import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import News from './models/News.js';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Get recent articles and check hindiSummary
  const recent = await News.find()
    .sort({ publishedAt: -1 })
    .limit(10)
    .select('title hindiSummary publishedAt')
    .lean();
    
  console.log('=== Recent 10 Articles ===\n');
  recent.forEach((n, i) => {
    const hasHindi = n.hindiSummary && n.hindiSummary.trim().length > 10;
    console.log(`${i+1}. ${n.title?.substring(0,50)}...`);
    console.log(`   Date: ${n.publishedAt}`);
    console.log(`   Hindi: ${hasHindi ? 'YES - ' + n.hindiSummary?.substring(0,50) + '...' : 'NO (empty)'}`);
    console.log('');
  });
  
  // Count actual non-empty Hindi summaries
  const withHindi = await News.countDocuments({ 
    hindiSummary: { $exists: true, $ne: '', $regex: /^.{10,}$/ }
  });
  
  console.log(`\nTotal with non-empty Hindi: ${withHindi} / 216`);
  
  await mongoose.disconnect();
}

check().catch(console.error);
