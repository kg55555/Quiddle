const express = require('express');
const router = express.Router();
const pool = require('../util/pool');

// GET /api/quizsearch?q=math
router.get('/', async (req, res) => {
    const { q } = req.query;
    if (!q || !q.trim()) return res.status(400).json({ error: 'Query required' });

    const query = q.trim().slice(0, 200);
    try {
        const result = await pool.query(`
            SELECT 
                q.quiz_id,
                q.name,
                q.description,
                q.number_of_questions,
                q.created_at,
                c.course_name,
                u.first_name || ' ' || u.last_name AS created_by_name,
                ts_rank(q.search_vector, websearch_to_tsquery('english', $1)) AS rank
            FROM quizzes q
            LEFT JOIN courses c ON q.course_id = c.course_id
            LEFT JOIN users u ON q.created_by = u.id
            WHERE q.visibility = 'public'
                AND q.search_vector @@ websearch_to_tsquery('english', $1)
            ORDER BY rank DESC
            LIMIT 20
        `, [query]);

        res.json({ results: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Search failed' });
    }
});

module.exports = router;
