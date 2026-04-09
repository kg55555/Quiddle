jest.mock('../../util/pool');
jest.mock('../../util/mailtransporter', () => ({ sendMail: jest.fn() }));

const request = require('supertest');
const express = require('express');

describe('mail routes', () => {
  let app;
  let pool;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    jest.mock('../../util/pool', () => ({
    query: jest.fn(),
    connect: jest.fn(),
    }));
    jest.mock('../../util/mailtransporter', () => ({ sendMail: jest.fn() }));

    pool = require('../../util/pool');

    app = express();
    app.use(express.json());
    app.use('/', require('../../routes/mail')); // adjust path as needed
  });

  describe('POST /verify-email', () => {

      let consoleErrorSpy, consoleLogSpy;

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
    });

    it('200 - verifies email successfully', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });

      const res = await request(app)
        .post('/verify-email')
        .send({ email: 'jane@university.edu', validationString: 'abc123' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Email verified successfully');
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET email_validated = TRUE'),
        ['jane@university.edu', 'abc123']
      );
    });

    it('400 - invalid validation string', async () => {
      pool.query.mockResolvedValue({ rowCount: 0 });

      const res = await request(app)
        .post('/verify-email')
        .send({ email: 'jane@university.edu', validationString: 'wrong' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid validation string');
    });

    it('400 - email not found', async () => {
      pool.query.mockResolvedValue({ rowCount: 0 });

      const res = await request(app)
        .post('/verify-email')
        .send({ email: 'nobody@university.edu', validationString: 'abc123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('500 - database error', async () => {
      pool.query.mockRejectedValue(new Error('DB crash'));

      const res = await request(app)
        .post('/verify-email')
        .send({ email: 'jane@university.edu', validationString: 'abc123' });

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Email verification failed');
    });
  });
});