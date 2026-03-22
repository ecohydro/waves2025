# Implementation Plan: Member Publications & News

**Branch**: `003-member-publications-news` | **Date**: 2026-03-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-member-publications-news/spec.md`

## Summary

Add "Recent Publications" and "Recent News" sections to individual member detail pages (`/people/[slug]`). Publications are fetched via a reverse query (publications where author references the person), and news via author/coAuthors/relatedPeople references. Both sections appear after the biography card, before education, in the existing 2-column main content area. The publications page gains author-based query parameter filtering for "View all" links.

## Technical Context

**Language/Version**: TypeScript 5 / React 18.2 / Next.js 14.2 (App Router)
**Primary Dependencies**: `@sanity/client`, `@sanity/image-url`, Tailwind CSS 3.4
**Storage**: Sanity CMS (hosted, GROQ queries)
**Testing**: Manual verification against CMS data; existing `npm test && npm run lint`
**Target Platform**: Web (SSR/SSG via Next.js)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Member page loads in under 2 seconds including new sections
**Constraints**: No new npm dependencies; reuse existing UI components (Card, CardContent, Button)
**Scale/Scope**: ~20-50 member pages, ~100-200 publications, ~50 news articles

## Constitution Check

*No constitution file found. Proceeding without gate checks.*

## Project Structure

### Documentation (this feature)

```text
specs/003-member-publications-news/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── people/
│   │   └── [slug]/
│   │       └── page.tsx          # MODIFY: Add publications & news sections
│   ├── publications/
│   │   └── page.tsx              # MODIFY: Add author query param filtering
│   └── news/
│       └── page.tsx              # MODIFY: Add person query param filtering
├── lib/
│   └── cms/
│       └── client.ts             # MODIFY: Add new GROQ queries & fetch functions
├── sanity/
│   └── schemaTypes/
│       └── publication.ts        # MODIFY: Add person reference to authors array
└── components/
    └── people/                   # NEW: Member-specific components (optional)
```

**Structure Decision**: All changes fit within the existing Next.js App Router structure. New GROQ queries and fetch functions are added to the existing CMS client. The member detail page is extended inline. No new routes are needed.

## Key Implementation Details

### 1. Sanity Schema Fix (Critical)

The `publication.ts` schema's `authors` array currently only defines `name` and `isCorresponding` fields. However, the GROQ queries in `client.ts` already dereference `person->`, and the TypeScript `Publication` interface includes `person?: Person`. The schema must be updated to add a `person` reference field to the authors array member to ensure schema-data consistency and enable the reverse query this feature needs.

### 2. New GROQ Queries

Two new queries are needed in `client.ts`:

**Publications by person** (reverse query):
```groq
*[_type == "publication"
  && publicationType != "abstract"
  && references($personId)
] | order(publishedDate desc)[0...6] {
  _id, title, slug, publicationType,
  authors[] { person-> { _id, name, slug }, name, isCorresponding },
  venue { name, shortName },
  publishedDate, doi
}
```
Uses `references($personId)` for efficient reverse lookup. Fetches 6 to know if "View all" link is needed (display 5, check for 6th).

**News by person** (reverse query):
```groq
*[_type == "news"
  && status == "published"
  && (author._ref == $personId
      || $personId in coAuthors[]._ref
      || $personId in relatedPeople[]._ref)
] | order(publishedAt desc)[0...4] {
  _id, title, slug, excerpt, featuredImage, publishedAt, category
}
```
Fetches 4 to know if "View all" link is needed (display 3, check for 4th).

### 3. Member Page Layout Changes

Current main content order: Research Interests → Biography → Education

New order: Research Interests → Biography → **Recent Publications** → **Recent News** → Education

Both new sections use the existing `Card` / `CardContent` components for visual consistency.

### 4. Publications Page Author Filtering

Add `author` to the existing `searchParams` type. When present, filter `allPublications` to those where any `authors[].person?._id` matches the person ID or `authors[].person?.slug.current` matches the author param. The "View all" link from member pages will use: `/publications?author=person-slug`.

### 4b. News Page Person Filtering

Add `person` to the news page `searchParams` (currently accepts none). When present, filter `sortedNews` to articles where the `author`, any `coAuthors[]`, or any `relatedPeople[]` slug matches the param. The existing `getAllNews` GROQ query projection needs to include `author->{ slug }`, `coAuthors[]->{ slug }`, and `relatedPeople[]->{ slug }` for client-side matching. The "View all news" link from member pages will use: `/news?person=person-slug`.

### 5. Author Highlighting

In the publications list on member pages, the current member's name is rendered with `font-bold` while other authors use normal weight. Matching is done by comparing `author.person?._id` against the current person's `_id`.

## Complexity Tracking

No constitution violations to justify.
