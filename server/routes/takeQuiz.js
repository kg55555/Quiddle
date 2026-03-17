const express = require('express');
const pool = require('../util/pool');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// GET /api/quizzes/:quiz_id — fetches a quiz with its questions and answers
router.get('/:quiz_id', authenticate, async (req, res) => {
    const { quiz_id } = req.params;
    const userId = req.user.id;

    if (!quiz_id) {
        return res.status(400).json({ success: false, error: 'Quiz ID is required' });
    }

    const client = await pool.connect();

    try {
        // Fetch quiz details
        const quizResult = await client.query(
            `SELECT q.quiz_id, q.name, q.description, q.course_id, q.number_of_questions, 
                    q.visibility, q.created_by, c.course_id
             FROM quizzes q
             LEFT JOIN courses c ON q.course_id = c.course_id
             WHERE q.quiz_id = $1`,
            [quiz_id]
        );

        if (quizResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        const quiz = quizResult.rows[0];

        // Check visibility (private quizzes only accessible by creator)
        if (quiz.visibility === 'private' && quiz.created_by !== userId) {
            return res.status(403).json({ success: false, error: 'You do not have access to this quiz' });
        }

        // Fetch questions with answers
        const questionsResult = await client.query(
            `SELECT q.question_id, q.quiz_id, q.type, q.description,
                    a.answer_id, a.answer_description, a.is_correct
             FROM questions q
             LEFT JOIN answers a ON q.question_id = a.question_id
             WHERE q.quiz_id = $1
             ORDER BY q.question_id, a.answer_id`,
            [quiz_id]
        );

        // Structure the data
        const questionsMap = {};
        questionsResult.rows.forEach(row => {
            if (!questionsMap[row.question_id]) {
                questionsMap[row.question_id] = {
                    question_id: row.question_id,
                    type: row.type,
                    description: row.description,
                    answers: []
                };
            }
            
            if (row.answer_id) {
                questionsMap[row.question_id].answers.push({
                    answer_id: row.answer_id,
                    answer_description: row.answer_description,
                    is_correct: row.is_correct
                });
            }
        });

        const questions = Object.values(questionsMap);

        res.status(200).json({
            success: true,
            quiz: {
                quiz_id: quiz.quiz_id,
                name: quiz.name,
                description: quiz.description,
                course_id: quiz.course_id,
                number_of_questions: quiz.number_of_questions,
                visibility: quiz.visibility,
                questions
            }
        });

    } catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    } finally {
        client.release();
    }
});

// POST /api/quiz-submissions — submits and grades a quiz
router.post('/', authenticate, async (req, res) => {
    const { quiz_id, answers } = req.body;
    const userId = req.user.userId;

    if (!quiz_id || !answers || !Array.isArray(answers)) {
        return res.status(400).json({ 
            success: false, 
            error: 'Quiz ID and answers are required' 
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Verify quiz exists and user has access
        const quizResult = await client.query(
            `SELECT quiz_id, visibility, created_by FROM quizzes WHERE quiz_id = $1`,
            [quiz_id]
        );

        if (quizResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        const quiz = quizResult.rows[0];
        if (quiz.visibility === 'private' && quiz.created_by !== userId) {
            await client.query('ROLLBACK');
            return res.status(403).json({ success: false, error: 'You do not have access to this quiz' });
        }

        // Fetch all questions and correct answers
        const questionsResult = await client.query(
            `SELECT q.question_id, q.type, q.description,
                    a.answer_id, a.answer_description, a.is_correct
             FROM questions q
             LEFT JOIN answers a ON q.question_id = a.question_id
             WHERE q.quiz_id = $1
             ORDER BY q.question_id, a.answer_id`,
            [quiz_id]
        );

        // Structure questions with their correct answers
        const questionsMap = {};
        questionsResult.rows.forEach(row => {
            if (!questionsMap[row.question_id]) {
                questionsMap[row.question_id] = {
                    question_id: row.question_id,
                    description: row.description,
                    type: row.type,
                    correctAnswers: [],
                    allAnswers: []
                };
            }
            
            if (row.answer_id) {
                questionsMap[row.question_id].allAnswers.push({
                    answer_id: row.answer_id,
                    answer_description: row.answer_description,
                    is_correct: row.is_correct
                });
                
                if (row.is_correct) {
                    questionsMap[row.question_id].correctAnswers.push(row.answer_id);
                }
            }
        });

        // Grade the quiz
        let score = 0;
        const detailedResults = [];

        answers.forEach(userAnswer => {
            const question = questionsMap[userAnswer.questionId];
            if (!question) return;

            const userAnswerIds = userAnswer.answerIds.sort((a, b) => a - b);
            const correctAnswerIds = question.correctAnswers.sort((a, b) => a - b);

            // Check if answers match exactly (if only select 1 correct answer out of multiple, still results in 0)
            const isCorrect = 
                userAnswerIds.length === correctAnswerIds.length &&
                userAnswerIds.every((id, idx) => id === correctAnswerIds[idx]);

            if (isCorrect) {
                score++;
            }

            // Get answer text
            const userAnswerText = userAnswerIds
                .map(id => question.allAnswers.find(a => a.answer_id === id)?.answer_description)
                .filter(Boolean)
                .join(', ') || 'Not answered';

            const correctAnswerText = correctAnswerIds
                .map(id => question.allAnswers.find(a => a.answer_id === id)?.answer_description)
                .filter(Boolean)
                .join(', ');

            detailedResults.push({
                questionId: question.question_id,
                userAnswerText,
                correctAnswerText,
                isCorrect
            });
        });

        // Save submission to database (for quiz_taken)
        const submissionResult = await client.query(
            `INSERT INTO quiz_taken (quiz_id, user_id, score, total_questions)
             VALUES ($1, $2, $3, $4)
             RETURNING submission_id`,
            [quiz_id, userId, score, Object.keys(questionsMap).length]
        );

        // Save individual question responses
        for (const userAnswer of answers) {
            const question = questionsMap[userAnswer.questionId];
            if (question) {
                await client.query(
                    `INSERT INTO submission_responses (submission_id, question_id, answer_ids)
                     VALUES ($1, $2, $3)`,
                    [submissionResult.rows[0].submission_id, userAnswer.questionId, JSON.stringify(userAnswer.answerIds)]
                );
            }
        }

        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            results: {
                submissionId: submissionResult.rows[0].submission_id,
                score,
                totalPoints: Object.keys(questionsMap).length,
                totalQuestions: Object.keys(questionsMap).length,
                correctCount: score,
                percentage: Math.round((score / Object.keys(questionsMap).length) * 100),
                detailedResults
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error submitting quiz:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    } finally {
        client.release();
    }
});

module.exports = router;