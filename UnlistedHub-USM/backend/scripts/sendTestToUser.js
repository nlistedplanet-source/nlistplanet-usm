/**
 * Send test notification to specific user
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { createAndSendNotification, sendPushNotification } from '../utils/pushNotifications.js';

dotenv.config();

const username = process.argv[2] || 'spongebob205';

async function sendTestNotification() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const user = await User.findOne({ username }).lean();
    
    if (!user) {
      console.log(`❌ User '${username}' not found`);
      process.exit(1);
    }

    console.log(`📱 Sending test notification to: ${username}`);
    console.log(`   User ID: ${user._id}`);
    console.log(`   FCM Tokens: ${user.fcmTokens?.length || 0}`);
    
    if (!user.fcmTokens || user.fcmTokens.length === 0) {
      console.log('\n⚠️  WARNING: User has no FCM tokens registered!');
      console.log('   Notification will NOT be delivered.');
      console.log('   User must login to mobile app and allow notifications first.\n');
    }

    console.log('\n🚀 Sending notification...\n');

    const result = await sendPushNotification(user._id, {
      type: 'test',
      title: '🔔 Test Notification',
      message: 'यह एक test notification है। Lock screen पर दिखना चाहिए!',
      data: {
        actionUrl: '/dashboard',
        testType: 'manual_test',
        timestamp: new Date().toISOString(),
        username: username
      }
    });

    console.log('\n📊 Result:');
    if (result.success) {
      console.log('✅ Notification sent successfully!');
      console.log(`   Delivered: ${result.successCount || 0}`);
      console.log(`   Failed: ${result.failureCount || 0}`);
      if (result.invalidTokens?.length > 0) {
        console.log(`   Invalid tokens removed: ${result.invalidTokens.length}`);
      }
    } else {
      console.log('❌ Failed to send notification');
      console.log('   Reason:', result.error || 'Unknown error');
    }

    console.log('\n📱 Check your mobile app now!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

sendTestNotification();
