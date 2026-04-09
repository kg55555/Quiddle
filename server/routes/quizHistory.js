const express = require('express');
const pool = require('../util/pool');
const authenticate = require('../middleware/authenticate');

/**
* This module defines routes for fetching a user's quiz attempt history and detailed results of specific quiz attempts. It includes three main endpoints:
 * 1. GET /api/quiz-history: Retrieves a list of all quizzes attempted by the authenticated user, including metadata such as quiz name, description, course name, score achieved, and attempt date.
 * 2. GET /api/quiz-history/attempt/:attemptId: Fetches detailed results for a specific quiz attempt, including the user's answers, correct answers, and whether each question was answered correctly.
 * 3. GET /api/quiz-history/quiz-stats: Provides aggregated statistics about the user's quiz attempts, such as total quizzes taken, average score, and highest score.
 */

const router = express.Router();

/*
 * Parses the answer value, handling both JSON and non-JSON strings.
 */
function parseAnswerValue(value) {
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
        return [value];
    }
}

/**
 * GET /api/quiz-history — fetches a list of quizzes attempted by the authenticated user, including metadata and scores
 * Expected request header: Authorization
 * Possible responses:
 * 200 | OK/success | Returns a list of quiz attempts with metadata and scores
 * 500 | Server Error | Database crash or unexpected error
 * 
 * This endpoint retrieves a list of all quizzes attempted by the authenticated user, including metadata such as quiz name, description, course name, score achieved, and attempt date. 
 * The route uses the authenticate middleware to ensure that only logged-in users can access their quiz history. If the database query fails, it returns a 500 status code with an error message.
 * 
 * Note: This endpoint is intended for users to view their quiz attempt history and does not return attempts made by other users.
 */
