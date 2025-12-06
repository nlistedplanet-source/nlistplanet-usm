/**
 * Auto News Fetcher Script
 * 
 * This script automatically fetches news from RSS feeds and APIs,
 * summarizes them (Inshorts-style 60-80 words), and stores in database.
 * 
 * Run via cron job: 0 *\/6 * * * (every 6 hours)
 * Or manually: node scripts/fetchNews.js
 */

import mongoose from 'mongoose';
import Parser from 'rss-parser';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import OpenAI from 'openai';
import { v2 as cloudinary } from 'cloudinary';
import News from '../models/News.js';

// Fix path for dotenv when running from scripts folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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

// RSS Parser
const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail', 'enclosure']
  }
});

// RSS Feed Sources for Unlisted/Pre-IPO/Stock Market News
const RSS_FEEDS = [
  // ===== A. INDIA BUSINESS & MARKET NEWS =====
  {
    url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
    name: 'Economic Times Markets',
    category: 'Market'
  },
  {
    url: 'https://economictimes.indiatimes.com/markets/ipos/fpos/rssfeeds/12167922.cms',
    name: 'ET IPO',
    category: 'IPO'
  },
  {
    url: 'https://www.livemint.com/rss/markets',
    name: 'Livemint Markets',
    category: 'Market'
  },
  {
    url: 'https://www.livemint.com/rss/business',
    name: 'Livemint Business',
    category: 'Market'
  },
  {
    url: 'https://www.business-standard.com/rss/markets-106.rss',
    name: 'Business Standard Markets',
    category: 'Market'
  },
  {
    url: 'https://www.moneycontrol.com/rss/MCtopnews.xml',
    name: 'Moneycontrol Top News',
    category: 'Market'
  },
  {
    url: 'https://www.thehindubusinessline.com/feeder/default.rss',
    name: 'The Hindu Business Line',
    category: 'Market'
  },
  {
    url: 'https://www.financialexpress.com/feed/',
    name: 'Financial Express',
    category: 'Market'
  },
  
  // ===== B. STARTUP, FUNDING & PRIVATE MARKET =====
  {
    url: 'https://techcrunch.com/feed/',
    name: 'TechCrunch',
    category: 'Startup'
  },
  
  // ===== C. INTERNATIONAL MARKET & FINANCIAL NEWS =====
  {
    url: 'https://finance.yahoo.com/news/rssindex',
    name: 'Yahoo Finance',
    category: 'Market'
  },
  {
    url: 'https://www.reutersagency.com/feed/?taxonomy=best-sectors&post_type=best',
    name: 'Reuters Markets',
    category: 'Market'
  },
  {
    url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    name: 'CNBC World',
    category: 'Market'
  },
  {
    url: 'https://www.marketwatch.com/rss/topstories',
    name: 'MarketWatch',
    category: 'Market'
  },
  
  // ===== D. GOOGLE NEWS - KEYWORD BASED =====
  {
    url: 'https://news.google.com/rss/search?q=unlisted+shares+india&hl=en-IN&gl=IN&ceid=IN:en',
    name: 'Google News - Unlisted Shares',
    category: 'Unlisted'
  },
  {
    url: 'https://news.google.com/rss/search?q=pre+ipo+india&hl=en-IN&gl=IN&ceid=IN:en',
    name: 'Google News - Pre-IPO',
    category: 'IPO'
  },
  {
    url: 'https://news.google.com/rss/search?q=startup+funding+india&hl=en-IN&gl=IN&ceid=IN:en',
    name: 'Google News - Startup Funding',
    category: 'Startup'
  },
  {
    url: 'https://news.google.com/rss/search?q=IPO+india&hl=en-IN&gl=IN&ceid=IN:en',
    name: 'Google News - IPO India',
    category: 'IPO'
  },
  
  // ===== E. GOVERNMENT & REGULATORY =====
  {
    url: 'https://www.sebi.gov.in/rss',
    name: 'SEBI Press Releases',
    category: 'Regulatory'
  }
];

// Keywords to filter relevant news
const RELEVANT_KEYWORDS = [
  'unlisted', 'pre-ipo', 'ipo', 'shares', 'stock', 'equity',
  'startup', 'funding', 'valuation', 'investment', 'investor',
  'nse', 'bse', 'sebi', 'market', 'trading', 'demat',
  'reliance', 'tata', 'hdfc', 'icici', 'bajaj', 'adani',
  'fintech', 'pharma', 'it sector', 'banking', 'insurance'
];

