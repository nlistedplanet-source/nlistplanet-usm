// Test script to accept a bid directly
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Listing from './models/Listing.js';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/unlistedhub';

async function testAcceptBid() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Find PPFAS listing with pending bids
    const listings = await Listing.find({
      companyName: /PPFAS/i,
      'bids.status': 'pending'
    }).populate('userId', 'username').populate('bids.userId', 'username');

    console.log(`📊 Found ${listings.length} PPFAS listing(s) with pending bids\n`);

    for (const listing of listings) {
      console.log(`\n📦 Listing ID: ${listing._id}`);
      console.log(`   Company: ${listing.companyName}`);
      console.log(`   Owner: @${listing.userId?.username || 'Unknown'}`);
      console.log(`   Type: ${listing.type.toUpperCase()}`);
      console.log(`   Status: ${listing.status}`);
      console.log(`   Price: ₹${listing.price}`);
      
      const pendingBids = listing.bids.filter(b => b.status === 'pending');
      console.log(`\n   💰 Pending Bids (${pendingBids.length}):`);
      
      pendingBids.forEach((bid, idx) => {
        console.log(`\n   Bid ${idx + 1}:`);
        console.log(`   - Bid ID: ${bid._id}`);
        console.log(`   - Bidder: @${bid.userId?.username || bid.username || 'Unknown'}`);
        console.log(`   - Bidder ID: ${bid.userId?._id || 'Unknown'}`);
        console.log(`   - Price: ₹${bid.price}`);
        console.log(`   - Buyer Pays: ₹${bid.buyerOfferedPrice || 'Not set'}`);
        console.log(`   - Seller Gets: ₹${bid.sellerReceivesPrice || 'Not set'}`);
        console.log(`   - Quantity: ${bid.quantity}`);
        console.log(`   - Status: ${bid.status}`);
        console.log(`   - Created: ${bid.createdAt}`);
      });
      
      // Ask if user wants to accept
      console.log(`\n\n❓ Do you want to accept the FIRST bid?`);
      console.log(`   This will change status: pending → pending_confirmation`);
      console.log(`   And set buyerAcceptedAt timestamp`);
      console.log(`\n   👉 Run with --accept flag to proceed\n`);
      
      // If --accept flag is provided
      if (process.argv.includes('--accept') && pendingBids.length > 0) {
        const bidToAccept = pendingBids[0];
        console.log(`\n🎯 Accepting bid ${bidToAccept._id}...\n`);
        
        // Update bid status
        bidToAccept.status = 'pending_confirmation';
        bidToAccept.buyerAcceptedAt = new Date();
        
        // Update listing status
        listing.status = 'deal_pending';
        
        await listing.save();
        
        console.log('✅ Bid accepted successfully!');
        console.log(`   - Bid status: pending → pending_confirmation`);
        console.log(`   - Listing status: ${listing.status}`);
        console.log(`   - buyerAcceptedAt: ${bidToAccept.buyerAcceptedAt}`);
        console.log(`\n🎉 Now refresh browser to see changes!\n`);
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ Done!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testAcceptBid();
