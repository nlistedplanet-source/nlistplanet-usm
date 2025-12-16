import mongoose from 'mongoose';
import Company from '../models/Company.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

async function migrateOldCompanies() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // Find companies that might be user-added (no logo, not from admin)
    // These are likely manual entries created before the verification system
    const companiesWithoutLogo = await Company.find({
      $or: [
        { logo: null },
        { logo: { $exists: false } },
        { logo: '' }
      ],
      // Only if addedBy is not explicitly set or is 'admin' (old default)
      $or: [
        { addedBy: { $exists: false } },
        { addedBy: 'admin' }
      ]
    });

    console.log(`📊 Found ${companiesWithoutLogo.length} companies without logos`);
    
    if (companiesWithoutLogo.length > 0) {
      console.log('\nCompanies without logos:');
      companiesWithoutLogo.forEach(c => {
        console.log(`  - ${c.name} (sector: ${c.sector || 'N/A'})`);
      });

      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('\n❓ Mark these as pending user entries? (yes/no): ', async (answer) => {
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
          const result = await Company.updateMany(
            {
              $or: [
                { logo: null },
                { logo: { $exists: false } },
                { logo: '' }
              ],
              $or: [
                { addedBy: { $exists: false } },
                { addedBy: 'admin' }
              ]
            },
            {
              $set: {
                verificationStatus: 'pending',
                addedBy: 'user',
                addedByUser: null
              }
            }
          );

          console.log(`\n✅ Updated ${result.modifiedCount} companies to pending status`);
        } else {
          console.log('\n❌ Migration cancelled');
        }

        rl.close();
        await mongoose.connection.close();
        process.exit(0);
      });
    } else {
      console.log('\n✅ No companies found to migrate');
      await mongoose.connection.close();
      process.exit(0);
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

migrateOldCompanies();
