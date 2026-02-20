import { createHmac, randomBytes } from 'crypto';
import fs from 'fs';
import path from 'path';
import { Pool, type PoolConfig } from 'pg';

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

export type WebhookStorageMode = 'memory' | 'file' | 'postgres';

export interface WebhookStorageInfo {
  mode: WebhookStorageMode;
  persistent: boolean;
  path?: string;
  databaseUrlConfigured?: boolean;
}

export interface WebhookStorageHealth extends WebhookStorageInfo {
  available: boolean;
  recordCount?: number;
  error?: string;
}

const DEFAULT_WEBHOOK_STORE_PATH = path.join(process.cwd(), '.data', 'webhooks-registry.json');
const WEBHOOKS_TABLE = 'cms_webhooks';

function resolveStorageMode(): WebhookStorageMode {
  const configuredMode = process.env.CMS_WEBHOOK_STORAGE?.trim().toLowerCase();
  if (configuredMode === 'memory' || configuredMode === 'file' || configuredMode === 'postgres') {
    return configuredMode;
  }

  // Keep tests isolated and deterministic while defaulting runtime to durable storage.
  return process.env.NODE_ENV === 'test' ? 'memory' : 'file';
}

function resolveStoragePath(): string {
  return process.env.CMS_WEBHOOK_STORE_PATH || DEFAULT_WEBHOOK_STORE_PATH;
}

function resolveDatabaseUrl(): string | null {
  return process.env.CMS_WEBHOOK_DATABASE_URL || process.env.DATABASE_URL || null;
}

