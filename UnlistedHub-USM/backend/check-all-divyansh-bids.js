// Check ALL of Divyansh's PPFAS bids regardless of status
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Listing from './models/Listing.js';
import User from './models/User.js';
dotenv.config();

async function checkAllDivyanshBids() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to production database\n');

    const divyansh = await User.findOne({ username: 'spongebob205' });
    if (!divyansh) {
      console.log('❌ User not found');
      return;
    }
    console.log(`✅ User: @${divyansh.username} (${divyansh._id})\n`);

    // Find ALL listings with Divyansh's bids (any status)
    const listings = await Listing.find({
      'bids.userId': divyansh._id
    }).populate('userId', 'username').sort({ createdAt: -1 });

    console.log(`📊 Found ${listings.length} listing(s) with bids from Divyansh\n`);

    for (const listing of listings) {
      const divyanshBids = listing.bids.filter(b => 
        b.userId.toString() === divyansh._id.toString()
      );

      console.log(`${'='.repeat(70)}`);
      console.log(`📦 ${listing.companyName} (${listing.type.toUpperCase()})`);
      console.log(`   Listing ID: ${listing._id}`);
      console.log(`   Owner: @${listing.userId.username}`);
      console.log(`   Listing Status: ${listing.status}`);
      console.log(`   Price: ₹${listing.price}`);
      console.log(`   Created: ${listing.createdAt.toLocaleString()}`);
      console.log(`\n   📝 Divyansh's Bids on this listing: ${divyanshBids.length}`);

      divyanshBids.forEach((bid, idx) => {
        console.log(`\n   --- Bid ${idx + 1} ---`);
        console.log(`   Bid ID: ${bid._id}`);
        console.log(`   Status: ${bid.status}`);
        console.log(`   Price: ₹${bid.price}`);
        console.log(`   Buyer Pays: ₹${bid.buyerOfferedPrice || 'Not set'}`);
        console.log(`   Seller Gets: ₹${bid.sellerReceivesPrice || 'Not set'}`);
        console.log(`   Quantity: ${bid.quantity}`);
        console.log(`   buyerAcceptedAt: ${bid.buyerAcceptedAt || 'Not set'}`);
        console.log(`   sellerAcceptedAt: ${bid.sellerAcceptedAt || 'Not set'}`);
        console.log(`   Created: ${bid.createdAt.toLocaleString()}`);
      });

      console.log('');
    }

    console.log(`${'='.repeat(70)}\n`);

    // Now update the FIRST pending bid if any
    const pendingListings = listings.filter(l => 
      l.bids.some(b => 
        b.userId.toString() === divyansh._id.toString() && 
        b.status === 'pending'
      )
    );

    if (pendingListings.length > 0) {
      console.log(`\n✅ Found ${pendingListings.length} listing(s) with pending bids\n`);
      console.log('🎯 Updating first pending bid...\n');

      const listing = pendingListings[0];
      const bid = listing.bids.find(b => 
        b.userId.toString() === divyansh._id.toString() && 
        b.status === 'pending'
      );

      bid.status = 'pending_confirmation';
      bid.buyerAcceptedAt = new Date();
      bid.buyerOfferedPrice = bid.buyerOfferedPrice || bid.price * 1.02;
      bid.sellerReceivesPrice = bid.sellerReceivesPrice || bid.price * 0.98;
      bid.platformFee = bid.platformFee || bid.price * 0.02;
      listing.status = 'deal_pending';

      await listing.save();

      console.log('✅ Updated successfully!');
      console.log(`   Bid: ${bid._id}`);
      console.log(`   Status: pending → pending_confirmation`);
      console.log(`   Buyer Pays: ₹${bid.buyerOfferedPrice.toFixed(2)}`);
      console.log('\n🎉 Refresh browser to see changes!');
    } else {
      console.log('ℹ️  No pending bids found to update.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Done!');
    process.exit(0);
  }
}

checkAllDivyanshBids();
