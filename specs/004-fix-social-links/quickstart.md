# Quickstart: Fix Social Links Hostnames

**Feature**: 004-fix-social-links

## Prerequisites

- Node.js with `tsx` available
- `.env.local` with Sanity credentials:
  - `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - `NEXT_PUBLIC_SANITY_DATASET`
  - `SANITY_API_EDITOR_TOKEN` (or `SANITY_API_TOKEN`) — required for write operations

## Step 1: Audit Current State

Run the audit script to see which social links are broken:

```bash
npx tsx scripts/audit-social-links.ts
```

This outputs a table showing every member's social links, their current values, and whether they need fixing. Use `--json` for machine-readable output.

## Step 2: Preview Fixes (Dry Run)

Run the fix script without applying changes:

```bash
npx tsx scripts/fix-person-social-urls.ts
```

Without `--yes`, the script shows proposed changes but does not modify any data.

## Step 3: Apply Fixes

Once you've reviewed the dry-run output:

```bash
npx tsx scripts/fix-person-social-urls.ts --yes
```

This updates all affected person documents in Sanity (both published and draft versions).

## Step 4: Verify

Re-run the audit to confirm zero broken links remain:

```bash
npx tsx scripts/audit-social-links.ts
```

Then run the integration tests:

```bash
npm run test:sanity-data
```

## Step 5: Test in Browser

Start the dev server and spot-check member profile pages:

```bash
npm run dev
```

Visit `/people` and click through social links on several member profiles to verify they navigate to the correct external platforms.
