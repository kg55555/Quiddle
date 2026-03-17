const express = require('express');
const pool = require('../util/pool');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// GET /api/quizzes/my-quizzes — list user's own quizzes (Hub.tsx)
// Must be defined before /:quizId or Express will match "my-quizzes" as a quizId
router.get('/my-quizzes', authenticate, async (req, res) => {
    const userId = req.user.userId;

    try {
        const result = await pool.query(`
            SELECT q.quiz_id AS id, q.name, q.description, q.visibility,
                   COALESCE(c.course_name, 'No Course') AS course_name,
                   q.created_at
            FROM quizzes q
            LEFT JOIN courses c ON q.course_id = c.course_id
            WHERE q.created_by = $1
            ORDER BY q.created_at DESC
        `, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error('My quizzes error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch quizzes' });
    }
});

// GET /api/quizzes/:quizId — fetch a single quiz with its questions and answers (for edit mode)
router.get('/:quizId', authenticate, async (req, res) => {
    const { quizId } = req.params;
    const userId = req.user.userId;

    try {
        const quizResult = await pool.query(`
            SELECT q.quiz_id, q.name, q.description, q.visibility,
                   COALESCE(c.course_name, '') AS course_name
            FROM quizzes q
            LEFT JOIN courses c ON q.course_id = c.course_id
            WHERE q.quiz_id = $1 AND q.created_by = $2
        `, [quizId, userId]);

        if (quizResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Quiz not found or unauthorized' });
        }

        const questionsResult = await pool.query(`
            SELECT q.question_id, q.type, q.description AS question_text,
                   a.answer_id, a.answer_description AS answer_text, a.is_correct
            FROM questions q
            LEFT JOIN answers a ON a.question_id = q.question_id
            WHERE q.quiz_id = $1
            ORDER BY q.question_id, a.answer_id
        `, [quizId]);

        // Group flat JOIN rows back into a nested questions array
        const qMap = new Map();
        questionsResult.rows.forEach(row => {
            if (!qMap.has(row.question_id)) {
                qMap.set(row.question_id, {
                    question_id: row.question_id,
                    type: row.type,
                    question_text: row.question_text,
                    answers: []
                });
            }
            if (row.answer_id) {
                qMap.get(row.question_id).answers.push({
                    answer_id: row.answer_id,
                    answer_text: row.answer_text,
                    is_correct: row.is_correct
                });
            }
        });

        res.json({
            ...quizResult.rows[0],
            questions: [...qMap.values()]
        });
    } catch (error) {
        console.error('Fetch quiz error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch quiz' });
    }
});

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

// PUT /api/quizzes/:quizId — updates an existing quiz with its questions and answers
router.put('/:quizId', authenticate, async (req, res) => {
    const { quizId } = req.params;
    const { name, course_name, description, visibility = 'private', questions } = req.body;
    const userId = req.user.userId;

    if (!questions || questions.length === 0) {
        return res.status(400).json({ success: false, error: 'Questions are required' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Only allow the quiz owner to edit
        const { rows } = await client.query(
            'SELECT quiz_id FROM quizzes WHERE quiz_id = $1 AND created_by = $2',
            [quizId, userId]
        );
        if (rows.length === 0) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

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

        // Update quiz metadata — number_of_questions is derived from the questions array length
        await client.query(
            `UPDATE quizzes SET name = $1, description = $2, visibility = $3,
             number_of_questions = $4, course_id = $5
             WHERE quiz_id = $6`,
            [name, description, visibility, questions.length, courseId, quizId]
        );

        // Delete old answers first, then questions — avoids FK constraint violations
        await client.query(
            'DELETE FROM answers WHERE question_id IN (SELECT question_id FROM questions WHERE quiz_id = $1)',
            [quizId]
        );
        await client.query('DELETE FROM questions WHERE quiz_id = $1', [quizId]);

        // Reinsert each question then its answers (same pattern as POST)
        for (const q of questions) {
            const { rows: [question] } = await client.query(
                `INSERT INTO questions (quiz_id, type, description)
                 VALUES ($1, $2, $3)
                 RETURNING question_id`,
                [quizId, q.type, q.question_text]
            );

            for (const a of q.answers) {
                await client.query(
                    `INSERT INTO answers (question_id, answer_description, is_correct)
                     VALUES ($1, $2, $3)`,
                    [question.question_id, a.answer_text, a.is_correct]
                );
            }
        }

        // Commit only if all updates succeeded
        await client.query('COMMIT');
        res.json({ success: true, quizId });

    } catch (error) {
        // Roll back everything if any update failed
        await client.query('ROLLBACK');
        console.error('Quiz update error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    } finally {
        // Always release the client back to the pool
        client.release();
    }
});

module.exports = router;
