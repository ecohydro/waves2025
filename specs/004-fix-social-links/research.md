# Research: Fix Social Links Hostnames

**Date**: 2026-04-16
**Feature**: 004-fix-social-links

## R1: How Social Links Are Stored in Sanity

**Decision**: Social links are stored in a `socialMedia` object on person documents with 6 fields, using two different storage strategies.

**Findings**:
- URL-type fields (Sanity validates as URL): `linkedin`, `researchGate`, `googleScholar` — stored as full URLs
- String-type fields (no URL validation): `twitter`, `github` — stored as handles or full URLs
- ID-type field: `orcid` — stored as bare ID (`0000-0000-0000-0000`), URL composed at render time
- Two schema files exist:
  - `src/sanity/schemaTypes/person.ts` — the Sanity Studio schema (runtime)
  - `src/lib/cms/schemas/person.ts` — detailed schema with richer validation rules
- Both schemas must be updated for validation changes

**Alternatives considered**: None — this is the existing data model.

## R2: Root Cause of waveslab.org Hostnames

**Decision**: The waveslab.org URLs were likely introduced during the MDX-to-Sanity migration when social link values from the old site contained relative paths or waveslab.org URLs.

**Findings**:
- The migration script (`src/lib/cms/migration/migrate-people-to-sanity.ts`, line 265-272) directly maps MDX frontmatter values to Sanity `socialMedia` fields without normalization
- The existing `fix-person-social-urls.ts` script normalizes handles to URLs but does NOT detect or fix waveslab.org hostnames
- Since `linkedin`, `researchGate`, `googleScholar` are Sanity URL-type fields, the waveslab.org values must have been valid URLs (`https://waveslab.org/...`) to pass Sanity's built-in validation

**Alternatives considered**: Schema default values (ruled out — no defaults set), rendering-layer bug (ruled out — rendering uses stored values directly).

## R3: Existing Normalization Script Capabilities

**Decision**: Extend the existing `scripts/fix-person-social-urls.ts` rather than writing a new fix script.

**Rationale**: The existing script already handles:
- Sanity client setup with auth tokens
- Published + draft document handling
- Dry-run mode
- Normalization functions per platform
- Transaction-based batch updates

**What needs to be added**:
- waveslab.org hostname detection (check if URL host is `waveslab.org` or `www.waveslab.org`)
- Slug extraction from waveslab.org paths (strip `/people/` or similar prefixes)
- Integration into the `computeUpdates()` pipeline as a pre-normalization step

**Alternatives considered**: New standalone script (rejected — would duplicate all the Sanity client/transaction/draft handling logic).

## R4: Sanity Custom Validation for Prevention

**Decision**: Add custom validation rules to Sanity schema URL fields that reject waveslab.org hostnames.

**Findings**:
- Sanity supports custom validation via `validation: (Rule) => Rule.custom(...)` 
- URL-type fields already have `Rule.uri({ scheme: ['http', 'https'] })` — custom validation can be chained
- String-type fields (`twitter`, `github`) can use `Rule.custom()` to check if a full URL with waveslab.org was pasted
- Validation messages should be actionable: "Please enter the actual {platform} URL, not a waveslab.org link"

**Alternatives considered**: Sanity document action hook (overkill for this use case), pre-save transformation (harder to debug, less transparent to editors).

## R5: Rendering Code — No Changes Needed

**Decision**: No changes to rendering code (`src/app/people/[slug]/page.tsx`).

**Rationale**: The rendering code at lines 455-535 uses stored values directly as `href`. Once the data is fixed in Sanity, the links will work correctly. The rendering code also already handles:
- ORCID: composes URL from bare ID (`https://orcid.org/${id}`)
- Google Scholar: conditional logic for IDs vs full URLs
- All others: direct href from stored value

**Alternatives considered**: Adding render-time normalization (rejected — fix at the data source is cleaner and prevents the broken data from persisting).
