/**
 * Send Christmas wishes notification to all users
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { sendPushNotification } from '../utils/pushNotifications.js';

dotenv.config();

async function sendChristmasWishes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({ fcmTokens: { $exists: true, $not: { $size: 0 } } }).select('_id username fcmTokens');
    console.log(`🎄 Sending Christmas wishes to ${users.length} users...`);

    const notification = {
      type: 'christmas_wish',
      title: '🎄 Merry Christmas from NListPlanet!',
      message: 'Wishing you and your family a joyful, peaceful, and prosperous Christmas! Thank you for being a valued part of our community.\n\n- Team NListPlanet',
      data: {
        actionUrl: '/dashboard',
        event: 'christmas',
        timestamp: new Date().toISOString()
      }
    };

    let sent = 0;
    for (const user of users) {
      const result = await sendPushNotification(user._id, notification);
      if (result.success) sent++;
    }
    console.log(`\n✅ Christmas wishes sent to ${sent} users!`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

sendChristmasWishes();
