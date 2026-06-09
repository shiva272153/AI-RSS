const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * Send OTP email to user
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @param {string} name - User's name (optional)
 */
const sendOTPEmail = async (email, otp, name = 'User') => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"AI Resume Screening" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset OTP — AI Resume Screening',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0; padding:0; background-color:#0a0e1a; font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0e1a; padding:40px 20px;">
          <tr>
            <td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background-color:#111827; border-radius:16px; border:1px solid rgba(148,163,184,0.15); overflow:hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#06b6d4 100%); padding:32px; text-align:center;">
                    <h1 style="color:#ffffff; font-size:24px; margin:0 0 8px; font-weight:800;">🔐 Password Reset</h1>
                    <p style="color:rgba(255,255,255,0.85); font-size:14px; margin:0;">AI Resume Screening System</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:32px;">
                    <p style="color:#f1f5f9; font-size:16px; margin:0 0 16px;">Hi <strong>${name}</strong>,</p>
                    <p style="color:#94a3b8; font-size:14px; line-height:1.6; margin:0 0 24px;">
                      We received a request to reset your password. Use the OTP below to verify your identity:
                    </p>

                    <!-- OTP Code -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding:24px 0;">
                          <div style="display:inline-block; background:rgba(99,102,241,0.1); border:2px solid rgba(99,102,241,0.3); border-radius:12px; padding:16px 40px;">
                            <span style="font-size:36px; font-weight:800; letter-spacing:12px; color:#a5b4fc; font-family:'Courier New',monospace;">
                              ${otp}
                            </span>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <p style="color:#94a3b8; font-size:13px; line-height:1.6; margin:0 0 8px;">
                      ⏰ This OTP expires in <strong style="color:#f1f5f9;">10 minutes</strong>.
                    </p>
                    <p style="color:#94a3b8; font-size:13px; line-height:1.6; margin:0;">
                      If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:20px 32px; border-top:1px solid rgba(148,163,184,0.1);">
                    <p style="color:#64748b; font-size:12px; margin:0; text-align:center;">
                      AI-Based Resume Screening & Job Matching System
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 OTP email sent to ${email} (Message ID: ${info.messageId})`);
  return info;
};

module.exports = { sendOTPEmail };
