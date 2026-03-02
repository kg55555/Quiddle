const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

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

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  const { firstName, middleName, lastName, institutionID, email, password } = req.body;
  const fullName = middleName 
    ? `${firstName} ${middleName} ${lastName}` 
    : `${firstName} ${lastName}`;

  try {
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
      'INSERT INTO users (full_name, institution_id, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, full_name',
      [fullName, institutionID, email, passwordHash]
    );

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
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
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
    
    console.log(`Login successful for: ${user.id}`);
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

/*
201 | Created/success| User successfully created|
400 | Bad Request  | Missing required fields
404 | Not Found    | Institution ID doesn't exist
409 | Conflict     | Email already registered
500 | Server Error | Database crash or unexpected error

*/


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
