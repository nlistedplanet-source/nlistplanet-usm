import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Listing from './models/Listing.js';

dotenv.config();

async function checkDivyanshBids() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all listings with bids from Divyansh (userId: 674ca7df9d30db49e1cbc6be)
    const divyanshId = '674ca7df9d30db49e1cbc6be';
    
    const listings = await Listing.find({
      'bids.userId': divyanshId
    }).populate('companyId', 'name');

    console.log(`Found ${listings.length} listings with Divyansh's bids\n`);
    console.log('=' .repeat(80));

    for (const listing of listings) {
      const divyanshBids = listing.bids.filter(bid => 
        bid.userId.toString() === divyanshId
      );

      console.log(`\n📊 Listing: ${listing.companyName || listing.companyId?.name}`);
      console.log(`   ID: ${listing._id}`);
      console.log(`   Type: ${listing.type}`);
      console.log(`   Listing Status: ${listing.status}`);
      console.log(`   Divyansh's Bids: ${divyanshBids.length}`);
      
      divyanshBids.forEach((bid, index) => {
        console.log(`\n   Bid ${index + 1}:`);
        console.log(`      Bid ID: ${bid._id}`);
        console.log(`      Status: ${bid.status}`);
        console.log(`      Price: ₹${bid.price}`);
        console.log(`      Quantity: ${bid.quantity}`);
        console.log(`      Created: ${bid.createdAt}`);
        if (bid.buyerAcceptedAt) {
          console.log(`      Buyer Accepted At: ${bid.buyerAcceptedAt}`);
        }
      });
      
      console.log('\n' + '-'.repeat(80));
    }

    console.log('\n✅ Check complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDivyanshBids();
