// Check all PPFAS listings and bids
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Listing from './models/Listing.js';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/unlistedhub';

async function checkPPFAS() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Find ALL PPFAS listings (any status)
    const listings = await Listing.find({
      companyName: /PPFAS/i
    }).populate('userId', 'username fullName').populate('bids.userId', 'username fullName');

    console.log(`📊 Found ${listings.length} PPFAS listing(s) in database\n`);

    for (const listing of listings) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📦 Listing ID: ${listing._id}`);
      console.log(`   Company: ${listing.companyName}`);
      console.log(`   Owner: @${listing.userId?.username || 'Unknown'} (${listing.userId?.fullName || 'N/A'})`);
      console.log(`   Owner ID: ${listing.userId?._id}`);
      console.log(`   Type: ${listing.type.toUpperCase()}`);
      console.log(`   Listing Status: ${listing.status}`);
      console.log(`   Price: ₹${listing.price}`);
      console.log(`   Quantity: ${listing.quantity}`);
      console.log(`   Created: ${listing.createdAt}`);
      
      console.log(`\n   💰 Bids (${listing.bids?.length || 0}):`);
      
      if (listing.bids && listing.bids.length > 0) {
        listing.bids.forEach((bid, idx) => {
          console.log(`\n   --- Bid ${idx + 1} ---`);
          console.log(`   Bid ID: ${bid._id}`);
          console.log(`   Bidder: @${bid.userId?.username || bid.username || 'Unknown'}`);
          console.log(`   Bidder Full Name: ${bid.userId?.fullName || 'N/A'}`);
          console.log(`   Bidder ID: ${bid.userId?._id}`);
          console.log(`   Price (base): ₹${bid.price}`);
          console.log(`   Buyer Pays: ₹${bid.buyerOfferedPrice || 'Not set'}`);
          console.log(`   Seller Gets: ₹${bid.sellerReceivesPrice || 'Not set'}`);
          console.log(`   Platform Fee: ₹${bid.platformFee || 'Not set'}`);
          console.log(`   Quantity: ${bid.quantity}`);
          console.log(`   Status: ${bid.status}`);
          console.log(`   buyerAcceptedAt: ${bid.buyerAcceptedAt || 'Not set'}`);
          console.log(`   sellerAcceptedAt: ${bid.sellerAcceptedAt || 'Not set'}`);
          console.log(`   Created: ${bid.createdAt}`);
          console.log(`   Updated: ${bid.updatedAt || 'N/A'}`);
        });
      } else {
        console.log(`   (No bids yet)`);
      }
    }

    console.log(`\n${'='.repeat(60)}\n`);
    
    // Now let's find bids with pending status
    const listingsWithPending = await Listing.find({
      'bids.status': 'pending'
    }).populate('userId', 'username').populate('bids.userId', 'username');
    
    console.log(`\n📊 Total listings with PENDING bids: ${listingsWithPending.length}`);
    
    if (listingsWithPending.length > 0) {
      listingsWithPending.forEach(listing => {
        const pendingBids = listing.bids.filter(b => b.status === 'pending');
        console.log(`   - ${listing.companyName}: ${pendingBids.length} pending bid(s)`);
      });
    }

    await mongoose.disconnect();
    console.log('\n✅ Done!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkPPFAS();
