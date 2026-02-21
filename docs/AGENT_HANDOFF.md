# WAVES2025 Agent Handoff

## Host + Repository

- Agent host repo path: `/home/kkc9q/dev/waves2025`
- App stack: Next.js 14 App Router + React 18 + TypeScript
- Content source of truth: Sanity CMS (`projectId=6r5yojda`, `dataset=production`)
- Deployment: Vercel via GitHub integration (push/merge to `main`)

## Canonical Branding

- Always expand WAVES as: **Water, Vegetation, and Society**
- Do not use any legacy acronym expansion.

## Current API Surface (Implemented)

Base path: `/api/cms`

- `GET /api/cms/health`
- `GET|POST|PUT|DELETE /api/cms/webhooks` (requires `x-api-key: <CMS_API_KEY>`)
- `POST /api/cms/webhooks/test-delivery`

Notes:

- Content CRUD endpoints are not currently exposed as API routes.
- Planned v1 write endpoints are documented in `docs/planning/CMS_API_SCOPE_PLAN.md`.

## Webhook Persistence

Supported storage backends:

- `memory` (test/ephemeral)
- `file` (default runtime)
- `postgres` (required for multi-instance/serverless durability)

Key env vars:

- `CMS_WEBHOOK_STORAGE=memory|file|postgres`
- `CMS_WEBHOOK_STORE_PATH` (optional file path override)
- `CMS_WEBHOOK_DATABASE_URL` (required for postgres mode; `DATABASE_URL` also supported)
- `CMS_WEBHOOK_DATABASE_SSL=true` (optional)

Migration command (file -> postgres):

- `npm run webhooks:migrate-to-postgres`

## Content Models + Visibility Rules

Sanity document types:

- `person`
- `publication`
- `project`
- `news`

Site list visibility logic:

- People list: `_type == "person" && isActive == true`
- Projects list: `_type == "project" && isPublic == true`
- News list: `_type == "news" && status == "published"`
- Publications list: `_type == "publication" && defined(publicationType)`

## Content Editing + Publishing Workflow

1. Open Studio at `/studio` (or local standalone Studio via `npm run studio` on port `3333`).
2. Create/edit a document (`person`, `publication`, `project`, or `news`).
3. Ensure required fields and visibility/status fields are set correctly.
4. (Optional) Preview draft via:
   - `/api/preview?secret=<SANITY_PREVIEW_SECRET>&type=<person|publication|news|project>&slug=<slug>`
5. Publish in Sanity Studio.
6. Verify on site and check health:
   - `GET /api/cms/health`

Exit preview via:

- `/api/exit-preview`

## CI + Quality Gates

Workflow file: `.github/workflows/ci.yml`

Fast lane (push/PR on `main`, `develop`):

- `npm run lint`
- `npm run type-check`
- `npm run test:fast`
- `npm run build`

Integration lane (`npm run test:full-integration`) runs on:

- push to `main`
- manual dispatch
- nightly schedule
- PRs labeled `run-integration` (non-fork PRs)

## Agent Bootstrap Commands (on host)

```bash
cd /home/kkc9q/dev/waves2025
npm ci
npm run lint
npm run type-check
npm test
npm run build
```

## Operational Verification Commands

```bash
# API smoke (requires CMS_API_KEY and running server/target URL)
BASE_URL='https://<domain>' CMS_API_KEY='<key>' npm run test:api

# Health check
curl -sS https://<domain>/api/cms/health | jq
```

## Known Caveats

- Multi-instance/serverless deployments must use Postgres webhook storage.
- `docs/content-management-guide.md` contains historical references (`/admin`, Slack commands) that do not match currently implemented app routes.
