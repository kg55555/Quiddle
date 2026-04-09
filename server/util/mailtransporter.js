const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

/**
 * This module sets up a Nodemailer transporter using Gmail's SMTP service. It reads the SMTP credentials from environment variables and verifies the connection on startup. 
 * The transporter is exported for use in other parts of the application, such as sending verification emails during user registration.
 */

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.GOOGLE_APP_PASS,
  },
});

// Verify connection configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Mailer connection error:', error);
  } else {
    console.log('✅ Mailer is ready to take our messages');
  }
});

module.exports = transporter;