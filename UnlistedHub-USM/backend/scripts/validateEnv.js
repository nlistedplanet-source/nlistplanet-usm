#!/usr/bin/env node
/**
 * Environment Validation Script
 * Run before starting server to catch configuration issues early
 * Usage: node scripts/validateEnv.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend folder
dotenv.config({ path: join(__dirname, '..', '.env') });

const validationResults = {
  passed: [],
  failed: [],
  warnings: []
};

// Required environment variables
const requiredVars = {
  MONGODB_URI: {
    validator: (val) => val && val.startsWith('mongodb'),
    message: 'Must be a valid MongoDB connection string starting with mongodb:// or mongodb+srv://'
  },
  JWT_SECRET: {
    validator: (val) => val && val.length >= 32,
    message: 'Must be at least 32 characters long for security'
  },
  FRONTEND_URL: {
    validator: (val) => val && (val.startsWith('http://') || val.startsWith('https://')),
    message: 'Must be a valid URL starting with http:// or https://'
  }
};

// Optional but recommended
const recommendedVars = {
  OPENAI_API_KEY: {
    validator: (val) => val && val.startsWith('sk-'),
    message: 'Required for AI features (news summaries, translations)'
  },
  FIREBASE_SERVICE_ACCOUNT: {
    validator: (val) => {
      if (!val) return false;
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    },
    message: 'Required for push notifications (must be valid JSON)'
  },
  EMAIL_USER: {
    validator: (val) => val && val.includes('@'),
    message: 'Required for email notifications'
  },
  EMAIL_PASSWORD: {
    validator: (val) => val && val.length > 0,
    message: 'Required for email notifications'
  }
};

console.log('🔍 Validating Backend Environment Configuration...\n');

// Check required variables
console.log('📋 Required Variables:');
for (const [key, config] of Object.entries(requiredVars)) {
  const value = process.env[key];
  if (!value) {
    validationResults.failed.push(`❌ ${key}: Missing`);
    console.log(`  ❌ ${key}: Missing`);
  } else if (!config.validator(value)) {
    validationResults.failed.push(`❌ ${key}: Invalid - ${config.message}`);
    console.log(`  ❌ ${key}: Invalid - ${config.message}`);
  } else {
    validationResults.passed.push(`✅ ${key}`);
    console.log(`  ✅ ${key}: Valid`);
  }
}

// Check recommended variables
console.log('\n🔔 Optional/Recommended Variables:');
for (const [key, config] of Object.entries(recommendedVars)) {
  const value = process.env[key];
  if (!value) {
    validationResults.warnings.push(`⚠️  ${key}: Missing - ${config.message}`);
    console.log(`  ⚠️  ${key}: Missing - ${config.message}`);
  } else if (!config.validator(value)) {
    validationResults.warnings.push(`⚠️  ${key}: Invalid - ${config.message}`);
    console.log(`  ⚠️  ${key}: Invalid - ${config.message}`);
  } else {
    validationResults.passed.push(`✅ ${key}`);
    console.log(`  ✅ ${key}: Valid`);
  }
}

// Additional checks
console.log('\n🔐 Security Checks:');

// Check NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
console.log(`  ℹ️  NODE_ENV: ${nodeEnv}`);
if (nodeEnv === 'production') {
  console.log('  ⚠️  Running in PRODUCTION mode - ensure all variables are properly set');
}

// Check CORS origins
if (process.env.CORS_ORIGINS) {
  const origins = process.env.CORS_ORIGINS.split(',').filter(Boolean);
  console.log(`  ✅ CORS_ORIGINS: ${origins.length} origin(s) configured`);
  origins.forEach(origin => console.log(`     - ${origin.trim()}`));
} else {
  console.log('  ℹ️  CORS_ORIGINS: Not set (using defaults)');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION SUMMARY:');
console.log('='.repeat(60));
console.log(`✅ Passed: ${validationResults.passed.length}`);
console.log(`⚠️  Warnings: ${validationResults.warnings.length}`);
console.log(`❌ Failed: ${validationResults.failed.length}`);

if (validationResults.failed.length > 0) {
  console.log('\n❌ VALIDATION FAILED - Fix the following issues:\n');
  validationResults.failed.forEach(msg => console.log(`   ${msg}`));
  console.log('\n💡 Check your .env file in UnlistedHub-USM/backend/');
  process.exit(1);
}

if (validationResults.warnings.length > 0) {
  console.log('\n⚠️  Some optional features may not work:');
  validationResults.warnings.forEach(msg => console.log(`   ${msg}`));
}

console.log('\n✅ Environment validation passed! Safe to start server.\n');
process.exit(0);
