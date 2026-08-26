# Research: People Page Content — News & Publications

**Date**: 2026-03-13

## R1: GROQ Query Strategy for Publications by Person

**Decision**: Use a reverse-reference GROQ query that filters publications where any author's `person._ref` matches the person's `_id`. Filter by status in the query itself to minimize data transfer.

**Rationale**: Sanity GROQ supports `references($personId)` shorthand, but explicit filtering on `authors[].person._ref == $personId` combined with status filtering is more precise and avoids matching unrelated references. Limiting to 5 results with `[0...5]` is done at the query level for efficiency.

**Alternatives considered**:
- Fetch all publications client-side and filter: Rejected — unnecessary data transfer, especially as publication count grows.
- Use `references()` function: Simpler syntax but less precise; would match any reference to the person anywhere in the publication document, not just the authors array.

## R2: GROQ Query Strategy for News by Person

**Decision**: Use a GROQ query that checks three relationship paths: `author._ref`, `coAuthors[]._ref`, and `relatedPeople[]._ref`. Combine with OR logic and filter for `status == "published"`.

**Rationale**: News items can reference a person in three distinct ways per the schema. All three must be checked to satisfy FR-004. Limiting to 3 results at the query level.

**Alternatives considered**:
- Use `references($personId)`: Would work since all three fields reference the person, but could also match `relatedPublications` or `relatedProjects` that happen to reference the person indirectly. Explicit field checks are safer.
- Separate queries per relationship: Rejected — unnecessary round-trips and would require client-side deduplication.

## R3: Page Layout Integration

**Decision**: Add publications and news sections as new `<Card>` components in the main content column (left `lg:col-span-2` area) of the existing person detail page, after the Education section.

**Rationale**: The person detail page uses a 3-column grid layout with main content (col-span-2) and sidebar (col-span-1). Publications and news are primary content, not sidebar metadata, so they belong in the main column. Placing them after Education follows the clarified requirement (after biography/profile content) and maintains the existing visual hierarchy.

**Alternatives considered**:
- Sidebar placement: Rejected — sidebar is for quick info and social links; publication/news lists need more horizontal space.
- New full-width section below the grid: Rejected — would break the existing layout pattern.

## R4: "View All Publications" Link Target

**Decision**: Link to `/publications?author=[slug]` to filter the publications page by author. If the publications page does not currently support author filtering via query params, the link will go to `/publications` without filtering (degraded but functional).

**Rationale**: The publications page already supports `?type=` and `?area=` query params. Adding `?author=` filtering would be ideal but is out of scope for this feature. A plain `/publications` link still satisfies FR-009's intent of providing navigation to the full list.

**Alternatives considered**:
- Anchor link to a person-specific section: Not feasible since publications page doesn't have person-specific sections.
- No link at all: Rejected — FR-009 requires it.
