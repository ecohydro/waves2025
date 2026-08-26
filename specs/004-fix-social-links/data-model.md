# Data Model: Fix Social Links Hostnames

**Date**: 2026-04-16
**Feature**: 004-fix-social-links

## Entities

### Person (existing — no schema changes)

The `person` document type in Sanity CMS. No structural changes to the data model.

### SocialMedia (existing object — validation changes only)

Embedded object within Person. Fields and their expected values:

| Field | Sanity Type | Storage Format | Valid Hostname(s) | Example |
|-------|-------------|----------------|-------------------|---------|
| `orcid` | string | Bare ID | N/A (no URL) | `0000-0002-5507-2368` |
| `googleScholar` | url | Full URL | `scholar.google.com` | `https://scholar.google.com/citations?user=VGaoB64AAAAJ` |
| `researchGate` | url | Full URL | `researchgate.net`, `www.researchgate.net` | `https://www.researchgate.net/profile/Jane-Doe` |
| `linkedin` | url | Full URL | `linkedin.com`, `www.linkedin.com` | `https://www.linkedin.com/in/jane-doe` |
| `twitter` | string | Handle or full URL | `twitter.com`, `x.com` (if URL) | `janedoe` or `https://twitter.com/janedoe` |
| `github` | string | Handle or full URL | `github.com` (if URL) | `janedoe` or `https://github.com/janedoe` |

### Broken Link Classification

Categories used by the audit script to classify each social link value:

| Classification | Description | Action |
|---------------|-------------|--------|
| `correct` | URL hostname matches expected platform | No change |
| `broken-hostname` | URL contains waveslab.org or other wrong hostname | Auto-fix: extract slug, rebuild with correct hostname |
| `bare-slug` | No hostname, just a profile identifier | Normalize to full platform URL (existing logic handles this) |
| `empty` | null, undefined, or blank string | Skip |
| `manual-review` | Slug doesn't map cleanly to platform username | Flag in report, skip auto-fix |

## Validation Rules (new)

Added to Sanity schema — reject values where the URL hostname matches `waveslab.org` or `www.waveslab.org`:

- `linkedin`: Must not contain `waveslab.org`; must be a valid `linkedin.com` URL
- `researchGate`: Must not contain `waveslab.org`; must be a valid `researchgate.net` URL
- `googleScholar`: Must not contain `waveslab.org`; must be a valid `scholar.google.com` URL
- `twitter`: If a full URL is entered, must not contain `waveslab.org`
- `github`: If a full URL is entered, must not contain `waveslab.org`
- `orcid`: Existing regex validation (`^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$`) is sufficient