function resolveDatabaseSsl(): PoolConfig['ssl'] | undefined {
  const configured = process.env.CMS_WEBHOOK_DATABASE_SSL;
  if (!configured) return undefined;
  const normalized = configured.trim().toLowerCase();
  if (normalized === '1' || normalized === 'true' || normalized === 'yes') {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

function normalizeTimestamp(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string' && value.trim().length > 0) return value;
  return null;
}

class WebhookRegistry {
  private webhooksById = new Map<string, RegisteredWebhook>();
  private loaded = false;
  private loadingPromise: Promise<void> | null = null;
  private readonly storageMode = resolveStorageMode();
  private readonly storagePath = resolveStoragePath();
  private postgresPool: Pool | null = null;
  private postgresTablePromise: Promise<void> | null = null;

  private hydrateWebhook(value: unknown): RegisteredWebhook | null {
    if (!value || typeof value !== 'object') return null;

    const candidate = value as Partial<RegisteredWebhook> & { events?: unknown };
    if (
      typeof candidate.id !== 'string' ||
      typeof candidate.url !== 'string' ||
      typeof candidate.secret !== 'string'
    ) {
      return null;
    }

    const rawEvents = Array.isArray(candidate.events)
      ? candidate.events.filter((event) => typeof event === 'string')
      : [];
    if (rawEvents.length === 0) {
      return null;
    }

    const now = new Date().toISOString();
    const createdAt = normalizeTimestamp(candidate.createdAt) || now;
    const updatedAt = normalizeTimestamp(candidate.updatedAt) || createdAt;

    return {
      id: candidate.id,
      url: candidate.url,
      secret: candidate.secret,
      events: rawEvents as WebhookEventType[],
      isActive: candidate.isActive !== false,
      createdAt,
      updatedAt,
      description: typeof candidate.description === 'string' ? candidate.description : undefined,
    };
  }

  private ensurePostgresPool(): Pool {
    if (this.storageMode !== 'postgres') {
      throw new Error('Postgres pool requested while storage mode is not postgres');
    }
    if (this.postgresPool) return this.postgresPool;

    const connectionString = resolveDatabaseUrl();
    if (!connectionString) {
      throw new Error(
        'Postgres webhook storage requires CMS_WEBHOOK_DATABASE_URL (or DATABASE_URL)',
      );
    }

    const config: PoolConfig = { connectionString };
    const ssl = resolveDatabaseSsl();
    if (ssl) {
      config.ssl = ssl;
    }

    this.postgresPool = new Pool(config);
    return this.postgresPool;
  }

  private async ensurePostgresTable(): Promise<void> {
    if (this.storageMode !== 'postgres') return;
    if (!this.postgresTablePromise) {
      const pool = this.ensurePostgresPool();
      this.postgresTablePromise = pool
        .query(
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
        )
        .then(() => undefined);
    }
    await this.postgresTablePromise;
  }

  private loadFromFile(): void {
    if (!fs.existsSync(this.storagePath)) {
      return;
    }

    const raw = fs.readFileSync(this.storagePath, 'utf8').trim();
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.error('Webhook storage file format is invalid (expected array)');
      return;
    }

    for (const record of parsed) {
      const webhook = this.hydrateWebhook(record);
      if (webhook) {
        this.webhooksById.set(webhook.id, webhook);
      }
    }
  }

  private async loadFromPostgres(): Promise<void> {
    await this.ensurePostgresTable();
    const pool = this.ensurePostgresPool();
    const { rows } = await pool.query<{
      id: string;
      url: string;
      secret: string;
      events: unknown;
      is_active: boolean;
      description: string | null;
      created_at: string | Date;
      updated_at: string | Date;
    }>(
      `SELECT id, url, secret, events, is_active, description, created_at, updated_at
       FROM ${WEBHOOKS_TABLE}
       ORDER BY created_at ASC`,
    );

    for (const row of rows) {
      const webhook = this.hydrateWebhook({
        id: row.id,
        url: row.url,
        secret: row.secret,
        events: row.events,
        isActive: row.is_active,
        description: row.description ?? undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
      if (webhook) {
        this.webhooksById.set(webhook.id, webhook);
      }
    }
  }

  private async loadFromStorage(): Promise<void> {
    if (this.storageMode === 'file') {
      this.loadFromFile();
      return;
    }

    if (this.storageMode === 'postgres') {
      await this.loadFromPostgres();
    }
  }

  private async ensureLoaded(): Promise<void> {
    if (this.loaded) return;

    if (!this.loadingPromise) {
      this.loadingPromise = this.loadFromStorage()
        .then(() => {
          this.loaded = true;
        })
        .finally(() => {
          this.loadingPromise = null;
        });
    }

    await this.loadingPromise;
  }

  private persistToFile(): void {
    fs.mkdirSync(path.dirname(this.storagePath), { recursive: true });
    const tempPath = `${this.storagePath}.tmp`;
    const payload = JSON.stringify(Array.from(this.webhooksById.values()), null, 2);
    fs.writeFileSync(tempPath, `${payload}\n`, 'utf8');
    fs.renameSync(tempPath, this.storagePath);
  }

  private async upsertPostgresWebhook(webhook: RegisteredWebhook): Promise<void> {
    await this.ensurePostgresTable();
    const pool = this.ensurePostgresPool();
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

  private async deletePostgresWebhook(id: string): Promise<void> {
    await this.ensurePostgresTable();
    const pool = this.ensurePostgresPool();
    await pool.query(`DELETE FROM ${WEBHOOKS_TABLE} WHERE id = $1`, [id]);
  }

  private async clearPostgresWebhooks(): Promise<void> {
    await this.ensurePostgresTable();
    const pool = this.ensurePostgresPool();
    await pool.query(`DELETE FROM ${WEBHOOKS_TABLE}`);
  }

  private async persistUpsert(webhook: RegisteredWebhook): Promise<void> {
    if (this.storageMode === 'file') {
      this.persistToFile();
      return;
    }

    if (this.storageMode === 'postgres') {
      await this.upsertPostgresWebhook(webhook);
    }
  }

  private async persistDelete(id: string): Promise<void> {
    if (this.storageMode === 'file') {
      this.persistToFile();
      return;
    }

    if (this.storageMode === 'postgres') {
      await this.deletePostgresWebhook(id);
    }
  }

  private async persistClear(): Promise<void> {
    if (this.storageMode === 'file') {
      this.persistToFile();
      return;
    }

    if (this.storageMode === 'postgres') {
      await this.clearPostgresWebhooks();
    }
  }

  async register(
    webhook: Omit<RegisteredWebhook, 'id' | 'createdAt' | 'updatedAt' | 'secret'> & {
      secret?: string;
    },
  ): Promise<RegisteredWebhook> {
    await this.ensureLoaded();
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
    try {
      await this.persistUpsert(record);
    } catch (error) {
      this.webhooksById.delete(id);
      throw error;
    }
    return record;
  }

  async list(): Promise<RegisteredWebhook[]> {
    await this.ensureLoaded();
    return Array.from(this.webhooksById.values());
  }

  async get(id: string): Promise<RegisteredWebhook | undefined> {
    await this.ensureLoaded();
    return this.webhooksById.get(id);
  }

  async update(
    id: string,
    updates: Partial<Omit<RegisteredWebhook, 'id' | 'createdAt'>>,
  ): Promise<RegisteredWebhook | undefined> {
    await this.ensureLoaded();
    const existing = this.webhooksById.get(id);
    if (!existing) return undefined;
    const updated: RegisteredWebhook = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.webhooksById.set(id, updated);
    try {
      await this.persistUpsert(updated);
    } catch (error) {
      this.webhooksById.set(id, existing);
      throw error;
    }
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await this.ensureLoaded();
    const previous = this.webhooksById.get(id);
    if (!previous) return false;
    const deleted = this.webhooksById.delete(id);
    if (deleted) {
      try {
        await this.persistDelete(id);
      } catch (error) {
        this.webhooksById.set(id, previous);
        throw error;
      }
    }
    return deleted;
  }

  async clear(): Promise<void> {
    await this.ensureLoaded();
    this.webhooksById.clear();
    this.loaded = true;
    await this.persistClear();
  }

  storageInfo(): WebhookStorageInfo {
    if (this.storageMode === 'postgres') {
      return {
        mode: this.storageMode,
        persistent: true,
        databaseUrlConfigured: Boolean(resolveDatabaseUrl()),
      };
    }

    return {
      mode: this.storageMode,
      persistent: this.storageMode === 'file',
      path: this.storageMode === 'file' ? this.storagePath : undefined,
    };
  }

  async healthInfo(): Promise<WebhookStorageHealth> {
    const info = this.storageInfo();
    try {
      await this.ensureLoaded();
      if (this.storageMode === 'postgres') {
        await this.ensurePostgresTable();
        const pool = this.ensurePostgresPool();
        await pool.query('SELECT 1');
      } else if (this.storageMode === 'file') {
        fs.mkdirSync(path.dirname(this.storagePath), { recursive: true });
      }

      return {
        ...info,
        available: true,
        recordCount: this.webhooksById.size,
      };
    } catch (error) {
      return {
        ...info,
        available: false,
        error: error instanceof Error ? error.message : 'Unknown storage error',
      };
    }
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

  const webhooks = await webhookRegistry.list();
  const targets = webhooks.filter(
    (w) => w.isActive && (w.events.includes(eventType) || w.events.includes('*' as WebhookEventType)),
  );

  const results = await Promise.all(
    targets.map(async (webhook) => ({
      webhookId: webhook.id,
      result: await deliverWebhook(webhook, payload),
    })),
  );

  return results;
}
