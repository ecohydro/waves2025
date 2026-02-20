# WAVES Lab Website

Next.js 14 + TypeScript site for WAVES Lab content, backed by Sanity CMS data.

## Current Status (February 20, 2026)

- Build, lint, and type-check pass locally.
- Fast test suite is consolidated on Vitest and passes.
- Full CMS integration test passes against real Sanity data.
- Core site sections are live: people, publications, news, research, projects, search.
- API routes currently implemented: health + webhook management/test delivery.

## Quick Start

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Core Commands

```bash
# Quality gates
npm run lint
npm run type-check
npm test
npm run build

# Fast test suite (used by npm test)
npm run test:fast

# Integration checks (manual / staging)
npm run test:sanity-data
npm run test:full-integration

# One-time migration: move local file-backed webhooks into Postgres
npm run webhooks:migrate-to-postgres
```

## Testing Strategy

- Unit/fast tests: Vitest (`npm test`, `npm run test:fast`)
- Integration tests (real CMS data and running dev server): Vitest integration config
- CI default job runs: lint, type-check, fast tests, build
- Integration CI runs on `main` push, manual dispatch, nightly schedule, or PR label `run-integration`

## API Surface (Current)

- `GET /api/cms/health`
- `GET|POST|PUT|DELETE /api/cms/webhooks` (admin key required)
- `POST /api/cms/webhooks/test-delivery`
- Webhook registry supports `memory`, `file`, and `postgres` storage (`CMS_WEBHOOK_STORAGE=...`)
- For multi-instance/serverless deployments, use `CMS_WEBHOOK_STORAGE=postgres`

See `docs/api/cms-api-documentation.md` for details.
For scoped roadmap and auth/API decisions, see `docs/planning/CMS_API_SCOPE_PLAN.md`.
For rollout steps, see `docs/deployment/WEBHOOK_POSTGRES_CUTOVER.md`.

## Project Structure

```text
waves2025/
├── docs/       # project and operations docs
├── src/        # Next.js app and library code
├── content/    # migrated MDX content and assets
├── public/     # static assets
├── scripts/    # one-off migration/maintenance utilities
└── legacy/     # source legacy site data
```
