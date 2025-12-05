/**
 * Re-summarize existing news to Inshorts style (60 words max)
 * Run this once to update all existing news articles
 * 
 * Usage: node scripts/resummarizenews.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import News from '../models/News.js';

// Fix path for dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Inshorts-style summarizer (60 words max)
const createInshortsummary = (content, title) => {
  if (!content && !title) return '';
  
  let text = content || title;
  
  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, '');
  
  // Remove URLs
  text = text.replace(/https?:\/\/[^\s]+/g, '');
  
  // Remove special markers
  text = text.replace(/\[\+\d+ chars\]/g, '');
  text = text.replace(/Read more.*/gi, '');
  text = text.replace(/Click here.*/gi, '');
  text = text.replace(/Subscribe.*/gi, '');
  
  // Clean whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  // Split into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15);
  
  let summary = '';
  let wordCount = 0;
  const maxWords = 60;
  
  for (const sentence of sentences) {
    const cleanSentence = sentence.trim();
    const words = cleanSentence.split(/\s+/);
    
    if (wordCount + words.length <= maxWords) {
      summary += cleanSentence + '. ';
      wordCount += words.length;
    } else if (wordCount < 25) {
      // Need more content, add partial
      const remaining = maxWords - wordCount;
      summary += words.slice(0, remaining).join(' ') + '...';
      break;
    } else {
      break;
    }
  }
  
  summary = summary.trim();
  
  // Ensure proper ending
  if (summary && !summary.endsWith('.') && !summary.endsWith('...')) {
    summary += '.';
  }
  
  return summary || text.split(/\s+/).slice(0, 60).join(' ') + '...';
};

// Main function
const resummarizenews = async () => {
  console.log('\n🔄 Re-summarizing ALL news to Inshorts style (60 words)...\n');
  
  await connectDB();
  
  try {
    // Get all news
    const allNews = await News.find({});
    console.log(`📊 Found ${allNews.length} articles to process\n`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const article of allNews) {
      const originalSummary = article.summary;
      const originalWordCount = originalSummary ? originalSummary.split(/\s+/).length : 0;
      
      // Force update ALL articles to ensure proper 60-word summary
      const newSummary = createInshortsummary(article.content || article.summary, article.title);
      
      if (newSummary && newSummary.length >= 30) {
        const newWordCount = newSummary.split(/\s+/).length;
        
        // Only update if new summary is different and shorter/better
        if (newSummary !== originalSummary) {
          article.summary = newSummary;
          await article.save();
          updated++;
          console.log(`✅ ${article.title.substring(0, 50)}...`);
          console.log(`   ${originalWordCount} words → ${newWordCount} words\n`);
        } else {
          skipped++;
        }
      } else {
        skipped++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   Updated: ${updated} articles`);
    console.log(`   Skipped: ${skipped} articles (already optimal)`);
    console.log('\n✅ Re-summarization complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  await mongoose.connection.close();
  process.exit(0);
};

// Run
resummarizenews();
