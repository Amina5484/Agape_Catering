import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error(
        'Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in your .env file'
      );
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Email sent successfully to ${to} with message ID: ${info.messageId}`
    );
    return true;
  } catch (error) {
    console.error('Error sending email:', error);

    // Handle specific error types
    if (error.response) {
      console.error('SMTP Response Error:', error.response);
    } else if (error.code === 'EAUTH') {
      console.error(
        'Authentication Error: Check your email credentials in .env file'
      );
    } else if (error.code === 'ENOTFOUND') {
      console.error('Network Error: Unable to reach the email server');
    } else {
      console.error('Unexpected Error:', error.message);
    }

    throw new Error(
      'Failed to send email. Please check the logs for more details.'
    );
  }
};
