/**
 * Update Hindi summaries using Google Translate (FREE, no rate limit)
 * Run: node scripts/updateHindiGoogle.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import News from '../models/News.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Google Translate (free, unofficial API)
const translateToHindi = async (text) => {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Extract translated text
    let translated = '';
    if (data && data[0]) {
      data[0].forEach(item => {
        if (item[0]) translated += item[0];
      });
    }
    
    return translated || '';
  } catch (error) {
    console.log(`  ⚠️ Translate error: ${error.message}`);
    return '';
  }
};

const updateHindiSummaries = async () => {
  console.log('🚀 Updating Hindi Summaries (Google Translate)...\n');
  
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected\n');
  
  // Find articles without Hindi summary
  const articles = await News.find({
    $or: [
      { hindiSummary: { $exists: false } },
      { hindiSummary: '' },
      { hindiSummary: null }
    ]
  }).sort({ publishedAt: -1 });
  
  console.log(`📰 Found ${articles.length} articles without Hindi summary\n`);
  
  let updated = 0;
  let failed = 0;
  
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`[${i+1}/${articles.length}] ${article.title.substring(0, 50)}...`);
    
    // Translate summary
    const hindiSummary = await translateToHindi(article.summary);
    
    if (hindiSummary && hindiSummary.length > 20) {
      await News.updateOne(
        { _id: article._id },
        { $set: { hindiSummary } }
      );
      console.log(`  ✅ ${hindiSummary.substring(0, 60)}...`);
      updated++;
    } else {
      console.log(`  ❌ Failed`);
      failed++;
    }
    
    // Small delay to be nice to Google
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log('\n📊 Summary:');
  console.log(`   Updated: ${updated}`);
  console.log(`   Failed: ${failed}`);
  console.log('\n✅ Hindi Update Complete!');
  
  await mongoose.disconnect();
  process.exit(0);
};

updateHindiSummaries().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
