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
import News from '../models/News.js';

// Fix path for dotenv when running from scripts folder
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

// Summarize content to 60-80 words (Inshorts style)
const summarizeContent = (content, maxWords = 75) => {
  if (!content) return '';
  
  // Remove HTML tags
  let text = content.replace(/<[^>]*>/g, '');
  
  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  // Split into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  
  let summary = '';
  let wordCount = 0;
  
  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/);
    if (wordCount + words.length <= maxWords) {
      summary += sentence.trim() + '. ';
      wordCount += words.length;
    } else {
      // Add partial sentence if needed
      const remaining = maxWords - wordCount;
      if (remaining > 5) {
        summary += words.slice(0, remaining).join(' ') + '...';
      }
      break;
    }
  }
  
  return summary.trim() || text.split(/\s+/).slice(0, maxWords).join(' ') + '...';
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
        
        const newsItem = {
          title: item.title,
          summary,
          content: content.substring(0, 2000), // Limit content
          category,
          thumbnail,
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
