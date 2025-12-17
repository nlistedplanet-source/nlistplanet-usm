// Manually accept Divyansh's first PPFAS bid in production database
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Listing from './models/Listing.js';
import User from './models/User.js';
dotenv.config();

async function acceptDivyanshBid() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to production database\n');

    // Find Divyansh's user
    const divyansh = await User.findOne({ username: 'spongebob205' });
    if (!divyansh) {
      console.log('❌ User spongebob205 not found');
      return;
    }
    console.log(`✅ Found user: @${divyansh.username} (ID: ${divyansh._id})\n`);

    // Find PPFAS listings with Divyansh's pending bids
    const listings = await Listing.find({
      companyName: /PPFAS/i,
      type: 'sell',
      'bids.userId': divyansh._id,
      'bids.status': 'pending'
    }).populate('userId', 'username');

    console.log(`📊 Found ${listings.length} PPFAS listing(s) with Divyansh's pending bids\n`);

    if (listings.length === 0) {
      console.log('ℹ️  No pending bids found. All bids may already be accepted.');
      return;
    }

    // Get the first listing
    const listing = listings[0];
    console.log(`📦 Listing: ${listing.companyName}`);
    console.log(`   Owner: @${listing.userId.username}`);
    console.log(`   Listing Status: ${listing.status}`);
    console.log(`   Price: ₹${listing.price}\n`);

    // Find Divyansh's pending bid
    const bid = listing.bids.find(b => 
      b.userId.toString() === divyansh._id.toString() && 
      b.status === 'pending'
    );

    if (!bid) {
      console.log('❌ No pending bid found from Divyansh');
      return;
    }

    console.log(`💰 Found pending bid:`);
    console.log(`   Bid ID: ${bid._id}`);
    console.log(`   Current Status: ${bid.status}`);
    console.log(`   Price: ₹${bid.price}`);
    console.log(`   Quantity: ${bid.quantity}\n`);

    // Update bid to accepted state
    console.log('🔄 Updating bid to accepted state...\n');
    
    bid.status = 'pending_confirmation';
    bid.buyerAcceptedAt = new Date();
    
    // Ensure fee fields are set
    if (!bid.buyerOfferedPrice) {
      bid.buyerOfferedPrice = bid.price * 1.02; // Buyer pays 2% more
    }
    if (!bid.sellerReceivesPrice) {
      bid.sellerReceivesPrice = bid.price * 0.98; // Seller gets 2% less
    }
    if (!bid.platformFee) {
      bid.platformFee = bid.price * 0.02;
    }
    
    // Update listing status to hide from marketplace
    listing.status = 'deal_pending';
    
    await listing.save();
    
    console.log('✅ SUCCESS! Bid accepted in database!\n');
    console.log('📊 Updated Details:');
    console.log(`   Bid Status: pending → pending_confirmation`);
    console.log(`   Listing Status: ${listing.status}`);
    console.log(`   buyerAcceptedAt: ${bid.buyerAcceptedAt}`);
    console.log(`   Buyer Pays: ₹${bid.buyerOfferedPrice.toFixed(2)}`);
    console.log(`   Seller Gets: ₹${bid.sellerReceivesPrice.toFixed(2)}`);
    console.log(`   Platform Fee: ₹${bid.platformFee.toFixed(2)}\n`);
    
    console.log('🎉 Now go to https://nlistplanet.com and refresh My Bids tab!');
    console.log('   You should see:');
    console.log('   ✅ Action By: "✅ You Accepted"');
    console.log('   ✅ Price: ₹' + bid.buyerOfferedPrice.toFixed(2));
    console.log('   ✅ Status: "⚠️ Waiting for Seller\'s Acceptance"');
    console.log('   ✅ Green border on card\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Done!');
    process.exit(0);
  }
}

acceptDivyanshBid();
