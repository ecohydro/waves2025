# Implementation Plan: Fix Social Links Hostnames

**Branch**: `004-fix-social-links` | **Date**: 2026-04-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-fix-social-links/spec.md`

## Summary

Social links on member profile pages were populated during site migration with incorrect hostnames — defaulting to `waveslab.org` instead of the correct external platform domains (linkedin.com, github.com, etc.). The profile identifier/slug is correct but the hostname is wrong, making all links broken. This plan covers: auditing Sanity CMS data to identify broken links, batch-correcting hostnames while preserving slugs, adding validation to prevent recurrence, and writing tests to verify correctness.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js (tsx runner for scripts)
**Primary Dependencies**: `@sanity/client` (CMS reads/writes), Next.js 14.2 (App Router), Vitest (testing)
**Storage**: Sanity CMS (hosted, GROQ queries)
**Testing**: Vitest (unit tests for normalization logic, integration tests against Sanity)
**Target Platform**: Web (Next.js on Vercel) + CLI scripts (tsx)
**Project Type**: Web application + data migration scripts
**Performance Goals**: N/A — batch script runs once; no runtime performance impact
**Constraints**: Must support dry-run mode; must handle both published and draft Sanity documents
**Scale/Scope**: ~50-100 person documents in Sanity; 6 social link fields per person

## Constitution Check

*No constitution file found. Proceeding without gate checks.*

## Project Structure

### Documentation (this feature)

```text
specs/004-fix-social-links/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
scripts/
├── fix-person-social-urls.ts          # EXISTING — extend with waveslab.org detection
└── audit-social-links.ts              # NEW — audit script producing a report

src/
├── sanity/schemaTypes/person.ts       # MODIFY — add URL hostname validation
├── lib/cms/schemas/person.ts          # MODIFY — add URL hostname validation (detailed schema)
└── lib/cms/client.ts                  # READ ONLY — GROQ queries (no changes needed)

tests/
├── unit/
│   └── social-link-normalization.test.ts  # NEW — unit tests for normalization functions
└── integration/
    └── sanity-data-validation.test.ts     # MODIFY — add social link hostname assertions
```

**Structure Decision**: Extends the existing scripts/ pattern for data fix scripts, adds unit tests for the normalization logic, and augments the existing Sanity data validation integration test.

## Implementation Approach

### Phase A: Audit & Understand (Stories 2)

1. **Create audit script** (`scripts/audit-social-links.ts`):
   - Query all person documents from Sanity (published + drafts)
   - For each social link field, classify the stored value:
     - `correct` — hostname matches the expected platform
     - `broken-hostname` — contains waveslab.org or other non-platform hostname
     - `bare-slug` — no hostname, just a profile identifier
     - `empty` — null/undefined/blank
   - Output a structured report to stdout (table format) showing: member name, field, current value, status, suggested correction
   - Support `--json` flag for machine-readable output

2. **Expected platform hostnames per field**:
   - `linkedin` → `linkedin.com` or `www.linkedin.com`
   - `github` → `github.com`
   - `twitter` → `twitter.com` or `x.com`
   - `researchGate` → `researchgate.net` or `www.researchgate.net`
   - `googleScholar` → `scholar.google.com`
   - `orcid` → bare ID (no URL), validated by regex `^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$`

### Phase B: Fix Data (Stories 1, 3)

3. **Extend `scripts/fix-person-social-urls.ts`** with waveslab.org hostname detection:
   - Add a `detectAndFixWaveslabUrl(fieldName, value)` function that:
     - Checks if the URL hostname is `waveslab.org` or `www.waveslab.org`
     - Extracts the slug/path segment (e.g., `/people/jane-doe` → `jane-doe`)
     - Rebuilds the URL using the correct platform hostname based on the field name
   - Integrate this into the existing `computeUpdates()` pipeline, running before the existing normalization logic
   - Preserve existing dry-run (`--dry-run`) and apply (`--yes`) modes
   - Handle draft documents (existing logic already supports this)

4. **Slug extraction logic**:
   - Strip common path prefixes: `/people/`, `/members/`, leading `/`
   - The remaining slug becomes the profile identifier
   - For fields where slug format doesn't match platform expectations (e.g., `jane-doe` for a LinkedIn field that expects a different slug), flag for manual review in the output

### Phase C: Prevent Recurrence (Story 4)

5. **Add Sanity schema validation** to both schema files:
   - For URL-type fields (`linkedin`, `researchGate`, `googleScholar`): add custom validation that rejects URLs with `waveslab.org` hostname and provides a helpful error message
   - For string-type fields (`twitter`, `github`): add validation that rejects full URLs containing `waveslab.org`
   - Keep existing URL scheme validation (`http`/`https`) intact

### Phase D: Testing & Verification

6. **Unit tests** (`tests/unit/social-link-normalization.test.ts`):
   - Test `detectAndFixWaveslabUrl()` for each platform
   - Test slug extraction from various waveslab.org URL patterns
   - Test that already-correct URLs pass through unchanged
   - Test edge cases: bare slugs, empty values, non-waveslab incorrect hostnames

7. **Integration test additions** (`tests/integration/sanity-data-validation.test.ts`):
   - Add assertion: no person document should have social link URLs containing `waveslab.org`
   - Add assertion: all URL-type social link fields should have correct platform hostnames

### Execution Order

1. Write unit tests for normalization logic (test-first)
2. Create audit script, run it to understand scope
3. Extend fix script with waveslab.org detection
4. Run fix script in dry-run mode, review output
5. Apply fixes (with user confirmation)
6. Run audit script again to verify zero broken links
7. Add Sanity schema validation
8. Add integration test assertions
9. Verify all tests pass
