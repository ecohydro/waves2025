# Quickstart: People Page Content — News & Publications

**Date**: 2026-03-13

## Overview

Add two new sections to individual person pages showing their recent publications and news.

## Files to Modify

1. **`src/lib/cms/client.ts`** — Add 2 GROQ queries and 2 fetch functions
2. **`src/app/people/[slug]/page.tsx`** — Import new fetch functions, call them, render sections

## Implementation Steps

### Step 1: Add GROQ Queries (client.ts)

Add `getPublicationsByPerson` and `getNewsByPerson` queries to the `queries` object. Add corresponding `fetchPublicationsByPerson(personId, preview)` and `fetchNewsByPerson(personId, preview)` async functions.

### Step 2: Update Person Detail Page (page.tsx)

1. Import the two new fetch functions
2. After fetching the person, fetch their publications and news in parallel using `Promise.all`
3. After the Education card (end of main content column), conditionally render:
   - "Recent Publications" card if publications array is non-empty
   - "Recent News" card if news array is non-empty
4. Each entry links to its detail page

### Verification

- Visit a person page for a member with known publications → publications section appears
- Visit a person page for a member with no publications → no publications section
- Visit a person page for a member with news → news section appears
- Click a publication/news link → navigates to correct detail page
