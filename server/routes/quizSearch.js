const express = require('express');
const router = express.Router();
const pool = require('../util/pool');

/**
 * This module defines routes for searching quizzes based on a query string. It includes two main endpoints:
 * 1. GET /api/quizsearch?q=searchTerm: This endpoint allows users to search for public quizzes based on a query string that matches quiz names and descriptions. It returns a list of quizzes that match the search term, ordered by relevance.
 * 2. GET /api/quizsearch/suggestions?q=searchTerm: This endpoint provides search suggestions for the quiz search bar. It returns a list of quiz names that partially match the query string, which can be used to enhance the user experience when searching for quizzes.
 */

/**
 * GET /api/quizsearch?q=searchTerm — searches for quizzes based on a query string
 * Expected request query: q (string) - the search term to query quizzes by name and description
 * Possible responses:
 * 200 | OK/success | Returns a list of quizzes matching the search term
 * 400 | Bad Request | Query parameter is missing or invalid
 * 500 | Server Error | Database crash or unexpected error
 *
 * This endpoint allows users to search for public quizzes based on a query string that matches quiz names and descriptions.
 */
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

// for searchbar suggestion
// GET /api/quizsearch/suggestions?q=math

/**
 * GET /api/quizsearch/suggestions?q=searchTerm — provides search suggestions for the quiz search bar
 * Expected request query: q (string) - the search term to query quiz names by
 * Possible responses:
 * 200 | OK/success | Returns a list of quiz names that partially match the search term
 * 400 | Bad Request | Query parameter is missing or invalid
 * 500 | Server Error | Database crash or unexpected error
 *
 * This endpoint provides search suggestions for the quiz search bar. It returns a list of quiz names that partially match the query string, which can be used to enhance the user experience when searching for quizzes.
 */
router.get('/suggestions', async (req, res) => {
    const { q } = req.query;

    if (!q || q.trim().length < 4) {
        return res.json({ results: [] });
    }

    const query = q.trim().slice(0, 200);

    try {
        const result = await pool.query(`
            SELECT 
                q.quiz_id,
                q.name,
                c.course_name
            FROM quizzes q
            LEFT JOIN courses c ON q.course_id = c.course_id
            WHERE q.visibility = 'public'
                AND q.name ILIKE $1
            ORDER BY q.name ASC
            LIMIT 5
        `, [`%${query}%`]);

        res.json({ results: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Suggestions failed' });
    }
});

module.exports = router;
