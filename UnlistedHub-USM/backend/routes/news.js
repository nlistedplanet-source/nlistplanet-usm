import express from 'express';
import News from '../models/News.js';

const router = express.Router();

// GET /api/news - Get all published news (paginated)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      featured,
      search 
    } = req.query;

    const query = { isPublished: true };

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter featured only
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Search in title and summary
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [news, total] = await Promise.all([
      News.find(query)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-content') // Don't send full content in list
        .lean(),
      News.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: news,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch news' });
  }
});

// GET /api/news/categories - Get available categories with counts
router.get('/categories', async (req, res) => {
  try {
    const categories = await News.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: categories.map(c => ({ name: c._id, count: c.count }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// GET /api/news/featured - Get featured news for homepage
router.get('/featured', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const news = await News.find({ isPublished: true, isFeatured: true })
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit))
      .select('-content')
      .lean();

    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch featured news' });
  }
});

// GET /api/news/latest - Get latest news
router.get('/latest', async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const news = await News.find({ isPublished: true })
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit))
      .select('-content')
      .lean();

    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch latest news' });
  }
});

// GET /api/news/:id - Get single news article
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate('companyMentioned', 'ScriptName Sector')
      .lean();

    if (!news) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }

    // Increment views
    await News.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // Get related news (same category)
    const related = await News.find({
      _id: { $ne: news._id },
      isPublished: true,
      category: news.category
    })
      .sort({ publishedAt: -1 })
      .limit(4)
      .select('-content')
      .lean();

    res.json({ 
      success: true, 
      data: { ...news, views: news.views + 1 },
      related 
    });
  } catch (error) {
    console.error('Get news detail error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch news' });
  }
});

// GET /api/news/company/:companyId - Get news for specific company
router.get('/company/:companyId', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const news = await News.find({
      isPublished: true,
      companyMentioned: req.params.companyId
    })
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit))
      .select('-content')
      .lean();

    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch company news' });
  }
});

export default router;
