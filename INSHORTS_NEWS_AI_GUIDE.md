# 🤖 Inshorts-Style News AI System

Complete automated news pipeline: RSS → OpenAI → Hindi Summary + Image → Inshorts Card

---

## 📋 Overview

### What It Does:
1. **Fetches RSS news** from multiple Indian financial sources
2. **Processes with OpenAI**:
   - Generates 40-60 word Hindi Inshorts-style summaries
   - Creates DALL-E images for news without thumbnails
3. **Displays** in beautiful Inshorts-style vertical swipe cards

---

## 🔧 Setup

### 1. Environment Variables

Add to `backend/.env`:

```env
# OpenAI (Required for AI features)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# Cloudinary (Optional - for permanent image storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Install Dependencies

```bash
cd UnlistedHub-USM/backend
npm install openai node-fetch
```

---

## 🚀 Usage

### Automatic (Recommended)

News automatically processes every 30 minutes with AI:
- Hindi summaries generated automatically
- Missing images created via DALL-E
- No manual intervention needed

### Manual Processing (Admin)

Use these admin API endpoints to manually trigger AI:

#### Process Single News with AI
```bash
POST /api/admin/news-ai/process-ai/:newsId
Authorization: Bearer <admin_token>
```

#### Batch Process Multiple News
```bash
POST /api/admin/news-ai/batch-process-ai
Authorization: Bearer <admin_token>
Body: {
  "newsIds": ["id1", "id2", "id3"]
}
```

#### Generate Image Only
```bash
POST /api/admin/news-ai/generate-image/:newsId
Authorization: Bearer <admin_token>
```

#### Generate Hindi Summary Only
```bash
POST /api/admin/news-ai/generate-hindi/:newsId
Authorization: Bearer <admin_token>
```

#### Get News Missing Hindi
```bash
GET /api/admin/news-ai/missing-hindi
Authorization: Bearer <admin_token>
```

#### Get News Missing Images
```bash
GET /api/admin/news-ai/missing-images
Authorization: Bearer <admin_token>
```

---

## 📱 Frontend Components

### Mobile App (Inshorts Style)

File: `nlistplanet-mobile/frontend/src/pages/BlogPage.jsx`

Already has Inshorts-style vertical swipe cards with:
- ✅ Full-screen card view
- ✅ Swipe up/down navigation
- ✅ Hindi summary display
- ✅ Image with category badge
- ✅ Source attribution

### Desktop App (Grid Style)

File: `UnlistedHub-USM/frontend/src/pages/BlogPage.jsx`

Grid layout with:
- ✅ 3-column responsive grid
- ✅ Search functionality
- ✅ Category filters
- ✅ Card hover effects

### Reusable Inshorts Card Component

File: `UnlistedHub-USM/frontend/src/components/news/InshortsNewsCard.jsx`

Standalone component for Inshorts-style cards:

```jsx
import InshortsNewsCard from './components/news/InshortsNewsCard';

<InshortsNewsCard 
  article={newsArticle} 
  onShare={(article) => handleShare(article)}
/>
```

---

## 🎨 Inshorts Card Features

### Visual Design:
- **Top 45%**: Image with gradient overlay
- **Bottom 55%**: Content (title + Hindi summary)
- **Category Badge**: Color-coded by news type
- **Source Badge**: News source indicator
- **Inshorts Logo Style**: 3-bar indicator (like official app)

### Content:
- **English Title**: Bold, 2-line max
- **Hindi Summary**: 40-60 words, formal tone
- **English Summary**: Below Hindi (separated by divider)
- **Date & Share**: Bottom bar with actions

### Interactions:
- Vertical swipe (mobile)
- Click to expand (desktop)
- Share button
- "पूरा पढ़ें" (Read More) link

---

## 🤖 AI Processing Details

### Hindi Summary Generation

**Model**: GPT-4o-mini  
**Instructions**:
- Formal Hindi (Devanagari script)
- Exactly 40-60 words
- Start with main news point directly
- Keep technical terms (IPO, shares) in English
- End with key impact/significance
- No bullet points, flowing paragraph

**Example**:
```
Input (English): 
"Punjab & Haryana High Court ruled in favor of Haryana government in a 62-year-old land dispute case. The court ordered ₹14,000 land to be returned, increasing it from ₹7 crore to 25% additional compensation."

Output (Hindi):
"हरियाणा में 62 साल बाद शख्स ने जीता प्रॉपर्ट केस, ₹14,000 में खरीदी गयी जमीन के बिजाद में मूल खरीदार के परिवार को फैसला सुनाया गया है। कोर्ट ने प्राइवेट डेवलपर के खिलाफ फैसला सुनाते हुए कहा कि अब कर करीब ₹7 करोड़ की हो चुकी यह जमीन 80-वर्षीय एकमात्र वारिस को सौंपी जाएगी। इसके लिए उन्हें मूल कीमत का अतिरिक्त 25% मुआवजा देना होगा।"
```

### Image Generation

**Model**: DALL-E 3  
**Size**: 1024x1024  
**Style**: Professional, minimal, corporate  
**No Text**: Clean images without any text overlay

**Prompt Structure**:
```
Category-specific base + Title analysis + Style constraints

