import nodemailer from 'nodemailer';
import axios from 'axios';

// Brevo API fallback for when SMTP ports are blocked (Render compatibility)
const sendViaBrevoAPI = async ({ to, subject, html, fromName, fromEmail, replyTo }) => {
  const apiKey = process.env.BREVO_API_KEY || process.env.EMAIL_PASSWORD;
  
  if (!apiKey) {
    throw new Error('Brevo API key not configured');
  }

  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: fromName, email: fromEmail },
        to: [{ email: to }],
        replyTo: { email: replyTo },
        subject,
        htmlContent: html
      },
      {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        timeout: 15000
      }
    );
    
    console.log('[Email] ✅ Sent via Brevo API:', response.data.messageId);
    return { success: true, messageId: response.data.messageId };
  } catch (error) {
    console.error('[Email] ❌ Brevo API error:', error.response?.data || error.message);
    throw error;
  }
};

// Create transporter with fallback ports (fixed: use createTransport)
const createTransporter = () => {
  const host = process.env.EMAIL_HOST;
  // Try port 465 (SSL) if 587 is blocked on hosting platform
  const port = parseInt(process.env.EMAIL_PORT || '465', 10);
  // Port 465 requires secure=true, port 587 requires secure=false
  const secure = port === 465 ? true : (String(process.env.EMAIL_SECURE).toLowerCase() === 'true');
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 30000, // 30 seconds
    // Enable debugging for troubleshooting
    logger: false,
    debug: false,
    // Fallback to port 465 if 587 fails (Render compatibility)
    tls: {
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2'
    }
  });

  return transporter;
};

// Send email with SMTP fallback to Brevo API
export const sendEmail = async ({ to, subject, html }) => {
  const fromName = process.env.EMAIL_FROM_NAME;
  const fromEmail = process.env.EMAIL_FROM_ADDRESS;
  const replyTo = process.env.EMAIL_REPLY_TO;

  // Try Brevo API first (works when SMTP ports blocked on Render)
  if (process.env.BREVO_API_KEY || process.env.NODE_ENV === 'production') {
    try {
      return await sendViaBrevoAPI({ to, subject, html, fromName, fromEmail, replyTo });
    } catch (apiError) {
      console.error('[Email] Brevo API failed, trying SMTP fallback...');
      // Fall through to SMTP attempt
    }
  }

  // SMTP fallback (for local development or if API fails)
  try {
    const transporter = createTransporter();
    // Verify transporter configuration for clearer diagnostics
    try {
      await transporter.verify();
      console.log('[Email] ✅ SMTP Transporter verified.');
    } catch (verifyErr) {
      console.error('[Email] ⚠️ SMTP verification failed:', verifyErr.message);
      // Try sending anyway, verification can fail but sending might work
    }
    
    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
      replyTo
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[Email] ✅ Sent via SMTP:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email] ❌ SMTP send error:', error.message);
    return { success: false, error: error.message };
  }
};

