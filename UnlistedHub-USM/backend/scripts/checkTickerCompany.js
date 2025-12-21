/**
 * Check if "ticker" company exists
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from '../models/Company.js';

dotenv.config();

async function checkTickerCompany() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if ticker exists
    const ticker = await Company.findOne({ 
      name: { $regex: /^ticker$/i }
    });

    if (ticker) {
      console.log('✅ Company "ticker" EXISTS in database!\n');
      console.log('Company details:');
      console.log(JSON.stringify(ticker, null, 2));
    } else {
      console.log('❌ Company "ticker" does NOT exist in database');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit();
  }
}

checkTickerCompany();
