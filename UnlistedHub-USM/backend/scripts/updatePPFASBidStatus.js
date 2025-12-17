/**
 * Script to manually update PPFAS bid status from 'pending' to 'pending_confirmation'
 * This simulates what happens when buyer accepts from marketplace
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Listing = require('../models/Listing');
const User = require('../models/User');

const updatePPFASBid = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find Divyansh's user
    const divyansh = await User.findOne({ username: 'spongebob205' });
    if (!divyansh) {
      console.log('❌ User spongebob205 not found');
      process.exit(1);
    }
    console.log(`✅ Found user: ${divyansh.username} (${divyansh._id})\n`);

    // Find PPFAS listing from hrithik947
    const seller = await User.findOne({ username: 'hrithik947' });
    if (!seller) {
      console.log('❌ Seller hrithik947 not found');
      process.exit(1);
    }

    const listing = await Listing.findOne({
      companyName: 'PPFAS',
      userId: seller._id,
      type: 'sell'
    });

    if (!listing) {
      console.log('❌ PPFAS listing from hrithik947 not found');
      process.exit(1);
    }

    console.log(`✅ Found PPFAS listing: ${listing._id}`);
    console.log(`   Status: ${listing.status}`);
    console.log(`   Price: ₹${listing.price}`);
    console.log(`   Bids: ${listing.bids.length}\n`);

    // Find Divyansh's bid
    const bid = listing.bids.find(b => b.userId.toString() === divyansh._id.toString());
    
    if (!bid) {
      console.log('❌ No bid found from spongebob205 on this listing');
      console.log('   Creating a new bid and accepting it...\n');
      
      // Create new bid with acceptance
      const newBid = {
        userId: divyansh._id,
        username: divyansh.username,
        price: listing.price,
        originalPrice: listing.price,
        quantity: 5000,
        message: 'Accepted from marketplace',
        counterHistory: [],
        status: 'pending_confirmation',
        buyerAcceptedAt: new Date(),
        buyerOfferedPrice: listing.price * 1.02, // Buyer pays 2% more
        sellerReceivesPrice: listing.price * 0.98, // Seller gets 2% less
        platformFee: listing.price * 0.02
      };
      
      listing.bids.push(newBid);
      listing.status = 'deal_pending';
      await listing.save();
      
      console.log('✅ Created new bid and marked as accepted!');
      console.log(`   Bid ID: ${listing.bids[listing.bids.length - 1]._id}`);
      console.log(`   Status: pending_confirmation`);
      console.log(`   Buyer Price: ₹${newBid.buyerOfferedPrice.toFixed(2)}`);
      console.log(`   Seller Price: ₹${newBid.sellerReceivesPrice.toFixed(2)}`);
      console.log(`   Listing Status: deal_pending`);
      
    } else {
      console.log(`✅ Found bid: ${bid._id}`);
      console.log(`   Current Status: ${bid.status}`);
      console.log(`   Price: ₹${bid.price}`);
      console.log(`   Quantity: ${bid.quantity}\n`);

      if (bid.status === 'pending_confirmation' || bid.status === 'accepted') {
        console.log('ℹ️  Bid is already in accepted state. No changes needed.');
      } else {
        console.log('🔄 Updating bid to accepted state...\n');
        
        // Update bid status
        bid.status = 'pending_confirmation';
        bid.buyerAcceptedAt = new Date();
        
        // Ensure fee fields are set
        if (!bid.buyerOfferedPrice) {
          bid.buyerOfferedPrice = bid.price * 1.02;
        }
        if (!bid.sellerReceivesPrice) {
          bid.sellerReceivesPrice = bid.price * 0.98;
        }
        if (!bid.platformFee) {
          bid.platformFee = bid.price * 0.02;
        }
        
        // Update listing status to hide from marketplace
        listing.status = 'deal_pending';
        
        await listing.save();
        
        console.log('✅ Bid updated successfully!');
        console.log(`   Status: ${bid.status}`);
        console.log(`   Buyer Accepted At: ${bid.buyerAcceptedAt}`);
        console.log(`   Buyer Price: ₹${bid.buyerOfferedPrice.toFixed(2)}`);
        console.log(`   Seller Price: ₹${bid.sellerReceivesPrice.toFixed(2)}`);
        console.log(`   Platform Fee: ₹${bid.platformFee.toFixed(2)}`);
        console.log(`   Listing Status: ${listing.status}`);
      }
    }

    console.log('\n✅ Done! Refresh your browser to see changes.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updatePPFASBid();
