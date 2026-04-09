jest.mock('../../util/pool');
jest.mock('../../util/mailtransporter', () => ({
  sendMail: jest.fn(),
}));
jest.mock('../../util/token');
jest.mock('bcrypt');

const request = require('supertest');
const express = require('express');

describe('auth routes', () => {
  let app;
  let pool;
  let token;
  let bcrypt;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    pool    = require('../../util/pool');
    token   = require('../../util/token');
    bcrypt  = require('bcrypt');

    app = express();
    app.use(express.json());
    app.use('/', require('../../routes/auth')); // adjust path as needed
  });


  // ─── POST /signup ──────────────────────────────────────────────

  describe('POST /signup', () => {
    const validBody = {
      firstName: 'Jane',
      lastName: 'Doe',
      institutionID: 'inst_1',
      email: 'jane@university.edu',
      password: 'secret123',
    };

    it('201 - creates user and sends verification email', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [] })                                      // email not taken
        .mockResolvedValueOnce({ rows: [{ institution_name: 'University' }] })    // institution found
        .mockResolvedValueOnce({ rows: [{ institution_id: 'inst_1' }] })          // domain matches
        .mockResolvedValueOnce({ rows: [{ id: 1, email: validBody.email, first_name: 'Jane', last_name: 'Doe', email_validation_string: 'abc123' }] }); // insert

      bcrypt.hash.mockResolvedValue('hashed_password');
      const mailer = require('../../util/mailtransporter'); // get the mock directly



      const res = await request(app).post('/signup').send(validBody);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.userId).toBe(1);
      expect(mailer.sendMail).toHaveBeenCalledTimes(1);
    });

    it('400 - missing required fields', async () => {
      const res = await request(app).post('/signup').send({ firstName: 'Jane' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('All fields are required');
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('409 - email already registered', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 99 }] }); // email taken

      const res = await request(app).post('/signup').send(validBody);

      expect(res.statusCode).toBe(409);
      expect(res.body.error).toBe('Email already registered');
    });

    it('404 - institution not found', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [] })   // email not taken
        .mockResolvedValueOnce({ rows: [] });  // institution not found

      const res = await request(app).post('/signup').send(validBody);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Institution not found');
    });

    it('400 - email domain does not match institution', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [] })                                    // email not taken
        .mockResolvedValueOnce({ rows: [{ institution_name: 'University' }] }) // institution found
        .mockResolvedValueOnce({ rows: [] });                                   // domain mismatch

      const res = await request(app).post('/signup').send(validBody);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Email domain does not match institution');
    });

    it('500 - database error', async () => {
      pool.query.mockRejectedValue(new Error('DB crash'));

      const res = await request(app).post('/signup').send(validBody);

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Internal server error');
    });
  });

  // ─── POST /login ───────────────────────────────────────────────

  describe('POST /login', () => {
    const validBody = { username: 'jane@university.edu', password: 'secret123' };
    const fakeUser  = { id: 1, email: 'jane@university.edu', password_hash: 'hashed', first_name: 'Jane', last_name: 'Doe' };

    it('200 - returns token on valid credentials', async () => {
      pool.query.mockResolvedValue({ rows: [fakeUser] });
      bcrypt.compare.mockResolvedValue(true);
      token.signToken.mockReturnValue('jwt-token');

      const res = await request(app).post('/login').send(validBody);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBe('jwt-token');
      expect(res.body.userId).toBe(1);
      expect(token.signToken).toHaveBeenCalledWith({ userId: 1, email: fakeUser.email });
    });

    it('401 - user not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const res = await request(app).post('/login').send(validBody);

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('401 - wrong password', async () => {
      pool.query.mockResolvedValue({ rows: [fakeUser] });
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app).post('/login').send(validBody);

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('500 - database error', async () => {
      pool.query.mockRejectedValue(new Error('DB crash'));

      const res = await request(app).post('/login').send(validBody);

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Login failed');
    });
  });

  // ─── GET /verify-token ─────────────────────────────────────────

  describe('GET /verify-token', () => {

    it('201 - valid token', async () => {
      token.verifyToken.mockReturnValue({ userId: 1, email: 'jane@university.edu' });

      const res = await request(app)
        .get('/verify-token')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('401 - no authorization header', async () => {
      const res = await request(app).get('/verify-token');

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('No token provided');
    });

    it('401 - malformed authorization header', async () => {
      const res = await request(app)
        .get('/verify-token')
        .set('Authorization', 'Token abc'); // not "Bearer ..."

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('No token provided');
    });

    it('401 - invalid or expired token', async () => {
      token.verifyToken.mockImplementation(() => { throw new Error('jwt expired'); });

      const res = await request(app)
        .get('/verify-token')
        .set('Authorization', 'Bearer bad-token');

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Invalid or expired token');
    });
  });
});