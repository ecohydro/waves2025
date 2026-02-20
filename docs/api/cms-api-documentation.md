# CMS API Documentation

_Last updated: February 20, 2026_

This document describes the API routes currently implemented in the application.

## Base URL

```text
https://<your-domain>/api/cms
```

## Authentication

### Admin API key

Webhook management endpoints require an admin API key header:

```text
x-api-key: <CMS_API_KEY>
```

If the key is missing or incorrect, endpoints return `401 Unauthorized`.

## Implemented Endpoints

## 1) Health Check

### `GET /api/cms/health`

Checks server health and Sanity connectivity.

Example response (`200`):

```json
{
  "status": "healthy",
  "timestamp": "2026-02-20T20:00:00.000Z",
  "uptime": 12345,
  "nodeEnv": "production",
  "sanity": {
    "connected": true,
    "responseTime": "132ms",
    "personCount": 69
  },
  "environment": {
    "projectId": true,
    "dataset": true,
    "apiToken": true,
    "cmsApiKey": true
  },
  "webhooks": {
    "storageMode": "file",
    "persistent": true,
    "available": true,
    "recordCount": 3
  },
  "version": "0.1.0"
}
```

Failure response (`503`) returns `status: "unhealthy"` with error details.

## 2) Webhook Management

### `GET /api/cms/webhooks`

- Requires admin API key.
- Returns all registered webhooks.
- Optional query `id=<webhookId>` returns one webhook.
- Returns `503` if webhook storage backend is unavailable.

### `POST /api/cms/webhooks`

- Requires admin API key.
- Registers a webhook.
- Returns `503` if webhook storage backend is unavailable.

Request body:

```json
{
  "url": "https://example.com/hook",
  "events": ["people.created"],
  "isActive": true,
  "description": "optional"
}
```

### `PUT /api/cms/webhooks`

- Requires admin API key.
- Updates an existing webhook.
- Returns `503` if webhook storage backend is unavailable.

Request body (example):

```json
{
  "id": "wh_...",
  "isActive": false,
  "description": "Paused"
}
```

### `DELETE /api/cms/webhooks?id=<webhookId>`

- Requires admin API key.
- Deletes a webhook by id.
- Returns `503` if webhook storage backend is unavailable.

## 3) Webhook Test Delivery Echo

### `POST /api/cms/webhooks/test-delivery`

Echo endpoint used to validate payload/signature transport. Returns received headers and body.
Invalid JSON returns `400`.

## Event Names

Supported webhook event names:

- `people.created`
- `people.updated`
- `people.deleted`
- `publications.created`
- `publications.updated`
- `publications.deleted`
- `news.created`
- `news.updated`
- `news.deleted`

## Notes

- Webhook registrations support three storage backends: `memory`, `file`, and `postgres`.
- Default storage mode is `file` (except tests, which default to `memory`).
- Configure with:
  - `CMS_WEBHOOK_STORAGE=memory|file|postgres`
  - `CMS_WEBHOOK_STORE_PATH=/path/to/webhooks-registry.json` (optional)
  - `CMS_WEBHOOK_DATABASE_URL=postgres://...` (required for `postgres` mode)
  - `CMS_WEBHOOK_DATABASE_SSL=true` (optional)
- Existing file-backed webhooks can be migrated with:
  - `npm run webhooks:migrate-to-postgres`
- Content CRUD endpoints (`/people`, `/publications`, `/news`) are not currently exposed as API routes.
