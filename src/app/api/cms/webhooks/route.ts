import { NextRequest, NextResponse } from 'next/server';
import { webhookRegistry, RegisteredWebhook } from '@/lib/cms/api/webhooks';

function requireAdminApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  const expected = process.env.CMS_API_KEY;
  return Boolean(apiKey && expected && apiKey === expected);
}

export async function GET(request: NextRequest) {
  if (!requireAdminApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (id) {
    const wh = webhookRegistry.get(id);
    if (!wh) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: sanitize(wh) }, { status: 200 });
  }

  const items = webhookRegistry.list().map(sanitize);
  return NextResponse.json({ data: items }, { status: 200 });
}

export async function POST(request: NextRequest) {
  if (!requireAdminApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { url, events, isActive, description } = body || {};
    if (!url || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: 'url and events[] are required' }, { status: 400 });
    }
    const created = webhookRegistry.register({ url, events, isActive, description });
    return NextResponse.json(
      { message: 'Webhook registered', data: sanitize(created) },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  if (!requireAdminApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !body.id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const updated = webhookRegistry.update(body.id, body);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(
    { message: 'Webhook updated', data: sanitize(updated) },
    { status: 200 },
  );
}

export async function DELETE(request: NextRequest) {
  if (!requireAdminApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  const ok = webhookRegistry.delete(id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ message: 'Webhook deleted' }, { status: 200 });
}

function sanitize(wh: RegisteredWebhook) {
  const { secret, ...rest } = wh;
  return { ...rest, hasSecret: Boolean(secret) };
}
