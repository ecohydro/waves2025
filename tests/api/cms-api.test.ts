import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as healthGET } from '@/app/api/cms/health/route';
import { POST as testDeliveryPOST } from '@/app/api/cms/webhooks/test-delivery/route';

const mockClientFetch = vi.hoisted(() => vi.fn());

vi.mock('@/lib/cms/client', () => ({
  client: {
    fetch: mockClientFetch,
  },
}));

describe('CMS API routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project';
    process.env.NEXT_PUBLIC_SANITY_DATASET = 'test-dataset';
    process.env.CMS_API_KEY = 'test-cms-api-key';
    process.env.SANITY_API_TOKEN = 'test-token';
  });

  it('returns healthy status when Sanity is reachable', async () => {
    mockClientFetch.mockResolvedValue(69);
    const request = new NextRequest('http://localhost:3000/api/cms/health', { method: 'GET' });
    const response = await healthGET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('healthy');
    expect(json.sanity.connected).toBe(true);
    expect(json.sanity.personCount).toBe(69);
    expect(json.webhooks.storageMode).toBeDefined();
    expect(typeof json.webhooks.persistent).toBe('boolean');
    expect(typeof json.webhooks.available).toBe('boolean');
  });

  it('returns unhealthy status when Sanity check fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockClientFetch.mockRejectedValue(new Error('Connection failed'));
    const request = new NextRequest('http://localhost:3000/api/cms/health', { method: 'GET' });
    const response = await healthGET(request);
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json.status).toBe('unhealthy');
    expect(json.sanity.connected).toBe(false);
    expect(json.webhooks.storageMode).toBeDefined();
    expect(typeof json.webhooks.persistent).toBe('boolean');
    expect(typeof json.webhooks.available).toBe('boolean');
    errorSpy.mockRestore();
  });

  it('echoes webhook test payload and signature headers', async () => {
    const payload = { hello: 'world' };
    const request = new NextRequest('http://localhost:3000/api/cms/webhooks/test-delivery', {
      method: 'POST',
      headers: {
        'x-waves-timestamp': '1734567890000',
        'x-waves-signature': 'v1=abc',
        'x-waves-event': 'people.created',
        'x-waves-webhook-id': 'wh_123',
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const response = await testDeliveryPOST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.received).toBe(true);
    expect(json.headers.timestamp).toBe('1734567890000');
    expect(json.headers.signature).toBe('v1=abc');
    expect(json.headers.event).toBe('people.created');
    expect(json.headers.webhookId).toBe('wh_123');
    expect(json.body).toEqual(payload);
  });

  it('returns 400 for invalid webhook test payload JSON', async () => {
    const request = new NextRequest('http://localhost:3000/api/cms/webhooks/test-delivery', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: '{"invalid": true',
    });

    const response = await testDeliveryPOST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid JSON body');
  });
});
