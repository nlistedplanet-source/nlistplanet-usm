/**
 * Test Auto-Generation of Highlights for New Company
 * Usage: node test-auto-highlights.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Company from './models/Company.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB Connected\n');
  } catch (error) {
    console.error('✗ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const testAutoGeneration = async () => {
  try {
    console.log('🧪 Testing Auto-Generation of Highlights\n');
    console.log('Creating a test company...\n');

    // Create a new test company
    const testCompany = new Company({
      name: 'Test EdTech Solutions Private Limited',
      scriptName: 'Test EdTech',
      sector: 'EdTech',
      description: 'Leading online education platform in India'
    });

    await testCompany.save();
    console.log('✓ Company created:', testCompany.name);
    console.log('✓ Company ID:', testCompany._id);

    // Wait a bit for the post-save hook to complete
    console.log('\n⏳ Waiting for AI generation (5 seconds)...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Fetch the company again to see if highlights were added
    const updatedCompany = await Company.findById(testCompany._id);
    
    console.log('📊 Updated Company Data:');
    console.log('Name:', updatedCompany.name);
    console.log('Script Name:', updatedCompany.scriptName);
    console.log('Sector:', updatedCompany.sector);
    console.log('\n✨ Highlights:');
    if (updatedCompany.highlights && updatedCompany.highlights.length > 0) {
      updatedCompany.highlights.forEach((h, i) => {
        console.log(`  ${i + 1}. ${h}`);
      });
      console.log('\n📝 Description:');
      console.log(`  ${updatedCompany.description}`);
      console.log('\n✅ Auto-generation SUCCESSFUL!');
    } else {
      console.log('  (No highlights generated yet)');
      console.log('\n⚠️ Auto-generation may have failed or is still processing');
    }

    // Clean up - delete test company
    console.log('\n🧹 Cleaning up test company...');
    await Company.findByIdAndDelete(testCompany._id);
    console.log('✓ Test company deleted\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
};

const run = async () => {
  try {
    await connectDB();
    await testAutoGeneration();
    console.log('✅ Test completed!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

run();
