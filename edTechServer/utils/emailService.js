const nodemailer = require('nodemailer');
const path = require('path');
const { create } = require('express-handlebars');
const exphbs = require('express-handlebars');
const hbs = require('handlebars');

// Create a transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Configure Handlebars for email templates
const handlebars = exphbs.create({
  extname: '.hbs',
  defaultLayout: false,
  partialsDir: [path.join(__dirname, '../mail/templates/')],
  layoutsDir: path.join(__dirname, '../mail/templates/')
});

// Use the express-handlebars instance with nodemailer
transporter.use('compile', {
  engine: {
    handlebars: handlebars.handlebars,
  },
  viewPath: path.join(__dirname, '../mail/templates/'),
  viewEngine: handlebars,
  extName: '.hbs'
});

/**
 * Send registration confirmation email
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.studentName - Student's full name
 * @param {String} options.courseName - Name of the course
 * @param {String} options.amount - Amount paid
 * @param {String} options.paymentId - Payment reference ID
 */
const sendRegistrationConfirmation = async ({
  to, studentName, courseName, amount, paymentId,
}) => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'WebMok Education'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USERNAME}>`,
      to,
      subject: '🎉 Registration Confirmed | WebMok Education',
      template: 'registration-confirmation',
      context: {
        studentName,
        courseName,
        amount: parseFloat(amount).toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0,
        }),
        paymentId,
        currentYear: new Date().getFullYear(),
        supportEmail: process.env.SUPPORT_EMAIL || 'support@webmok.com',
        websiteUrl: process.env.WEBSITE_URL || 'https://webmok.com',
      },
    };

    await transporter.sendMail(mailOptions);
    console.log(`Registration confirmation email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending registration confirmation email:', error);
    return false;
  }
};

module.exports = {
  sendRegistrationConfirmation,
};
