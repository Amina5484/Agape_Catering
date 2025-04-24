import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // App password (not regular password)
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });

    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);

    // Handle specific error types
    if (error.response) {
      console.error('SMTP Response Error:', error.response);
    } else if (error.code === 'EAUTH') {
      console.error('Authentication Error: Check your email credentials.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('Network Error: Unable to reach the email server.');
    } else {
      console.error('Unexpected Error:', error.message);
    }

    throw new Error('Failed to send email. Please check the logs for more details.');
  }
};