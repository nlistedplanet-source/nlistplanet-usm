/**
 * Test Company AI Service
 * Usage: node test-company-ai.js
 */

import dotenv from 'dotenv';
import { generateCompanyHighlights } from './utils/companyAI.js';

dotenv.config();

const testCompanies = [
  {
    name: 'Oravel Stays Limited',
    scriptName: 'OYO Rooms',
    sector: 'Hospitality & Travel',
    description: null
  },
  {
    name: 'Zomato Limited',
    scriptName: 'Zomato',
    sector: 'Food Delivery & Technology',
    description: null
  },
  {
    name: 'Byju\'s Think & Learn',
    scriptName: 'Byju\'s',
    sector: 'EdTech',
    description: null
  }
];

const runTests = async () => {
  console.log('\n🧪 Testing Company AI Service\n');
  console.log('='.repeat(50));

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in .env file');
    process.exit(1);
  }

  for (const company of testCompanies) {
    console.log(`\n\n📊 Testing: ${company.scriptName || company.name}`);
    console.log('-'.repeat(50));

    try {
      const result = await generateCompanyHighlights(company);

      console.log('\n✅ Generated Highlights:');
      result.highlights.forEach((highlight, index) => {
        console.log(`   ${index + 1}. ${highlight}`);
      });

      console.log('\n📝 Description:');
      console.log(`   ${result.description}`);

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }

    // Delay between requests
    if (testCompanies.indexOf(company) < testCompanies.length - 1) {
      console.log('\n⏳ Waiting 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log('\n\n' + '='.repeat(50));
  console.log('✅ Tests completed!\n');
};

runTests().catch(console.error);
