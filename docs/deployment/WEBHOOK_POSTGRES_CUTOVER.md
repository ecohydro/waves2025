# Webhook Postgres Cutover Runbook

_Last updated: February 20, 2026_

This runbook moves webhook storage from file-backed local persistence to shared Postgres persistence.

## Preconditions

1. A reachable Postgres database.
2. The branch with Postgres webhook storage support is deployed.
3. You have a valid `CMS_API_KEY`.

## Environment Variables

Set these in the deployment environment:

```bash
CMS_WEBHOOK_STORAGE=postgres
CMS_WEBHOOK_DATABASE_URL=postgres://user:password@host:5432/database
CMS_WEBHOOK_DATABASE_SSL=true
```

Notes:

- `CMS_WEBHOOK_DATABASE_SSL=true` is optional. Use it for managed providers that require SSL.
- `CMS_WEBHOOK_DATABASE_URL` can be replaced by `DATABASE_URL` if you prefer a shared variable.

## Staging Cutover

1. Configure staging env vars.
2. Run dry-run migration:

```bash
CMS_WEBHOOK_DATABASE_URL='postgres://...' npm run webhooks:migrate-to-postgres -- --dry-run
```

3. Run migration:

```bash
CMS_WEBHOOK_DATABASE_URL='postgres://...' npm run webhooks:migrate-to-postgres
```

4. Deploy staging.
5. Verify storage health:

```bash
curl -sS https://<staging-domain>/api/cms/health | jq '.webhooks'
```

Expected:

- `storageMode` is `"postgres"`
- `persistent` is `true`
- `available` is `true`

6. Verify API behavior:

```bash
BASE_URL='https://<staging-domain>' CMS_API_KEY='<your-key>' npm run test:api
```

## Production Cutover

1. Configure production env vars (same keys as staging).
2. Run migration against production DB:

```bash
CMS_WEBHOOK_DATABASE_URL='postgres://...' npm run webhooks:migrate-to-postgres -- --dry-run
CMS_WEBHOOK_DATABASE_URL='postgres://...' npm run webhooks:migrate-to-postgres
```

3. Deploy production.
4. Verify:

```bash
curl -sS https://<production-domain>/api/cms/health | jq '.webhooks'
BASE_URL='https://<production-domain>' CMS_API_KEY='<your-key>' npm run test:api
```

## Platform-specific Commands

## Vercel

Set env vars:

```bash
vercel env add CMS_WEBHOOK_STORAGE production
vercel env add CMS_WEBHOOK_DATABASE_URL production
vercel env add CMS_WEBHOOK_DATABASE_SSL production
```

Deploy:

```bash
vercel --prod
```

## Kubernetes / Generic Node Host

Apply env vars via deployment manifest/secret, then restart rollout:

```bash
kubectl set env deploy/<app> CMS_WEBHOOK_STORAGE=postgres
kubectl set env deploy/<app> CMS_WEBHOOK_DATABASE_URL='postgres://...'
kubectl set env deploy/<app> CMS_WEBHOOK_DATABASE_SSL=true
kubectl rollout restart deploy/<app>
kubectl rollout status deploy/<app>
```

## Rollback

If Postgres storage is unhealthy:

1. Revert env var:

```bash
CMS_WEBHOOK_STORAGE=file
```

2. Redeploy.
3. Re-check `/api/cms/health`.

This restores file-backed behavior immediately while you investigate DB connectivity.

## Post-cutover Monitoring

During the first 24 hours, check:

1. `/api/cms/health` for `webhooks.available`.
2. API `503` rates on `/api/cms/webhooks`.
3. Postgres connection errors from app logs.
