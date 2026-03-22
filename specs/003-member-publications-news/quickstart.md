# Quickstart: Member Publications & News

**Feature**: 003-member-publications-news
**Branch**: `003-member-publications-news`

## Prerequisites

- Node.js and npm installed
- Sanity environment variables configured (`.env.local`)
- Access to Sanity Studio for CMS data verification

## Setup

```bash
git checkout 003-member-publications-news
npm install
npm run dev
```

## Implementation Order

### Step 1: Update Sanity Publication Schema
**File**: `src/sanity/schemaTypes/publication.ts`

Add `person` reference field to the `authors` array member. This ensures schema-data consistency — the GROQ queries and TypeScript types already expect this field.

### Step 2: Add GROQ Queries & Fetch Functions
**File**: `src/lib/cms/client.ts`

Add two new queries:
- `getPublicationsByPerson` — reverse lookup using `references($personId)`
- `getNewsByPerson` — match against author, coAuthors, and relatedPeople refs

Add corresponding fetch functions:
- `fetchPublicationsByPerson(personId, preview)`
- `fetchNewsByPerson(personId, preview)`

### Step 3: Add Sections to Member Detail Page
**File**: `src/app/people/[slug]/page.tsx`

- Import new fetch functions
- Fetch publications and news in parallel with existing person fetch
- Insert "Recent Publications" card after Biography, before Education
- Insert "Recent News" card after Publications, before Education
- Conditionally render each section only when data exists

### Step 4: Add Author Filtering to Publications Page
**File**: `src/app/publications/page.tsx`

- Add `author` to `searchParams` type
- Filter publications by `authors[].person?.slug.current` when param present
- Show active filter indicator and clear button

## Verification

1. Navigate to a member page with known publications → publications section appears
2. Navigate to a member page with known news → news section appears
3. Navigate to a member page with no publications or news → no empty sections
4. Click "View all publications" → publications page filtered to that author
5. Click "View all news" → news page filtered to that member
6. Click publication title → navigates to publication detail page
7. Click news title → navigates to news detail page

## Key Files

| File | Action | Purpose |
|------|--------|---------|
| `src/sanity/schemaTypes/publication.ts` | Modify | Add person reference to authors |
| `src/lib/cms/client.ts` | Modify | Add 2 queries + 2 fetch functions |
| `src/app/people/[slug]/page.tsx` | Modify | Add publications & news sections |
| `src/app/publications/page.tsx` | Modify | Add author query param filtering |
| `src/app/news/page.tsx` | Modify | Add person query param filtering |
