/**
 * Fix ISIN Unique Index - Make it Sparse
 * Drop existing unique index on ISIN and recreate as sparse unique index
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixISINIndex() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('companies');

    // Check existing indexes
    console.log('📋 Current indexes on companies collection:');
    const existingIndexes = await collection.indexes();
    existingIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key), index.unique ? '(unique)' : '', index.sparse ? '(sparse)' : '');
    });

    // Drop existing ISIN index if it exists
    try {
      console.log('\n🗑️  Dropping existing isin_1 index...');
      await collection.dropIndex('isin_1');
      console.log('✅ Dropped isin_1 index');
    } catch (error) {
      if (error.code === 27) { // Index not found
        console.log('⚠️  Index isin_1 does not exist, skipping drop');
      } else {
        throw error;
      }
    }

    // Create new sparse unique index
    console.log('\n📝 Creating new sparse unique index on ISIN...');
    await collection.createIndex(
      { isin: 1 },
      { 
        unique: true,
        sparse: true, // Only enforce unique on non-null values
        name: 'isin_1'
      }
    );
    console.log('✅ Created sparse unique index on ISIN');

    // Verify new indexes
    console.log('\n📋 Updated indexes on companies collection:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key), index.unique ? '(unique)' : '', index.sparse ? '(sparse)' : '');
    });

    console.log('\n✨ Index fix completed successfully!');

  } catch (error) {
    console.error('\n❌ Error fixing index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit();
  }
}

fixISINIndex();
