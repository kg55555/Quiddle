const express = require('express');
const router = express.Router();
const pool = require('../util/pool');

/**
 * GET /api/browse — fetches a list of popular quizzes for browsing
 * Expected request: No parameters required
 * Possible responses:
 * 200 | OK/success | Returns a list of popular quizzes with their metadata
 * 500 | Server Error | Database crash or unexpected error
 * 
 * This endpoint retrieves a list of popular quizzes from the database, which can be used for browsing and discovery by users. 
 * The quizzes returned include their metadata such as quiz ID, name, description, course ID, number of questions, visibility, and creator information.
 * If the database query fails, it returns a 500 status code with an error message.
 * 
 * Note: This endpoint is intended for browsing quizzes and does not require authentication. It returns public quizzes based on popularity metrics defined in the database (e.g., number of attempts)
 */

// GET /api/browse
router.get('/', async (req, res) => {

    try {

        const result = await pool.query(
                'SELECT * FROM popular_quizzes'
        );

        res.status(200).json({ quizzes: result.rows });

    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;