jest.mock('../../util/pool', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));
jest.mock('../../util/token');

const request = require('supertest');
const express = require('express');

describe('quiz history routes', () => {
  let app;
  let pool;
  let mockClient;
  let verifyToken;

  const authed = { userId: 1, email: 'jane@university.edu' };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    jest.mock('../../util/pool', () => ({
      query: jest.fn(),
      connect: jest.fn(),
    }));
    jest.mock('../../util/token');

    pool        = require('../../util/pool');
    verifyToken = require('../../util/token').verifyToken;

    mockClient = {
      query:   jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(mockClient);
    verifyToken.mockReturnValue(authed);

    app = express();
    app.use(express.json());
    app.use('/', require('../../routes/quizHistory'));
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

    it('200 - returns quiz history for authenticated user', async () => {
      const fakeHistory = [
        {
          attempt_id: 1,
          quiz_id: 10,
          score_achieved: 8,
          attempted_at: '2024-01-01',
          quiz_name: 'Math Quiz',
          number_of_questions: 10,
          quiz_description: 'A math quiz',
          course_name: 'Math 101',
        },
      ];

      mockClient.query
        .mockResolvedValueOnce({})                          // BEGIN
        .mockResolvedValueOnce({ rows: fakeHistory })       // SELECT
        .mockResolvedValueOnce({});                         // COMMIT

      const res = await request(app)
        .get('/')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.quizHistory).toEqual(fakeHistory);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('200 - returns empty array when no history exists', async () => {
      mockClient.query
        .mockResolvedValueOnce({})           // BEGIN
        .mockResolvedValueOnce({ rows: [] }) // SELECT
        .mockResolvedValueOnce({});          // COMMIT

      const res = await request(app)
        .get('/')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(200);
      expect(res.body.quizHistory).toEqual([]);
    });

    it('401 - no token', async () => {
      const res = await request(app).get('/');

      expect(res.statusCode).toBe(401);
      expect(pool.connect).not.toHaveBeenCalled();
    });

    it('401 - invalid token', async () => {
      verifyToken.mockImplementation(() => { throw new Error('jwt expired'); });

      const res = await request(app)
        .get('/')
        .set('Authorization', 'Bearer bad-token');

      expect(res.statusCode).toBe(401);
    });

    it('500 - rolls back and releases client on DB error', async () => {
      mockClient.query
        .mockResolvedValueOnce({})                        // BEGIN
        .mockRejectedValueOnce(new Error('DB crash'));    // SELECT fails

      const res = await request(app)
        .get('/')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Failed to fetch quiz history');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  // ─── GET /attempt/:attemptId ─────────────────────────────────

  describe('GET /attempt/:attemptId', () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    const fakeAttempt   = [{ attempt_id: 1, quiz_id: 10, score_achieved: 2 }];
    const fakeQuiz      = [{ number_of_questions: 2, name: 'Math Quiz' }];
    const fakeQuestions = [
      { question_id: 1, type: 'multiple_choice', description: 'Q1?', answer_id: 1, answer_description: 'A1', is_correct: true },
      { question_id: 1, type: 'multiple_choice', description: 'Q1?', answer_id: 2, answer_description: 'A2', is_correct: false },
      { question_id: 2, type: 'multiple_choice', description: 'Q2?', answer_id: 3, answer_description: 'B1', is_correct: true },
      { question_id: 2, type: 'multiple_choice', description: 'Q2?', answer_id: 4, answer_description: 'B2', is_correct: false },
    ];
    const fakeAttempted = [
      { question_id: 1, answer_value: 'A1' },
      { question_id: 2, answer_value: 'B2' },
    ];

    function mockHappyPath() {
      mockClient.query
        .mockResolvedValueOnce({ rows: fakeAttempt })     // verify attempt ownership
        .mockResolvedValueOnce({ rows: fakeQuiz })        // fetch quiz details
        .mockResolvedValueOnce({ rows: fakeQuestions })   // fetch questions + answers
        .mockResolvedValueOnce({ rows: fakeAttempted });  // fetch attempted answers
    }

    it('200 - returns detailed attempt results', async () => {
      mockHappyPath();

      const res = await request(app)
        .get('/attempt/1')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.results.score).toBe(2);
      expect(res.body.results.totalQuestions).toBe(2);
      expect(res.body.results.percentage).toBe(100);
      expect(res.body.results.detailedResults).toHaveLength(2);
      expect(res.body.questions).toHaveLength(2);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('200 - marks answer as correct when user answer matches', async () => {
      mockHappyPath();

      const res = await request(app)
        .get('/attempt/1')
        .set('Authorization', 'Bearer valid-token');

      const q1 = res.body.results.detailedResults.find(r => r.questionId === 1);
      expect(q1.isCorrect).toBe(true);
      expect(q1.userAnswerText).toBe('A1');
      expect(q1.correctAnswerText).toBe('A1');
    });

    it('200 - marks answer as incorrect when user answer does not match', async () => {
      mockHappyPath();

      const res = await request(app)
        .get('/attempt/1')
        .set('Authorization', 'Bearer valid-token');

      const q2 = res.body.results.detailedResults.find(r => r.questionId === 2);
      expect(q2.isCorrect).toBe(false);
      expect(q2.userAnswerText).toBe('B2');
      expect(q2.correctAnswerText).toBe('B1');
    });

    it('403 - attempt not found or belongs to another user', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .get('/attempt/99')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toBe('Unauthorized or attempt not found');
    });

    it('404 - quiz not found', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: fakeAttempt })  // attempt found
        .mockResolvedValueOnce({ rows: [] });           // quiz not found

      const res = await request(app)
        .get('/attempt/1')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Quiz not found');
    });

    it('401 - no token', async () => {
      const res = await request(app).get('/attempt/1');

      expect(res.statusCode).toBe(401);
    });

    it('500 - database error', async () => {
      mockClient.query.mockRejectedValueOnce(new Error('DB crash'));

      const res = await request(app)
        .get('/attempt/1')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(500);
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  // ─── GET /quiz-stats ─────────────────────────────────────────

  describe('GET /quiz-stats', () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    const fakeStats = {
      total_quizzes_taken: '5',
      total_attempts: '8',
      average_score: '72.50',
      highest_score: '95',
      quizzes_created: '3',
    };

    it('200 - returns quiz stats for authenticated user', async () => {
      pool.query.mockResolvedValue({ rows: [fakeStats] });

      const res = await request(app)
        .get('/quiz-stats')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats).toEqual(fakeStats);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE qt.taken_by = $1'),
        [authed.userId]
      );
    });

    it('401 - no token', async () => {
      const res = await request(app).get('/quiz-stats');

      expect(res.statusCode).toBe(401);
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('500 - database error', async () => {
      pool.query.mockRejectedValue(new Error('DB crash'));

      const res = await request(app)
        .get('/quiz-stats')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Failed to fetch statistics');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Fetch quiz stats error:',
        expect.any(Error)
      );
    });
  });
});