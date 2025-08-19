import { triggerWebhooks, WebhookEventType } from '@/lib/cms/api/webhooks';

export type EntityKind = 'people' | 'publications' | 'news';

export function buildEventType(
  kind: EntityKind,
  action: 'created' | 'updated' | 'deleted',
): WebhookEventType {
  return `${kind}.${action}` as WebhookEventType;
}

export async function emitEntityEvent(
  kind: EntityKind,
  action: 'created' | 'updated' | 'deleted',
  data: unknown,
) {
  const eventType = buildEventType(kind, action);
  return triggerWebhooks(eventType, data);
}
