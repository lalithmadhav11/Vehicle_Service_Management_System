import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Base HTML template with premium styling and logo
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
          background-color: #0a0a0a; 
          color: #f0f0f0; 
          margin: 0; 
          padding: 0; 
          -webkit-font-smoothing: antialiased;
        }
        .wrapper {
          background-color: #0a0a0a;
          padding: 40px 20px;
          width: 100%;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #141414; 
          border-radius: 12px; 
          border: 1px solid #2a2a2a; 
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .header { 
          text-align: center; 
          padding: 30px 20px; 
          background: linear-gradient(135deg, #111111 0%, #1a1a1a 100%);
          border-bottom: 2px solid #cc0000; 
        }
        .logo { 
          font-size: 28px; 
          font-weight: 800; 
          color: #ffffff; 
          letter-spacing: 3px; 
          text-transform: uppercase; 
          margin: 0;
        }
        .logo span {
          color: #cc0000;
        }
        .content { 
          padding: 40px 30px; 
          line-height: 1.8; 
          color: #d1d5db; 
          font-size: 16px;
        }
        .footer { 
          text-align: center; 
          padding: 24px; 
          background-color: #0f0f0f;
          border-top: 1px solid #2a2a2a; 
          font-size: 13px; 
          color: #6b7280; 
        }
        .button { 
          display: inline-block; 
          padding: 14px 28px; 
          background-color: #cc0000; 
          color: #ffffff !important; 
          text-decoration: none; 
          border-radius: 6px; 
          font-weight: 600; 
          margin-top: 25px; 
          margin-bottom: 10px;
          text-align: center;
        }
        .box { 
          background-color: #1a1a1a; 
          border: 1px solid #2a2a2a; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 25px 0; 
          border-left: 4px solid #cc0000;
        }
        h2 { 
          color: #ffffff; 
          margin-top: 0; 
          font-weight: 700;
          font-size: 22px;
          margin-bottom: 20px;
        }
        p {
          margin-bottom: 15px;
        }
        strong {
          color: #ffffff;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <div class="logo">AUTO<span>SERVE</span></div>
          </div>
          <div class="content">
            ${options.html}
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} AUTOSERVE Vehicle Service Management System.<br>All rights reserved.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const message = {
    from: `${process.env.EMAIL_USER}`,
    to: options.email,
    subject: options.subject,
    html: htmlTemplate,
  };

  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId);
};

export default sendEmail;
