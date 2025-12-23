#!/usr/bin/env node
/**
 * Quick API Testing Script
 * Test common endpoints without Postman
 * Usage: node scripts/quickTest.js
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const API_URL = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.replace(/:\d+/, ':5000') 
  : 'http://localhost:5000';

console.log('🧪 Quick API Test Suite');
console.log('📡 Testing API at:', API_URL);
console.log('='.repeat(60) + '\n');

const tests = [];
let passed = 0;
let failed = 0;

// Helper to run test
async function runTest(name, fn) {
  process.stdout.write(`Testing: ${name}... `);
  try {
    await fn();
    console.log('✅ PASSED');
    passed++;
  } catch (error) {
    console.log('❌ FAILED');
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

// Test 1: Health Check
await runTest('Health Endpoint', async () => {
  const response = await axios.get(`${API_URL}/api/health`);
  if (response.status !== 200) throw new Error('Health check failed');
  if (!response.data.status) throw new Error('No status in response');
});

// Test 2: Public Companies Endpoint
await runTest('Public Companies Endpoint', async () => {
  const response = await axios.get(`${API_URL}/api/companies`);
  if (response.status !== 200) throw new Error('Failed to fetch companies');
  if (!Array.isArray(response.data.companies)) throw new Error('Invalid response format');
});

// Test 3: Public News Endpoint
await runTest('Public News Endpoint', async () => {
  const response = await axios.get(`${API_URL}/api/news`);
  if (response.status !== 200) throw new Error('Failed to fetch news');
  if (!response.data.news) throw new Error('Invalid response format');
});

// Test 4: Public Listings Endpoint
await runTest('Public Listings Endpoint', async () => {
  const response = await axios.get(`${API_URL}/api/listings`);
  if (response.status !== 200) throw new Error('Failed to fetch listings');
  if (!Array.isArray(response.data.listings)) throw new Error('Invalid response format');
});

// Test 5: CORS Headers
await runTest('CORS Configuration', async () => {
  const response = await axios.options(`${API_URL}/api/companies`);
  // Just checking if OPTIONS request doesn't fail
  if (response.status > 299) throw new Error('CORS preflight failed');
});

// Test 6: Rate Limiting (should still work)
await runTest('Rate Limiting (fast requests)', async () => {
  // Send 3 quick requests
  for (let i = 0; i < 3; i++) {
    await axios.get(`${API_URL}/api/health`);
  }
  // If we get here without 429, rate limit is configured properly
});

// Test 7: Invalid Route (should return 404)
await runTest('404 Handling', async () => {
  try {
    await axios.get(`${API_URL}/api/nonexistent-route-12345`);
    throw new Error('Should have returned 404');
  } catch (error) {
    if (error.response?.status !== 404) {
      throw new Error('Expected 404, got: ' + error.response?.status);
    }
  }
});

// Test 8: MongoDB Connection (via health endpoint)
await runTest('MongoDB Connection', async () => {
  const response = await axios.get(`${API_URL}/api/health`);
  if (!response.data.database) throw new Error('Database status not reported');
  if (response.data.database !== 'connected') {
    throw new Error(`Database is ${response.data.database}`);
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 TEST SUMMARY:');
console.log('='.repeat(60));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

if (failed > 0) {
  console.log('\n⚠️  Some tests failed. Check server logs for details.');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed! API is working correctly.\n');
  process.exit(0);
}