// Send verification email
export const sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  const logoUrl = `${process.env.FRONTEND_URL}/images/logos/new_logo.png`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Verify Your Email - NList Planet</title>
      <!--[if mso]>
      <style type="text/css">
        body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
      </style>
      <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); background-attachment: fixed;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            
            <!-- Main Container -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
              
              <!-- Logo Header -->
              <tr>
                <td align="center" style="padding: 40px 30px 20px 30px; background-color: #ffffff;">
                  <img src="${logoUrl}" alt="NList Planet" width="180" style="display: block; max-width: 180px; height: auto; border: 0; outline: none; text-decoration: none;" />
                </td>
              </tr>
              
              <!-- Hero Section -->
              <tr>
                <td style="padding: 0 30px 30px 30px; text-align: center; background-color: #ffffff;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 30px; margin-bottom: 30px;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; line-height: 1.2;">
                      🎉 Welcome Aboard!
                    </h1>
                  </div>
                  
                  <h2 style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                    Hi ${user.fullName}! 👋
                  </h2>
                  
                  <p style="margin: 0 0 25px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                    Thank you for joining <strong style="color: #667eea;">NList Planet</strong> - India's trusted platform for unlisted shares trading.
                  </p>
                </td>
              </tr>
              
              <!-- Content Section -->
              <tr>
                <td style="padding: 0 30px 30px 30px; background-color: #ffffff;">
                  
                  <div style="background-color: #f7fafc; border-radius: 12px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #667eea;">
                    <p style="margin: 0 0 15px 0; color: #2d3748; font-size: 16px; line-height: 1.6; font-weight: 500;">
                      📧 Let's verify your email address
                    </p>
                    <p style="margin: 0; color: #4a5568; font-size: 15px; line-height: 1.6;">
                      Click the button below to activate your account and start exploring unlisted investment opportunities.
                    </p>
                  </div>
                  
                  <!-- CTA Button -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td align="center" style="padding: 0 0 30px 0;">
                        <a href="${verificationUrl}" style="display: inline-block; padding: 18px 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 17px; font-weight: 600; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4); transition: transform 0.2s;">
                          ✓ Verify My Email Address
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Alternative Link -->
                  <div style="background-color: #f7fafc; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                    <p style="margin: 0 0 10px 0; color: #718096; font-size: 14px; text-align: center;">
                      Or copy and paste this link into your browser:
                    </p>
                    <p style="margin: 0; padding: 12px; background-color: #ffffff; border-radius: 8px; word-break: break-all; font-size: 13px; border: 1px solid #e2e8f0; text-align: center;">
                      <a href="${verificationUrl}" style="color: #667eea; text-decoration: none; font-family: monospace;">${verificationUrl}</a>
                    </p>
                  </div>
                  
                  <!-- Warning Box -->
                  <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #ffc107;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td width="30" valign="top" style="padding-right: 10px;">
                          <span style="font-size: 24px;">⏰</span>
                        </td>
                        <td>
                          <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                            <strong>Important:</strong> This verification link will expire in <strong>24 hours</strong>. Please verify your email soon to avoid any delays.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  <!-- Security Note -->
                  <div style="background-color: #edf2f7; border-radius: 12px; padding: 20px; text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #2d3748; font-size: 14px; line-height: 1.6;">
                      🔒 <strong>Security Notice</strong>
                    </p>
                    <p style="margin: 0; color: #4a5568; font-size: 13px; line-height: 1.5;">
                      If you didn't create an account with NList Planet, please ignore this email. Your security is our priority.
                    </p>
                  </div>
                  
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background: linear-gradient(to right, #f7fafc, #edf2f7); padding: 35px 30px; border-top: 3px solid #667eea;">
                  
                  <!-- Social Links -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
                    <tr>
                      <td align="center">
                        <p style="margin: 0 0 15px 0; color: #4a5568; font-size: 15px; font-weight: 600;">
                          Stay Connected
                        </p>
                        <p style="margin: 0 0 20px 0; color: #718096; font-size: 14px;">
                          Need help? We're here for you!<br/>
                          Email: <a href="mailto:hello@nlistplanet.com" style="color: #667eea; text-decoration: none; font-weight: 500;">hello@nlistplanet.com</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Divider -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
                    <tr>
                      <td style="border-top: 1px solid #cbd5e0;"></td>
                    </tr>
                  </table>
                  
                  <!-- Copyright -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td align="center">
                        <p style="margin: 0 0 8px 0; color: #718096; font-size: 13px; line-height: 1.5;">
                          © ${new Date().getFullYear()} <strong>NList Planet</strong>. All rights reserved.
                        </p>
                        <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                          India's Premier Unlisted Shares Marketplace
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                </td>
              </tr>
              
            </table>
            
            <!-- Spacer for mobile -->
            <div style="height: 40px;"></div>
            
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: '✨ Verify Your Email - Welcome to NList Planet!',
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
