jest.mock('../../util/pool');
jest.mock('../../util/token');

const request = require('supertest');
const express = require('express');

describe('quiz routes', () => {
  let app;
  let pool;
  let mockClient;
  let verifyToken;

  const authed = { userId: 1, email: 'jane@university.edu' };

  const validQuiz = {
    name: 'My Quiz',
    course_name: 'Math 101',
    description: 'A test quiz',
    visibility: 'public',
    questions: [
      {
        type: 'multiple_choice',
        question_text: 'What is 2+2?',
        answers: [
          { answer_text: '4', is_correct: true },
          { answer_text: '3', is_correct: false },
        ],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    // re-require everything after resetModules
    jest.mock('../../util/pool');
    jest.mock('../../util/token');

    pool        = require('../../util/pool');
    verifyToken = require('../../util/token').verifyToken;

    mockClient = {
      query:   jest.fn(),
      release: jest.fn(),
    };
    pool.connect = jest.fn().mockResolvedValue(mockClient);

    verifyToken.mockReturnValue(authed);

    app = express();
    app.use(express.json());
    app.use('/', require('../../routes/createQuiz'));
  });

  // ─── GET /my-quizzes ─────────────────────────────────────────

  describe('GET /my-quizzes', () => {
    it('200 - returns quizzes for authenticated user', async () => {
      const fakeQuizzes = [
        { id: 1, name: 'Quiz 1', description: 'Desc', visibility: 'public', course_name: 'Math 101', created_at: '2024-01-01' },
      ];
      pool.query = jest.fn().mockResolvedValue({ rows: fakeQuizzes });

      const res = await request(app)
        .get('/my-quizzes')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(fakeQuizzes);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE q.created_by = $1'),
        [authed.userId]
      );
    });

    it('401 - no token', async () => {
      const res = await request(app).get('/my-quizzes');

      expect(res.statusCode).toBe(401);
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('401 - invalid token', async () => {
      verifyToken.mockImplementation(() => { throw new Error('jwt expired'); });

      const res = await request(app)
        .get('/my-quizzes')
        .set('Authorization', 'Bearer bad-token');

      expect(res.statusCode).toBe(401);
    });

    it('500 - database error', async () => {
      pool.query = jest.fn().mockRejectedValue(new Error('DB crash'));

      const res = await request(app)
        .get('/my-quizzes')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Failed to fetch quizzes');
    });
  });

  // ─── GET /:quizId ────────────────────────────────────────────

  describe('GET /:quizId', () => {
    const fakeQuiz = { quiz_id: 1, name: 'Quiz 1', description: 'Desc', visibility: 'public', course_name: 'Math 101' };
    const fakeQuestions = [
      { question_id: 1, type: 'multiple_choice', question_text: 'Q1?', answer_id: 1, answer_text: 'A1', is_correct: true },
      { question_id: 1, type: 'multiple_choice', question_text: 'Q1?', answer_id: 2, answer_text: 'A2', is_correct: false },
    ];

    it('200 - returns quiz with nested questions and answers', async () => {
      pool.query = jest.fn()
        .mockResolvedValueOnce({ rows: [fakeQuiz] })
        .mockResolvedValueOnce({ rows: fakeQuestions });

      const res = await request(app)
        .get('/1')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(200);
      expect(res.body.quiz_id).toBe(1);
      expect(res.body.questions).toHaveLength(1);
      expect(res.body.questions[0].answers).toHaveLength(2);
    });

    it('404 - quiz not found or unauthorized', async () => {
      pool.query = jest.fn().mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .get('/99')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Quiz not found or unauthorized');
    });

    it('401 - no token', async () => {
      const res = await request(app).get('/1');

      expect(res.statusCode).toBe(401);
    });

    it('500 - database error', async () => {
      pool.query = jest.fn().mockRejectedValue(new Error('DB crash'));

      const res = await request(app)
        .get('/1')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Failed to fetch quiz');
    });
  });

  // ─── POST / ──────────────────────────────────────────────────

  describe('POST /', () => {
    function mockHappyPath() {
      mockClient.query
        .mockResolvedValueOnce({})                              // BEGIN
        .mockResolvedValueOnce({ rows: [{ course_id: 10 }] })  // INSERT course
        .mockResolvedValueOnce({ rows: [{ quiz_id: 42 }] })    // INSERT quiz
        .mockResolvedValueOnce({ rows: [{ question_id: 5 }] }) // INSERT question
        .mockResolvedValueOnce({})                             // INSERT answer 1
        .mockResolvedValueOnce({})                             // INSERT answer 2
        .mockResolvedValueOnce({});                            // COMMIT
    }

    it('201 - creates quiz and returns quizId', async () => {
      mockHappyPath();

      const res = await request(app)
        .post('/')
        .set('Authorization', 'Bearer valid-token')
        .send(validQuiz);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.quizId).toBe(42);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('400 - missing quiz name', async () => {
      const res = await request(app)
        .post('/')
        .set('Authorization', 'Bearer valid-token')
        .send({ ...validQuiz, name: '' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Quiz name is required');
      expect(pool.connect).not.toHaveBeenCalled();
    });

    it('400 - missing questions', async () => {
      const res = await request(app)
        .post('/')
        .set('Authorization', 'Bearer valid-token')
        .send({ ...validQuiz, questions: [] });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Questions are required');
    });

    it('400 - missing course name', async () => {
      const res = await request(app)
        .post('/')
        .set('Authorization', 'Bearer valid-token')
        .send({ ...validQuiz, course_name: '' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Course is required');
    });

    it('400 - invalid visibility', async () => {
      const res = await request(app)
        .post('/')
        .set('Authorization', 'Bearer valid-token')
        .send({ ...validQuiz, visibility: 'secret' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid visibility');
    });

    it('401 - no token', async () => {
      const res = await request(app).post('/').send(validQuiz);

      expect(res.statusCode).toBe(401);
    });

    it('500 - rolls back and releases client on DB error', async () => {
      mockClient.query
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error('DB crash'));

      const res = await request(app)
        .post('/')
        .set('Authorization', 'Bearer valid-token')
        .send(validQuiz);

      expect(res.statusCode).toBe(500);
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('falls back to SELECT when course INSERT returns nothing', async () => {
      mockClient.query
        .mockResolvedValueOnce({})                              // BEGIN
        .mockResolvedValueOnce({ rows: [] })                   // INSERT course → DO NOTHING
        .mockResolvedValueOnce({ rows: [{ course_id: 99 }] })  // SELECT course fallback
        .mockResolvedValueOnce({ rows: [{ quiz_id: 42 }] })    // INSERT quiz
        .mockResolvedValueOnce({ rows: [{ question_id: 5 }] }) // INSERT question
        .mockResolvedValueOnce({})                             // INSERT answer 1
        .mockResolvedValueOnce({})                             // INSERT answer 2
        .mockResolvedValueOnce({});                            // COMMIT

      const res = await request(app)
        .post('/')
        .set('Authorization', 'Bearer valid-token')
        .send(validQuiz);

      expect(res.statusCode).toBe(201);
      expect(res.body.quizId).toBe(42);
    });
  });

  // ─── PUT /:quizId ────────────────────────────────────────────

  describe('PUT /:quizId', () => {
    function mockHappyPath() {
      mockClient.query
        .mockResolvedValueOnce({})                              // BEGIN
        .mockResolvedValueOnce({ rows: [{ quiz_id: 1 }] })     // ownership check
        .mockResolvedValueOnce({ rows: [{ course_id: 10 }] })  // INSERT course
        .mockResolvedValueOnce({})                             // UPDATE quiz
        .mockResolvedValueOnce({})                             // DELETE answers
        .mockResolvedValueOnce({})                             // DELETE questions
        .mockResolvedValueOnce({ rows: [{ question_id: 5 }] }) // INSERT question
        .mockResolvedValueOnce({})                             // INSERT answer 1
        .mockResolvedValueOnce({})                             // INSERT answer 2
        .mockResolvedValueOnce({});                            // COMMIT
    }

    it('200 - updates quiz and returns quizId', async () => {
      mockHappyPath();

      const res = await request(app)
        .put('/1')
        .set('Authorization', 'Bearer valid-token')
        .send(validQuiz);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.quizId).toBe('1');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('400 - missing quiz name', async () => {
      const res = await request(app)
        .put('/1')
        .set('Authorization', 'Bearer valid-token')
        .send({ ...validQuiz, name: '' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Quiz name is required');
      expect(pool.connect).not.toHaveBeenCalled();
    });

    it('400 - missing questions', async () => {
      const res = await request(app)
        .put('/1')
        .set('Authorization', 'Bearer valid-token')
        .send({ ...validQuiz, questions: [] });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Questions are required');
    });

    it('400 - missing course name', async () => {
      const res = await request(app)
        .put('/1')
        .set('Authorization', 'Bearer valid-token')
        .send({ ...validQuiz, course_name: '' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Course is required');
    });

    it('400 - invalid visibility', async () => {
      const res = await request(app)
        .put('/1')
        .set('Authorization', 'Bearer valid-token')
        .send({ ...validQuiz, visibility: 'secret' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid visibility');
    });

    it('401 - no token', async () => {
      const res = await request(app).put('/1').send(validQuiz);

      expect(res.statusCode).toBe(401);
    });

    it('403 - user is not the quiz owner', async () => {
      mockClient.query
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .put('/1')
        .set('Authorization', 'Bearer valid-token')
        .send(validQuiz);

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('500 - rolls back and releases client on DB error', async () => {
      mockClient.query
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ quiz_id: 1 }] })
        .mockRejectedValueOnce(new Error('DB crash'));

      const res = await request(app)
        .put('/1')
        .set('Authorization', 'Bearer valid-token')
        .send(validQuiz);

      expect(res.statusCode).toBe(500);
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});