import { describe, it, expect, vi, beforeEach } from 'vitest';
import { emitEntityEvent } from '@/lib/cms/api/entities-events';
import { webhookRegistry } from '@/lib/cms/api/webhooks';

describe('Entity event triggering', () => {
  beforeEach(() => {
    // Register a test webhook targeting our local echo endpoint
    webhookRegistry.register({
      url: 'http://localhost:3000/api/cms/webhooks/test-delivery',
      events: ['people.created'],
      isActive: true,
      description: 'local test',
    });
  });

  it('builds and triggers entity events', async () => {
    // Mock fetch to avoid real HTTP
    const fetchSpy = vi
      .spyOn(global, 'fetch' as any)
      .mockResolvedValue({ ok: true, status: 200 } as Response);

    const res = await emitEntityEvent('people', 'created', { id: 'p1', name: 'Test' });
    expect(Array.isArray(res)).toBe(true);
    expect(fetchSpy).toHaveBeenCalled();

    fetchSpy.mockRestore();
  });
});
