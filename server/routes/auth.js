const express = require('express');
require('dotenv').config({path: '../.env'});
const nodemailer = require('../util/mailtransporter');
const pool = require('../util/pool');
const signuptemplate = require('../util/verificationtemplate');
const bcrypt = require('bcrypt');
const { signToken, verifyToken } = require('../util/token');

const router = express.Router();

/**
 * This module defines the authentication routes for the application, including user signup, login, and token verification. 
 * The signup route handles user registration by validating input, checking for existing users, and inserting new users into the database. It also sends a verification email using Nodemailer. 
 * The login route authenticates users by verifying their credentials and returns a JWT token upon successful login. 
 * The token verification route checks the validity of a provided JWT token and returns an appropriate response. 
 * Each route includes error handling to return relevant HTTP status codes and messages based on different failure scenarios.
 */


/**
* Signup endpoint
* Expected request body: {
*  firstName: string,
*  middleName: string (optional),
*  lastName: string,
*  institutionID: integer,
*  email: string,
*  password: string
* }
* Possible responses:
* 201 | Created/success| User successfully created|
* 400 | Bad Request  | Missing required fields
* 404 | Not Found    | Institution ID doesn't exist
* 400 | Instituion domain | Domain of institution not found
* 409 | Conflict     | Email already registered
* 500 | Server Error | Database crash or unexpected error
* 
* The email verification process is handled by sending an email with a unique validation string. The user must click the link in the email to verify their account, 
* which updates the database to mark the email as validated.
* 
*/
router.post('/signup', async (req, res) => {
    try {
        const { firstName, middleName, lastName, institutionID, email, password } = req.body;

        // Used for email template display only
        const displayName = middleName
            ? `${firstName} ${middleName} ${lastName}`
            : `${firstName} ${lastName}`;

        // 400 - Missing required fields
        if (!firstName || !lastName || !email || !password || !institutionID) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }

        // 409 - Email already registered (conflict)
        const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(409).json({ success: false, error: 'Email already registered' });
        }

        // 404 - Institution not found
		const instNameQuery = await pool.query(
			'SELECT institution_name FROM valid_institutions WHERE institution_id = $1',
			[institutionID]
		);
		if (instNameQuery.rows.length === 0) {
			return res.status(404).json({ success: false, error: 'Institution not found' });
		}

		// 400 - Email domain doesn't match institution
		const emailDomain = '@' + email.split('@')[1];
		const instCheck = await pool.query(
			'SELECT institution_id FROM valid_institutions WHERE institution_name = $1 AND accepted_email_endings = $2',
			[instNameQuery.rows[0].institution_name, emailDomain]
		);
		if (instCheck.rows.length === 0) {
			return res.status(400).json({ success: false, error: 'Email domain does not match institution' });
		}


        // 201 - Successfully created
        const passwordHash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (first_name, middle_name, last_name, institution_id, email, password_hash, email_validation_string) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, first_name, last_name, email_validation_string',
            [firstName, middleName || null, lastName, institutionID, email, passwordHash, Math.random().toString(36).substring(2, 15)]
        );

        nodemailer.sendMail(signuptemplate(displayName, email, process.env.FRONTEND_URL + "/verify-email?email=" + result.rows[0].email + "&validationString=" + result.rows[0].email_validation_string));

        res.status(201).json({
            success: true,
            userId: result.rows[0].id,
            firstName: result.rows[0].first_name,
            lastName: result.rows[0].last_name
        });

    } catch (error) {
        // 500 - Server/database error
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});


/**
 * Login endpoint
 * Expected request body: {
 *  username: string (email),
 *  password: string
 * }
 * Possible responses:
 * 200 | OK/success | Login successful, returns JWT token and user info
 * 401 | Unauthorized | Invalid credentials (email not found or password mismatch)
 * 500 | Server Error | Database crash or unexpected error
 * 
 * The login process involves checking if the provided email exists in the database, verifying the password using bcrypt, 
 * and then signing a JWT token with the user's ID and email if authentication is successful. 
 * The token can be used for subsequent authenticated requests to protected routes.
 * 
 */
router.post('/login', async (req, res) => {

    try {
        const { username, password } = req.body;
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = signToken({ userId: user.id, email: user.email });

        res.json({
            success: true,
            token: token,
            userId: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * Verify token endpoint
 * Expected request header: Authorization: Bearer <token>
 * Possible responses:
 * 200 | OK/success | Token is valid, returns user info
 * 401 | Unauthorized | Invalid or expired token
 * 
 * This endpoint checks the validity of a JWT token provided in the Authorization header.
 */
router.get('/verify-token', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        const userData = verifyToken(token);
        res.status(201).json({ success: true,});
    } catch (error) {
        res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
});

/*
201 | Created/success| User successfully created|
400 | Bad Request  | Missing required fields
404 | Not Found    | Institution ID doesn't exist
400 | Instituion domain | Domain of institution not found
409 | Conflict     | Email already registered
500 | Server Error | Database crash or unexpected error

*/

module.exports = router;
