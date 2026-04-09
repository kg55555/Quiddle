const express = require('express');
const pool = require('../util/pool');
const authenticate = require('../middleware/authenticate');

const router = express.Router();


/**
 * This module defines routes for fetching and updating the authenticated user's profile information. It includes two main endpoints:
 * 1. GET /api/user/me: Retrieves the logged-in user's profile information, including first name, middle name, last name, and email. This endpoint requires authentication and returns a 401 status code if the token is invalid or expired.
 * 2. PUT /api/user/me: Allows the logged-in user to update their profile information (first name, middle name, last name). This endpoint also requires authentication and returns a 401 status code if the token is invalid or expired. If the update is successful, it returns a success response; otherwise, it returns a 500 status code with an error message.
 */

/**
 * GET /api/user/me — fetch the logged-in user's profile info
 * Expected request header: Authorization: Bearer <token>
 * Possible responses:
 * 200 | OK/success | Returns the user's profile information (first name, middle name, last name, email)
 * 401 | Unauthorized | Invalid or expired token
 * 500 | Server Error | Database crash or unexpected error
 * This endpoint retrieves the profile information of the authenticated user based on the JWT token provided in the Authorization header.
 * It returns the user's first name, middle name, last name, and email. If the token is invalid or expired, it returns a 401 status code. 
 * If there is a database error, it returns a 500 status code with an error message.
 */

router.get('/me', authenticate, async (req, res) => {
    const userId = req.user.userId;

    try {
        const result = await pool.query(
            'SELECT first_name, middle_name, last_name, email FROM users WHERE id = $1',
            [userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Fetch user error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch profile' });
    }
});

// PUT /api/user/me — update the logged-in user's name

/**
 * PUT /api/user/me — update the logged-in user's profile information (first name, middle name, last name)
 * Expected request header: Authorization: Bearer <token>
 * Expected request body: {
 *   first_name: string,
 *   middle_name: string,
 *   last_name: string
 * }
 * 
 * Possible responses:
 * 200 | OK/success | Returns a success response
 * 401 | Unauthorized | Invalid or expired token
 * 500 | Server Error | Database crash or unexpected error
 * 
 * This endpoint allows the authenticated user to update their profile information, including first name, middle name, and last name. 
 * It requires a valid JWT token in the Authorization header and returns appropriate responses based on the success or failure of the update operation. 
 * If the token is invalid or expired, it returns a 401 status code. If there is a database error during the update, it returns a 500 status code with an error message.
 */
router.put('/me', authenticate, async (req, res) => {
    const userId = req.user.userId;
    const { first_name, middle_name, last_name } = req.body;

    try {
        await pool.query(
            'UPDATE users SET first_name = $1, middle_name = $2, last_name = $3 WHERE id = $4',
			[first_name, middle_name || null, last_name, userId]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
});

module.exports = router;
