#!/usr/bin/env node

/**
 * Simple API endpoint test script
 * Run with: node scripts/test-api-endpoints.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_KEY = process.env.CMS_API_KEY || 'test-api-key';

async function testEndpoint(method, path, body = null, headers = {}) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    console.log(`${method} ${path} - Status: ${response.status}`);

    if (response.ok) {
      console.log('✅ Success');
      if (data.data) {
        console.log(`   Data: ${Array.isArray(data.data) ? data.data.length : 1} items`);
      }
      if (data.pagination) {
        console.log(`   Total: ${data.pagination.total}`);
      }
    } else {
      console.log('❌ Error:', data.error);
      if (data.details) {
        console.log('   Details:', data.details);
      }
    }

    return { success: response.ok, data };
  } catch (error) {
    console.log(`${method} ${path} - ❌ Network Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Testing CMS API Endpoints\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  // Test health endpoint
  console.log('1. Testing Health Check');
  await testEndpoint('GET', '/api/cms/health');
  console.log('');

  // Test people endpoints
  console.log('2. Testing People Endpoints');
  await testEndpoint('GET', '/api/cms/people');
  await testEndpoint('GET', '/api/cms/people?userGroup=current&limit=5');
  console.log('');

  // Test publications endpoints
  console.log('3. Testing Publications Endpoints');
  await testEndpoint('GET', '/api/cms/publications');
  await testEndpoint('GET', '/api/cms/publications?publicationType=journal-article&limit=5');
  console.log('');

  // Test news endpoints
  console.log('4. Testing News Endpoints');
  await testEndpoint('GET', '/api/cms/news');
  await testEndpoint('GET', '/api/cms/news?category=lab-news&limit=5');
  console.log('');

  // Test authentication (should fail without API key)
  console.log('5. Testing Authentication');
  await testEndpoint('POST', '/api/cms/people', {
    name: 'Test Person',
    slug: { current: 'test-person' },
    userGroup: 'current',
    isActive: true,
  });
  console.log('');

  // Test with API key (should work if server is running)
  console.log('6. Testing with API Key');
  await testEndpoint(
    'POST',
    '/api/cms/people',
    {
      name: 'Test Person',
      slug: { current: 'test-person' },
      userGroup: 'current',
      isActive: true,
    },
    { 'x-api-key': API_KEY },
  );
  console.log('');

  console.log('🏁 API endpoint tests completed!');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testEndpoint, runTests };
