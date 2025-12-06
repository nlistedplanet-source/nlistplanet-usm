import dotenv from 'dotenv';
dotenv.config();

import { sendOTPSMS, generateOTP } from './utils/smsService.js';

const testPhone = '9876543210'; // Test phone number
const otp = generateOTP();

console.log('=== SMS Service Test ===');
console.log('BREVO_API_KEY configured:', !!process.env.BREVO_API_KEY);
console.log('TWILIO configured:', !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN));
console.log('');
console.log('Testing OTP SMS to:', testPhone);
console.log('Generated OTP:', otp);
console.log('');

try {
  const result = await sendOTPSMS(testPhone, otp);
  console.log('Result:', result);
} catch (error) {
  console.error('Error:', error.message);
}
