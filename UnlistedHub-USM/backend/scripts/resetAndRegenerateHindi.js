/**
 * Reset Hindi summaries and regenerate with formal newspaper style
 * Run: node scripts/resetAndRegenerateHindi.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import News from '../models/News.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate Hindi summary - Newspaper style (formal Hindi)
const generateHindiSummary = async (title, englishSummary) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional Hindi news translator for a financial newspaper like Dainik Jagran or Amar Ujala.

Rules:
- Use formal, newspaper-style Hindi (समाचार पत्र शैली)
- Keep it 50-60 words max
- Use proper Hindi grammar and sentence structure
- Maintain professional tone like business news
- Use Hindi numerals for large amounts (करोड़, लाख)
- Technical terms like IPO, shares, market can stay in English
- NO casual words like "यार", "भाई", "सुन", "अरे"
- Write like a news anchor would read on TV

Example style: "विदेशी संस्थागत निवेशकों ने दिसंबर के पहले सप्ताह में ₹11,820 करोड़ के भारतीय शेयर बेचे। हालांकि, घरेलू संस्थागत निवेशकों की मजबूत खरीदारी ने इस दबाव को संतुलित किया।"`
        },
        {
          role: 'user',
          content: `Title: ${title}\n\nEnglish Summary: ${englishSummary}\n\nTranslate to formal newspaper Hindi:`
        }
      ],
      max_tokens: 200,
      temperature: 0.5
    });
    
    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.log(`  ⚠️ Error: ${error.message}`);
    return '';
  }
};

const regenerateAllHindi = async () => {
  console.log('🚀 Regenerating ALL Hindi Summaries (Newspaper Style)...\n');
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not set in .env');
    process.exit(1);
  }
  
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected\n');
  
  // Clear all existing Hindi summaries first
  console.log('🗑️ Clearing old casual Hindi summaries...');
  await News.updateMany({}, { $set: { hindiSummary: '' } });
  console.log('✅ Cleared!\n');
  
  // Get all articles
  const articles = await News.find().sort({ publishedAt: -1 });
  console.log(`📰 Regenerating ${articles.length} articles with formal Hindi\n`);
  
  let updated = 0;
  let failed = 0;
  
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`[${i+1}/${articles.length}] ${article.title.substring(0, 50)}...`);
    
    const hindiSummary = await generateHindiSummary(article.title, article.summary);
    
    if (hindiSummary) {
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
    
    // Rate limit - 25 seconds between requests (free tier: 3 RPM)
    console.log(`  ⏳ Waiting 25s for rate limit...`);
    await new Promise(r => setTimeout(r, 25000));
  }
  
  console.log('\n📊 Summary:');
  console.log(`   Updated: ${updated}`);
  console.log(`   Failed: ${failed}`);
  console.log('\n✅ Newspaper Hindi Regeneration Complete!');
  
  await mongoose.disconnect();
  process.exit(0);
};

regenerateAllHindi().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
