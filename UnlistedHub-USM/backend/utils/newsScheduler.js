/**
 * News Scheduler
 * Fetches news every 30 minutes for latest updates
 * 
 * Runs in-process with server (no separate cron needed)
 */

import mongoose from 'mongoose';
import Parser from 'rss-parser';
import OpenAI from 'openai';
import { v2 as cloudinary } from 'cloudinary';
import News from '../models/News.js';

// Initialize OpenAI (if available)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Initialize Cloudinary (if available)
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// RSS Parser
const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail', 'enclosure']
  }
});

// RSS Feed Sources (smaller list for frequent fetching)
const RSS_FEEDS = [
  // Primary India Market News
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
    url: 'https://www.moneycontrol.com/rss/MCtopnews.xml',
    name: 'Moneycontrol',
    category: 'Market'
  },
  // Google News for targeted keywords
  {
    url: 'https://news.google.com/rss/search?q=unlisted+shares+india&hl=en-IN&gl=IN&ceid=IN:en',
    name: 'Google - Unlisted Shares',
    category: 'Unlisted'
  },
  {
    url: 'https://news.google.com/rss/search?q=IPO+india&hl=en-IN&gl=IN&ceid=IN:en',
    name: 'Google - IPO India',
    category: 'IPO'
  }
];

// Keywords to filter relevant news
const RELEVANT_KEYWORDS = [
  'unlisted', 'pre-ipo', 'ipo', 'shares', 'stock', 'equity',
  'startup', 'funding', 'valuation', 'investment', 'nse', 'bse', 'sebi'
];

// Detect category
const detectCategory = (title, summary) => {
  const text = `${title} ${summary}`.toLowerCase();
  if (text.includes('ipo') || text.includes('listing')) return 'IPO';
  if (text.includes('unlisted')) return 'Unlisted';
  if (text.includes('startup') || text.includes('funding')) return 'Startup';
  if (text.includes('sebi') || text.includes('rbi')) return 'Regulatory';
  return 'Market';
};

// Summarize content (60 words max)
const summarizeContent = (content, maxWords = 60) => {
  if (!content) return '';
  let text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  text = text.replace(/https?:\/\/[^\s]+/g, '');
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  let summary = '';
  let wordCount = 0;
  
  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/);
    if (wordCount + words.length <= maxWords) {
      summary += sentence.trim() + '. ';
      wordCount += words.length;
    } else break;
  }
  
  return summary.trim() || text.split(/\s+/).slice(0, maxWords).join(' ') + '...';
};

// Extract thumbnail
const extractThumbnail = (item) => {
  if (item['media:content']?.['$']?.url) return item['media:content']['$'].url;
  if (item['media:thumbnail']?.['$']?.url) return item['media:thumbnail']['$'].url;
  if (item.enclosure?.url) return item.enclosure.url;
  const imgMatch = (item.content || '').match(/<img[^>]+src="([^">]+)"/);
  return imgMatch ? imgMatch[1] : '';
};

// Check if relevant
const isRelevantNews = (title, content) => {
  const text = `${title} ${content}`.toLowerCase();
  return RELEVANT_KEYWORDS.some(keyword => text.includes(keyword));
};

// Generate Hindi summary
const generateHindiSummary = async (title, englishSummary) => {
  if (!openai) return '';
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional Hindi news translator. Use formal newspaper Hindi. Keep it 50-60 words max. Technical terms like IPO, shares can stay in English.`
        },
        {
          role: 'user',
          content: `Title: ${title}\nSummary: ${englishSummary}\n\nTranslate to formal Hindi:`
        }
      ],
      max_tokens: 200,
      temperature: 0.5
    });
    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    return '';
  }
};

// Extract tags
const extractTags = (title, content) => {
  const text = `${title} ${content}`.toLowerCase();
  const tags = [];
  const tagKeywords = ['ipo', 'pre-ipo', 'unlisted', 'stocks', 'market', 'startup', 'funding'];
  tagKeywords.forEach(keyword => {
    if (text.includes(keyword)) tags.push(keyword.toUpperCase());
  });
  return tags.slice(0, 5);
};

// Fetch single RSS feed
const fetchRSSFeed = async (feed) => {
  try {
    const result = await parser.parseURL(feed.url);
    const newsItems = [];
    
    for (const item of result.items.slice(0, 5)) { // Max 5 per feed for speed
      try {
        const exists = await News.findOne({ sourceUrl: item.link });
        if (exists) continue;
        
        const content = item.contentSnippet || item.content || item.summary || '';
        if (!isRelevantNews(item.title, content)) continue;
        
        const summary = summarizeContent(content);
        if (!summary || summary.length < 50) continue;
        
        const category = detectCategory(item.title, summary) || feed.category;
        const thumbnail = extractThumbnail(item);
        const tags = extractTags(item.title, content);
        const hindiSummary = await generateHindiSummary(item.title, summary);
        
        newsItems.push({
          title: item.title,
          summary,
          hindiSummary,
          content: content.substring(0, 2000),
          category,
          thumbnail,
          sourceUrl: item.link,
          sourceName: feed.name,
          author: item.creator || item.author || feed.name,
          tags,
          isPublished: true,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date()
        });
      } catch (itemError) {
        // Skip item
      }
    }
    return newsItems;
  } catch (error) {
    console.log(`  ⚠️ Feed error (${feed.name}): ${error.message}`);
    return [];
  }
};

// Main fetch function
const fetchLatestNews = async () => {
  console.log(`\n📰 [${new Date().toLocaleTimeString()}] Fetching latest news...`);
  
  let totalSaved = 0;
  
  for (const feed of RSS_FEEDS) {
    const newsItems = await fetchRSSFeed(feed);
    
    for (const item of newsItems) {
      try {
        await News.create(item);
        totalSaved++;
        console.log(`  ✅ New: ${item.title.substring(0, 40)}...`);
      } catch (saveError) {
        // Duplicate or error, skip
      }
    }
  }
  
  if (totalSaved > 0) {
    console.log(`📊 Saved ${totalSaved} new articles`);
  } else {
    console.log(`📊 No new articles found`);
  }
};

// Start scheduler (runs every 30 minutes)
export const startNewsScheduler = () => {
  const INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
  
  console.log('📰 News Scheduler: Starting (every 30 minutes)');
  
  // Fetch immediately on startup
  setTimeout(() => {
    fetchLatestNews().catch(err => console.error('News fetch error:', err.message));
  }, 10000); // Wait 10 seconds after server start
  
  // Then fetch every 30 minutes
  setInterval(() => {
    fetchLatestNews().catch(err => console.error('News fetch error:', err.message));
  }, INTERVAL_MS);
};

export default { startNewsScheduler, fetchLatestNews };
