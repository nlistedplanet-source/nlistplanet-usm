/**
 * Test Lock Screen Notification
 * Sends enhanced notification to test lock screen display
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { createAndSendNotification } from '../utils/pushNotifications.js';

dotenv.config();

async function testLockScreenNotification() {
  try {
    console.log('🔔 Testing Lock Screen Notification...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find users with FCM tokens
    const users = await User.find({
      fcmTokens: { $exists: true, $ne: [] }
    }).select('username fcmTokens').lean();

    if (users.length === 0) {
      console.log('❌ No users with FCM tokens found');
      console.log('\n💡 Please login to mobile app and allow notifications first');
      process.exit(1);
    }

    console.log(`📱 Found ${users.length} users with FCM tokens:\n`);
    users.forEach((u, idx) => {
      console.log(`${idx + 1}. ${u.username} - ${u.fcmTokens.length} token(s)`);
    });

    // Send notification to all users
    console.log('\n🚀 Sending lock screen test notifications...\n');

    for (const user of users) {
      console.log(`\n📲 Sending to: ${user.username}`);
      
      const result = await createAndSendNotification(user._id, {
        type: 'test',
        title: '🔔 NListPlanet Alert',
        message: 'Lock screen notification test - आपको यह mobile lock screen पर दिखना चाहिए!',
        data: {
          actionUrl: '/dashboard',
          testType: 'lock_screen',
          timestamp: new Date().toISOString()
        }
      });

      if (result.success) {
        console.log(`   ✅ Sent successfully`);
        console.log(`   📊 Delivered: ${result.successCount}/${user.fcmTokens.length}`);
      } else {
        console.log(`   ❌ Failed: ${result.reason}`);
      }
    }

    console.log('\n✅ Test complete!');
    console.log('\n📱 Check your phone:');
    console.log('   1. Lock screen पर notification दिखना चाहिए');
    console.log('   2. Sound और vibration होना चाहिए');
    console.log('   3. Icon और app name दिखना चाहिए');
    console.log('   4. Click करने पर app open होगी\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testLockScreenNotification();
