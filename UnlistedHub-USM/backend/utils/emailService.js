import nodemailer from 'nodemailer';

// Create transporter (fixed: use createTransport)
const createTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  const secure = String(process.env.EMAIL_SECURE).toLowerCase() === 'true';
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });

  return transporter;
};

// Send email
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    // Verify transporter configuration for clearer diagnostics
    try {
      await transporter.verify();
      console.log('[Email] Transporter verified. Ready to send.');
    } catch (verifyErr) {
      console.error('[Email] Transporter verification failed:', verifyErr);
    }
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to,
      subject,
      html,
      replyTo: process.env.EMAIL_REPLY_TO
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Send verification email
export const sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                    🎉 Welcome to NList Planet!
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">
                    Hi ${user.fullName}! 👋
                  </h2>
                  
                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                    Thank you for signing up with <strong>NList Planet</strong> - your trusted platform for unlisted shares trading.
                  </p>
                  
                  <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                    To get started, please verify your email address by clicking the button below:
                  </p>
                  
                  <!-- CTA Button -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="padding: 0 0 30px 0;">
                        <a href="${verificationUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                          ✓ Verify Email Address
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 0 0 15px 0; color: #999999; font-size: 14px; line-height: 1.6;">
                    Or copy and paste this link into your browser:
                  </p>
                  
                  <p style="margin: 0 0 30px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px; word-break: break-all; font-size: 14px; color: #667eea;">
                    <a href="${verificationUrl}" style="color: #667eea; text-decoration: none;">${verificationUrl}</a>
                  </p>
                  
                  <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin-bottom: 30px;">
                    <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                      ⏰ <strong>Important:</strong> This verification link will expire in 24 hours.
                    </p>
                  </div>
                  
                  <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                    If you didn't create an account with NList Planet, please ignore this email.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                  <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px;">
                    Need help? Contact us at <a href="mailto:hello@nlistplanet.com" style="color: #667eea; text-decoration: none;">hello@nlistplanet.com</a>
                  </p>
                  <p style="margin: 0; color: #cccccc; font-size: 12px;">
                    © 2025 NList Planet. All rights reserved.
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: '✨ Verify Your Email - NList Planet',
    html
  });
};

// Send welcome email (after verification)
export const sendWelcomeEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to NList Planet</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                    🎊 You're All Set!
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">
                    Welcome aboard, ${user.fullName}! 🚀
                  </h2>
                  
                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                    Your email has been successfully verified! You're now part of the <strong>NList Planet</strong> community.
                  </p>
                  
                  <div style="background-color: #d1f2eb; border-left: 4px solid #28a745; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <p style="margin: 0 0 15px 0; color: #155724; font-size: 16px; font-weight: 600;">
                      What's next?
                    </p>
                    <ul style="margin: 0; padding-left: 20px; color: #155724; font-size: 14px; line-height: 1.8;">
                      <li>Browse unlisted shares marketplace</li>
                      <li>Create your first buy/sell listing</li>
                      <li>Complete your KYC for trading</li>
                      <li>Refer friends and earn rewards</li>
                    </ul>
                  </div>
                  
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="padding: 0 0 30px 0;">
                        <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                          🎯 Go to Dashboard
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                    Need help getting started? Check out our <a href="${process.env.FRONTEND_URL}/how-it-works" style="color: #667eea; text-decoration: none;">How It Works</a> guide.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                  <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px;">
                    Questions? Reach out at <a href="mailto:hello@nlistplanet.com" style="color: #667eea; text-decoration: none;">hello@nlistplanet.com</a>
                  </p>
                  <p style="margin: 0; color: #cccccc; font-size: 12px;">
                    © 2025 NList Planet. All rights reserved.
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: '🎉 Welcome to NList Planet!',
    html
  });
};
