const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();
const nodemailer = require('./util/mailtransporter');
const signuptemplate = require('./util/signuptemplate');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to PostgreSQL database!');
    console.log('Current time from database:', res.rows[0].now);
  }
});

const verificationURL = process.env.ENVIRONMENT === 'development' ? process.env.FRONTEND_DEVELOPMENT_URL + process.env.EMAIL_VERIFICATION_URL : process.env.PRODUCTION_FRONTEND_URL + process.env.EMAIL_VERIFICATION_URL;

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  const { fullName, institution, email, password } = req.body;
  
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (full_name, institution, email, password_hash, email_validation_string) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, email_validation_string',
      [fullName, institution, email, passwordHash, Math.random().toString(36).substring(2, 15)]
    );

    nodemailer.transporter.sendMail(signuptemplate(fullName, email, verificationURL + "/?email=" + result.rows[0].email + "&validationString=" + result.rows[0].email_validation_string));

    res.json({ 
      success: true, 
      userId: result.rows[0].id,
      emailValidationString: result.rows[0].email_validation_string,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.code === '23505') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Signup failed' });
    }
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
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
    
    res.json({ 
      success: true, 
      userId: user.id,
      fullName: user.full_name 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

const mail = require("./routes/mail.js");
app.use("/api/mail", mail);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});