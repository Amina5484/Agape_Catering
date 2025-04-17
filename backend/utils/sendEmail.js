import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
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
};
