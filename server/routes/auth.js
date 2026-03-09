const express = require('express');
require('dotenv').config({path: '../.env'});
const nodemailer = require('../util/mailtransporter');
const pool = require('../util/pool');
const signuptemplate = require('../util/verificationtemplate');
const bcrypt = require('bcrypt');
const { signToken, verifyToken } = require('../util/token');

const router = express.Router();

// Signup endpoint

router.post('/signup', async (req, res) => {
  try {
    const { firstName, middleName, lastName, institutionID, email, password } = req.body;
    const fullName = middleName 
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
    const instCheck = await pool.query('SELECT institution_id FROM valid_institutions WHERE institution_id = $1', [institutionID]);
    if (instCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Institution not found' });
    }

    // 201 - Successfully created
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (full_name, institution_id, email, password_hash, email_validation_string) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, email_validation_string',
      [fullName, institutionID, email, passwordHash, Math.random().toString(36).substring(2, 15)]
    );

    nodemailer.sendMail(signuptemplate(fullName, email, process.env.FRONTEND_URL + "/verify-email?email=" + result.rows[0].email + "&validationString=" + result.rows[0].email_validation_string));

    res.status(201).json({ 
      success: true, 
      userId: result.rows[0].id,
      fullName: result.rows[0].full_name
    });

  } catch (error) {
    console.error('Signup error:', error);
    // 500 - Server/database error
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


// Login endpoint
router.post('/login', async (req, res) => {

  try {
    const { username, password } = req.body;
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      console.log(`Login failed`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      console.log(`Login failed`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = signToken({ userId: user.id, email: user.email });

    console.log(`Login successful for: ${user.id}`);
    res.json({ 
      success: true,
      token: token, 
      userId: user.id,
      fullName: user.full_name,
      email: user.email 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

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
    console.error('Token verification error:', error);
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
});

/*
201 | Created/success| User successfully created|
400 | Bad Request  | Missing required fields
404 | Not Found    | Institution ID doesn't exist
409 | Conflict     | Email already registered
500 | Server Error | Database crash or unexpected error

*/

module.exports = router;