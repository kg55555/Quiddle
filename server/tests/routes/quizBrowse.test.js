jest.mock('../../util/pool');

const request = require('supertest');
const express = require('express');

describe('quizBrowse routes', () => {
  let app;
  let pool;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    jest.mock('../../util/pool');
    jest.mock('../../util/pool', () => ({
    query: jest.fn(),
    connect: jest.fn(),
    }));

    pool = require('../../util/pool');

    app = express();
    app.use(express.json());
    app.use('/', require('../../routes/quizBrowse'));
  });

  describe('GET /', () => {
    let consoleErrorSpy, consoleLogSpy;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('200 - returns popular quizzes', async () => {
      const fakeQuizzes = [
        { id: 1, name: 'Quiz 1', description: 'Desc', visibility: 'public', course_name: 'Math 101', created_at: '2024-01-01' },
      ];
      pool.query = jest.fn().mockResolvedValue({ rows: fakeQuizzes });

      const res = await request(app).get('/');

      expect(res.statusCode).toBe(200);
      expect(res.body.quizzes).toEqual(fakeQuizzes);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM popular_quizzes')
      );
    });

    it('200 - returns empty array when no quizzes exist', async () => {
      pool.query = jest.fn().mockResolvedValue({ rows: [] });

      const res = await request(app).get('/');

      expect(res.statusCode).toBe(200);
      expect(res.body.quizzes).toEqual([]);
    });

    it('500 - database error', async () => {
      pool.query = jest.fn().mockRejectedValue(new Error('DB crash'));

      const res = await request(app).get('/');

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Internal server error');
    });
  });
});