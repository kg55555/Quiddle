const nodemailer = require('nodemailer');

// Ensure environment variables are loaded
require('dotenv').config({ path: '../.env' });

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