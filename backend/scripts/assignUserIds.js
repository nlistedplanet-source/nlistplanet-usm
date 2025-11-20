import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const assignUserIds = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all users without userId
    const usersWithoutId = await User.find({ userId: { $exists: false } });
    console.log(`Found ${usersWithoutId.length} users without userId`);

    if (usersWithoutId.length === 0) {
      console.log('All users already have userId assigned');
      process.exit(0);
    }

    // Generate userId for each user
    for (const user of usersWithoutId) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWYZ0123456789';
      let userId = 'USR';
      for (let i = 0; i < 5; i++) {
        userId += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Check if userId already exists
      const existingUser = await User.findOne({ userId });
      if (existingUser) {
        console.log(`userId ${userId} already exists, regenerating...`);
        continue; // Skip this iteration and try again
      }

      user.userId = userId;
      await user.save();
      console.log(`Assigned userId ${userId} to user ${user.email}`);
    }

    console.log('✅ Successfully assigned userId to all existing users');
    process.exit(0);
  } catch (error) {
    console.error('Error assigning userIds:', error);
    process.exit(1);
  }
};

assignUserIds();
