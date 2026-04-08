const express = require('express');
const pool = require('../util/pool');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

/**
 * Quiz creation and editing routes
 * 
 * POST /api/quizzes — creates a new quiz with its questions and answers
 * PUT /api/quizzes/:quizId — updates an existing quiz with its questions and answers
 * GET /api/quizzes/my-quizzes — fetches all quizzes created by the authenticated user
 * GET /api/quizzes/:quizId — fetches a single quiz with its questions and answers (for edit mode)
 * 
 * All routes require authentication. The quiz creator is the only one who can edit their quiz, but quizzes can be fetched for viewing based on their visibility settings.
 * Each quiz consists of metadata (name, description, visibility, course) and an array of questions, where each question has a type, description, and an array of answers (with correctness flags).
 * 
 * The POST and PUT routes use database transactions to ensure that all related inserts/updates succeed or fail together, maintaining data integrity. 
 * Error handling is implemented to return appropriate HTTP status codes and messages for various failure scenarios, such as missing fields, unauthorized access, or server errors.
 * 
 */


/**
 * GET /api/quizzes/my-quizzes — fetches all quizzes created by the authenticated user
 * Expected request header: Authorization
 * Possible responses:
 * 200 | OK/success | Returns an array of quizzes created by the user
 * 500 | Server Error | Database crash or unexpected error
 * 
 * This endpoint retrieves all quizzes from the database that were created by the authenticated user. Each quiz includes its metadata and is ordered by creation date, with the most recent quizzes appearing first.
 * The route uses the authenticate middleware to ensure that only logged-in users can access their quizzes. If the database query fails, it returns a 500 status code with an error message.
 * 
 */
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
        res.status(500).json({ success: false, error: 'Failed to fetch quizzes' });
    }
});

/**
 * GET /api/quizzes/:quizId — fetches a single quiz with its questions and answers (for edit mode)
 * Expected request header: Authorization
 * Possible responses:
 * 200 | OK/success | Returns the quiz with its questions and answers
 * 404 | Not Found | Quiz does not exist or user is not authorized to view it
 * 500 | Server Error | Database crash or unexpected error
 * 
 * This endpoint retrieves a specific quiz created by a user by its ID, including all associated questions and answers. If the quiz is not found or the user is unauthorized, it returns appropriate error responses.
 * The route uses the authenticate middleware to ensure that only logged-in users can access quiz details. If the database query fails, it returns a 500 status code with an error message.
 * 
 */
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
        res.status(500).json({ success: false, error: 'Failed to fetch quiz' });
    }
});

/**
 * POST /api/quizzes — creates a new quiz with its questions and answers
 * Expected request header: Authorization
 * Expected request body: JSON with quiz metadata and an array of questions (each with its answers)
 * Possible responses:
 * 201 | Created/success | Returns the ID of the newly created quiz
 * 400 | Bad Request | Missing required fields or invalid data
 * 500 | Server Error | Database crash or unexpected error
 * 
 * This endpoint allows an authenticated user to create a new quiz by providing its metadata (name, description, visibility, course) and an array of questions 
 * (each with its type, description, and answers).
 */
router.post('/', authenticate, async (req, res) => {
    const { name, course_name, description, visibility = 'private', questions } = req.body;
    const userId = req.user.userId;
	
	if (!name || !name.trim()) {
		return res.status(400).json({ success: false, error: 'Quiz name is required' });
	}
	
    if (!questions || questions.length === 0) {
        return res.status(400).json({ success: false, error: 'Questions are required' });
    }
	
	if (!course_name || !course_name.trim()) {
		return res.status(400).json({ success: false, error: 'Course is required' });
	}
	
	if (!['public', 'private'].includes(visibility)) {
		return res.status(400).json({ success: false, error: 'Invalid visibility' });
	}

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Get existing course or create a new one if it doesn't exist
		const { rows: [course] } = await client.query(
			`INSERT INTO courses (course_name) VALUES ($1)
			 ON CONFLICT (course_name) DO NOTHING
			 RETURNING course_id`,
			[course_name.trim()]
		);
		// If DO NOTHING triggered, the INSERT returns nothing so fall back to SELECT
		const courseId = course?.course_id ?? (
			await client.query('SELECT course_id FROM courses WHERE course_name = $1', [course_name.trim()])
		).rows[0].course_id;
        

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
        res.status(500).json({ success: false, error: 'Internal server error' });
    } finally {
        // Always release the client back to the pool
        client.release();
    }
});


/**
 * PUT /api/quizzes/:quizId — updates an existing quiz with its questions and answers
 * Expected request header: Authorization
 * Expected request body: JSON with quiz metadata and an array of questions (each with its answers)
 * Possible responses:
 * 200 | OK/success | Returns the ID of the updated quiz
 * 400 | Bad Request | Missing required fields or invalid data
 * 403 | Forbidden | User is not the creator of the quiz
 * 404 | Not Found | Quiz does not exist
 * 500 | Server Error | Database crash or unexpected error
 * 
 * This endpoint allows an authenticated user to update an existing quiz that they created by providing its metadata (name, description, visibility, course) and an array of questions 
 * (each with its type, description, and answers). The user must be the creator of the quiz to update it. If the quiz is not found or the user is unauthorized, it returns appropriate error responses.
 */
router.put('/:quizId', authenticate, async (req, res) => {
    const { quizId } = req.params;
    const { name, course_name, description, visibility = 'private', questions } = req.body;
    const userId = req.user.userId;
	
	if (!name || !name.trim()) {
		return res.status(400).json({ success: false, error: 'Quiz name is required' });
	}
	
	if (!questions || questions.length === 0) {
        return res.status(400).json({ success: false, error: 'Questions are required' });
    }
	
	if (!course_name || !course_name.trim()) {
		return res.status(400).json({ success: false, error: 'Course is required' });
	}
	
	if (!['public', 'private'].includes(visibility)) {
		return res.status(400).json({ success: false, error: 'Invalid visibility' });
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
        const { rows: [course] } = await client.query(
			`INSERT INTO courses (course_name) VALUES ($1)
			 ON CONFLICT (course_name) DO NOTHING
			 RETURNING course_id`,
			[course_name.trim()]
		);
		// If DO NOTHING triggered, the INSERT returns nothing so fall back to SELECT
		const courseId = course?.course_id ?? (
			await client.query('SELECT course_id FROM courses WHERE course_name = $1', [course_name.trim()])
		).rows[0].course_id;

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
        res.status(500).json({ success: false, error: 'Internal server error' });
    } finally {
        // Always release the client back to the pool
        client.release();
    }
});

module.exports = router;