// Auto-detect category based on content
const detectCategory = (title, summary) => {
  const text = `${title} ${summary}`.toLowerCase();
  
  if (text.includes('ipo') || text.includes('pre-ipo') || text.includes('listing')) {
    return 'IPO';
  }
  if (text.includes('unlisted') || text.includes('pre ipo')) {
    return 'Unlisted';
  }
  if (text.includes('startup') || text.includes('funding') || text.includes('venture') || text.includes('series a') || text.includes('series b')) {
    return 'Startup';
  }
  if (text.includes('sebi') || text.includes('rbi') || text.includes('regulation') || text.includes('compliance') || text.includes('ministry')) {
    return 'Regulatory';
  }
  if (text.includes('analysis') || text.includes('outlook') || text.includes('forecast')) {
    return 'Analysis';
  }
  if (text.includes('company') || text.includes('announces') || text.includes('reports')) {
    return 'Company';
  }
  if (text.includes('market') || text.includes('sensex') || text.includes('nifty')) {
    return 'Market';
  }
  
  return 'General';
};

// Summarize content to 60 words max (Inshorts style - crisp & concise)
const summarizeContent = (content, maxWords = 60) => {
  if (!content) return '';
  
  // Remove HTML tags
  let text = content.replace(/<[^>]*>/g, '');
  
  // Remove extra whitespace, URLs, and special chars
  text = text.replace(/https?:\/\/[^\s]+/g, ''); // Remove URLs
  text = text.replace(/\s+/g, ' ').trim();
  text = text.replace(/\[\+\d+ chars\]/g, ''); // Remove [+123 chars] markers
  
  // Split into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  let summary = '';
  let wordCount = 0;
  
  for (const sentence of sentences) {
    const cleanSentence = sentence.trim();
    const words = cleanSentence.split(/\s+/);
    
    if (wordCount + words.length <= maxWords) {
      summary += cleanSentence + '. ';
      wordCount += words.length;
    } else if (wordCount < 30) {
      // If we have less than 30 words, add partial sentence
      const remaining = maxWords - wordCount;
      summary += words.slice(0, remaining).join(' ') + '...';
      break;
    } else {
      break;
    }
  }
  
  // Clean up and ensure proper ending
  summary = summary.trim();
  if (summary && !summary.endsWith('.') && !summary.endsWith('...')) {
    summary += '.';
  }
  
  return summary || text.split(/\s+/).slice(0, maxWords).join(' ') + '...';
};

// Extract thumbnail from RSS item
const extractThumbnail = (item) => {
  // Try various thumbnail sources
  if (item['media:content'] && item['media:content']['$']) {
    return item['media:content']['$'].url;
  }
  if (item['media:thumbnail'] && item['media:thumbnail']['$']) {
    return item['media:thumbnail']['$'].url;
  }
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  }
  
  // Try to extract from content
  const imgMatch = (item.content || item['content:encoded'] || '').match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch) {
    return imgMatch[1];
  }
  
  // Default placeholder based on category
  return '';
};

// Check if news is relevant
const isRelevantNews = (title, content) => {
  const text = `${title} ${content}`.toLowerCase();
  return RELEVANT_KEYWORDS.some(keyword => text.includes(keyword));
};

// Generate Hindi summary using GPT-4 (Newspaper style formal Hindi)
const generateHindiSummary = async (title, englishSummary) => {
  if (!process.env.OPENAI_API_KEY) {
    console.log('  ⚠️ OpenAI API key not set, skipping Hindi summary');
    return '';
  }
  
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
- NO casual words like "यार", "भाई", "सुन"
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
    console.log(`  ⚠️ Hindi summary error: ${error.message}`);
    return '';
  }
};

// Generate AI image for news without thumbnail
const generateAIImage = async (title, category) => {
  if (!process.env.OPENAI_API_KEY) {
    console.log('  ⚠️ OpenAI API key not set, skipping image generation');
    return null;
  }
  
  try {
    const prompt = `Professional, clean business/finance news thumbnail for: "${title}". Category: ${category}. Style: Modern, minimal, corporate blue tones, abstract financial graphics. No text in image.`;
    
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard'
    });
    
    const imageUrl = response.data[0]?.url;
    if (imageUrl) {
      // Upload to Cloudinary for permanent storage
      const uploaded = await uploadToCloudinary(imageUrl);
      return uploaded;
    }
    return null;
  } catch (error) {
    console.log(`  ⚠️ Image generation error: ${error.message}`);
    return null;
  }
};

