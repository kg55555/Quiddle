const express = require('express');
const pool = require('../util/pool');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// POST /api/quizzes — creates a new quiz with its questions and answers
router.post('/', authenticate, async (req, res) => {
    const { name, course_name, description, visibility = 'private', questions } = req.body;
    const userId = req.user.userId;

    if (!questions || questions.length === 0) {
        return res.status(400).json({ success: false, error: 'Questions are required' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Get existing course or create a new one if it doesn't exist
        let courseId = null;
        if (course_name?.trim()) {
            const { rows: [course] } = await client.query(
                `INSERT INTO courses (course_name) VALUES ($1)
                 ON CONFLICT (course_name) DO NOTHING
                 RETURNING course_id`,
                [course_name.trim()]
            );
            // If DO NOTHING triggered, the INSERT returns nothing so fall back to SELECT
            courseId = course?.course_id ?? (
                await client.query('SELECT course_id FROM courses WHERE course_name = $1', [course_name.trim()])
            ).rows[0].course_id;
        }

        // Insert the quiz — number_of_questions is derived from the questions array length
        const { rows: [quiz] } = await client.query(
            `INSERT INTO quizzes (created_by, course_id, visibility, number_of_questions, name, description)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING quiz_id`,
            [userId, courseId, visibility, questions.length, name, description]
        );

        // Insert each question then its answers
        for (const q of questions) {
            const { rows: [question] } = await client.query(
                `INSERT INTO questions (quiz_id, type, description)
                 VALUES ($1, $2, $3)
                 RETURNING question_id`,
                [quiz.quiz_id, q.type, q.question_text]
            );

            for (const a of q.answers) {
                await client.query(
                    `INSERT INTO answers (question_id, answer_description, is_correct)
                     VALUES ($1, $2, $3)`,
                    [question.question_id, a.answer_text, a.is_correct]
                );
            }
        }

        // Commit only if all inserts succeeded
        await client.query('COMMIT');
        res.status(201).json({ success: true, quizId: quiz.quiz_id });

    } catch (error) {
        // Roll back everything if any insert failed
        await client.query('ROLLBACK');
        console.error('Quiz creation error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    } finally {
        // Always release the client back to the pool
        client.release();
    }
});

module.exports = router;
