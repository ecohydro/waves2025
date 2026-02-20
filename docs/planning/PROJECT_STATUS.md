# Project Status - WAVES Website

_Last updated: February 20, 2026_

## Current State

The repository is in an operational state for core development:

- ✅ `npm run lint` passes
- ✅ `npm run type-check` passes
- ✅ `npm test` (fast Vitest suite) passes
- ✅ `npm run build` passes
- ✅ `npm run test:full-integration` passes against live Sanity data

## What Is Implemented

- Next.js 14 App Router site with People, Publications, News, Research, Search, and Studio routes
- Sanity-backed content fetching for people/publications/news/project data
- Project and archive/legal utility routes (`/projects`, `/news/archive`, `/privacy`, etc.)
- CMS operational API routes for health checks and webhook lifecycle management

## Testing and CI Model

- Fast lane: lint + type-check + Vitest fast suite + build
- Slow lane: full CMS integration tests with running dev server and real dataset
- CI runs fast lane on push/PR; integration runs on:
  - push to `main`
  - manual dispatch
  - nightly schedule
  - PRs labeled `run-integration`

## Known Gaps / Ongoing Work

1. API scope is intentionally limited today (health + webhooks only).
2. Some historical migration scripts remain lightly typed and are excluded from lint quality gate.
3. Browserslist data should be periodically refreshed (`npx update-browserslist-db@latest`).
4. Multi-instance/serverless environments must set `CMS_WEBHOOK_STORAGE=postgres` (and DB URL) for shared webhook persistence.

## Next Priorities

1. Finalize and execute the staged API scope plan in `docs/planning/CMS_API_SCOPE_PLAN.md`.
2. Add tighter API-level contract tests around webhook error paths and auth failures.
3. Reduce noisy test logging in migration-related suites.
4. Continue documentation cleanup in older historical completion reports.
