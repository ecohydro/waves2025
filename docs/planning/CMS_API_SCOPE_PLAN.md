# CMS API Scope Decision and Implementation Plan

_Last updated: February 20, 2026_

## Decision

The project will **not** expose public read endpoints for people/publications/news under `/api/cms/*` at this time.  
Those reads stay in server-side app code via `src/lib/cms/client.ts`.

The API surface will focus on **operational/admin use cases**:

1. Health and diagnostics (`/api/cms/health`)
2. Webhook lifecycle (`/api/cms/webhooks*`)
3. Future authenticated admin mutations (versioned under `/api/cms/v1/*`)

This keeps the public surface small, reduces duplicated query logic, and avoids maintaining two read paths.

## Target API Shape (v1)

### Keep (already implemented)

- `GET /api/cms/health`
- `GET|POST|PUT|DELETE /api/cms/webhooks`
- `POST /api/cms/webhooks/test-delivery`

### Add (planned)

- `POST /api/cms/v1/people`
- `PATCH /api/cms/v1/people/:id`
- `DELETE /api/cms/v1/people/:id`
- `POST /api/cms/v1/publications`
- `PATCH /api/cms/v1/publications/:id`
- `DELETE /api/cms/v1/publications/:id`
- `POST /api/cms/v1/news`
- `PATCH /api/cms/v1/news/:id`
- `DELETE /api/cms/v1/news/:id`

## Auth and Authorization Decision

Short term (Phase 1-2):

- Keep `x-api-key` for operational endpoints.
- Add key rotation support with `CMS_API_KEY_CURRENT` + `CMS_API_KEY_PREVIOUS`.
- Require explicit `x-cms-client` identifier header for auditability.

Medium term (Phase 3):

- Move `/api/cms/v1/*` to signed service tokens with scope claims:
  - `cms:people:write`
  - `cms:publications:write`
  - `cms:news:write`
  - `cms:webhooks:admin`
- Maintain `x-api-key` compatibility only for `/api/cms/webhooks*` during migration window.

## Rollout Plan

## Phase 0 (completed)

- Align tests/docs to real API.
- Remove stale endpoint tests.
- Add durable webhook persistence with pluggable backends (`file` for local, `postgres` for shared deployments).

## Phase 1 (next)

- Add request schema validation for all webhook endpoints.
- Add contract tests for auth failures, invalid payloads, and id-not-found paths.
- Add audit logging envelope (request id, actor id, route, outcome).

## Phase 2

- Implement `/api/cms/v1/people` mutations + tests.
- Emit entity webhooks on successful writes.
- Add idempotency keys for create/update requests.

## Phase 3

- Implement `/api/cms/v1/publications` and `/api/cms/v1/news` mutations.
- Introduce scoped service tokens and deprecate broad admin key for v1 writes.
- Add rate limits per token/client.

## Phase 4

- Security hardening:
  - replay protection for signed tokens
  - key rotation runbook
  - API abuse alerting and dashboards

## Acceptance Criteria

1. Every new endpoint has: schema validation, auth tests, and error-path tests.
2. Every mutation emits a webhook event with delivery result telemetry.
3. API docs and test fixtures ship in the same PR as route changes.
4. CI includes at least one integration path that exercises new v1 write flow against a non-production dataset.
