import { createHmac, randomBytes } from 'crypto';

export type WebhookEventType =
  | 'people.created'
  | 'people.updated'
  | 'people.deleted'
  | 'publications.created'
  | 'publications.updated'
  | 'publications.deleted'
  | 'news.created'
  | 'news.updated'
  | 'news.deleted';

export interface RegisteredWebhook {
  id: string;
  url: string;
  secret: string;
  events: WebhookEventType[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export interface WebhookPayload<T = unknown> {
  id: string;
  type: WebhookEventType;
  timestamp: string;
  data: T;
  source: 'waves2025';
}

export interface DeliveryAttemptResult {
  success: boolean;
  status?: number;
  error?: string;
  attempts: number;
  lastAttemptAt: string;
}

class WebhookRegistry {
  private webhooksById = new Map<string, RegisteredWebhook>();

  register(
    webhook: Omit<RegisteredWebhook, 'id' | 'createdAt' | 'updatedAt' | 'secret'> & {
      secret?: string;
    },
  ): RegisteredWebhook {
    const id = `wh_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const now = new Date().toISOString();
    const secret = webhook.secret || randomBytes(16).toString('hex');
    const record: RegisteredWebhook = {
      id,
      url: webhook.url,
      secret,
      events: webhook.events,
      isActive: webhook.isActive ?? true,
      createdAt: now,
      updatedAt: now,
      description: webhook.description,
    };
    this.webhooksById.set(id, record);
    return record;
  }

  list(): RegisteredWebhook[] {
    return Array.from(this.webhooksById.values());
  }

  get(id: string): RegisteredWebhook | undefined {
    return this.webhooksById.get(id);
  }

  update(
    id: string,
    updates: Partial<Omit<RegisteredWebhook, 'id' | 'createdAt'>>,
  ): RegisteredWebhook | undefined {
    const existing = this.webhooksById.get(id);
    if (!existing) return undefined;
    const updated: RegisteredWebhook = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.webhooksById.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.webhooksById.delete(id);
  }
}

export const webhookRegistry = new WebhookRegistry();

export function computeSignature(
  secret: string,
  payloadString: string,
  timestampMs: number,
): string {
  const baseString = `${timestampMs}.${payloadString}`;
  const hmac = createHmac('sha256', secret).update(baseString).digest('hex');
  return `v1=${hmac}`;
}

export function verifySignature(
  secret: string,
  payloadString: string,
  timestampMs: number,
  providedSignature: string,
  toleranceMs: number = 5 * 60 * 1000,
): boolean {
  const now = Date.now();
  if (Math.abs(now - timestampMs) > toleranceMs) return false;
  const expected = computeSignature(secret, payloadString, timestampMs);
  const a = Buffer.from(expected);
  const b = Buffer.from(providedSignature || '');
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

export async function deliverWebhook(
  webhook: RegisteredWebhook,
  payload: WebhookPayload,
  maxAttempts: number = 3,
  initialBackoffMs: number = 1000,
): Promise<DeliveryAttemptResult> {
  const body = JSON.stringify(payload);
  let attempts = 0;
  let lastError: string | undefined;
  let lastStatus: number | undefined;

  while (attempts < maxAttempts) {
    attempts += 1;
    const timestampMs = Date.now();
    const signature = computeSignature(webhook.secret, body, timestampMs);
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Waves-Timestamp': String(timestampMs),
          'X-Waves-Signature': signature,
          'X-Waves-Event': payload.type,
          'X-Waves-Webhook-Id': webhook.id,
          'User-Agent': 'waves2025-webhooks/1.0',
        },
        body,
      });
      lastStatus = response.status;
      if (response.ok) {
        return {
          success: true,
          status: response.status,
          attempts,
          lastAttemptAt: new Date().toISOString(),
        };
      }
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error';
    }

    const backoff = initialBackoffMs * Math.pow(2, attempts - 1);
    await new Promise((resolve) => setTimeout(resolve, backoff));
  }

  return {
    success: false,
    status: lastStatus,
    error: lastError || 'Delivery failed',
    attempts,
    lastAttemptAt: new Date().toISOString(),
  };
}

export async function triggerWebhooks<T = unknown>(
  eventType: WebhookEventType,
  data: T,
): Promise<Array<{ webhookId: string; result: DeliveryAttemptResult }>> {
  const payload: WebhookPayload<T> = {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    type: eventType,
    timestamp: new Date().toISOString(),
    data,
    source: 'waves2025',
  };

  const targets = webhookRegistry
    .list()
    .filter(
      (w) =>
        w.isActive && (w.events.includes(eventType) || w.events.includes('*' as WebhookEventType)),
    );

  const results = await Promise.all(
    targets.map(async (webhook) => ({
      webhookId: webhook.id,
      result: await deliverWebhook(webhook, payload),
    })),
  );

  return results;
}
