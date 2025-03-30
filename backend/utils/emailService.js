const nodemailer = require('nodemailer');
const config = require('config');

// Configure email transporter (update these settings based on your email provider)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or any other service like 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com', // Use environment variable or update with your email
    pass: process.env.EMAIL_PASSWORD || 'your-app-password' // Use environment variable or update with your app password
  }
});

/**
 * Send email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 * @param {string} html - HTML content
 * @returns {Promise} - Resolves with info about the sent email
 */
const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to,
    subject,
    text,
    html
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendEmail
};
