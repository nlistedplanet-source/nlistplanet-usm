/**
 * Check all users with FCM tokens
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

async function checkAllUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users sorted by last activity
    const allUsers = await User.find({})
      .select('username email fcmTokens lastActivity')
      .sort({ lastActivity: -1 })
      .limit(30)
      .lean();

    console.log('📱 All Users (Last 30, sorted by activity):\n');
    
    allUsers.forEach((user, idx) => {
      const name = user.username || user.email?.split('@')[0] || 'Unknown';
      const tokenCount = user.fcmTokens?.length || 0;
      const lastSeen = user.lastActivity 
        ? new Date(user.lastActivity).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        : 'Never';
      
      const status = tokenCount > 0 ? '✅' : '❌';
      console.log(`${idx + 1}. ${status} ${name}`);
      console.log(`   FCM Tokens: ${tokenCount}`);
      console.log(`   Last Seen: ${lastSeen}\n`);
    });

    const usersWithTokens = allUsers.filter(u => u.fcmTokens?.length > 0);
    console.log(`\n📊 Summary:`);
    console.log(`   Total Users: ${allUsers.length}`);
    console.log(`   With Notifications: ${usersWithTokens.length}`);
    console.log(`   Without Notifications: ${allUsers.length - usersWithTokens.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkAllUsers();
