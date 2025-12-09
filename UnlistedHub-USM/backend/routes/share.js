import express from 'express';
import { protect } from '../middleware/auth.js';
import ShareTracking from '../models/ShareTracking.js';
import Listing from '../models/Listing.js';
import User from '../models/User.js';
import OpenAI from 'openai';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// @route   POST /api/share/create
// @desc    Create a share tracking link
// @access  Private
router.post('/create', protect, async (req, res) => {
  try {
    const { listingId } = req.body;

    // Fetch listing details
    const listing = await Listing.findById(listingId).populate('company');
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Generate unique shareId
    const timestamp = Date.now();
    const shareId = `${req.user.username}_${listingId}_${timestamp}`;

    // Create share tracking
    const shareTracking = await ShareTracking.create({
      shareId,
      userId: req.user._id,
      listingId
    });

    // Generate AI caption using OpenAI
    let aiInsight = '';
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional investment analyst. Generate concise, positive investment insights for social media.'
          },
          {
            role: 'user',
            content: `Generate a professional 2-3 line (40-60 words) investment insight for:
Company: ${listing.company?.name || 'Unlisted Company'}
Sector: ${listing.company?.sector || 'Various Sectors'}
Context: Unlisted share investment opportunity

Focus on: growth prospects, market position, sector trends
Tone: Professional, optimistic, factual
Do not include price or financial advice disclaimers.`
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      aiInsight = completion.choices[0]?.message?.content?.trim() || '';
    } catch (error) {
      console.error('OpenAI error:', error);
      // Fallback insight
      aiInsight = `${listing.company?.name || 'This company'} operates in ${listing.company?.sector || 'a growing sector'} with strong market fundamentals. An exciting opportunity for investors looking to diversify their portfolio with unlisted shares.`;
    }

    // Generate caption
    const shareUrl = `${process.env.FRONTEND_URL}/listing/${listingId}?ref=${shareId}`;
    const caption = `🚀 Get Your Share in Fast-Growing Companies!

${aiInsight}

👉 Explore now: ${shareUrl}

#UnlistedShares #Investment #WealthCreation`;

    res.status(201).json({
      success: true,
      data: {
        shareId,
        shareUrl,
        caption,
        listing: {
          _id: listing._id,
          company: listing.company?.name,
          price: listing.price,
          quantity: listing.quantity,
          type: listing.type
        }
      }
    });
  } catch (error) {
    console.error('Share creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create share link'
    });
  }
});

// @route   POST /api/share/track-click/:shareId
// @desc    Track a click on share link
// @access  Public
router.post('/track-click/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;
    const { ip, userAgent } = req.body;

    const shareTracking = await ShareTracking.findOne({ shareId });
    if (!shareTracking) {
      return res.status(404).json({
        success: false,
        message: 'Share link not found'
      });
    }

    // Increment clicks
    shareTracking.clicks += 1;
    
    // Track unique visitor
    shareTracking.uniqueVisitors.push({
      ip,
      userAgent,
      timestamp: new Date()
    });

    await shareTracking.save();

    res.json({
      success: true,
      message: 'Click tracked'
    });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track click'
    });
  }
});

// @route   GET /api/share/stats
// @desc    Get user's share statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const shares = await ShareTracking.find({ userId: req.user._id })
      .populate('listingId', 'company price quantity type')
      .sort('-createdAt');

    const totalClicks = shares.reduce((sum, share) => sum + share.clicks, 0);
    const totalConversions = shares.reduce((sum, share) => sum + share.conversions.length, 0);
    const totalEarnings = shares.reduce((sum, share) => {
      const shareEarnings = share.conversions.reduce((s, c) => s + (c.referralReward || 0), 0);
      return sum + shareEarnings;
    }, 0);

    res.json({
      success: true,
      data: {
        totalShares: shares.length,
        totalClicks,
        totalConversions,
        totalEarnings,
        shares
      }
    });
  } catch (error) {
    console.error('Share stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch share statistics'
    });
  }
});

export default router;
