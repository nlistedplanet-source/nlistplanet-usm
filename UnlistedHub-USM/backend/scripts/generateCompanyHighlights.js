/**
 * Generate Company Highlights Script
 * Usage: node scripts/generateCompanyHighlights.js
 * 
 * Generates AI-powered investment highlights and descriptions for companies
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Company from '../models/Company.js';
import { generateCompanyHighlights, batchGenerateHighlights } from '../utils/companyAI.js';

dotenv.config();

// Colors for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`${colors.green}✓ MongoDB Connected${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ MongoDB Connection Error:${colors.reset}`, error.message);
    process.exit(1);
  }
};

const generateHighlights = async () => {
  try {
    console.log(`\n${colors.blue}=== Company Highlights Generator ===${colors.reset}\n`);

    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error(`${colors.red}✗ OPENAI_API_KEY not found in environment variables${colors.reset}`);
      console.log(`${colors.yellow}Please add OPENAI_API_KEY to your .env file${colors.reset}`);
      process.exit(1);
    }

    // Find companies without highlights
    const companiesWithoutHighlights = await Company.find({
      $or: [
        { highlights: { $exists: false } },
        { highlights: { $size: 0 } }
      ]
    })
    .sort({ totalListings: -1 }) // Prioritize companies with more listings
    .limit(20); // Process 20 at a time to avoid rate limits

    if (companiesWithoutHighlights.length === 0) {
      console.log(`${colors.green}✓ All companies already have highlights!${colors.reset}`);
      return;
    }

    console.log(`${colors.blue}Found ${companiesWithoutHighlights.length} companies without highlights${colors.reset}\n`);
    
    // Show company list
    console.log(`${colors.yellow}Processing companies:${colors.reset}`);
    companiesWithoutHighlights.forEach((company, index) => {
      console.log(`  ${index + 1}. ${company.scriptName || company.name} (${company.sector})`);
    });
    console.log('');

    // Generate highlights with delay to avoid rate limiting
    console.log(`${colors.blue}Generating highlights with OpenAI...${colors.reset}\n`);
    const results = await batchGenerateHighlights(companiesWithoutHighlights, 3000); // 3 second delay

    // Update database
    let successCount = 0;
    let failCount = 0;

    for (const result of results) {
      if (result.success) {
        try {
          await Company.findByIdAndUpdate(result.companyId, {
            highlights: result.highlights,
            description: result.description
          });
          console.log(`${colors.green}✓ ${result.name}${colors.reset}`);
          console.log(`  Highlights: ${result.highlights.length} points`);
          console.log(`  Description: ${result.description.substring(0, 60)}...`);
          console.log('');
          successCount++;
        } catch (error) {
          console.error(`${colors.red}✗ Failed to update ${result.name}: ${error.message}${colors.reset}`);
          failCount++;
        }
      } else {
        console.error(`${colors.red}✗ ${result.name}: ${result.error}${colors.reset}`);
        failCount++;
      }
    }

    // Summary
    console.log(`\n${colors.blue}=== Summary ===${colors.reset}`);
    console.log(`${colors.green}✓ Success: ${successCount}${colors.reset}`);
    if (failCount > 0) {
      console.log(`${colors.red}✗ Failed: ${failCount}${colors.reset}`);
    }
    console.log(`Total Processed: ${results.length}\n`);

  } catch (error) {
    console.error(`${colors.red}✗ Error:${colors.reset}`, error.message);
    throw error;
  }
};

// Run script
const run = async () => {
  try {
    await connectDB();
    await generateHighlights();
    console.log(`${colors.green}✓ Script completed successfully!${colors.reset}\n`);
    process.exit(0);
  } catch (error) {
    console.error(`${colors.red}✗ Script failed:${colors.reset}`, error.message);
    process.exit(1);
  }
};

run();
