import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import News from './models/News.js';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const total = await News.countDocuments();
  const withHindi = await News.countDocuments({ 
    hindiSummary: { $exists: true, $ne: '', $ne: null } 
  });
  
  console.log(`Total news: ${total}`);
  console.log(`With Hindi summary: ${withHindi}`);
  
  // Sample one with Hindi
  const sample = await News.findOne({ 
    hindiSummary: { $exists: true, $ne: '' } 
  }).select('title summary hindiSummary').lean();
  
  if (sample) {
    console.log('\n--- Sample Article ---');
    console.log('Title:', sample.title?.substring(0, 60));
    console.log('English:', sample.summary?.substring(0, 100));
    console.log('Hindi:', sample.hindiSummary?.substring(0, 100));
  }
  
  // Check recent articles
  const recent = await News.find()
    .sort({ publishedAt: -1 })
    .limit(5)
    .select('title hindiSummary')
    .lean();
    
  console.log('\n--- Recent 5 Articles ---');
  recent.forEach((n, i) => {
    console.log(`${i+1}. ${n.title?.substring(0,50)}... | Hindi: ${n.hindiSummary ? 'YES' : 'NO'}`);
  });
  
  await mongoose.disconnect();
}

check().catch(console.error);
