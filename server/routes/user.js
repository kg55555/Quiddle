const express = require('express');
const pool = require('../util/pool');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// GET /api/user/me — fetch the logged-in user's profile info
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
