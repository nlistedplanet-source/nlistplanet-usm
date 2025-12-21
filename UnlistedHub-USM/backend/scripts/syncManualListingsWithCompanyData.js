/**
 * Sync Manual Listings with Company Database
 * Updates marketplace listings with latest company details from database
 * Useful when admin updates company info in Companies Management
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Listing from '../models/Listing.js';
import Company from '../models/Company.js';

dotenv.config();

async function syncListingsWithCompanyData() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Find all listings with manual companies
    const listingsWithManualEntries = await Listing.find({ 
      manualCompanyName: { $exists: true, $ne: null }
    }).select('_id postId manualCompanyName companyId');

    console.log(`📊 Found ${listingsWithManualEntries.length} listings with manual entries\n`);

    let updated = 0;
    let errors = 0;

    for (const listing of listingsWithManualEntries) {
      try {
        // Find company by name (case-insensitive)
        const escapedName = listing.manualCompanyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const company = await Company.findOne({
          name: { $regex: new RegExp(`^${escapedName}$`, 'i') }
        }).lean();

        if (company) {
          // Update listing with company details
          await Listing.updateOne(
            { _id: listing._id },
            {
              $set: {
                companyId: company._id,
                'companyDetails.name': company.name,
                'companyDetails.logo': company.logo,
                'companyDetails.sector': company.sector,
                'companyDetails.marketSegment': company.marketSegment,
                'companyDetails.isin': company.isin,
                'companyDetails.pan': company.pan,
                'companyDetails.cin': company.cin,
                'companyDetails.highlights': company.highlights,
                'companyDetails.description': company.description,
                'companyDetails.verificationStatus': company.verificationStatus,
                updatedAt: new Date()
              }
            }
          );

          console.log(`✅ Updated: ${listing.postId} (${listing.manualCompanyName})`);
          updated++;
        } else {
          console.log(`⚠️  Company not found: ${listing.manualCompanyName} (${listing.postId})`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${listing.postId}:`, error.message);
        errors++;
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`✅ Successfully updated: ${updated}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`⏭️  Total: ${listingsWithManualEntries.length}`);

  } catch (error) {
    console.error('💥 Fatal error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the sync
syncListingsWithCompanyData();
