# Implementation Plan: People Page Content — News & Publications

**Branch**: `002-people-page-content` | **Date**: 2026-03-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-people-page-content/spec.md`

## Summary

Add "Recent Publications" and "Recent News" sections to individual person profile pages (`/people/[slug]`). Two new GROQ queries will fetch publications authored by a person and news associated with a person, and the person detail page will render these sections after the existing biography/profile content.

## Technical Context

**Language/Version**: TypeScript 5 / React 18.2 / Next.js 14.2 (App Router)
**Primary Dependencies**: `@sanity/client`, `@sanity/image-url`, Tailwind CSS 3.4
**Storage**: Sanity CMS (hosted, GROQ queries)
**Testing**: Manual verification against Sanity content
**Target Platform**: Web (server-rendered Next.js pages)
**Project Type**: Web application (academic research lab website)
**Performance Goals**: Standard web page load times; queries are server-side at build/request time
**Constraints**: No new CMS schema changes; use existing entity relationships
**Scale/Scope**: ~20-50 person pages, each with 0-50 publications and 0-20 news items

## Constitution Check

*No constitution file found. No gate checks required.*

## Project Structure

### Documentation (this feature)

```text
specs/002-people-page-content/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/cms/
│   └── client.ts              # Add 2 new GROQ queries + 2 fetch functions
└── app/people/[slug]/
    └── page.tsx               # Add publications & news sections to person detail
```

**Structure Decision**: All changes are additions to existing files. No new files needed in `src/`. The feature touches exactly 2 source files.
