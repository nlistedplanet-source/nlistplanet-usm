/**
 * Update existing news articles with Hindi summaries
 * Run: node scripts/updateHindiSummaries.js
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

// Generate Hindi summary using GPT-4 (natural conversational Hindi)
const generateHindiSummary = async (title, englishSummary) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a news summarizer. Convert English news to natural, conversational Hindi (aam bolchal wali Hindi). 
          
Rules:
- Use simple Hindi that common people speak, NOT formal/translated Hindi
- Keep it 50-60 words max
- Make it sound like a friend is telling you the news
- Use Hinglish where natural (common English words like "shares", "market", "company" can stay)
- Don't use heavy Sanskrit-based Hindi words
- The tone should be casual but informative`
        },
        {
          role: 'user',
          content: `Title: ${title}\n\nEnglish Summary: ${englishSummary}\n\nConvert this to natural Hindi:`
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });
    
    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.log(`  ⚠️ Error: ${error.message}`);
    return '';
  }
};

const updateHindiSummaries = async () => {
  console.log('🚀 Starting Hindi Summary Update...\n');
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not set in .env');
    process.exit(1);
  }
  
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
    
    const hindiSummary = await generateHindiSummary(article.title, article.summary);
    
    if (hindiSummary) {
      await News.updateOne(
        { _id: article._id },
        { $set: { hindiSummary } }
      );
      console.log(`  ✅ Hindi: ${hindiSummary.substring(0, 60)}...`);
      updated++;
    } else {
      console.log(`  ❌ Failed to generate Hindi summary`);
      failed++;
    }
    
    // Rate limit - wait 500ms between requests
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log('\n📊 Summary:');
  console.log(`   Updated: ${updated}`);
  console.log(`   Failed: ${failed}`);
  console.log('\n✅ Hindi Summary Update Complete!');
  
  await mongoose.disconnect();
  process.exit(0);
};

updateHindiSummaries().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
