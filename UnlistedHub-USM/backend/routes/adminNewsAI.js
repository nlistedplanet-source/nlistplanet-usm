/**
 * Admin News AI Routes
 * Manual triggering of AI processing for news
 */

import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import News from '../models/News.js';
import { processNewsWithAI, generateNewsImage, generateHindiInshortsSummary } from '../utils/newsAI.js';

const router = express.Router();

/**
 * POST /api/admin/news/process-ai/:newsId
 * Process single news item with AI
 */
router.post('/process-ai/:newsId', protect, authorize('admin'), async (req, res) => {
  try {
    const news = await News.findById(req.params.newsId);
    
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    console.log(`\n🤖 Admin triggered AI processing for: ${news.title.substring(0, 50)}...`);

    // Process with AI
    const processed = await processNewsWithAI({
      title: news.title,
      summary: news.summary,
      thumbnail: news.thumbnail,
      category: news.category
    });

    // Update news item
    news.hindiSummary = processed.hindiSummary;
    news.thumbnail = processed.thumbnail;
    await news.save();

    res.json({
      success: true,
      message: 'News processed with AI successfully',
      data: news
    });

  } catch (error) {
    console.error('AI processing error:', error);
    res.status(500).json({ message: 'Failed to process news with AI' });
  }
});

/**
 * POST /api/admin/news/batch-process-ai
 * Process multiple news items with AI
 */
router.post('/batch-process-ai', protect, authorize('admin'), async (req, res) => {
  try {
    const { newsIds } = req.body;

    if (!newsIds || newsIds.length === 0) {
      return res.status(400).json({ message: 'No news IDs provided' });
    }

    console.log(`\n🤖 Admin triggered batch AI processing for ${newsIds.length} items`);

    const results = {
      processed: 0,
      failed: 0,
      errors: []
    };

    for (const newsId of newsIds) {
      try {
        const news = await News.findById(newsId);
        
        if (!news) {
          results.failed++;
          results.errors.push({ newsId, error: 'Not found' });
          continue;
        }

        const processed = await processNewsWithAI({
          title: news.title,
          summary: news.summary,
          thumbnail: news.thumbnail,
          category: news.category
        });

        news.hindiSummary = processed.hindiSummary;
        news.thumbnail = processed.thumbnail;
        await news.save();

        results.processed++;

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        results.failed++;
        results.errors.push({ newsId, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Processed ${results.processed} items, ${results.failed} failed`,
      results
    });

  } catch (error) {
    console.error('Batch AI processing error:', error);
    res.status(500).json({ message: 'Failed to batch process news' });
  }
});

/**
 * POST /api/admin/news/generate-image/:newsId
 * Generate image for news without thumbnail
 */
router.post('/generate-image/:newsId', protect, authorize('admin'), async (req, res) => {
  try {
    const news = await News.findById(req.params.newsId);
    
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    if (news.thumbnail && news.thumbnail.length > 10) {
      return res.status(400).json({ message: 'News already has a thumbnail' });
    }

    console.log(`\n🎨 Admin triggered image generation for: ${news.title.substring(0, 50)}...`);

    const imageUrl = await generateNewsImage(news.title, news.category);

    if (!imageUrl) {
      return res.status(500).json({ message: 'Failed to generate image' });
    }

    news.thumbnail = imageUrl;
    await news.save();

    res.json({
      success: true,
      message: 'Image generated successfully',
      data: { thumbnail: imageUrl }
    });

  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ message: 'Failed to generate image' });
  }
});

/**
 * POST /api/admin/news/generate-hindi/:newsId
 * Generate Hindi summary for news
 */
router.post('/generate-hindi/:newsId', protect, authorize('admin'), async (req, res) => {
  try {
    const news = await News.findById(req.params.newsId);
    
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    console.log(`\n🇮🇳 Admin triggered Hindi generation for: ${news.title.substring(0, 50)}...`);

    const hindiSummary = await generateHindiInshortsSummary(news.title, news.summary);

    if (!hindiSummary) {
      return res.status(500).json({ message: 'Failed to generate Hindi summary' });
    }

    news.hindiSummary = hindiSummary;
    await news.save();

    res.json({
      success: true,
      message: 'Hindi summary generated successfully',
      data: { hindiSummary }
    });

  } catch (error) {
    console.error('Hindi generation error:', error);
    res.status(500).json({ message: 'Failed to generate Hindi summary' });
  }
});

/**
 * GET /api/admin/news/missing-hindi
 * Get all news without Hindi summary
 */
router.get('/missing-hindi', protect, authorize('admin'), async (req, res) => {
  try {
    const news = await News.find({
      $or: [
        { hindiSummary: { $exists: false } },
        { hindiSummary: '' },
        { hindiSummary: null }
      ]
    })
      .sort({ publishedAt: -1 })
      .limit(50)
      .select('title summary category publishedAt');

    res.json({
      success: true,
      count: news.length,
      data: news
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ message: 'Failed to fetch news' });
  }
});

/**
 * GET /api/admin/news/missing-images
 * Get all news without images
 */
router.get('/missing-images', protect, authorize('admin'), async (req, res) => {
  try {
    const news = await News.find({
      $or: [
        { thumbnail: { $exists: false } },
        { thumbnail: '' },
        { thumbnail: null }
      ]
    })
      .sort({ publishedAt: -1 })
      .limit(50)
      .select('title summary category publishedAt');

    res.json({
      success: true,
      count: news.length,
      data: news
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ message: 'Failed to fetch news' });
  }
});

export default router;
