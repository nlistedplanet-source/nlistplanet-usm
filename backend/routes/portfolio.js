import express from 'express';
import Listing from '../models/Listing.js';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/portfolio/stats
// @desc    Get user's portfolio statistics
// @access  Private
router.get('/stats', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get completed transactions
    const completedTrades = await Transaction.countDocuments({
      $or: [{ buyerId: userId }, { sellerId: userId }],
      status: 'completed'
    });

    // Get active listings count
    const activeListings = await Listing.countDocuments({
      userId: userId,
      status: 'active'
    });

    // Get portfolio holdings (completed buy transactions)
    const holdings = await Transaction.aggregate([
      {
        $match: {
          buyerId: userId,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$companyId',
          totalShares: { $sum: '$quantity' },
          avgBuyPrice: { $avg: '$price' },
          totalInvested: { $sum: { $multiply: ['$price', '$quantity'] } }
        }
      }
    ]);

    // Calculate total portfolio value (mock current prices for now)
    let totalValue = 0;
    let totalInvested = 0;
    let totalGain = 0;

    holdings.forEach(holding => {
      totalInvested += holding.totalInvested;
      // Mock: Assume 15% average gain for demo
      const currentValue = holding.totalInvested * 1.15;
      totalValue += currentValue;
    });

    totalGain = totalValue - totalInvested;
    const gainPercentage = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        totalValue: Math.round(totalValue),
        totalInvested: Math.round(totalInvested),
        totalGain: Math.round(totalGain),
        gainPercentage: parseFloat(gainPercentage),
        activeListings,
        completedTrades
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/portfolio/holdings
// @desc    Get user's current holdings
// @access  Private
router.get('/holdings', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get all buy transactions
    const buyTransactions = await Transaction.find({
      buyerId: userId,
      status: 'completed'
    }).populate('companyId', 'name logo sector');

    // Get all sell transactions
    const sellTransactions = await Transaction.find({
      sellerId: userId,
      status: 'completed'
    }).populate('companyId', 'name logo sector');

    // Calculate net holdings
    const holdingsMap = new Map();

    // Add buy transactions
    buyTransactions.forEach(tx => {
      const companyId = tx.companyId._id.toString();
      if (!holdingsMap.has(companyId)) {
        holdingsMap.set(companyId, {
          companyId: tx.companyId._id,
          company: tx.companyId.name,
          logo: tx.companyId.logo,
          sector: tx.companyId.sector,
          quantity: 0,
          totalInvested: 0,
          avgBuyPrice: 0
        });
      }
      const holding = holdingsMap.get(companyId);
      holding.quantity += tx.quantity;
      holding.totalInvested += tx.price * tx.quantity;
    });

    // Subtract sell transactions
    sellTransactions.forEach(tx => {
      const companyId = tx.companyId._id.toString();
      if (holdingsMap.has(companyId)) {
        const holding = holdingsMap.get(companyId);
        holding.quantity -= tx.quantity;
        holding.totalInvested -= tx.price * tx.quantity;
      }
    });

    // Filter out zero holdings and calculate metrics
    const holdings = Array.from(holdingsMap.values())
      .filter(h => h.quantity > 0)
      .map(h => {
        h.avgBuyPrice = Math.round(h.totalInvested / h.quantity);
        // Mock current price (15% gain for demo)
        h.currentPrice = Math.round(h.avgBuyPrice * 1.15);
        h.totalValue = h.currentPrice * h.quantity;
        h.gain = h.totalValue - h.totalInvested;
        h.gainPercent = ((h.gain / h.totalInvested) * 100).toFixed(2);
        return h;
      });

    res.json({
      success: true,
      data: holdings
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/portfolio/activities
// @desc    Get user's recent activities
// @access  Private
router.get('/activities', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    // Get recent transactions
    const transactions = await Transaction.find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
      status: 'completed'
    })
      .sort('-completedAt')
      .limit(limit)
      .populate('companyId', 'name logo')
      .populate('buyerId', 'username')
      .populate('sellerId', 'username');

    const activities = transactions.map(tx => ({
      id: tx._id,
      type: tx.buyerId.toString() === userId.toString() ? 'buy' : 'sell',
      company: tx.companyId.name,
      logo: tx.companyId.logo,
      shares: tx.quantity,
      amount: tx.price * tx.quantity,
      price: tx.price,
      date: tx.completedAt || tx.createdAt,
      counterparty: tx.buyerId.toString() === userId.toString() 
        ? tx.sellerId.username 
        : tx.buyerId.username
    }));

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
});

export default router;
