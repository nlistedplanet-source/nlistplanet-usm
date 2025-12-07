import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Listing from '../models/Listing.js';

dotenv.config();

async function fixListingPrices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get all listings
    const listings = await Listing.find({});
    console.log(`Found ${listings.length} listings to fix\n`);
    
    let fixedCount = 0;
    
    for (const listing of listings) {
      const oldDisplayPrice = listing.displayPrice;
      const oldPlatformFee = listing.platformFee;
      
      // Calculate correct values
      const correctPlatformFee = listing.price * 0.02;
      const correctDisplayPrice = listing.type === 'sell' 
        ? listing.price * 1.02  // SELL: Buyer pays +2%
        : listing.price * 0.98; // BUY: Seller gets -2%
      
      // Check if needs fixing (compare with small tolerance for floating point)
      const needsFix = Math.abs(oldDisplayPrice - correctDisplayPrice) > 0.001 || 
                       Math.abs(oldPlatformFee - correctPlatformFee) > 0.001;
      
      if (needsFix) {
        listing.displayPrice = correctDisplayPrice;
        listing.platformFee = correctPlatformFee;
        await listing.save();
        
        console.log(`FIXED: ${listing.companyName} (${listing.type.toUpperCase()})`);
        console.log(`  Price: ₹${listing.price}`);
        console.log(`  Display: ₹${oldDisplayPrice?.toFixed(2)} → ₹${correctDisplayPrice.toFixed(2)}`);
        console.log(`  Fee: ₹${oldPlatformFee?.toFixed(2)} → ₹${correctPlatformFee.toFixed(2)}`);
        console.log('');
        fixedCount++;
      }
    }
    
    console.log(`\n✅ Fixed ${fixedCount} listings`);
    console.log(`ℹ️  ${listings.length - fixedCount} listings were already correct`);
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixListingPrices();
