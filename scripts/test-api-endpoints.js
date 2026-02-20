#!/usr/bin/env node

/**
 * Simple API endpoint test script
 * Run with: node scripts/test-api-endpoints.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_KEY = process.env.CMS_API_KEY || 'test-api-key';

async function testEndpoint(method, path, expectedStatus, body = null, headers = {}) {
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
    const contentType = response.headers.get('content-type') || '';
    let data = null;
    let rawBody = '';

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      rawBody = await response.text();
    }

    const statusOk = response.status === expectedStatus;

    console.log(
      `${method} ${path} - Status: ${response.status} (expected ${expectedStatus}) ${statusOk ? '✅' : '❌'}`,
    );

    if (!statusOk) {
      if (data && data.error) {
        console.log(`   Error: ${data.error}`);
      } else if (rawBody) {
        console.log(`   Body (truncated): ${rawBody.slice(0, 120)}`);
      }
    } else {
      console.log('   Status check passed');
    }

    return { success: statusOk, data, status: response.status };
  } catch (error) {
    console.log(`${method} ${path} - ❌ Network Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Testing CMS API Endpoints\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  console.log('Note: server must be running at BASE_URL.\n');

  let failures = 0;
  const countFailure = (result) => {
    if (!result.success) failures += 1;
  };

  console.log('1. Health check');
  countFailure(await testEndpoint('GET', '/api/cms/health', 200));
  console.log('');

  console.log('2. Webhooks list requires auth');
  countFailure(await testEndpoint('GET', '/api/cms/webhooks', 401));
  console.log('');

  console.log('3. Create webhook');
  const createResult = await testEndpoint(
    'POST',
    '/api/cms/webhooks',
    201,
    {
      url: 'https://example.com/hook',
      events: ['people.created'],
      isActive: true,
      description: 'API smoke test',
    },
    { 'x-api-key': API_KEY },
  );
  countFailure(createResult);
  const createdId = createResult.data?.data?.id;
  console.log('');

  console.log('4. List webhooks with auth');
  countFailure(await testEndpoint('GET', '/api/cms/webhooks', 200, null, { 'x-api-key': API_KEY }));
  console.log('');

  if (createdId) {
    console.log('5. Update + delete webhook');
    countFailure(
      await testEndpoint(
        'PUT',
        '/api/cms/webhooks',
        200,
        { id: createdId, isActive: false, description: 'Updated by smoke test' },
        { 'x-api-key': API_KEY },
      ),
    );
    countFailure(
      await testEndpoint(
        'DELETE',
        `/api/cms/webhooks?id=${createdId}`,
        200,
        null,
        { 'x-api-key': API_KEY },
      ),
    );
    console.log('');
  } else {
    failures += 1;
    console.log('5. Update + delete webhook - ❌ skipped because create step failed\n');
  }

  console.log('6. Test-delivery echo');
  countFailure(
    await testEndpoint(
      'POST',
      '/api/cms/webhooks/test-delivery',
      200,
      { ping: 'pong' },
      {
        'x-waves-timestamp': String(Date.now()),
        'x-waves-signature': 'v1=fake',
        'x-waves-event': 'people.created',
        'x-waves-webhook-id': 'wh_test',
      },
    ),
  );
  console.log('');

  if (failures > 0) {
    console.log(`🏁 API endpoint tests completed with ${failures} failure(s).`);
    process.exitCode = 1;
    return;
  }

  console.log('🏁 API endpoint tests completed successfully.');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = { testEndpoint, runTests };
