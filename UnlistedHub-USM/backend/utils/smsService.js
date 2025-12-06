import axios from 'axios';
import twilio from 'twilio';

// Initialize Twilio client
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    console.error('[SMS] Twilio credentials not configured');
    return null;
  }
  
  return twilio(accountSid, authToken);
};

// Send SMS via Twilio
const sendViaTwilio = async ({ phone, message }) => {
  const client = getTwilioClient();
  
  if (!client) {
    throw new Error('Twilio not configured');
  }

  // Format phone number for India (+91)
  let formattedPhone = phone.replace(/\s+/g, '').replace(/-/g, '');
  if (!formattedPhone.startsWith('+')) {
    if (formattedPhone.startsWith('91')) {
      formattedPhone = '+' + formattedPhone;
    } else {
      formattedPhone = '+91' + formattedPhone;
    }
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });
    
    console.log('[SMS] ✅ Sent via Twilio:', result.sid);
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('[SMS] ❌ Twilio SMS error:', error.message);
    throw error;
  }
};

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via SMS
export const sendOTPSMS = async (phone, otp) => {
  const message = `Your NList Planet verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;
  
  try {
    return await sendViaTwilio({ phone, message });
  } catch (error) {
    console.error('[SMS] Failed to send OTP:', error.message);
    return { success: false, error: error.message };
  }
};

// Send OTP via Email
export const sendOTPEmail = async (user, otp) => {
  // Import sendEmail dynamically to avoid circular dependency
  const { sendEmail } = await import('./emailService.js');
  
  const logoUrl = `${process.env.FRONTEND_URL}/images/logos/new_logo.png`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Verification OTP - NList Planet</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <table role="presentation" width="100%" style="min-height: 100vh;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" width="500" style="max-width: 500px; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
              
              <!-- Logo -->
              <tr>
                <td align="center" style="padding: 35px 30px 20px;">
                  <img src="${logoUrl}" alt="NList Planet" width="140" style="display: block;" />
                </td>
              </tr>
              
              <!-- Header -->
              <tr>
                <td style="padding: 0 30px 25px; text-align: center;">
                  <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700;">
                    🔐 Verification Code
                  </h1>
                  <p style="margin: 10px 0 0; color: #666; font-size: 15px;">
                    Hi ${user.fullName}, use this code to verify your account
                  </p>
                </td>
              </tr>
              
              <!-- OTP Box -->
              <tr>
                <td style="padding: 0 30px 30px;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 30px; text-align: center;">
                    <p style="margin: 0 0 15px; color: rgba(255,255,255,0.9); font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">
                      Your OTP Code
                    </p>
                    <div style="background: #ffffff; border-radius: 12px; padding: 20px 30px; display: inline-block;">
                      <span style="font-size: 36px; font-weight: 700; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${otp}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
              
              <!-- Info -->
              <tr>
                <td style="padding: 0 30px 30px;">
                  <div style="background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 8px; padding: 15px;">
                    <p style="margin: 0; color: #856404; font-size: 14px;">
                      ⏰ This code expires in <strong>10 minutes</strong>
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Security Note -->
              <tr>
                <td style="padding: 0 30px 30px;">
                  <p style="margin: 0; color: #888; font-size: 13px; text-align: center; line-height: 1.6;">
                    🔒 Never share this code with anyone. NList Planet will never ask for your OTP.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #eee;">
                  <p style="margin: 0 0 8px; color: #999; font-size: 12px;">
                    If you didn't request this code, please ignore this email.
                  </p>
                  <p style="margin: 0; color: #bbb; font-size: 11px;">
                    © ${new Date().getFullYear()} NList Planet. All rights reserved.
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
    subject: `🔐 ${otp} - Your NList Planet Verification Code`,
    html
  });
};

export default {
  generateOTP,
  sendOTPSMS,
  sendOTPEmail
};
