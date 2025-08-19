import { NextRequest, NextResponse } from 'next/server';

// This endpoint is a helper to validate signatures and echo payloads back.
export async function POST(request: NextRequest) {
  const timestamp = request.headers.get('x-waves-timestamp');
  const signature = request.headers.get('x-waves-signature');
  const event = request.headers.get('x-waves-event');
  const webhookId = request.headers.get('x-waves-webhook-id');

  const body = await request.text();

  return new NextResponse(
    JSON.stringify({
      received: true,
      headers: {
        timestamp,
        signature,
        event,
        webhookId,
      },
      body: body ? JSON.parse(body) : null,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    },
  );
}
