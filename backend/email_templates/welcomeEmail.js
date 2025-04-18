const welcomeEmailHTML = (name, email, password, role) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Welcome to Catering App</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
          line-height: 1.6;
        }
  
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
  
        .header {
          background-color: #f8b400;
          color: white;
          padding: 20px;
          text-align: center;
        }
  
        .header h1 {
          margin: 0;
          font-size: 26px;
        }
  
        .content {
          padding: 30px 20px;
        }
  
        .content p {
          margin-bottom: 15px;
          font-size: 16px;
          color: #333;
        }
  
        .password-box {
          background-color: #fff5e6;
          padding: 15px;
          border-left: 5px solid #f8b400;
          font-size: 18px;
          font-weight: bold;
          color: #d35400;
          word-break: break-all;
        }
  
        .footer {
          background-color: #333;
          color: white;
          text-align: center;
          padding: 15px;
          font-size: 12px;
        }
  
        .footer p {
          margin: 5px 0;
        }
  
        @media only screen and (max-width: 600px) {
          .header h1 {
            font-size: 22px;
          }
  
          .content {
            padding: 20px 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Catering App</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>You have been successfully registered as a <strong>${role}</strong>.</p>
          <p>Your temporary password is:</p>
          <div class="password-box">${password}</div>
          <p>Please make sure to change your password after logging in for better security.</p>
          <p>If you have any questions, contact our support team anytime.</p>
          <p>Best regards,<br/>The Catering App Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Catering App. All rights reserved.</p>
          <p>Contact us at support@aggapecatering.com</p>
        </div>
      </div>
    </body>
    </html>
    `;
  };
  
  export default welcomeEmailHTML;
  