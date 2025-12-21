/**
 * Check companies with null ISIN
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from '../models/Company.js';

dotenv.config();

async function checkNullISIN() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find companies with null ISIN
    const companiesWithNullISIN = await Company.find({ 
      $or: [
        { isin: null },
        { isin: { $exists: false } }
      ]
    }).select('name isin verificationStatus addedBy');

    console.log(`📊 Found ${companiesWithNullISIN.length} companies with null/missing ISIN:\n`);
    
    companiesWithNullISIN.slice(0, 10).forEach((company, index) => {
      console.log(`${index + 1}. ${company.name}`);
      console.log(`   ISIN: ${company.isin}`);
      console.log(`   Status: ${company.verificationStatus}`);
      console.log(`   Added by: ${company.addedBy}\n`);
    });

    if (companiesWithNullISIN.length > 10) {
      console.log(`... and ${companiesWithNullISIN.length - 10} more companies`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit();
  }
}

checkNullISIN();
