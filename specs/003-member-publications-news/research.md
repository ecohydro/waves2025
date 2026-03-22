# Research: Member Publications & News

**Feature**: 003-member-publications-news
**Date**: 2026-03-21

## Research Findings

### 1. Publication Schema Author References

**Decision**: Add `person` reference field to the `authors` array member in `publication.ts` Sanity schema.

**Rationale**: The GROQ queries in `client.ts` already dereference `person->` in author projections, and the TypeScript `Publication` interface defines `person?: Person` in the authors array type. The schema file is missing this field definition, creating a schema-data inconsistency. The field likely exists in the Sanity Studio already (added via the UI or a prior migration) but was never reflected in the code-level schema file. Adding it ensures consistency and enables the `references()` GROQ function for reverse lookups.

**Alternatives considered**:
- Name-based matching (rejected: fragile, spec explicitly requires reference-based matching via FR-015)
- Separate junction document (rejected: over-engineered for this use case)

### 2. GROQ Reverse Query Strategy

**Decision**: Use Sanity's built-in `references($personId)` function for publication lookups, and explicit `_ref` matching for news lookups.

**Rationale**: `references()` is Sanity's optimized way to find all documents referencing a given document ID. It works across any reference field in the document. For publications, this cleanly finds all publications where any author references the person. For news, we need more specificity (author OR coAuthors OR relatedPeople), so explicit `_ref` matching gives us precise control.

**Alternatives considered**:
- Client-side filtering (rejected: fetches all publications unnecessarily, poor performance)
- Separate index/cache (rejected: over-engineered, Sanity handles this efficiently)

### 3. Publications Page Author Filter

**Decision**: Add `author` query parameter to the existing publications page `searchParams`, filtering by person slug.

**Rationale**: The publications page already accepts `type` and `area` query parameters. Adding `author` follows the established pattern. Using slug (not ID) makes URLs human-readable and shareable. The filter is applied client-side after fetching all publications since the page already fetches all publications for grouping.

**Alternatives considered**:
- Server-side GROQ filter (rejected: would require a separate query path; current architecture fetches all then filters)
- Dedicated per-member publications route (rejected: unnecessary given existing filtering infrastructure)

### 4. Section Placement in Page Layout

**Decision**: Insert publications and news sections in the main content column (lg:col-span-2), after the Biography card and before the Education card.

**Rationale**: Confirmed during clarification. The member page uses a 3-column grid (2 main + 1 sidebar). Research Interests and Biography are in the main column. Placing publications and news here maintains visual hierarchy and keeps the sidebar for static info (Quick Info, Connect).

**Alternatives considered**: N/A — confirmed by user during `/speckit.clarify`.

### 5. Publication Type Filtering

**Decision**: Exclude `abstract` publication type from member pages. Include: `journal-article`, `conference-paper`, `book-chapter`, `preprint`, `thesis`, `report`, `book`, `other`.

**Rationale**: Confirmed during clarification. Abstracts are presentation-level items shown separately on the publications page. Member pages should highlight substantive scholarly output.

**Alternatives considered**: N/A — confirmed by user during `/speckit.clarify`.

### 6. News Matching Scope

**Decision**: Match news articles to members via all three reference fields: `author`, `coAuthors[]`, and `relatedPeople[]`. Treat all equally (no visual differentiation of the relationship type).

**Rationale**: The spec says "where the member is referenced (as author, co-author, or in related people)" (FR-005). Casting a wide net ensures members see all news relevant to them. Differentiating the relationship type would add UI complexity with minimal user value.

**Alternatives considered**:
- Author-only matching (rejected: would miss news featuring the member without authoring)
- Differentiated display by relationship type (rejected: unnecessary complexity)