Examples:
- IPO: "Stock market IPO concept, professional news illustration, showing company listing on stock exchange, no text, clean background"
- Court Case: "Courthouse and legal documents theme, professional news illustration, official document theme, no text"
- Profit: "Financial growth with upward trend arrows, professional minimalist design, no text"
```

**Storage**:
1. Generated by DALL-E (temporary URL)
2. Downloaded to buffer
3. Uploaded to Cloudinary (permanent storage)
4. Cloudinary URL saved in database

---

## 📊 Monitoring

### Check Processing Status

```bash
# See logs in backend console
📰 [10:30:00] Fetching latest news...
  ✅ New: Punjab & Haryana High Court case...
  🤖 Processing with AI...
  ✅ Generated Hindi summary: हरियाणा में 62 साल...
  📸 No thumbnail found, generating image...
  🎨 Generating image for: Punjab & Haryana High Court...
  ✅ Generated & uploaded image
📊 Saved 1 new articles
```

### Database Fields

News model includes:
```javascript
{
  title: String,              // English title
  summary: String,            // English summary (60 words)
  hindiSummary: String,       // Hindi Inshorts summary (40-60 words)
  thumbnail: String,          // Image URL (original or AI-generated)
  category: String,           // IPO, Market, Unlisted, etc.
  sourceName: String,         // Source publication
  sourceUrl: String,          // Original article link
  publishedAt: Date
}
```

---

## 🎯 Rate Limits

**OpenAI API**:
- Hindi generation: ~200 tokens per request
- Image generation: 1 image per request
- Automatic 2-second delay between requests

**Estimated Costs** (per article):
- Hindi summary: ~$0.001 (GPT-4o-mini)
- Image generation: ~$0.04 (DALL-E 3)
- Total per article: ~$0.041

**Monthly** (assuming 100 articles/day):
- 3000 articles × $0.041 = ~$123/month

---

## 🔧 Customization

### Modify Hindi Style

Edit: `backend/utils/newsAI.js`

```javascript
// Change system prompt in generateHindiInshortsSummary()
{
  role: 'system',
  content: `Your custom instructions here...`
}
```

### Modify Image Style

Edit: `backend/utils/newsAI.js`

```javascript
// Change prompt in createImagePrompt()
const baseStyle = "your custom style here";
```

### Change Word Count

```javascript
// In generateHindiInshortsSummary()
content: `Write EXACTLY 30-50 words` // Change numbers
```

---

## 🐛 Troubleshooting

### No Hindi summaries generating
- Check `OPENAI_API_KEY` is set correctly
- Verify API key has sufficient credits
- Check backend logs for OpenAI errors

### Images not generating
- DALL-E 3 is expensive, make sure you have credits
- Check Cloudinary config if images aren't persisting
- Fallback: System uses original thumbnail if generation fails

### Rate limit errors
- Increase delay in `newsAI.js` (line with `setTimeout`)
- Process fewer articles at once

---

## 📝 Example Workflow

1. **RSS Fetcher** runs every 30 minutes
2. Finds new article: "Punjab court case..."
3. Checks: No Hindi summary, has thumbnail
4. **Calls OpenAI**: Generate Hindi summary
5. Receives: "हरियाणा में 62 साल..."
6. Saves to database with Hindi summary
7. **Mobile App** displays in Inshorts card
8. User swipes through news vertically

---

## 🎓 Best Practices

1. **Cost Management**:
   - Only process relevant news (financial/market focus)
   - Skip re-processing if Hindi summary already exists
   - Use GPT-4o-mini (cheaper than GPT-4)

2. **Quality Control**:
   - Verify Hindi summaries manually for first few
   - Check image relevance periodically
   - Adjust prompts based on output quality

3. **Performance**:
   - Rate limit requests (2 seconds between)
   - Process in batches during off-peak hours
   - Cache results to avoid re-processing

---

## 🔗 Related Files

**Backend**:
- `backend/utils/newsAI.js` — AI processing logic
- `backend/utils/newsScheduler.js` — RSS fetching
- `backend/routes/adminNewsAI.js` — Manual admin controls
- `backend/models/News.js` — Database schema

**Frontend**:
- `UnlistedHub-USM/frontend/src/components/news/InshortsNewsCard.jsx` — Card component
- `nlistplanet-mobile/frontend/src/pages/BlogPage.jsx` — Mobile Inshorts view
- `UnlistedHub-USM/frontend/src/pages/BlogPage.jsx` — Desktop grid view

---

**Last Updated**: December 14, 2025  
**System Status**: ✅ Production Ready
