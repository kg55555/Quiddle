const express = require('express');
const pool = require('../util/pool');
const authenticate = require('../middleware/authenticate');

const router = express.Router();
// from userID, get all attemped quiz (all quizzes taken with foreign key matching
// user ID and foreign key matching quizzes)

// display 

// GET /api/quiz-history — fetch user's quiz attempt history
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

        res.json({
            success: true,
            quizHistory: result.rows
        });
    } catch (error) {
        console.error('Fetch quiz history error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch quiz history' });
    } finally {
        client.release();
    }
});

// GET /api/quiz-stats — fetch user's quiz statistics
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