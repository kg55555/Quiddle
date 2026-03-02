const express = require('express');
require('dotenv').config({path: '../.env'});
const nodemailer = require('../util/mailtransporter');

const router = express.Router();


const message = {
  from: process.env.SMTP_USER,
  to: process.env.SMTP_TEST_RECEIVER,
  subject: "Hello World",
  text: "This is the plaintext version of the email.",
  html: "<p>This is the <strong>HTML version</strong> of the email.</p>",
};

router.get('/send-test-email', async (req, res) => {
  try {
    const info = await nodemailer.transporter.sendMail(message);
    console.log('Email sent:', info.response);
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: 'Failed to send test email' });
  }
});

router.get('/verify-email/', async (req, res) => {
  const { email, validationString } = req.query;
  try {
    const result = await pool.query(
      'UPDATE users SET email_verified = TRUE WHERE email = $1 AND email_validation_string = $2 RETURNING id',
      [email, validationString]
    );
    if (result.rowCount === 0) {
      return res.status(400).json({ success: false, message: 'Invalid validation string' });
    }
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ success: false, error: 'Email verification failed' });
  }
});

module.exports = router;