router.get('/', authenticate, async (req, res) => {
    const userId = req.user.userId;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const result = await client.query(
            `SELECT 
                qt.attempt_id,
                qt.quiz_id,
                qt.taken_by,
                qt.score_achieved,
                qt.attempted_at,
                q.name AS quiz_name,
                q.number_of_questions,
                q.description AS quiz_description,
                COALESCE(c.course_name, 'No Course') AS course_name
             FROM quizzes_taken qt
             INNER JOIN quizzes q ON qt.quiz_id = q.quiz_id
             LEFT JOIN courses c ON q.course_id = c.course_id
             WHERE qt.taken_by = $1
             ORDER BY qt.attempted_at DESC`,
            [userId]
        );

        await client.query('COMMIT');
        res.json({
            success: true,
            quizHistory: result.rows
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Fetch quiz history error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch quiz history' });
    } finally {
        client.release();
    }
});

// GET /api/quiz-history/attempt/:attemptId — fetch previous attempt results
/**
 * GET /api/quiz-history/attempt/:attemptId — fetches detailed results for a specific quiz attempt, including user's answers, correct answers, and whether each question was answered correctly
 * Expected request header: Authorization
 * Possible responses:
 * 200 | OK/success | Returns detailed results for the specified quiz attempt
 * 403 | Forbidden | User is not the creator of the quiz attempt or attempt not found
 * 404 | Not Found | Quiz attempt does not exist
 * 500 | Server Error | Database crash or unexpected error
 * 
 * This endpoint retrieves detailed results for a specific quiz attempt made by the authenticated user. It includes the user's answers, correct answers, and whether each question was answered correctly.
 */
router.get('/attempt/:attemptId', authenticate, async (req, res) => {
    const { attemptId } = req.params;
    const userId = req.user.userId;

    let client;
    try {
        client = await pool.connect();

        // Verify the attempt belongs to the user
        const attemptResult = await client.query(
            `SELECT qt.quiz_id, qt.score_achieved, qt.attempt_id
             FROM quizzes_taken qt
             WHERE qt.attempt_id = $1 AND qt.taken_by = $2`,
            [attemptId, userId]
        );


        if (attemptResult.rows.length === 0) {
            return res.status(403).json({ success: false, error: 'Unauthorized or attempt not found' });
        }

        const { quiz_id, score_achieved } = attemptResult.rows[0];

        // Fetch quiz details
        const quizResult = await client.query(
            `SELECT q.number_of_questions, q.name FROM quizzes q WHERE quiz_id = $1`,
            [quiz_id]
        );

        if (quizResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        // Fetch questions and answers for this quiz
        const questionsResult = await client.query(
            `SELECT q.question_id, q.type, q.description,
                    a.answer_id, a.answer_description, a.is_correct
             FROM questions q
             LEFT JOIN answers a ON q.question_id = a.question_id
             WHERE q.quiz_id = $1
             ORDER BY q.question_id, a.answer_id`,
            [quiz_id]
        );


        // Fetch user's attempted answers
        const attemptedResult = await client.query(
            `SELECT question_id, answer_value, is_correct
             FROM attempted_questions
             WHERE attempt_id = $1
             ORDER BY question_id`,
            [attemptId]
        );


        // Structure questions
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
        const totalQuestions = questions.length;

        // Build detailed results from attempted answers
        const detailedResults = [];

        Object.values(questionsMap).forEach(question => {
            // Find the attempted answer(s) for this question
            const attemptedAnswers = attemptedResult.rows.filter(
                row => row.question_id === question.question_id
            );

            // Get the answer text(s)
            const userAnswerText = attemptedAnswers
                .flatMap(attempt => parseAnswerValue(attempt.answer_value))
                .filter(Boolean)
                .join(', ') || 'Not answered';

            // Get correct answer(s)
            const correctAnswers = question.answers.filter(a => a.is_correct);
            const correctAnswerText = correctAnswers
                .map(a => a.answer_description)
                .join(', ');

            // Determine if correct by checking if user's answer matches correct answer
            const isCorrect = attemptedAnswers.length > 0
                ? attemptedAnswers.every(attempt =>
                    parseAnswerValue(attempt.answer_value).every(val =>
                        question.answers.some(a =>
                            a.answer_description === val && a.is_correct
                        )
                    )
                )
                : false;

            // DEBUG: Log to verify
            console.log(`Question ${question.question_id}: isCorrect from DB = ${isCorrect}`);

            // DEBUG: Log all values
            // console.log(`\n=== Question ${question.question_id} ===`);
            // console.log(`Question Text: ${question.description}`);
            // console.log(`Attempted Answers:`, attemptedAnswers.map(a => a.answer_value));
            // console.log(`Correct Answers:`, correctAnswers.map(a => a.answer_description));
            // console.log(`User Answer Text: ${userAnswerText}`);
            // console.log(`Correct Answer Text: ${correctAnswerText}`);
            // console.log(`isCorrect: ${isCorrect}`);

            detailedResults.push({
                questionId: question.question_id,
                questionText: question.description,
                userAnswerText,
                correctAnswerText,
                isCorrect
            });
        });
        
        const percentage = totalQuestions > 0 ? Math.round((score_achieved / totalQuestions) * 100) : 0;

        res.json({
            success: true,
            results: {
                score: score_achieved,
                totalPoints: totalQuestions,
                percentage,
                correctCount: score_achieved,
                totalQuestions,
                detailedResults
            },
            questions
        });
    } catch (error) {
        console.error('Fetch attempt results error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to fetch attempt results' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

/**
 * GET /api/quiz-history/quiz-stats — fetches aggregated statistics about the user's quiz attempts, such as total quizzes taken, average score, and highest score
 * Expected request header: Authorization
 * Possible responses:
 * 200 | OK/success | Returns aggregated quiz statistics for the user
 * 500 | Server Error | Database crash or unexpected error
 * 
 * This endpoint provides aggregated statistics about the authenticated user's quiz attempts, including total quizzes taken, total attempts, average score, highest score, 
 * and the number of quizzes created by the user. The route uses the authenticate middleware to ensure that only logged-in users can access their quiz statistics. 
 * If the database query fails, it returns a 500 status code with an error message.
 * 
 */
router.get('/quiz-stats', authenticate, async (req, res) => {
    const userId = req.user.userId;

    try {
        const result = await pool.query(
            `SELECT 
                COUNT(DISTINCT qt.quiz_id) AS total_quizzes_taken,
                COUNT(qt.attempt_id) AS total_attempts,
                ROUND(AVG(CAST(qt.score_achieved AS FLOAT) / q.number_of_questions * 100), 2) AS average_score,
                MAX(CAST(qt.score_achieved AS FLOAT) / q.number_of_questions * 100) AS highest_score,
                (SELECT COUNT(*) FROM quizzes WHERE created_by = $1) AS quizzes_created
             FROM quizzes_taken qt
             JOIN quizzes q ON qt.quiz_id = q.quiz_id
             WHERE qt.taken_by = $1`,
            [userId]
        );

        res.json({
            success: true,
            stats: result.rows[0]
        });
    } catch (error) {
        console.error('Fetch quiz stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
    }
});

module.exports = router;