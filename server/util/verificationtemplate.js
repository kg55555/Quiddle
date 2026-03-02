// Function to generate the email content
require('dotenv').config({path: '../.env'});

const getSignupTemplate = (userName, userEmail, confirmLink) => {
  return {
    from: process.env.SMTP_USER,
    to: userEmail,
    subject: "Welcome to Quiddle! Please confirm your account",
    text: `Hello ${userName},\n\nWelcome to our platform! Please confirm your account by clicking the link below:\n${confirmLink}\n\nIf you didn't sign up, you can safely ignore this email.`,
    
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #333;">Welcome aboard, ${userName}! 🚀</h2>
        <p style="font-size: 16px; color: #555; line-height: 1.5;">
          We're excited to have you. To get started, please confirm your email address by clicking the button below:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmLink}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Confirm My Account
          </a>
        </div>
        <p style="font-size: 12px; color: #999;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${confirmLink}" style="color: #007bff;">${confirmLink}</a>
        </p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">
          &copy; 2026 Quiddle. All rights reserved.
        </p>
      </div>
    `
  };
};

module.exports = getSignupTemplate;