# Authentication and Security Notes

_Last updated: February 20, 2026_

## Status

This repository currently uses a **simple admin API key model** for mutating CMS API operations.

Implemented enforcement today:

- `x-api-key` check on `/api/cms/webhooks` `GET|POST|PUT|DELETE`
- unauthenticated requests return `401`

## What Is Not Currently Implemented

The following items were previously documented as a broader design but are **not active API features** in this codebase at present:

- JWT issuance/validation endpoints
- role-based access control middleware
- persisted API user management
- monitoring endpoint for auth/rate-limit analytics

## Current Recommendation

- Treat this file as a design/history note, not as active API behavior.
- Use `docs/api/cms-api-documentation.md` as the source of truth for implemented routes.
- If expanded auth is needed, follow `docs/planning/CMS_API_SCOPE_PLAN.md`, ship behind tests, and update docs in the same change.
