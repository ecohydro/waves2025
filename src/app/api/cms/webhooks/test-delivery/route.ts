import { NextRequest, NextResponse } from 'next/server';

// This endpoint is a helper to validate signatures and echo payloads back.
export async function POST(request: NextRequest) {
  const timestamp = request.headers.get('x-waves-timestamp');
  const signature = request.headers.get('x-waves-signature');
  const event = request.headers.get('x-waves-event');
  const webhookId = request.headers.get('x-waves-webhook-id');

  const rawBody = await request.text();
  let parsedBody: unknown = null;

  if (rawBody) {
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
  }

  return new NextResponse(
    JSON.stringify({
      received: true,
      headers: {
        timestamp,
        signature,
        event,
        webhookId,
      },
      body: parsedBody,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    },
  );
}
