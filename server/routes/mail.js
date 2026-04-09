const express = require('express');
require('dotenv').config({path: '../.env'});
const nodemailer = require('../util/mailtransporter');
const pool = require('../util/pool');

const router = express.Router();

/**
 * This module defines routes related to email operations, specifically for verifying user email addresses during the registration process. 
 * It includes a POST endpoint that accepts an email and a validation string, checks them against the database, and updates the user's email validation status accordingly. 
 * The route uses the connection pool to interact with the PostgreSQL database and returns appropriate success or error responses based on the outcome of the verification process.
 * The email verification process is typically triggered when a user clicks on a verification link sent to their email after signing up. 
 * The link contains the user's email and a unique validation string, which are used to confirm the user's identity and validate their email address in the system.
 */

// const message = {
//   from: process.env.SMTP_USER,
//   to: process.env.SMTP_TEST_RECEIVER,
//   subject: "Hello World",
//   text: "This is the plaintext version of the email.",
//   html: "<p>This is the <strong>HTML version</strong> of the email.</p>",
// };

// router.get('/send-test-email', async (req, res) => {
//   try {
//     const info = await nodemailer.sendMail(message);
//     console.log('Email sent:', info.response);
//     res.json({ success: true, message: 'Test email sent successfully' });
//   } catch (error) {
//     console.error('Error sending email:', error);
//     res.status(500).json({ success: false, error: 'Failed to send test email' });
//   }
// });


/**
 * POST /api/mail/verify-email — verifies a user's email address using a validation string
 * Expected request body: {
 *   email: string,
 *   validationString: string
 * }
 * Possible responses:
 * 200 | OK/success | Email verified successfully
 * 400 | Bad Request | Invalid validation string or missing fields
 * 500 | Server Error | Database crash or unexpected error
 * 
 * This endpoint is responsible for verifying a user's email address during the registration process. It accepts an email and a validation string, checks them against the database,
 * and updates the user's email validation status if the information is correct. If the validation string is invalid or missing, it returns a 400 status code with an error message. 
 * If the verification is successful, it returns a 200 status code with a success message. In case of any database errors or unexpected issues, 
 * it returns a 500 status code with an appropriate error message.
 */

router.post('/verify-email', async (req, res) => {

  try {
    const { email, validationString } = req.body;
    const result = await pool.query(
      'UPDATE users SET email_validated = TRUE WHERE email = $1 AND email_validation_string = $2 RETURNING id',
      [email, validationString]
    );
    if (result.rowCount === 0) {
      return res.status(400).json({ success: false, message: 'Invalid validation string' });
    }
    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ success: false, error: 'Email verification failed' });
  }
});

module.exports = router;