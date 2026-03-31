const express = require('express');
const router = express.Router();
const pool = require('../util/pool');

// GET /api/browse
router.get('/', async (req, res) => {

    try {

        const result = await pool.query(
                'SELECT * FROM popular_quizzes'
        );

        res.json({ quizzes: result.rows });

    } catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;