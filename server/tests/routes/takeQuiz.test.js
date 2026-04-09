jest.mock('../../util/pool');
jest.mock('../../middleware/authenticate');

const request = require('supertest');
const express = require('express');

describe('take-quiz / quiz-submissions routes', () => {
  let app;
  let pool;
  let mockClient;
  let authenticate;

  const authed = { userId: 1 };

  const QUIZ_ROW = {
    quiz_id: 10,
    name: 'Test Quiz',
    description: 'A test quiz',
    course_id: 5,
    number_of_questions: 2,
    visibility: 'public',
    created_by: 1,
  };

  const QUESTION_ROWS = [
    { question_id: 1, quiz_id: 10, type: 'multiple_choice', description: 'Q1?', answer_id: 1, answer_description: 'A', is_correct: true },
    { question_id: 1, quiz_id: 10, type: 'multiple_choice', description: 'Q1?', answer_id: 2, answer_description: 'B', is_correct: false },
    { question_id: 2, quiz_id: 10, type: 'multiple_choice', description: 'Q2?', answer_id: 3, answer_description: 'C', is_correct: true },
    { question_id: 2, quiz_id: 10, type: 'multiple_choice', description: 'Q2?', answer_id: 4, answer_description: 'D', is_correct: false },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    jest.mock('../../util/pool');
    jest.mock('../../middleware/authenticate');

    pool         = require('../../util/pool');
    authenticate = require('../../middleware/authenticate');

    mockClient = {
      query:   jest.fn(),
      release: jest.fn(),
    };
    pool.connect = jest.fn().mockResolvedValue(mockClient);

    // Default: authenticated as userId 1
    authenticate.mockImplementation((req, _res, next) => {
      req.user = authed;
      next();
    });

    app = express();
    app.use(express.json());
    app.use('/api/take-quiz',        require('../../routes/takeQuiz')); // GET /:quiz_id
    app.use('/api/quiz-submissions', require('../../routes/takeQuiz')); // POST /
  });

  // ─── GET /api/take-quiz/:quiz_id ─────────────────────────────────────────────

  describe('GET /api/take-quiz/:quiz_id', () => {

    let consoleSpy, consoleLogSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('200 - returns quiz with structured questions and answers', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [QUIZ_ROW] })
        .mockResolvedValueOnce({ rows: QUESTION_ROWS });

      const res = await request(app)
        .get('/api/take-quiz/10')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.quiz.quiz_id).toBe(10);
      expect(res.body.quiz.questions).toHaveLength(2);
      expect(res.body.quiz.questions[0].answers).toHaveLength(2);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('200 - private quiz is accessible by its creator', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [{ ...QUIZ_ROW, visibility: 'private', created_by: 1 }] })
        .mockResolvedValueOnce({ rows: QUESTION_ROWS });

      const res = await request(app)
        .get('/api/take-quiz/10')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('200 - questions with no answers return an empty answers array', async () => {
      const rowsNoAnswers = [
        { question_id: 1, quiz_id: 10, type: 'open', description: 'Q?', answer_id: null, answer_description: null, is_correct: null },
      ];
      mockClient.query
        .mockResolvedValueOnce({ rows: [QUIZ_ROW] })
        .mockResolvedValueOnce({ rows: rowsNoAnswers });

      const res = await request(app)
        .get('/api/take-quiz/10')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(200);
      expect(res.body.quiz.questions[0].answers).toHaveLength(0);
    });

    it('403 - private quiz accessed by non-owner', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [{ ...QUIZ_ROW, visibility: 'private', created_by: 99 }] });

      const res = await request(app)
        .get('/api/take-quiz/10')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('You do not have access to this quiz');
    });

    it('404 - quiz not found', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .get('/api/take-quiz/999')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Quiz not found');
    });

    it('401 - no token', async () => {
      authenticate.mockImplementation((_req, res, _next) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const res = await request(app).get('/api/take-quiz/10');

      expect(res.statusCode).toBe(401);
      expect(pool.connect).not.toHaveBeenCalled();
    });

    it('500 - database error releases client and returns 500', async () => {
      mockClient.query
        .mockRejectedValueOnce(new Error('DB crash'));

      const res = await request(app)
        .get('/api/take-quiz/10')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  // ─── POST /api/quiz-submissions ──────────────────────────────────────────────

  describe('POST /api/quiz-submissions', () => {

    let consoleSpy, consoleLogSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    const validBody = {
      quiz_id: 10,
      answers: [
        { questionId: 1, answerTexts: ['A'] },
        { questionId: 2, answerTexts: ['C'] },
      ],
    };

    function mockHappyPath() {
      mockClient.query
        .mockResolvedValueOnce({ rows: [] })                          // BEGIN
        .mockResolvedValueOnce({ rows: [QUIZ_ROW] })                 // quiz lookup
        .mockResolvedValueOnce({ rows: QUESTION_ROWS })              // questions + answers
        .mockResolvedValueOnce({ rows: [{ attempt_id: 7 }] })        // INSERT quizzes_taken
        .mockResolvedValueOnce({ rows: [] })                         // INSERT attempted_questions Q1
        .mockResolvedValueOnce({ rows: [] })                         // INSERT attempted_questions Q2
        .mockResolvedValueOnce({ rows: [] });                        // COMMIT
    }

    it('200 - perfect score when all answers correct', async () => {
      mockHappyPath();

      const res = await request(app)
        .post('/api/quiz-submissions')
        .set('Authorization', 'Bearer valid-token')
        .send(validBody);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.results.score).toBe(2);
      expect(res.body.results.totalQuestions).toBe(2);
      expect(res.body.results.percentage).toBe(100);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('200 - partial score: 1 correct, 1 incorrect', async () => {
      mockHappyPath();

      const res = await request(app)
        .post('/api/quiz-submissions')
        .set('Authorization', 'Bearer valid-token')
        .send({ ...validBody, answers: [
          { questionId: 1, answerTexts: ['A'] },  // correct
          { questionId: 2, answerTexts: ['D'] },  // incorrect
        ]});

      expect(res.statusCode).toBe(200);
      expect(res.body.results.score).toBe(1);
      expect(res.body.results.percentage).toBe(50);
    });

    it('200 - zero score when all answers wrong', async () => {
      mockHappyPath();

      const res = await request(app)
        .post('/api/quiz-submissions')
        .set('Authorization', 'Bearer valid-token')
        .send({ ...validBody, answers: [
          { questionId: 1, answerTexts: ['B'] },
          { questionId: 2, answerTexts: ['D'] },
        ]});

      expect(res.statusCode).toBe(200);
      expect(res.body.results.score).toBe(0);
      expect(res.body.results.percentage).toBe(0);
    });

    it('200 - answer matching is case-insensitive', async () => {
      mockHappyPath();

      const res = await request(app)
        .post('/api/quiz-submissions')
        .set('Authorization', 'Bearer valid-token')
        .send({ ...validBody, answers: [
          { questionId: 1, answerTexts: ['a'] },
          { questionId: 2, answerTexts: ['c'] },
        ]});

      expect(res.statusCode).toBe(200);
      expect(res.body.results.score).toBe(2);
    });

    it('200 - selecting only one of two required correct answers scores 0', async () => {
      const multiCorrectRows = [
        { question_id: 1, quiz_id: 10, type: 'multi_select', description: 'Q1?', answer_id: 1, answer_description: 'A', is_correct: true },
        { question_id: 1, quiz_id: 10, type: 'multi_select', description: 'Q1?', answer_id: 2, answer_description: 'B', is_correct: true },
        { question_id: 1, quiz_id: 10, type: 'multi_select', description: 'Q1?', answer_id: 3, answer_description: 'C', is_correct: false },
      ];

      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [QUIZ_ROW] })
        .mockResolvedValueOnce({ rows: multiCorrectRows })
        .mockResolvedValueOnce({ rows: [{ attempt_id: 8 }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post('/api/quiz-submissions')
        .set('Authorization', 'Bearer valid-token')
        .send({ quiz_id: 10, answers: [{ questionId: 1, answerTexts: ['A'] }] });

      expect(res.statusCode).toBe(200);
      expect(res.body.results.score).toBe(0);
    });

    it('200 - detailedResults contain correct isCorrect flags and answer text', async () => {
      mockHappyPath();

      const res = await request(app)
        .post('/api/quiz-submissions')
        .set('Authorization', 'Bearer valid-token')
        .send({ ...validBody, answers: [
          { questionId: 1, answerTexts: ['A'] },
          { questionId: 2, answerTexts: ['D'] },
        ]});

      const { detailedResults } = res.body.results;
      const q1 = detailedResults.find(r => r.questionId === 1);
      const q2 = detailedResults.find(r => r.questionId === 2);

      expect(q1.isCorrect).toBe(true);
      expect(q1.correctAnswerText).toBe('A');
      expect(q2.isCorrect).toBe(false);
      expect(q2.correctAnswerText).toBe('C');
    });

    it('400 - missing quiz_id', async () => {
      const res = await request(app)
        .post('/api/quiz-submissions')
        .set('Authorization', 'Bearer valid-token')
        .send({ answers: [{ questionId: 1, answerTexts: ['A'] }] });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(pool.connect).not.toHaveBeenCalled();
    });

    it('400 - missing answers', async () => {
      const res = await request(app)
        .post('/api/quiz-submissions')
        .set('Authorization', 'Bearer valid-token')
        .send({ quiz_id: 10 });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(pool.connect).not.toHaveBeenCalled();
    });

    it('400 - answers not an array', async () => {
      const res = await request(app)
        .post('/api/quiz-submissions')
        .set('Authorization', 'Bearer valid-token')
        .send({ quiz_id: 10, answers: 'not-an-array' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(pool.connect).not.toHaveBeenCalled();
    });

    it('401 - no token', async () => {
      authenticate.mockImplementation((_req, res, _next) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const res = await request(app).post('/api/quiz-submissions').send(validBody);

      expect(res.statusCode).toBe(401);
      expect(pool.connect).not.toHaveBeenCalled();
    });

    it('403 - private quiz accessed by non-owner', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ ...QUIZ_ROW, visibility: 'private', created_by: 99 }] })
        .mockResolvedValueOnce({ rows: [] }); // ROLLBACK

      const res = await request(app)
        .post('/api/quiz-submissions')
        .set('Authorization', 'Bearer valid-token')
        .send(validBody);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('You do not have access to this quiz');
    });

    it('404 - quiz not found', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [] })   // BEGIN
        .mockResolvedValueOnce({ rows: [] })   // quiz lookup → empty
        .mockResolvedValueOnce({ rows: [] });  // ROLLBACK

      const res = await request(app)
        .post('/api/quiz-submissions')
        .set('Authorization', 'Bearer valid-token')
        .send(validBody);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Quiz not found');
    });

    it('500 - rolls back and releases client on DB error', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [] })           // BEGIN
        .mockRejectedValueOnce(new Error('DB crash'))  // quiz lookup fails
        .mockResolvedValueOnce({ rows: [] });          // ROLLBACK

      const res = await request(app)
        .post('/api/quiz-submissions')
        .set('Authorization', 'Bearer valid-token')
        .send(validBody);

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});