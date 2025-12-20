/**
 * Debug FCM Token Registration for Specific User
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const username = process.argv[2] || 'spongebob205';

async function debugUserToken() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const user = await User.findOne({ username }).lean();
    
    if (!user) {
      console.log(`❌ User '${username}' not found`);
      process.exit(1);
    }

    console.log(`\n🔍 Debug Info for: ${username}\n`);
    console.log('User ID:', user._id);
    console.log('Email:', user.email || 'N/A');
    console.log('Phone:', user.phone || 'N/A');
    console.log('\n📱 FCM Token Status:');
    console.log('Tokens Count:', user.fcmTokens?.length || 0);
    
    if (user.fcmTokens && user.fcmTokens.length > 0) {
      console.log('✅ Has FCM Tokens:');
      user.fcmTokens.forEach((token, idx) => {
        console.log(`   ${idx + 1}. ${token.substring(0, 40)}...`);
      });
    } else {
      console.log('❌ No FCM tokens registered\n');
      console.log('📝 To register token, user must:');
      console.log('   1. Open app in Chrome browser');
      console.log('   2. Login with username:', username);
      console.log('   3. Allow notification permission when asked');
      console.log('   4. Wait 2-3 seconds for token to register');
      console.log('   5. Check console for "🔔 Push notifications enabled!"');
    }

    console.log('\n🔐 Last Activity:', user.lastActivity || 'Never');
    console.log('Account Created:', user.createdAt);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

debugUserToken();
