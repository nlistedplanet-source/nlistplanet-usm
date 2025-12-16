import express from 'express';
import Listing from '../models/Listing.js';
import Company from '../models/Company.js';
import Notification from '../models/Notification.js';
import ReferralTracking from '../models/ReferralTracking.js';
import Settings from '../models/Settings.js';
import User from '../models/User.js';
import CompletedDeal from '../models/CompletedDeal.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { 
  validateListing, 
  validateBid, 
  validateBidAction, 
  validateCounterOffer, 
  validateObjectId 
} from '../middleware/validation.js';
import { createNewCompanyFromListing, searchCompanyByName } from '../utils/companyLookup.js';

const router = express.Router();

// @route   GET /api/listings
// @desc    Get all active listings (marketplace)
// @access  Public (with optional auth to filter own listings)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { 
      type, // 'sell' or 'buy'
      companyId, 
      search,
      sort = '-createdAt', // -createdAt, price, -price
      page = 1,
      limit = 20
    } = req.query;

    const query = { status: 'active' };

    // Filter by type
    if (type) query.type = type;

    // Filter by company
    if (companyId) query.companyId = companyId;

    // Search by company name
    if (search) {
      query.companyName = { $regex: search, $options: 'i' };
    }

    // Hide own listings if user is logged in
    if (req.user) {
      query.userId = { $ne: req.user._id };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch listings with boosted ones first
    let listings = await Listing.find(query)
      .sort({ isBoosted: -1, [sort]: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'username avatar fullName')
      .populate('companyId', 'CompanyName ScripName scriptName Logo Sector name logo sector PAN ISIN CIN pan isin cin highlights verificationStatus addedBy addedByUser');

    // Filter out listings with unverified companies (manual entries pending approval)
    listings = listings.filter(listing => {
      // If no companyId, allow (manual companyName only)
      if (!listing.companyId) return true;
      // If verificationStatus field doesn't exist (old companies), treat as verified
      if (!listing.companyId.verificationStatus) return true;
      // Only show verified companies or admin-added companies
      return listing.companyId.verificationStatus === 'verified' || listing.companyId.addedBy === 'admin';
    });

    const total = await Listing.countDocuments(query);

    res.json({
      success: true,
      data: listings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/listings/my
// @desc    Get user's own listings
// @access  Private
router.get('/my', protect, async (req, res, next) => {
  try {
    const { type, status, userId: requestedUserId } = req.query;

    // Allow admin to view other users' listings
    const targetUserId = (req.user.role === 'admin' && requestedUserId) ? requestedUserId : req.user._id;

    const query = { userId: targetUserId };
    
    if (type) query.type = type;
    if (status) query.status = status;  // Only filter by status if explicitly provided

    const listings = await Listing.find(query)
      .sort('-createdAt')
      .populate('userId', 'username avatar fullName')
      .populate('companyId', 'CompanyName ScripName scriptName Logo Sector name logo sector PAN ISIN CIN pan isin cin highlights');

    res.json({
      success: true,
      data: listings
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/listings/my-placed-bids
// @desc    Get bids/offers that current user placed on others' listings
// @access  Private
router.get('/my-placed-bids', protect, async (req, res, next) => {
  try {
    const { userId: requestedUserId } = req.query;

    // Allow admin to view other users' bids
    const targetUserId = (req.user.role === 'admin' && requestedUserId) ? requestedUserId : req.user._id;

    // Find all listings where target user has placed a bid or offer
    const listings = await Listing.find({
      $or: [
        { 'bids.userId': targetUserId },
        { 'offers.userId': targetUserId }
      ]
    })
      .sort('-createdAt')
      .populate('userId', 'username avatar fullName')
      .populate('companyId', 'CompanyName ScripName scriptName Logo Sector name logo sector PAN ISIN CIN pan isin cin highlights');

    // Extract user's bids and offers from listings
    const myActivity = [];
    
    listings.forEach(listing => {
      // Check bids array (for sell posts)
      if (listing.bids && listing.bids.length > 0) {
        listing.bids.forEach(bid => {
          if (bid.userId.toString() === targetUserId.toString()) {
            myActivity.push({
              _id: bid._id,
              type: 'bid',
              listingType: listing.type,
              listing: {
                _id: listing._id,
                companyName: listing.companyName,
                companyId: listing.companyId,
                listingPrice: listing.price,
                // Bidder is BUYER on SELL listing, so they pay +2%
                displayPrice: listing.type === 'sell' ? listing.price * 1.02 : listing.price * 0.98,
                listingQuantity: listing.quantity,
                isActive: listing.status === 'active',
                owner: listing.userId
              },
              price: bid.price,
              originalPrice: bid.originalPrice || bid.price, // Include original price
              quantity: bid.quantity,
              message: bid.message,
              status: bid.status,
              counterHistory: bid.counterHistory,
              createdAt: bid.createdAt
            });
          }
        });
      }
      
      // Check offers array (for buy posts)
      if (listing.offers && listing.offers.length > 0) {
        listing.offers.forEach(offer => {
          if (offer.userId.toString() === targetUserId.toString()) {
            myActivity.push({
              _id: offer._id,
              type: 'offer',
              listingType: listing.type,
              listing: {
                _id: listing._id,
                companyName: listing.companyName,
                companyId: listing.companyId,
                listingPrice: listing.price,
                // Offerer is SELLER on BUY listing, so they receive -2%
                displayPrice: listing.type === 'buy' ? listing.price * 0.98 : listing.price * 1.02,
                listingQuantity: listing.quantity,
                isActive: listing.status === 'active',
                owner: listing.userId
              },
              price: offer.price,
              originalPrice: offer.originalPrice || offer.price, // Include original price
              quantity: offer.quantity,
              message: offer.message,
              status: offer.status,
              counterHistory: offer.counterHistory,
              createdAt: offer.createdAt
            });
          }
        });
      }
    });

    // Sort by creation date
    myActivity.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: myActivity
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/listings
// @desc    Create new listing
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { type, companyId, companyName: manualCompanyName, price, quantity, minLot, companySegmentation, companyPan, companyISIN, companyCIN, description } = req.body;

    let company = null;
    let finalCompanyName = manualCompanyName;
    let isNewCompany = false;

    // If companyId provided, validate company exists
    if (companyId) {
      company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        });
      }
      finalCompanyName = company.CompanyName || company.name;
    } else if (manualCompanyName) {
      // Company name provided but no ID - search for existing or create new
      company = await searchCompanyByName(manualCompanyName);
      
      if (company) {
        // Found existing company
        finalCompanyName = company.CompanyName || company.name;
      } else {
        // Company not found - create new company with pending verification
        const result = await createNewCompanyFromListing(
          manualCompanyName,
          req.user._id,
          {
            pan: companyPan || null,
            isin: companyISIN || null,
            cin: companyCIN || null,
            sector: companySegmentation || null
          }
        );

        if (result.success) {
          company = result.company;
          isNewCompany = result.isNew;
          finalCompanyName = company.name;
          console.log(`New company "${company.name}" created by user ${req.user.username}, pending admin verification`);
        } else {
          console.error('Failed to create new company:', result.error);
          // Continue without company reference
          finalCompanyName = manualCompanyName;
        }
      }
    } else {
      // Neither companyId nor companyName provided
      return res.status(400).json({
        success: false,
        message: 'Company name or company ID is required'
      });
    }

    // Create listing
    const listingData = {
      userId: req.user._id,
      username: req.user.username,
      type,
      companyId: company ? company._id : null,
      companyName: finalCompanyName,
      companySegmentation: companySegmentation || null,
      companyPan: companyPan || null,
      companyISIN: companyISIN || null,
      companyCIN: companyCIN || null,
      price, // Keep original for backward compatibility
      quantity,
      minLot: minLot || 1,
      description
    };

    // Calculate platform fee fields
    if (type === 'sell') {
      // For SELL: Seller enters desired amount, buyer pays +2%
      listingData.sellerDesiredPrice = price;
      listingData.displayPrice = price * 1.02; // Buyer pays price + 2%
      listingData.platformFee = price * 0.02; // 2% fee on base price
    } else {
      // For BUY: Buyer enters max budget, seller gets -2%
      listingData.buyerMaxPrice = price;
      listingData.displayPrice = price * 0.98; // Seller gets price - 2%
      listingData.platformFee = price * 0.02; // 2% fee on base price
    }

    const listing = await Listing.create(listingData);

    // Update company listings count (only if company from database and not newly created)
    if (company && !isNewCompany) {
      company.totalListings += 1;
      await company.save();
    }

    // Prepare response message
    let message = `${type === 'sell' ? 'Sell post' : 'Buy request'} created successfully`;
    if (isNewCompany) {
      message += `. Note: "${company.name}" is a new company and pending admin verification.`;
    }

    res.status(201).json({
      success: true,
      message: `${type === 'sell' ? 'Sell post' : 'Buy request'} created successfully`,
      data: listing
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/listings/:id/bid
// @desc    Place bid on sell post or make offer on buy request
// @access  Private
router.post('/:id/bid', protect, async (req, res, next) => {
  try {
    const { price, quantity, message } = req.body;
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Can't bid on own listing
    if (listing.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot bid on your own listing'
      });
    }

    // Check if listing is active
    if (listing.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Listing is not active'
      });
    }

    // Validate quantity against minLot
    const minLot = listing.minLot || 1;
    if (quantity < minLot) {
      return res.status(400).json({
        success: false,
        message: `Minimum lot size is ${minLot} shares`
      });
    }

    // Validate quantity doesn't exceed available
    if (quantity > listing.quantity) {
      return res.status(400).json({
        success: false,
        message: `Maximum available is ${listing.quantity} shares`
      });
    }

    // Validate price is positive
    if (!price || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0'
      });
    }

    // Add bid/offer
    const bidData = {
      userId: req.user._id,
      username: req.user.username,
      price, // Current price (may change with counters)
      originalPrice: price, // Never changes - buyer's original bid
      quantity,
      message,
      counterHistory: []
    };

    // Calculate platform fee fields
    if (listing.type === 'sell') {
      // Buyer is bidding - buyer enters amount they'll pay
      bidData.buyerOfferedPrice = price;
      bidData.sellerReceivesPrice = price * 0.98; // Seller gets 2% less
      bidData.platformFee = price - bidData.sellerReceivesPrice;
    } else {
      // Seller is offering - seller enters amount they want to receive
      bidData.sellerReceivesPrice = price;
      bidData.buyerOfferedPrice = price / 0.98; // Buyer pays 2% more
      bidData.platformFee = bidData.buyerOfferedPrice - price;
    }

    if (listing.type === 'sell') {
      listing.bids.push(bidData);
    } else {
      listing.offers.push(bidData);
    }

    await listing.save();

    // Create notification for listing owner
    await Notification.create({
      userId: listing.userId,
      type: listing.type === 'sell' ? 'new_bid' : 'new_offer',
      title: listing.type === 'sell' ? 'New Bid Received' : 'New Offer Received',
      message: `@${req.user.username} ${listing.type === 'sell' ? 'placed a bid' : 'made an offer'} of ₹${price} for ${quantity} shares`,
      data: {
        listingId: listing._id,
        bidId: bidData._id,
        fromUser: req.user.username,
        amount: price,
        quantity,
        companyName: listing.companyName
      }
    });

    res.status(201).json({
      success: true,
      message: listing.type === 'sell' ? 'Bid placed successfully' : 'Offer made successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/listings/:id/boost
// @desc    Boost a listing
// @access  Private
router.put('/:id/boost', protect, async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Verify ownership
    if (listing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Set boost
    listing.isBoosted = true;
    listing.boostExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await listing.save();

    // Create transaction record
    const Transaction = (await import('../models/Transaction.js')).default;
    await Transaction.create({
      type: 'boost_fee',
      listingId: listing._id,
      sellerId: req.user._id,
      amount: process.env.BOOST_PRICE || 100,
      companyName: listing.companyName,
      description: `Boost fee for ${listing.type} post`
    });

    res.json({
      success: true,
      message: 'Listing boosted successfully for 24 hours'
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/listings/:listingId/bids/:bidId/accept
// @desc    Accept a bid/offer (Buyer accepts listing OR Seller accepts bid)
// @access  Private
router.put('/:listingId/bids/:bidId/accept', protect, async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.listingId).populate('userId', 'username fullName email');

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Find bid in appropriate array
    const bidArray = listing.type === 'sell' ? listing.bids : listing.offers;
    const bid = bidArray.id(req.params.bidId);

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    const isBidder = bid.userId.toString() === req.user._id.toString();
    const isOwner = listing.userId.toString() === req.user._id.toString();
    
    // Authorization check: Either Bidder or Owner can accept
    if (!isBidder && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this bid'
      });
    }

    // Check if already confirmed
    if (bid.status === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'This bid has already been confirmed'
      });
    }

    // Check if user already accepted
    if (bid.status === 'accepted') {
      // Someone already accepted, now checking who is accepting now
      const isSellListing = listing.type === 'sell';
      const buyerId = isSellListing ? bid.userId : listing.userId._id;
      const sellerId = isSellListing ? listing.userId._id : bid.userId;
      
      // Check who accepted first
      const buyerAcceptedFirst = bid.buyerAcceptedAt;
      const sellerAcceptedFirst = bid.sellerAcceptedAt;
      
      if (buyerAcceptedFirst && isBidder) {
        return res.status(400).json({
          success: false,
          message: 'You have already accepted this. Waiting for other party to confirm.'
        });
      }
      
      if (sellerAcceptedFirst && isOwner) {
        return res.status(400).json({
          success: false,
          message: 'You have already accepted this. Waiting for other party to confirm.'
        });
      }
      
      // Second party is accepting → Status becomes 'confirmed'
      bid.status = 'confirmed';
      if (isBidder) {
        bid.buyerAcceptedAt = new Date();
      } else {
        bid.sellerAcceptedAt = new Date();
      }
    } else {
      // First acceptance → Status becomes 'accepted'
      bid.status = 'accepted';
      
      // Track who accepted first
      const isSellListing = listing.type === 'sell';
      const isBuyer = isSellListing ? isBidder : isOwner;
      
      if (isBuyer) {
        bid.buyerAcceptedAt = new Date();
      } else {
        bid.sellerAcceptedAt = new Date();
      }
    }

    const newStatus = bid.status;
    bid.dealId = null; // Will be set after creating deal
    
    // ============ CREATE DEAL ============
    try {
      const bidderInfo = await User.findById(bid.userId).select('username fullName email');
      const ownerInfo = listing.userId; // Already populated
      
      if (!bidderInfo) {
        console.error(`❌ Accept Bid Error: Bidder not found (ID: ${bid.userId})`);
        return res.status(404).json({
          success: false,
          message: 'Bidder user account not found'
        });
      }

      if (!ownerInfo) {
        console.error(`❌ Accept Bid Error: Listing owner not found (ID: ${listing.userId})`);
        return res.status(404).json({
          success: false,
          message: 'Listing owner account not found'
        });
      }
      
      // Determine buyer and seller based on listing type
      const isSellListing = listing.type === 'sell';
      const sellerId = isSellListing ? listing.userId._id : bid.userId;
      const buyerId = isSellListing ? bid.userId : listing.userId._id;
      const sellerUsername = isSellListing ? ownerInfo.username : bidderInfo.username;
      const buyerUsername = isSellListing ? bidderInfo.username : ownerInfo.username;
      const sellerName = isSellListing ? ownerInfo.fullName : bidderInfo.fullName;
      const buyerName = isSellListing ? bidderInfo.fullName : ownerInfo.fullName;
      
      // Calculate prices with platform fee
      // For SELL listing: bid.price is Base Price -> Buyer Pays +2%, Seller Gets -2%
      // For BUY listing: bid.price is Seller Receives -> Buyer Pays = SellerReceives / 0.98
      const buyerPaysPerShare = isSellListing ? bid.price * 1.02 : bid.price / 0.98;
      const sellerReceivesPerShare = isSellListing ? bid.price * 0.98 : bid.price;
      const platformFeePerShare = buyerPaysPerShare - sellerReceivesPerShare;
      
      const dealData = {
        listingId: listing._id,
        bidId: bid._id,
        dealType: listing.type,
        companyName: listing.companyName,
        companyId: listing.companyId,
        sellerId,
        sellerUsername,
        sellerName,
        buyerId,
        buyerUsername,
        buyerName,
        agreedPrice: bid.price,
        quantity: bid.quantity,
        totalAmount: buyerPaysPerShare * bid.quantity,
        platformFee: platformFeePerShare * bid.quantity,
        buyerPaysPerShare,
        sellerReceivesPerShare,
        status: newStatus,
        buyerAcceptedAt: bid.buyerAcceptedAt,
        sellerAcceptedAt: bid.sellerAcceptedAt,
        buyerAcceptedPrice: buyerPaysPerShare
      };

      // If confirmed, set confirmation flags
      if (newStatus === 'confirmed') {
        dealData.buyerConfirmed = true;
        dealData.sellerConfirmed = true;
        dealData.buyerConfirmedAt = bid.buyerAcceptedAt;
        dealData.sellerConfirmedAt = bid.sellerAcceptedAt;
      }

      const deal = await CompletedDeal.create(dealData);
      
      console.log(`✅ Deal created with status: ${newStatus}`);
      
      // Update bid with dealId
      bid.dealId = deal._id;
      
      // Update listing status based on deal status
      if (newStatus === 'confirmed') {
        // Deal confirmed → Mark as sold
        listing.status = 'sold';
        
        // Reject all other pending bids
        bidArray.forEach(b => {
          if (b._id.toString() !== bid._id.toString() && b.status === 'pending') {
            b.status = 'rejected';
          }
        });
      } else if (newStatus === 'accepted') {
        // First acceptance → Hide from marketplace (negotiating)
        listing.status = 'negotiating';
      }
      
      await listing.save();
      
      // ============ NOTIFICATIONS ============
      if (newStatus === 'confirmed') {
        // Both parties confirmed → Deal complete
        // Notify buyer about confirmation
        await Notification.create({
          userId: buyerId,
          type: 'deal_confirmed',
          title: '🎉 Deal Confirmed!',
          message: `Your deal for ${listing.companyName} is confirmed! Check your verification codes.`,
          data: {
            listingId: listing._id,
            dealId: deal._id,
            companyName: listing.companyName
          }
        });

        // Notify seller about confirmation
        await Notification.create({
          userId: sellerId,
          type: 'deal_confirmed',
          title: '🎉 Deal Confirmed!',
          message: `Your deal for ${listing.companyName} is confirmed! Check your verification codes.`,
          data: {
            listingId: listing._id,
            dealId: deal._id,
            companyName: listing.companyName
          }
        });
      } else if (newStatus === 'accepted') {
        // First party accepted → Waiting for second party
        const acceptorId = isBidder ? buyerId : sellerId;
        const waitingForId = isBidder ? sellerId : buyerId;
        const acceptorUsername = isBidder ? buyerUsername : sellerUsername;
        const waitingForUsername = isBidder ? sellerUsername : buyerUsername;
        
        // Notify the person who accepted
        await Notification.create({
          userId: acceptorId,
          type: 'acceptance_sent',
          title: '✅ Acceptance Sent!',
          message: `Waiting for @${waitingForUsername} to accept the deal for ${listing.companyName}`,
          data: {
            listingId: listing._id,
            bidId: bid._id,
            dealId: deal._id,
            amount: isBidder ? buyerPaysPerShare * bid.quantity : sellerReceivesPerShare * bid.quantity,
            quantity: bid.quantity,
            companyName: listing.companyName
          }
        });
        
        // Notify the other party about acceptance
        await Notification.create({
          userId: waitingForId,
          type: 'party_accepted',
          title: '🔔 Deal Accepted!',
          message: `@${acceptorUsername} accepted the deal for ${listing.companyName}. Accept to confirm!`,
          data: {
            listingId: listing._id,
            bidId: bid._id,
            dealId: deal._id,
            amount: isBidder ? sellerReceivesPerShare * bid.quantity : buyerPaysPerShare * bid.quantity,
            quantity: bid.quantity,
            companyName: listing.companyName
          }
        });
      }

      res.json({
        success: true,
        message: newStatus === 'confirmed' 
          ? 'Deal confirmed! Verification codes generated.' 
          : 'Acceptance sent! Waiting for other party to confirm.',
        status: newStatus,
        deal: newStatus === 'confirmed' ? {
            id: deal._id,
            status: deal.status,
            buyerCode: deal.buyerVerificationCode,
            sellerCode: deal.sellerVerificationCode,
            rmCode: deal.rmVerificationCode
        } : {
            id: deal._id,
            status: deal.status
        }
      });
      
    } catch (dealError) {
      console.error('❌ Failed to create deal:', dealError);
      return res.status(500).json({
        success: false,
        message: `Failed to create deal: ${dealError.message}`
      });
    }
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/listings/:listingId/deals/:dealId/confirm
// @desc    STEP 2: Seller confirms buyer's acceptance (generates verification codes)
// @access  Private (listing owner/seller only)
router.put('/:listingId/deals/:dealId/confirm', protect, async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.listingId).populate('userId', 'username fullName email');
    const deal = await CompletedDeal.findById(req.params.dealId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    // Check if user is the seller
    if (deal.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the seller can confirm this deal'
      });
    }

    // Check if already confirmed
    if (deal.sellerConfirmed) {
      return res.status(400).json({
        success: false,
        message: 'Deal already confirmed'
      });
    }

    // Update deal status to confirmed and generate codes (already done by model defaults)
    deal.status = 'confirmed';
    deal.sellerConfirmed = true;
    deal.sellerConfirmedAt = new Date();
    await deal.save();

    // Update listing status
    listing.status = 'sold';
    
    // Reject all other pending bids
    const bidArray = listing.type === 'sell' ? listing.bids : listing.offers;
    bidArray.forEach(b => {
      if (b._id.toString() !== deal.bidId.toString() && b.status === 'pending') {
        b.status = 'rejected';
      }
    });
    
    await listing.save();

    // Notify buyer about seller confirmation
    await Notification.create({
      userId: deal.buyerId,
      type: 'seller_confirmed',
      title: '🎉 Congratulations!',
      message: `Seller accepted your bid for ${listing.companyName}. Check your codes!`,
      data: {
        listingId: listing._id,
        dealId: deal._id,
        companyName: listing.companyName
      }
    });

    // Notify seller about confirmation
    await Notification.create({
      userId: deal.sellerId,
      type: 'confirmation_success',
      title: '✅ Deal Confirmed!',
      message: `You confirmed the sale of ${listing.companyName}. Check your codes!`,
      data: {
        listingId: listing._id,
        dealId: deal._id,
        companyName: listing.companyName
      }
    });

    res.json({
      success: true,
      message: 'Deal confirmed successfully! Verification codes generated.',
      deal: {
        id: deal._id,
        status: deal.status,
        buyerCode: deal.buyerVerificationCode,
        sellerCode: deal.sellerVerificationCode,
        rmCode: deal.rmVerificationCode
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/listings/:listingId/deals/:dealId/reject
// @desc    Seller rejects buyer's acceptance
// @access  Private (listing owner/seller only)
router.put('/:listingId/deals/:dealId/reject', protect, async (req, res, next) => {
  try {
    const { reason } = req.body;
    const deal = await CompletedDeal.findById(req.params.dealId);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    // Check if user is the seller
    if (deal.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the seller can reject this deal'
      });
    }

    // Update deal status
    deal.status = 'rejected_by_seller';
    deal.cancelReason = reason || 'Rejected by seller';
    deal.cancelledAt = new Date();
    await deal.save();

    // Update bid status in listing
    const listing = await Listing.findById(req.params.listingId);
    const bidArray = listing.type === 'sell' ? listing.bids : listing.offers;
    const bid = bidArray.id(deal.bidId);
    if (bid) {
      bid.status = 'rejected';
    }

    // Revert listing status to active if it was negotiating
    if (listing.status === 'negotiating') {
      listing.status = 'active';
    }

    await listing.save();

    // Notify buyer about rejection
    await Notification.create({
      userId: deal.buyerId,
      type: 'seller_rejected',
      title: '❌ Seller Rejected',
      message: `Seller declined your acceptance for ${deal.companyName}. ${reason || ''}`,
      data: {
        listingId: listing._id,
        dealId: deal._id,
        companyName: deal.companyName,
        reason
      }
    });

    res.json({
      success: true,
      message: 'Deal rejected successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/listings/:listingId/bids/:bidId/reject
// @desc    Reject a bid/offer or reject a counter offer
// @access  Private (listing owner OR bidder if status is 'countered')
router.put('/:listingId/bids/:bidId/reject', protect, async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Find bid in appropriate array
    const bidArray = listing.type === 'sell' ? listing.bids : listing.offers;
    const bid = bidArray.id(req.params.bidId);

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    const isOwner = listing.userId.toString() === req.user._id.toString();
    const isBidder = bid.userId.toString() === req.user._id.toString();
    
    // Authorization check:
    // - Owner can always reject bids
    // - Bidder can reject ONLY when status is 'countered' (seller has countered)
    if (!isOwner && !(isBidder && bid.status === 'countered')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this bid'
      });
    }

    // Update bid status
    bid.status = 'rejected';
    await listing.save();

    // Create notification for bidder
    await Notification.create({
      userId: bid.userId,
      type: 'bid_rejected',
      title: 'Bid Rejected',
      message: `Your ${listing.type === 'sell' ? 'bid' : 'offer'} of ₹${bid.price} for ${bid.quantity} shares of ${listing.companyName} has been rejected.`,
      data: {
        listingId: listing._id,
        bidId: bid._id,
        amount: bid.price,
        quantity: bid.quantity,
        companyName: listing.companyName
      }
    });

    res.json({
      success: true,
      message: 'Bid rejected successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/listings/:listingId/bids/:bidId/counter
// @desc    Counter a bid/offer
// @access  Private (listing owner OR bidder if status is 'countered')
router.put('/:listingId/bids/:bidId/counter', protect, async (req, res, next) => {
  try {
    const { price, quantity, message } = req.body;
    const listing = await Listing.findById(req.params.listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Find bid in appropriate array
    const bidArray = listing.type === 'sell' ? listing.bids : listing.offers;
    const bid = bidArray.id(req.params.bidId);

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    const isOwner = listing.userId.toString() === req.user._id.toString();
    const isBidder = bid.userId.toString() === req.user._id.toString();
    
    // Authorization check:
    // - Owner can always counter bids
    // - Bidder can counter ONLY when status is 'countered' (seller has countered)
    if (!isOwner && !(isBidder && bid.status === 'countered')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to counter this bid'
      });
    }

    // Determine who is sending the counter
    const counterBy = isOwner ? 'seller' : 'buyer';

    // Add to counter history
    const round = (bid.counterHistory?.length || 0) + 1;
    const counterData = {
      round,
      by: counterBy,
      price,
      quantity: quantity || bid.quantity,
      message: message || '',
      timestamp: new Date()
    };
    bid.counterHistory.push(counterData);

    // Update bid status and price
    bid.status = 'countered';
    bid.price = price;
    if (quantity) bid.quantity = quantity;

    // Recalculate platform fee fields
    if (listing.type === 'sell') {
      // Seller is countering - seller enters desired amount
      bid.sellerReceivesPrice = price;
      bid.buyerOfferedPrice = price / 0.98; // Buyer pays 2% more
      bid.platformFee = bid.buyerOfferedPrice - price;
    } else {
      // Seller is countering on BUY post - seller enters desired amount
      bid.sellerReceivesPrice = price;
      bid.buyerOfferedPrice = price / 0.98; // Buyer pays 2% more
      bid.platformFee = bid.buyerOfferedPrice - price;
    }
    
    await listing.save();

    // Create notification for bidder
    await Notification.create({
      userId: bid.userId,
      type: 'bid_countered',
      title: 'Counter Offer Received',
      message: `Counter offer on ${listing.companyName}: ₹${price} for ${quantity || bid.quantity} shares`,
      data: {
        listingId: listing._id,
        bidId: bid._id,
        amount: price,
        quantity: quantity || bid.quantity,
        companyName: listing.companyName,
        round
      }
    });

    res.json({
      success: true,
      message: 'Counter offer sent successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/listings/:id
// @desc    Update/modify a listing
// @access  Private (listing owner only)
router.put('/:id', protect, async (req, res, next) => {
  try {
    const { price, quantity, minQuantity } = req.body;
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Verify ownership
    if (listing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this listing'
      });
    }

    // Can only update active listings
    if (listing.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Can only update active listings'
      });
    }

    // Update fields
    if (price !== undefined) {
      listing.price = price;
      // Recalculate platform fee fields
      if (listing.type === 'sell') {
        listing.sellerDesiredPrice = price;
        // SELL: Buyer pays price + 2%
        listing.displayPrice = price * 1.02;
        listing.platformFee = price * 0.02;
      } else {
        listing.buyerMaxPrice = price;
        // BUY: Seller gets price - 2%
        listing.displayPrice = price * 0.98;
        listing.platformFee = price * 0.02;
      }
    }
    if (quantity !== undefined) listing.quantity = quantity;
    if (minQuantity !== undefined) listing.minLot = minQuantity;
    
    await listing.save();

    res.json({
      success: true,
      message: 'Listing updated successfully',
      data: listing
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/listings/:id
// @desc    Delete a listing
// @access  Private (listing owner only)
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Verify ownership
    if (listing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this listing'
      });
    }

    // Can't delete listings with accepted bids/offers
    const hasAcceptedBids = listing.bids?.some(bid => bid.status === 'accepted') || 
                            listing.offers?.some(offer => offer.status === 'accepted');
    
    if (hasAcceptedBids) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete listing with accepted bids/offers. Please contact admin.'
      });
    }

    // Send notifications to all bidders/offers (remove duplicates)
    const bidUsers = [...(listing.bids || []), ...(listing.offers || [])].map(b => b.userId);
    const uniqueBidUsers = [...new Set(bidUsers.map(id => id.toString()))];
    
    if (uniqueBidUsers.length > 0) {
      try {
        await Notification.insertMany(
          uniqueBidUsers.map(userId => ({
            userId,
            type: 'listing_cancelled',
            title: 'Listing Cancelled',
            message: `The listing for ${listing.companyName} has been cancelled by the seller.`,
            data: {
              listingId: listing._id,
              companyName: listing.companyName
            }
          }))
        );
      } catch (notifError) {
        // Log notification error but don't fail the delete
        console.error('Failed to send notifications:', notifError);
      }
    }

    // Delete the listing
    await listing.deleteOne();

    res.json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/listings/completed-deals
// @desc    Get user's completed deals with verification codes
// @access  Private
router.get('/completed-deals', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Find deals where user is buyer or seller
    const deals = await CompletedDeal.find({
      $or: [
        { buyerId: userId },
        { sellerId: userId }
      ]
    })
    .populate('buyerId', 'username email phone')
    .populate('sellerId', 'username email phone')
    .sort({ createdAt: -1 })
    .lean();
    
    // Add userRole and appropriate verification codes for each deal
    const dealsWithRole = deals.map(deal => {
      const isBuyer = deal.buyerId?._id?.toString() === userId.toString();
      return {
        ...deal,
        userRole: isBuyer ? 'buyer' : 'seller',
        // Show user their own verification code and the RM code
        myVerificationCode: isBuyer ? deal.buyerVerificationCode : deal.sellerVerificationCode,
        // RM code is the same for everyone to verify RM
        rmVerificationCode: deal.rmVerificationCode,
        // Hide the other party's verification code
        buyerVerificationCode: undefined,
        sellerVerificationCode: undefined
      };
    });
    
    res.json({
      success: true,
      data: dealsWithRole,
      count: dealsWithRole.length
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/listings/:id/mark-sold
// @desc    Mark listing as sold externally (not through platform)
// @access  Private (listing owner only)
router.put('/:id/mark-sold', protect, async (req, res, next) => {
  try {
    const { soldPrice, soldQuantity, notes } = req.body;
    
    if (!soldPrice || soldPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the price at which you sold/bought the shares'
      });
    }
    
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }
    
    // Verify ownership
    if (listing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this listing'
      });
    }
    
    // Can only mark active listings as sold
    if (listing.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Can only mark active listings as sold'
      });
    }
    
    // Update listing
    listing.status = 'sold';
    listing.soldPrice = soldPrice;
    listing.soldQuantity = soldQuantity || listing.quantity;
    listing.soldExternally = true;
    listing.soldNotes = notes || '';
    listing.soldAt = new Date();
    
    // Reject all pending bids/offers
    const bidField = listing.type === 'sell' ? 'bids' : 'offers';
    if (listing[bidField] && listing[bidField].length > 0) {
      for (const bid of listing[bidField]) {
        if (bid.status === 'pending' || bid.status === 'countered') {
          bid.status = 'rejected';
          bid.rejectedAt = new Date();
          bid.rejectionReason = 'Listing sold externally';
          
          await Notification.create({
            userId: bid.userId,
            type: 'bid_rejected',
            title: 'Listing No Longer Available',
            message: `The ${listing.type === 'sell' ? 'seller' : 'buyer'} for ${listing.companyName} has completed their transaction elsewhere.`,
            data: {
              listingId: listing._id,
              bidId: bid._id,
              companyName: listing.companyName
            }
          });
        }
      }
    }
    
    await listing.save();
    
    res.json({
      success: true,
      message: `Successfully marked as ${listing.type === 'sell' ? 'sold' : 'bought'}!`,
      data: listing
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/listings/:id/cancel
// @desc    Cancel/Delete a listing (user no longer interested)
// @access  Private (listing owner only)
router.put('/:id/cancel', protect, async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }
    
    // Verify ownership
    if (listing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this listing'
      });
    }
    
    // Can only cancel active listings
    if (listing.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Can only cancel active listings'
      });
    }
    
    // Update listing
    listing.status = 'cancelled';
    listing.cancelledAt = new Date();
    listing.cancelReason = reason || 'User cancelled';
    
    // Reject all pending bids/offers
    const bidField = listing.type === 'sell' ? 'bids' : 'offers';
    if (listing[bidField] && listing[bidField].length > 0) {
      for (const bid of listing[bidField]) {
        if (bid.status === 'pending' || bid.status === 'countered') {
          bid.status = 'rejected';
          bid.rejectedAt = new Date();
          bid.rejectionReason = 'Listing cancelled by owner';
          
          await Notification.create({
            userId: bid.userId,
            type: 'bid_rejected',
            title: 'Listing Cancelled',
            message: `The ${listing.type === 'sell' ? 'seller' : 'buyer'} has cancelled their listing for ${listing.companyName}.`,
            data: {
              listingId: listing._id,
              bidId: bid._id,
              companyName: listing.companyName
            }
          });
        }
      }
    }
    
    await listing.save();
    
    res.json({
      success: true,
      message: 'Listing cancelled successfully',
      data: listing
    });
  } catch (error) {
    next(error);
  }
});

export default router;
