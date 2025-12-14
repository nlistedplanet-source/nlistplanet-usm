/**
 * News AI Service
 * OpenAI integration for:
 * 1. Hindi Inshorts-style summaries
 * 2. Image generation for news without thumbnails
 */

import OpenAI from 'openai';
import { v2 as cloudinary } from 'cloudinary';
import fetch from 'node-fetch';

// Lazy initialization for OpenAI (will be initialized on first use)
let openai = null;
const getOpenAI = () => {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
};

// Initialize Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Generate Inshorts-style Hindi summary
 * Short: 40-60 words in Hindi with formal tone
 */
export const generateHindiInshortsSummary = async (title, englishSummary) => {
  const openai = getOpenAI();
  if (!openai) {
    console.log('⚠️ OpenAI not configured');
    return '';
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an Inshorts Hindi news writer. Rules:
1. Write in formal Hindi (Devanagari script)
2. Keep it EXACTLY 40-60 words
3. Start with main news point directly (no "yeh khabar hai ki...")
4. Use simple, clear language
5. Keep technical terms like IPO, shares, market in English
6. End with key impact/significance
7. No bullet points, just flowing paragraph`
        },
        {
          role: 'user',
          content: `Title: ${title}\n\nEnglish Summary: ${englishSummary}\n\nWrite Inshorts-style Hindi summary (40-60 words):`
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });
    
    const hindiSummary = response.choices[0]?.message?.content?.trim() || '';
    console.log(`  ✅ Generated Hindi summary: ${hindiSummary.substring(0, 50)}...`);
    return hindiSummary;
  } catch (error) {
    console.error('  ❌ OpenAI Hindi generation error:', error.message);
    return '';
  }
};

/**
 * Generate relevant image using DALL-E 3
 * Creates news-appropriate images when thumbnail is missing
 */
export const generateNewsImage = async (title, category) => {
  const openai = getOpenAI();
  if (!openai) {
    console.log('⚠️ OpenAI not configured for image generation');
    return '';
  }
  
  try {
    // Create prompt based on news category and title
    const prompt = createImagePrompt(title, category);
    
    console.log(`  🎨 Generating image for: ${title.substring(0, 40)}...`);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });
    
    const imageUrl = response.data[0]?.url;
    
    if (!imageUrl) {
      console.log('  ⚠️ No image URL returned');
      return '';
    }
    
    // Upload to Cloudinary for permanent storage
    const cloudinaryUrl = await uploadToCloudinary(imageUrl, title);
    
    console.log(`  ✅ Generated & uploaded image`);
    return cloudinaryUrl;
    
  } catch (error) {
    console.error('  ❌ Image generation error:', error.message);
    return '';
  }
};

/**
 * Create DALL-E prompt based on news content
 */
const createImagePrompt = (title, category) => {
  const baseStyle = "professional news illustration, modern minimalist design, corporate style, high quality";
  
  const categoryPrompts = {
    'IPO': `Stock market IPO concept, ${baseStyle}, showing company listing on stock exchange`,
    'Market': `Stock market trading concept, ${baseStyle}, financial charts and graphs`,
    'Unlisted': `Private company shares concept, ${baseStyle}, business growth visualization`,
    'Startup': `Startup growth concept, ${baseStyle}, innovation and technology theme`,
    'Regulatory': `Legal and regulatory concept, ${baseStyle}, official document theme`,
    'Company': `Corporate business concept, ${baseStyle}, professional company theme`
  };
  
  const categoryPrompt = categoryPrompts[category] || categoryPrompts['Market'];
  
  // Analyze title for specific elements
  const titleLower = title.toLowerCase();
  let specificPrompt = '';
  
  if (titleLower.includes('court') || titleLower.includes('legal')) {
    specificPrompt = 'courthouse and legal documents theme';
  } else if (titleLower.includes('profit') || titleLower.includes('revenue')) {
    specificPrompt = 'financial growth and upward trend arrows';
  } else if (titleLower.includes('loss') || titleLower.includes('decline')) {
    specificPrompt = 'market decline with downward trend';
  } else if (titleLower.includes('merger') || titleLower.includes('acquisition')) {
    specificPrompt = 'business merger and partnership concept';
  } else if (titleLower.includes('invest') || titleLower.includes('fund')) {
    specificPrompt = 'investment and financial planning theme';
  }
  
  return `${categoryPrompt}${specificPrompt ? ', ' + specificPrompt : ''}, no text, no people, clean background`;
};

/**
 * Upload generated image to Cloudinary
 */
const uploadToCloudinary = async (imageUrl, title) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return imageUrl; // Return DALL-E URL if Cloudinary not configured
  }
  
  try {
    // Download image
    const response = await fetch(imageUrl);
    const buffer = await response.buffer();
    
    // Upload to Cloudinary
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'news-generated',
          public_id: `news_${Date.now()}`,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      ).end(buffer);
    });
  } catch (error) {
    console.error('  ⚠️ Cloudinary upload error:', error.message);
    return imageUrl; // Fallback to DALL-E URL
  }
};

/**
 * Process single news item with AI
 * Generates Hindi summary and image if needed
 */
export const processNewsWithAI = async (newsItem) => {
  const { title, summary, thumbnail, category } = newsItem;
  
  console.log(`\n🤖 Processing with AI: ${title.substring(0, 50)}...`);
  
  // Generate Hindi summary
  const hindiSummary = await generateHindiInshortsSummary(title, summary);
  
  // Generate image if missing
  let finalThumbnail = thumbnail;
  if (!thumbnail || thumbnail.length < 10) {
    console.log(`  📸 No thumbnail found, generating image...`);
    finalThumbnail = await generateNewsImage(title, category);
  }
  
  return {
    ...newsItem,
    hindiSummary,
    thumbnail: finalThumbnail
  };
};

/**
 * Batch process multiple news items
 */
export const processNewsItemsWithAI = async (newsItems) => {
  const processed = [];
  
  for (const item of newsItems) {
    try {
      const processedItem = await processNewsWithAI(item);
      processed.push(processedItem);
      
      // Rate limiting: Wait 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`  ❌ Failed to process: ${item.title.substring(0, 30)}...`);
      processed.push(item); // Add without AI processing
    }
  }
  
  return processed;
};

export default {
  generateHindiInshortsSummary,
  generateNewsImage,
  processNewsWithAI,
  processNewsItemsWithAI
};
