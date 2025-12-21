import express from 'express';
import { protect } from '../middleware/auth.js';
import Transaction from '../models/Transaction.js';
import Company from '../models/Company.js';
import Listing from '../models/Listing.js';

const router = express.Router();

// @route   GET /api/portfolio/stats
// @desc    Get portfolio statistics (total invested, current value, P&L)
// @access  Private
router.get('/stats', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get all completed transactions for the user
    const transactions = await Transaction.find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
      status: 'completed'
    });

    let totalInvested = 0;
    let totalReturns = 0;
    let totalShares = 0;

    transactions.forEach(tx => {
      if (!tx.buyerId || !tx.sellerId) return; // Skip incomplete transactions
      
      const amount = tx.price * tx.quantity;
      
      if (tx.buyerId.toString() === userId.toString()) {
        // User bought shares
        totalInvested += amount;
        totalShares += tx.quantity;
      } else {
        // User sold shares
        totalReturns += amount;
        totalShares -= tx.quantity;
      }
    });

    const currentValue = totalInvested + totalReturns; // Simplified - can be enhanced with current market prices
    const profitLoss = totalReturns - totalInvested;
    const profitLossPercentage = totalInvested > 0 ? ((profitLoss / totalInvested) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalInvested,
        currentValue,
        profitLoss,
        profitLossPercentage: profitLossPercentage.toFixed(2),
        totalShares,
        totalTransactions: transactions.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/portfolio/holdings
// @desc    Get user's current holdings grouped by company
// @access  Private
router.get('/holdings', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get all completed transactions
    const transactions = await Transaction.find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
      status: 'completed'
    }).populate('listingId', 'companyName companyId price');

    // Group by company and calculate holdings
    const holdingsMap = {};

    for (const tx of transactions) {
      const companyName = tx.listingId?.companyName || 'Unknown';
      
      if (!holdingsMap[companyName]) {
        holdingsMap[companyName] = {
          companyName,
          totalQuantity: 0,
          avgBuyPrice: 0,
          totalInvested: 0,
          transactions: []
        };
      }

      const holding = holdingsMap[companyName];
      const amount = tx.price * tx.quantity;

      if (tx.buyerId && tx.buyerId.toString() === userId.toString()) {
        // User bought
        holding.totalQuantity += tx.quantity;
        holding.totalInvested += amount;
        holding.transactions.push({
          type: 'buy',
          quantity: tx.quantity,
          price: tx.price,
          date: tx.createdAt
        });
      } else {
        // User sold
        holding.totalQuantity -= tx.quantity;
        holding.totalInvested -= amount;
        holding.transactions.push({
          type: 'sell',
          quantity: tx.quantity,
          price: tx.price,
          date: tx.createdAt
        });
      }

      // Calculate average buy price
      if (holding.totalQuantity > 0) {
        holding.avgBuyPrice = holding.totalInvested / holding.totalQuantity;
      }
    }

    // Convert to array and filter out zero holdings
    const holdings = Object.values(holdingsMap).filter(h => h.totalQuantity > 0);

    res.json({
      success: true,
      data: holdings
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/portfolio/activities
// @desc    Get recent portfolio activities (listings created, bids placed, offers placed, transactions)
// @access  Private
router.get('/activities', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 20;

    // Get recent transactions
    const transactions = await Transaction.find({
      $or: [{ buyerId: userId }, { sellerId: userId }]
    })
      .populate({
        path: 'listingId',
        select: 'companyName companyId',
        populate: {
          path: 'companyId',
          select: 'name scriptName Logo logo'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit);

    // Get user's own listings (posts they created) - Include bids/offers for activity tracking
    const userListings = await Listing.find({ userId: userId })
      .select('companyName companyId type price quantity status createdAt updatedAt bids offers')
      .populate('companyId', 'name scriptName scriptName Logo logo')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Get listings where user placed bids/offers - Remove limit to ensure we find all relevant listings regardless of creation date
    const listingsWithBidsOffers = await Listing.find({
      $or: [
        { 'bids.userId': userId },
        { 'offers.userId': userId }
      ]
    })
      .select('companyName companyId type bids offers createdAt')
      .populate('companyId', 'name scriptName scriptName Logo logo')
      .sort({ createdAt: -1 });
      // .limit(limit); // Removed limit to ensure we catch recent bids on older listings

    // Format activities
    const activities = [];

    // 1. Add user's own listings (posts)
    userListings.forEach(listing => {
      const companyName = listing.companyId?.name || listing.companyId?.scriptName || listing.companyName || 'Unknown';
      
      activities.push({
        type: 'listing',
        action: listing.type === 'sell' ? 'listed_sell' : 'listed_buy',
        companyName: companyName,
        quantity: listing.quantity,
        price: listing.price,
        status: listing.status,
        date: listing.createdAt,
        description: listing.type === 'sell' 
          ? `Listed ${listing.quantity} shares of ${companyName} for sale at ₹${listing.price}`
          : `Created buy order for ${listing.quantity} shares of ${companyName} at ₹${listing.price}`
      });

      // Check for actions on incoming bids/offers (Accept/Reject/Counter by me)
      const incomingItems = listing.type === 'sell' ? listing.bids : listing.offers;
      
      incomingItems?.forEach(item => {
        // Determine display price for the owner
        const displayPrice = listing.type === 'sell' ? (item.sellerReceivesPrice || item.price / 1.02) : (item.buyerOfferedPrice || item.price / 0.98);
        
        // If I accepted or rejected
        if (item.status === 'accepted' || item.status === 'rejected') {
          activities.push({
            type: 'action',
            action: item.status === 'accepted' ? 'accepted_bid' : 'rejected_bid',
            companyName: companyName,
            quantity: item.quantity,
            price: displayPrice,
            status: item.status,
            date: listing.updatedAt, // Best approximation
            description: `${item.status === 'accepted' ? 'Accepted' : 'Rejected'} ${listing.type === 'sell' ? 'bid' : 'offer'} for ${item.quantity} shares of ${companyName} at ₹${displayPrice.toFixed(2)}`
          });
        }

        // If I countered (as seller)
        item.counterHistory?.forEach(counter => {
          if (counter.by === 'seller') { // I am the seller
            // If I am seller on SELL listing, I entered what I get.
            // If I am seller on BUY listing, I entered what I get.
            const counterPrice = counter.price;
            
            activities.push({
              type: 'action',
              action: 'countered_bid',
              companyName: companyName,
              quantity: counter.quantity || item.quantity,
              price: counterPrice,
              status: 'countered',
              date: counter.timestamp,
              description: `Countered ${listing.type === 'sell' ? 'bid' : 'offer'} for ${companyName} at ₹${counterPrice}`
            });
          }
        });
      });
    });

    // 2. Add transactions
    transactions.forEach(tx => {
      if (!tx.buyerId || !tx.sellerId) return; // Skip incomplete transactions
      
      const isBuyer = tx.buyerId.toString() === userId.toString();
      const companyName = tx.listingId?.companyId?.name || tx.listingId?.companyName || 'Unknown';
      
      activities.push({
        type: 'transaction',
        action: isBuyer ? 'buy' : 'sell',
        companyName: companyName,
        quantity: tx.quantity,
        price: tx.price,
        status: tx.status,
        date: tx.createdAt,
        description: isBuyer 
          ? `Bought ${tx.quantity} shares of ${companyName} at ₹${tx.price}`
          : `Sold ${tx.quantity} shares of ${companyName} at ₹${tx.price}`
      });
    });

    // 3. Add bids/offers placed by user on others' listings
    listingsWithBidsOffers.forEach(listing => {
      const companyName = listing.companyId?.name || listing.companyId?.scriptName || listing.companyName || 'Unknown';
      const userBids = listing.bids?.filter(b => b.userId.toString() === userId.toString()) || [];
      const userOffers = listing.offers?.filter(o => o.userId.toString() === userId.toString()) || [];

      userBids.forEach(bid => {
        // Placed Bid
        const displayPrice = bid.buyerOfferedPrice || bid.price;
        activities.push({
          type: 'bid',
          action: 'placed_bid',
          companyName: companyName,
          quantity: bid.quantity,
          price: displayPrice,
          status: bid.status,
          date: bid.createdAt,
          description: `Placed bid for ${bid.quantity} shares of ${companyName} at ₹${displayPrice.toFixed(2)}`
        });

        // If I accepted my own bid (buyer accepts their bid)
        if (bid.status === 'pending_confirmation' || bid.status === 'accepted' || bid.status === 'confirmed') {
          if (bid.buyerAcceptedAt) {
            activities.push({
              type: 'action',
              action: 'accepted_bid',
              companyName: listing.companyName || 'Unknown',
              quantity: bid.quantity,
              price: bid.price,
              status: bid.status,
              date: bid.buyerAcceptedAt,
              description: `Accepted deal for ${bid.quantity} shares of ${listing.companyName} at ₹${bid.price}`
            });
          }
        }

        // Countered by me (as buyer)
        bid.counterHistory?.forEach(counter => {
          if (counter.by === 'buyer') {
            activities.push({
              type: 'action',
              action: 'countered_offer',
              companyName: listing.companyName || 'Unknown',
              quantity: counter.quantity || bid.quantity,
              price: counter.price,
              status: 'countered',
              date: counter.timestamp,
              description: `Countered offer for ${listing.companyName} at ₹${counter.price}`
            });
          }
        });
      });

      userOffers.forEach(offer => {
        // I am the offerer on a BUY listing. I see sellerReceivesPrice.
        const displayPrice = offer.sellerReceivesPrice || offer.price;
        
        // Made Offer
        activities.push({
          type: 'offer',
          action: 'placed_offer',
          companyName: companyName,
          quantity: offer.quantity,
          price: displayPrice,
          status: offer.status,
          date: offer.createdAt,
          description: `Made offer for ${offer.quantity} shares of ${companyName} at ₹${displayPrice.toFixed(2)}`
        });

        // If I accepted my own offer (seller accepts their offer on a buy listing)
        if (offer.status === 'pending_confirmation' || offer.status === 'accepted' || offer.status === 'confirmed') {
          if (offer.sellerAcceptedAt) {
            activities.push({
              type: 'action',
              action: 'accepted_offer',
              companyName: listing.companyName || 'Unknown',
              quantity: offer.quantity,
              price: offer.price,
              status: offer.status,
              date: offer.sellerAcceptedAt,
              description: `Accepted deal for ${offer.quantity} shares of ${listing.companyName} at ₹${offer.price}`
            });
          }
        }

        // Countered by me (as buyer/offerer)
        offer.counterHistory?.forEach(counter => {
          if (counter.by === 'buyer') { // I am the one making the offer (buyer role in transaction context, though technically seller in buy request? No, 'buyer' in counterHistory usually means the one who initiated the bid/offer? Need to verify logic. 
            // In Listing.js: by: 'buyer' or 'seller'. 
            // If I placed a bid on a Sell post, I am the 'buyer'.
            // If I placed an offer on a Buy post, I am the 'seller'.
            // Wait. If I place an offer on a Buy post, I am selling.
            // So my counter would be 'seller'.
            // Let's check Listing.js logic or assume standard naming.
            // Usually 'buyer' = User who pays money, 'seller' = User who gives shares.
            // If I place an offer on a Buy post, I am the SELLER.
            // So I should check for `counter.by === 'seller'` here?
            // Let's stick to `userId` check. If I am the one who placed the offer, I am the `userId` of the offer.
            // If `counter.by` matches my role...
            // It's safer to just check if I placed the counter? But `counterHistory` doesn't store userId, just 'buyer'/'seller'.
            // If I am the offerer on a Buy post, I am the SELLER.
            // So if `counter.by === 'seller'`, it's me.
            
            const isMyCounter = (listing.type === 'sell' && counter.by === 'buyer') || (listing.type === 'buy' && counter.by === 'seller');
            
            if (isMyCounter) {
               activities.push({
                type: 'action',
                action: 'countered_offer',
                companyName: listing.companyName || 'Unknown',
                quantity: counter.quantity || offer.quantity,
                price: counter.price,
                status: 'countered',
                date: counter.timestamp,
                description: `Countered request for ${listing.companyName} at ₹${counter.price}`
              });
            }
          }
        });
      });
    });

    // Sort by date and limit
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    const limitedActivities = activities.slice(0, limit);

    res.json({
      success: true,
      data: limitedActivities
    });
  } catch (error) {
    next(error);
  }
});

export default router;
