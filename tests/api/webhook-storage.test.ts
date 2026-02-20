import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it, vi } from 'vitest';

const originalStorageMode = process.env.CMS_WEBHOOK_STORAGE;
const originalStorePath = process.env.CMS_WEBHOOK_STORE_PATH;

afterEach(() => {
  if (originalStorageMode === undefined) {
    delete process.env.CMS_WEBHOOK_STORAGE;
  } else {
    process.env.CMS_WEBHOOK_STORAGE = originalStorageMode;
  }

  if (originalStorePath === undefined) {
    delete process.env.CMS_WEBHOOK_STORE_PATH;
  } else {
    process.env.CMS_WEBHOOK_STORE_PATH = originalStorePath;
  }

  vi.resetModules();
});

describe('Webhook storage backends', () => {
  it('persists registrations in file mode across module reloads', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'waves-webhooks-'));
    const storePath = path.join(tempDir, 'registry.json');
    try {
      process.env.CMS_WEBHOOK_STORAGE = 'file';
      process.env.CMS_WEBHOOK_STORE_PATH = storePath;

      vi.resetModules();
      const firstLoad = await import('@/lib/cms/api/webhooks');
      await firstLoad.webhookRegistry.clear();
      const created = await firstLoad.webhookRegistry.register({
        url: 'https://example.com/webhook',
        events: ['people.created'],
        isActive: true,
        description: 'persistence test',
      });

      vi.resetModules();
      const secondLoad = await import('@/lib/cms/api/webhooks');
      const loaded = await secondLoad.webhookRegistry.get(created.id);

      expect(loaded).toBeDefined();
      expect(loaded?.url).toBe('https://example.com/webhook');
      expect(secondLoad.webhookRegistry.storageInfo().mode).toBe('file');
      expect(secondLoad.webhookRegistry.storageInfo().persistent).toBe(true);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('uses memory mode in test environment by default', async () => {
    delete process.env.CMS_WEBHOOK_STORAGE;
    delete process.env.CMS_WEBHOOK_STORE_PATH;

    vi.resetModules();
    const module = await import('@/lib/cms/api/webhooks');

    expect(module.webhookRegistry.storageInfo().mode).toBe('memory');
    expect(module.webhookRegistry.storageInfo().persistent).toBe(false);
  });

  it('reports unavailable postgres storage when database URL is missing', async () => {
    process.env.CMS_WEBHOOK_STORAGE = 'postgres';
    delete process.env.CMS_WEBHOOK_DATABASE_URL;
    delete process.env.DATABASE_URL;

    vi.resetModules();
    const module = await import('@/lib/cms/api/webhooks');
    const health = await module.webhookRegistry.healthInfo();

    expect(health.mode).toBe('postgres');
    expect(health.persistent).toBe(true);
    expect(health.available).toBe(false);
    expect(health.databaseUrlConfigured).toBe(false);
  });
});