// Upload image to Cloudinary
const uploadToCloudinary = async (imageUrl) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.log('  ⚠️ Cloudinary not configured, using direct URL');
    return imageUrl;
  }
  
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'nlistplanet-news',
      transformation: [
        { width: 800, height: 450, crop: 'fill' },
        { quality: 'auto' }
      ]
    });
    return result.secure_url;
  } catch (error) {
    console.log(`  ⚠️ Cloudinary upload error: ${error.message}`);
    return imageUrl;
  }
};

// Extract tags from content
const extractTags = (title, content) => {
  const text = `${title} ${content}`.toLowerCase();
  const tags = [];
  
  const tagKeywords = [
    'ipo', 'pre-ipo', 'unlisted', 'stocks', 'market',
    'investment', 'trading', 'nse', 'bse', 'sebi',
    'startup', 'funding', 'fintech', 'banking'
  ];
  
  tagKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      tags.push(keyword.toUpperCase());
    }
  });
  
  return tags.slice(0, 5); // Max 5 tags
};

// Fetch and process RSS feed
const fetchRSSFeed = async (feed) => {
  try {
    console.log(`📡 Fetching: ${feed.name}...`);
    
    const result = await parser.parseURL(feed.url);
    const newsItems = [];
    
    for (const item of result.items.slice(0, 10)) { // Max 10 per feed
      try {
        // Check if already exists
        const exists = await News.findOne({ sourceUrl: item.link });
        if (exists) continue;
        
        // Check relevance
        const content = item.contentSnippet || item.content || item.summary || '';
        if (!isRelevantNews(item.title, content)) continue;
        
        // Create summary
        const summary = summarizeContent(content);
        if (!summary || summary.length < 50) continue;
        
        // Detect category
        const category = detectCategory(item.title, summary) || feed.category;
        
        // Extract thumbnail
        const thumbnail = extractThumbnail(item);
        
        // Extract tags
        const tags = extractTags(item.title, content);
        
        // Generate Hindi summary (AI-powered)
        const hindiSummary = await generateHindiSummary(item.title, summary);
        
        // Generate AI image if no thumbnail
        let finalThumbnail = thumbnail;
        let thumbnailAIGenerated = false;
        if (!thumbnail || thumbnail.trim() === '') {
          console.log(`  🎨 Generating AI image for: ${item.title.substring(0, 30)}...`);
          const aiImageUrl = await generateAIImage(item.title, category);
          if (aiImageUrl) {
            finalThumbnail = aiImageUrl;
            thumbnailAIGenerated = true;
          }
        }
        
        const newsItem = {
          title: item.title,
          summary,
          hindiSummary,
          content: content.substring(0, 2000), // Limit content
          category,
          thumbnail: finalThumbnail,
          thumbnailAIGenerated,
          sourceUrl: item.link,
          sourceName: feed.name,
          author: item.creator || item.author || feed.name,
          tags,
          isPublished: true,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date()
        };
        
        newsItems.push(newsItem);
      } catch (itemError) {
        console.log(`  ⚠️ Skipping item: ${itemError.message}`);
      }
    }
    
    return newsItems;
  } catch (error) {
    console.error(`❌ Failed to fetch ${feed.name}:`, error.message);
    return [];
  }
};

// Main function
const fetchAllNews = async () => {
  console.log('\n🚀 Starting Auto News Fetch...');
  console.log(`📅 ${new Date().toISOString()}\n`);
  
  await connectDB();
  
  let totalFetched = 0;
  let totalSaved = 0;
  
  for (const feed of RSS_FEEDS) {
    const newsItems = await fetchRSSFeed(feed);
    totalFetched += newsItems.length;
    
    // Save to database
    for (const item of newsItems) {
      try {
        await News.create(item);
        totalSaved++;
        console.log(`  ✅ Saved: ${item.title.substring(0, 50)}...`);
      } catch (saveError) {
        if (saveError.code === 11000) {
          console.log(`  ⏭️ Duplicate: ${item.title.substring(0, 40)}...`);
        } else {
          console.error(`  ❌ Save error: ${saveError.message}`);
        }
      }
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   Fetched: ${totalFetched} articles`);
  console.log(`   Saved: ${totalSaved} new articles`);
  console.log(`   Duplicates skipped: ${totalFetched - totalSaved}`);
  console.log('\n✅ Auto News Fetch Complete!\n');
  
  // Close connection
  await mongoose.connection.close();
  process.exit(0);
};

// Run
fetchAllNews().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
