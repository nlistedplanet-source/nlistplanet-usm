import express from 'express';
import News from '../models/News.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Admin middleware - check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// GET /api/admin/news - Get all news (including unpublished)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const query = {};
    if (status === 'published') query.isPublished = true;
    if (status === 'draft') query.isPublished = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [news, total] = await Promise.all([
      News.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      News.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: news,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch news' });
  }
});

// POST /api/admin/news - Create news article
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const {
      title,
      summary,
      content,
      category,
      thumbnail,
      sourceUrl,
      sourceName,
      author,
      tags,
      companyMentioned,
      isPublished,
      isFeatured
    } = req.body;

    const news = new News({
      title,
      summary,
      content,
      category: category || 'General',
      thumbnail,
      sourceUrl: sourceUrl || `https://nlistplanet.com/blog/${Date.now()}`,
      sourceName: sourceName || 'NlistPlanet',
      author: author || 'NlistPlanet Team',
      tags: tags || [],
      companyMentioned: companyMentioned || [],
      isPublished: isPublished !== false,
      isFeatured: isFeatured || false,
      publishedAt: new Date()
    });

    await news.save();

    res.status(201).json({ success: true, data: news });
  } catch (error) {
    console.error('Create news error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate news article' });
    }
    res.status(500).json({ success: false, message: 'Failed to create news' });
  }
});

// PUT /api/admin/news/:id - Update news article
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const updates = req.body;
    
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    if (!news) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }

    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update news' });
  }
});

// DELETE /api/admin/news/:id - Delete news article
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);

    if (!news) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }

    res.json({ success: true, message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete news' });
  }
});

// POST /api/admin/news/:id/toggle-publish - Toggle publish status
router.post('/:id/toggle-publish', auth, isAdmin, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }

    news.isPublished = !news.isPublished;
    if (news.isPublished && !news.publishedAt) {
      news.publishedAt = new Date();
    }
    await news.save();

    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle publish' });
  }
});

// POST /api/admin/news/:id/toggle-featured - Toggle featured status
router.post('/:id/toggle-featured', auth, isAdmin, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }

    news.isFeatured = !news.isFeatured;
    await news.save();

    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle featured' });
  }
});

export default router;
