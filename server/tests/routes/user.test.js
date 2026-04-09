jest.mock('../../util/pool');
jest.mock('../../middleware/authenticate');

jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

const request = require('supertest');
const express = require('express');

describe('user routes', () => {
  let app;
  let pool;
  let authenticate;

  const authed = { userId: 1 };

  const userRow = {
    first_name: 'Jane',
    middle_name: 'A',
    last_name: 'Doe',
    email: 'jane@university.edu',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    jest.mock('../../util/pool');
    jest.mock('../../middleware/authenticate');

    pool         = require('../../util/pool');
    authenticate = require('../../middleware/authenticate');

    authenticate.mockImplementation((req, _res, next) => {
      req.user = authed;
      next();
    });

    app = express();
    app.use(express.json());
    app.use('/', require('../../routes/user'));
  });

  // ─── GET /me ─────────────────────────────────────────────────

  describe('GET /me', () => {
    it('200 - returns the authenticated user\'s profile', async () => {
      pool.query = jest.fn().mockResolvedValue({ rows: [userRow] });

      const res = await request(app)
        .get('/me')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(userRow);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = $1'),
        [authed.userId]
      );
    });

    it('404 - user not found', async () => {
      pool.query = jest.fn().mockResolvedValue({ rows: [] });

      const res = await request(app)
        .get('/me')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('User not found');
    });

    it('401 - no token', async () => {
      authenticate.mockImplementation((_req, res, _next) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const res = await request(app).get('/me');

      expect(res.statusCode).toBe(401);
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('500 - database error', async () => {
      pool.query = jest.fn().mockRejectedValue(new Error('DB crash'));

      const res = await request(app)
        .get('/me')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Failed to fetch profile');
    });
  });

  // ─── PUT /me ─────────────────────────────────────────────────

  describe('PUT /me', () => {
    const validBody = {
      first_name: 'Jane',
      middle_name: 'B',
      last_name: 'Smith',
    };

    it('200 - updates profile and returns success', async () => {
      pool.query = jest.fn().mockResolvedValue({ rows: [] });

      const res = await request(app)
        .put('/me')
        .set('Authorization', 'Bearer valid-token')
        .send(validBody);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        [validBody.first_name, validBody.middle_name, validBody.last_name, authed.userId]
      );
    });

    it('200 - middle_name defaults to null when omitted', async () => {
      pool.query = jest.fn().mockResolvedValue({ rows: [] });

      const res = await request(app)
        .put('/me')
        .set('Authorization', 'Bearer valid-token')
        .send({ first_name: 'Jane', last_name: 'Smith' });

      expect(res.statusCode).toBe(200);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        ['Jane', null, 'Smith', authed.userId]
      );
    });

    it('401 - no token', async () => {
      authenticate.mockImplementation((_req, res, _next) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const res = await request(app).put('/me').send(validBody);

      expect(res.statusCode).toBe(401);
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('500 - database error', async () => {
      pool.query = jest.fn().mockRejectedValue(new Error('DB crash'));

      const res = await request(app)
        .put('/me')
        .set('Authorization', 'Bearer valid-token')
        .send(validBody);

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Failed to update profile');
    });
  });
});