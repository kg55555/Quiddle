jest.mock('../../util/pool', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

const request = require('supertest');
const express = require('express');

describe('quizSearch routes', () => {
  let app;
  let pool;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    jest.mock('../../util/pool', () => ({
      query: jest.fn(),
      connect: jest.fn(),
    }));

    pool = require('../../util/pool');

    app = express();
    app.use(express.json());
    app.use('/', require('../../routes/quizSearch'));
  });

  // ─── GET / ───────────────────────────────────────────────────

  describe('GET /', () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    const fakeResults = [
      { quiz_id: 1, name: 'Math Quiz', description: 'Basic math', number_of_questions: 10, course_name: 'Math 101', created_by_name: 'Jane Doe', rank: 0.9 },
    ];

    it('200 - returns matching quizzes', async () => {
      pool.query.mockResolvedValue({ rows: fakeResults });

      const res = await request(app).get('/').query({ q: 'math' });

      expect(res.statusCode).toBe(200);
      expect(res.body.results).toEqual(fakeResults);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE q.visibility = 'public'"),
        ['math']
      );
    });

    it('200 - returns empty array when no matches', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const res = await request(app).get('/').query({ q: 'zzznomatch' });

      expect(res.statusCode).toBe(200);
      expect(res.body.results).toEqual([]);
    });

    it('200 - trims and truncates query to 200 chars', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      const longQuery = 'a'.repeat(250);

      const res = await request(app).get('/').query({ q: longQuery });

      expect(res.statusCode).toBe(200);
      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        ['a'.repeat(200)]
      );
    });

    it('400 - missing query parameter', async () => {
      const res = await request(app).get('/');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Query required');
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('400 - whitespace-only query', async () => {
      const res = await request(app).get('/').query({ q: '   ' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Query required');
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('500 - database error', async () => {
      pool.query.mockRejectedValue(new Error('DB crash'));

      const res = await request(app).get('/').query({ q: 'math' });

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Search failed');
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ─── GET /suggestions ────────────────────────────────────────

  describe('GET /suggestions', () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    const fakeSuggestions = [
      { quiz_id: 1, name: 'Math Basics', course_name: 'Math 101' },
      { quiz_id: 2, name: 'Math Advanced', course_name: 'Math 201' },
    ];

    it('200 - returns suggestions for valid query', async () => {
      pool.query.mockResolvedValue({ rows: fakeSuggestions });

      const res = await request(app).get('/suggestions').query({ q: 'math' });

      expect(res.statusCode).toBe(200);
      expect(res.body.results).toEqual(fakeSuggestions);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE $1'),
        ['%math%']
      );
    });

    it('200 - returns empty array when query is missing', async () => {
      const res = await request(app).get('/suggestions');

      expect(res.statusCode).toBe(200);
      expect(res.body.results).toEqual([]);
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('200 - returns empty array when query is less than 4 chars', async () => {
      const res = await request(app).get('/suggestions').query({ q: 'mat' });

      expect(res.statusCode).toBe(200);
      expect(res.body.results).toEqual([]);
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('200 - returns empty array when query is exactly 4 chars', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const res = await request(app).get('/suggestions').query({ q: 'math' });

      expect(res.statusCode).toBe(200);
      expect(pool.query).toHaveBeenCalled();
    });

    it('200 - returns empty array when no suggestions match', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const res = await request(app).get('/suggestions').query({ q: 'zzzz' });

      expect(res.statusCode).toBe(200);
      expect(res.body.results).toEqual([]);
    });

    it('200 - trims and truncates query to 200 chars', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      const longQuery = 'a'.repeat(250);

      const res = await request(app).get('/suggestions').query({ q: longQuery });

      expect(res.statusCode).toBe(200);
      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        [`%${'a'.repeat(200)}%`]
      );
    });

    it('500 - database error', async () => {
      pool.query.mockRejectedValue(new Error('DB crash'));

      const res = await request(app).get('/suggestions').query({ q: 'math' });

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Suggestions failed');
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});