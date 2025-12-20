// Test Push Notification Script
// Usage: node test-push-notification.js <username_or_email>

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from './models/User.js';
import { sendPushNotification, createAndSendNotification } from './utils/pushNotifications.js';

const testPushNotification = async () => {
  try {
    const targetUser = process.argv[2] || 'divyansh'; // Default test user
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find user
    console.log(`\n🔍 Looking for user: ${targetUser}`);
    const user = await User.findOne({
      $or: [
        { username: targetUser },
        { email: targetUser },
        { username: { $regex: targetUser, $options: 'i' } }
      ]
    }).select('_id username email fcmTokens');
    
    if (!user) {
      console.log('❌ User not found!');
      process.exit(1);
    }
    
    console.log(`✅ Found user: ${user.username || user.email}`);
    console.log(`   User ID: ${user._id}`);
    console.log(`   FCM Tokens: ${user.fcmTokens?.length || 0}`);
    
    if (!user.fcmTokens || user.fcmTokens.length === 0) {
      console.log('\n❌ No FCM tokens registered for this user!');
      console.log('   The user needs to:');
      console.log('   1. Open the mobile app');
      console.log('   2. Login');
      console.log('   3. Allow notification permission when prompted');
      console.log('   4. Check browser console for "FCM token registered successfully"');
      process.exit(1);
    }
    
    console.log(`   Tokens: ${user.fcmTokens.map(t => t.substring(0, 20) + '...').join(', ')}`);
    
    // Send test notification
    console.log('\n📤 Sending test push notification...');
    const result = await sendPushNotification(user._id, {
      title: '🧪 Test Notification',
      message: 'This is a test push notification from NListPlanet!',
      type: 'test',
      data: {
        testId: Date.now().toString(),
        actionUrl: '/dashboard'
      }
    });
    
    console.log('\n📊 Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ Push notification sent successfully!');
      console.log(`   Delivered: ${result.successCount}/${user.fcmTokens.length}`);
      if (result.invalidTokens?.length > 0) {
        console.log(`   Invalid tokens removed: ${result.invalidTokens.length}`);
      }
    } else {
      console.log('\n❌ Push notification failed!');
      console.log(`   Reason: ${result.reason || result.error}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

testPushNotification();
