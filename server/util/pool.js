const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

/**
 * This module sets up a connection pool to a PostgreSQL database using the `pg` library. 
 * It reads the database connection string from environment variables and configures SSL settings for secure connections. 
 * The pool is tested on startup by executing a simple query to ensure that the database connection is working properly. 
 * The configured pool is then exported for use in other parts of the application, such as route handlers that need to interact with the database.
 */
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

module.exports = pool;