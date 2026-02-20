import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Import route handlers
import { GET, POST, PUT, DELETE } from '@/app/api/cms/webhooks/route';
import { webhookRegistry, computeSignature } from '@/lib/cms/api/webhooks';

describe('Webhooks API', () => {
  const ADMIN_KEY = 'admin-key';

  beforeEach(async () => {
    await webhookRegistry.clear();
    process.env.CMS_API_KEY = ADMIN_KEY as any;
  });

  it('registers, lists, updates, and deletes webhooks', async () => {
    const createReq = new NextRequest('http://localhost:3000/api/cms/webhooks', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ADMIN_KEY,
      },
      body: JSON.stringify({ url: 'http://example.com/hook', events: ['people.created'] }),
    });
    const createRes = await POST(createReq);
    expect(createRes.status).toBe(201);
    const created = await createRes.json();
    expect(created.data.id).toMatch(/^wh_/);
    expect(created.data.hasSecret).toBe(true);

    const listReq = new NextRequest('http://localhost:3000/api/cms/webhooks', {
      method: 'GET',
      headers: { 'x-api-key': ADMIN_KEY },
    });
    const listRes = await GET(listReq);
    expect(listRes.status).toBe(200);
    const listData = await listRes.json();
    expect(listData.data.length).toBeGreaterThan(0);

    const id = created.data.id;
    const updateReq = new NextRequest('http://localhost:3000/api/cms/webhooks', {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ADMIN_KEY,
      },
      body: JSON.stringify({ id, description: 'Test hook', isActive: false }),
    });
    const updateRes = await PUT(updateReq);
    expect(updateRes.status).toBe(200);
    const updated = await updateRes.json();
    expect(updated.data.description).toBe('Test hook');
    expect(updated.data.isActive).toBe(false);

    const deleteReq = new NextRequest(`http://localhost:3000/api/cms/webhooks?id=${id}`, {
      method: 'DELETE',
      headers: { 'x-api-key': ADMIN_KEY },
    });
    const deleteRes = await DELETE(deleteReq);
    expect(deleteRes.status).toBe(200);
  });

  it('rejects unauthorized access', async () => {
    const res = await GET(new NextRequest('http://localhost:3000/api/cms/webhooks'));
    expect(res.status).toBe(401);
  });
});

describe('Webhook signing', () => {
  it('computes a stable signature', () => {
    const secret = 'topsecret';
    const payload = JSON.stringify({ hello: 'world' });
    const ts = 1734567890000;
    const sig1 = computeSignature(secret, payload, ts);
    const sig2 = computeSignature(secret, payload, ts);
    expect(sig1).toBe(sig2);
    expect(sig1.startsWith('v1=')).toBe(true);
  });
});
