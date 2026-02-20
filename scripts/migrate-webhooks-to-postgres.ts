#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { Pool, type PoolConfig } from 'pg';

interface StoredWebhook {
  id: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const WEBHOOKS_TABLE = 'cms_webhooks';
const DEFAULT_SOURCE_PATH = path.join(process.cwd(), '.data', 'webhooks-registry.json');

function resolveSourcePath(): string {
  return process.env.CMS_WEBHOOK_SOURCE_FILE || process.env.CMS_WEBHOOK_STORE_PATH || DEFAULT_SOURCE_PATH;
}

function resolveDatabaseUrl(): string {
  const url = process.env.CMS_WEBHOOK_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error('Set CMS_WEBHOOK_DATABASE_URL (or DATABASE_URL) before running this migration');
  }
  return url;
}

function resolvePoolConfig(): PoolConfig {
  const config: PoolConfig = {
    connectionString: resolveDatabaseUrl(),
  };

  const sslEnabled = process.env.CMS_WEBHOOK_DATABASE_SSL?.trim().toLowerCase();
  if (sslEnabled === '1' || sslEnabled === 'true' || sslEnabled === 'yes') {
    config.ssl = { rejectUnauthorized: false };
  }

  return config;
}

function parseWebhook(value: unknown, index: number): StoredWebhook | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Partial<StoredWebhook>;

  if (
    typeof item.id !== 'string' ||
    typeof item.url !== 'string' ||
    typeof item.secret !== 'string' ||
    !Array.isArray(item.events) ||
    typeof item.createdAt !== 'string' ||
    typeof item.updatedAt !== 'string'
  ) {
    throw new Error(`Invalid webhook at index ${index}`);
  }

  const events = item.events.filter((event): event is string => typeof event === 'string');
  if (events.length === 0) {
    throw new Error(`Webhook at index ${index} has no valid events`);
  }

  return {
    id: item.id,
    url: item.url,
    secret: item.secret,
    events,
    isActive: item.isActive !== false,
    description: typeof item.description === 'string' ? item.description : undefined,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

async function ensureTable(pool: Pool): Promise<void> {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS ${WEBHOOKS_TABLE} (
       id TEXT PRIMARY KEY,
       url TEXT NOT NULL,
       secret TEXT NOT NULL,
       events JSONB NOT NULL,
       is_active BOOLEAN NOT NULL DEFAULT TRUE,
       description TEXT,
       created_at TIMESTAMPTZ NOT NULL,
       updated_at TIMESTAMPTZ NOT NULL
     )`,
  );
}

async function upsertWebhook(pool: Pool, webhook: StoredWebhook): Promise<void> {
  await pool.query(
    `INSERT INTO ${WEBHOOKS_TABLE}
       (id, url, secret, events, is_active, description, created_at, updated_at)
     VALUES
       ($1, $2, $3, $4::jsonb, $5, $6, $7::timestamptz, $8::timestamptz)
     ON CONFLICT (id) DO UPDATE
     SET
       url = EXCLUDED.url,
       secret = EXCLUDED.secret,
       events = EXCLUDED.events,
       is_active = EXCLUDED.is_active,
       description = EXCLUDED.description,
       updated_at = EXCLUDED.updated_at`,
    [
      webhook.id,
      webhook.url,
      webhook.secret,
      JSON.stringify(webhook.events),
      webhook.isActive,
      webhook.description ?? null,
      webhook.createdAt,
      webhook.updatedAt,
    ],
  );
}

async function main(): Promise<void> {
  const sourcePath = resolveSourcePath();
  const dryRun = process.argv.includes('--dry-run');

  if (!fs.existsSync(sourcePath)) {
    console.log(`No webhook source file found at ${sourcePath}. Nothing to migrate.`);
    return;
  }

  const raw = fs.readFileSync(sourcePath, 'utf8').trim();
  if (!raw) {
    console.log(`Webhook source file is empty at ${sourcePath}. Nothing to migrate.`);
    return;
  }

  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected array JSON in ${sourcePath}`);
  }

  const webhooks = parsed
    .map((value, index) => parseWebhook(value, index))
    .filter((value): value is StoredWebhook => value !== null);

  console.log(`Loaded ${webhooks.length} webhook(s) from ${sourcePath}`);
  if (webhooks.length === 0) {
    console.log('Nothing to migrate.');
    return;
  }

  if (dryRun) {
    console.log('Dry run enabled; no database writes performed.');
    return;
  }

  const pool = new Pool(resolvePoolConfig());
  try {
    await ensureTable(pool);
    await pool.query('BEGIN');
    for (const webhook of webhooks) {
      await upsertWebhook(pool, webhook);
    }
    await pool.query('COMMIT');
    console.log(`Migrated ${webhooks.length} webhook(s) into Postgres table "${WEBHOOKS_TABLE}".`);
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(
    `Webhook migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
  );
  process.exit(1);
});
