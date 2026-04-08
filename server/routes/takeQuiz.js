const express = require('express');
const pool = require('../util/pool');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

/**
 * This module defines routes for taking quizzes and submitting quiz results. It includes two main endpoints:
 * 1. GET /api/take-quiz/:quiz_id: Fetches a quiz by its ID, including all associated questions and answers. It checks the quiz's visibility settings to determine if the authenticated user has access to view it.
 * 2. POST /api/quiz-submissions: Submits a user's answers for a quiz, grades the quiz, and returns the results. It also saves the quiz attempt in the database for future reference in the user's quiz history.
 */

// GET /api/quizzes/:quiz_id — fetches a quiz with its questions and answers
/**
 * GET /api/take-quiz/:quiz_id — fetches a quiz with its questions and answers
 * Expected request header: Authorization
 * Possible responses:
 * 200 | OK/success | Returns the quiz with its questions and answers
 * 403 | Forbidden | User is not the creator of the quiz (for private quizzes)
 * 404 | Not Found | Quiz does not exist or user is not authorized to view it
 * 500 | Server Error | Database crash or unexpected error
 * 
 * This endpoint retrieves a specific quiz by its ID, including all associated questions and answers. It checks the quiz's visibility settings to determine if the 
 * authenticated user has access to view it.
 * 
 */
router.get('/:quiz_id', authenticate, async (req, res) => {
    const { quiz_id } = req.params;
    const userId = req.user.userId;

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
/**
 * POST /api/quiz-submissions — submits and grades a quiz
 * Expected request header: Authorization
 * Expected request body: {
 *   quiz_id: integer,
 *   answers: [{
        quiz_id: quizId,
        answers: {
            questionId: number,
            answerTexts: string[] // For multiple correct answers, user can submit multiple answer texts}
 *    }
 * }]
 * }
 * 
 * 
 * 
 * Possible responses:
 * 200 | OK/success | Quiz graded successfully, returns score and detailed results
 * 400 | Bad Request | Missing or invalid quiz ID or answers
 * 403 | Forbidden | User is not the creator of the quiz (for private quizzes)
 * 404 | Not Found | Quiz does not exist or user is not authorized to view it
 * 500 | Server Error | Database crash or unexpected error
 * 
 * This endpoint allows a user to submit their answers for a quiz, which are then graded against the correct answers stored in the database. 
 * The endpoint checks the quiz's visibility settings to ensure the user has access to take it. If the submission is valid, it calculates the user's score, 
 * saves the attempt in the database, and returns detailed results including which questions were answered correctly or incorrectly.
 * If the quiz ID or answers are missing or invalid, it returns a 400 status code with an error message. If the user is not authorized to take the quiz, 
 * it returns a 403 status code. If the quiz is not found, it returns a 404 status code. In case of any database errors or unexpected issues, 
 * it returns a 500 status code with an appropriate error message.
 */

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

            const correctAnswerIds = question.correctAnswers.sort((a, b) => a - b);
            const correctAnswerDescriptions = question.allAnswers
                .filter(a => correctAnswerIds.includes(a.answer_id))
                .map(a => a.answer_description).sort();

            // Check if answers match exactly (if only select 1 correct answer out of multiple, still results in 0)
            console.log(userAnswer.answerTexts, correctAnswerDescriptions);
            const isCorrect = userAnswer.answerTexts.length === correctAnswerDescriptions.length && userAnswer.answerTexts.every((text, idx) => text.toLowerCase() === correctAnswerDescriptions[idx].toLowerCase());

            if (isCorrect) {
                score++;
            }


            // Get answer text
            const userAnswerText = userAnswer.answerTexts
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
            console.log(detailedResults);
        });

        // Save submission to database (for quiz_taken)
        const submissionResult = await client.query(
            `INSERT INTO quizzes_taken (quiz_id, taken_by, score_achieved)
             VALUES ($1, $2, $3)
             RETURNING attempt_id`,
            [quiz_id, userId, score]
        );

        // Save each question responses
        for (const userAnswer of answers) {
            const question = questionsMap[userAnswer.questionId];
            if (question) {
                await client.query(
                    `INSERT INTO attempted_questions (attempt_id, question_id, answer_value)
                     VALUES ($1, $2, $3)`,
                    [submissionResult.rows[0].attempt_id, userAnswer.questionId, userAnswer.answerTexts]
                );
            }
        }

        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            results: {
                submissionId: submissionResult.rows[0].submission_id,
                // submissionId: 1, // Placeholder since we're not saving submissions in this version
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