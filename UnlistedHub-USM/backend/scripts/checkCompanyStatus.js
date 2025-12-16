import mongoose from 'mongoose';
import Company from '../models/Company.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

async function checkCompanies() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // Find companies without verificationStatus
    const companiesWithoutStatus = await Company.find({
      verificationStatus: { $exists: false }
    });
    console.log(`📊 Companies without verificationStatus: ${companiesWithoutStatus.length}`);
    if (companiesWithoutStatus.length > 0) {
      console.log('Companies without verificationStatus (first 5):');
      companiesWithoutStatus.slice(0, 5).forEach(c => {
        console.log(`  - ${c.name} (addedBy: ${c.addedBy || 'NOT SET'})`);
      });
    }

    // Find pending companies
    const pendingCompanies = await Company.find({
      verificationStatus: 'pending'
    });
    console.log(`\n⏳ Pending companies: ${pendingCompanies.length}`);
    if (pendingCompanies.length > 0) {
      console.log('Pending companies:');
      pendingCompanies.forEach(c => {
        console.log(`  - ${c.name} (addedBy: ${c.addedBy}, addedByUser: ${c.addedByUser})`);
      });
    }

    // Find user-added companies
    const userAdded = await Company.find({
      addedBy: 'user'
    });
    console.log(`\n👤 User-added companies: ${userAdded.length}`);
    if (userAdded.length > 0) {
      console.log('User-added companies:');
      userAdded.forEach(c => {
        console.log(`  - ${c.name} (status: ${c.verificationStatus})`);
      });
    }

    // Total companies
    const totalCompanies = await Company.countDocuments();
    console.log(`\n📈 Total companies: ${totalCompanies}`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCompanies();
