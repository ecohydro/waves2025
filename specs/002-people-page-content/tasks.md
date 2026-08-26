# Tasks: People Page Content — News & Publications

**Input**: Design documents from `/specs/002-people-page-content/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Not requested — test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Foundational (GROQ Queries & Fetch Functions)

**Purpose**: Add the two new GROQ queries and fetch functions that both user stories depend on.

- [ ] T001 [P] Add `getPublicationsByPerson` GROQ query to the `queries` object in src/lib/cms/client.ts — query filters publications where `$personId in authors[].person._ref` with status in `["published", "in-press", "accepted"]`, ordered by `publishedDate desc`, limited to **6** results (fetch 6 to detect "has more"; display only 5), projecting `_id, title, slug, publicationType, venue { name, shortName }, publishedDate, doi, status`
- [ ] T002 [P] Add `getNewsByPerson` GROQ query to the `queries` object in src/lib/cms/client.ts — query filters news where `author._ref == $personId || $personId in coAuthors[]._ref || $personId in relatedPeople[]._ref` with `status == "published"`, ordered by `publishedAt desc`, limited to 3 results, projecting `_id, title, slug, excerpt, publishedAt, category, featuredImage`
- [ ] T003 Add `fetchPublicationsByPerson(personId: string, preview?: boolean): Promise<Publication[]>` function in src/lib/cms/client.ts — calls `fetchData` with the `getPublicationsByPerson` query passing `{ personId }` as params
- [ ] T004 Add `fetchNewsByPerson(personId: string, preview?: boolean): Promise<News[]>` function in src/lib/cms/client.ts — calls `fetchData` with the `getNewsByPerson` query passing `{ personId }` as params

**Checkpoint**: New queries and fetch functions are available for use by person detail page.

---

## Phase 2: User Story 1 — View a Member's Recent Publications (Priority: P1) 🎯 MVP

**Goal**: Display a "Recent Publications" section on individual person pages showing up to 5 of the member's most recent publications.

**Independent Test**: Navigate to a person page for a member with known publications and verify the section appears with correct entries; navigate to a person page for a member with no publications and verify no section appears.

### Implementation for User Story 1

- [ ] T005 [US1] Import `fetchPublicationsByPerson` and `Publication` type in src/app/people/[slug]/page.tsx
- [ ] T006 [US1] After fetching the person, call `fetchPublicationsByPerson(person._id, isPreview)` to get recent publications in src/app/people/[slug]/page.tsx
- [ ] T007 [US1] Add a "Recent Publications" `<Card>` section after the Education card in the main content column (`lg:col-span-2` div) of src/app/people/[slug]/page.tsx — conditionally rendered only when publications array is non-empty; each entry displays title (linked to `/publications/${slug.current}`), publication year (extracted from `publishedDate`), and venue name (fallback to publication type if venue is absent); display only the first 5 results; if 6 results were returned, show a "View all publications" link to `/publications`

**Checkpoint**: Person pages with publications show the "Recent Publications" section; person pages without publications show nothing extra.

---

## Phase 3: User Story 2 — View a Member's Recent News (Priority: P2)

**Goal**: Display a "Recent News" section on individual person pages showing up to 3 of the member's most recent news items.

**Independent Test**: Navigate to a person page for a member associated with news items and verify the section appears; navigate to a person page with no associated news and verify no section appears.

### Implementation for User Story 2

- [ ] T008 [US2] Import `fetchNewsByPerson` and `News` type in src/app/people/[slug]/page.tsx
- [ ] T009 [US2] Fetch news in parallel with publications using `Promise.all([fetchPublicationsByPerson(...), fetchNewsByPerson(...)])` in src/app/people/[slug]/page.tsx (refactor the publication fetch from T006 to use Promise.all)
- [ ] T010 [US2] Add a "Recent News" `<Card>` section after the "Recent Publications" section in the main content column of src/app/people/[slug]/page.tsx — conditionally rendered only when news array is non-empty; each entry displays title (linked to `/news/${slug.current}`), formatted publication date, and category badge

**Checkpoint**: Person pages show both publications and news sections (when data exists), or either one alone, or neither — all correctly based on available data.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup.

- [ ] T011 Verify dark mode styling on both new sections in src/app/people/[slug]/page.tsx — ensure text colors use `dark:` variants consistent with existing cards on the page
- [ ] T012 Run quickstart.md verification scenarios: check a member with publications, a member without, a member with news, a member without, an **alumni** member, and verify links navigate correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — can start immediately
- **User Story 1 (Phase 2)**: Depends on T001 and T003 (publications query + fetch function)
- **User Story 2 (Phase 3)**: Depends on T002 and T004 (news query + fetch function); T009 also refactors T006
- **Polish (Phase 4)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after T001 + T003 are complete
- **User Story 2 (P2)**: Can start after T002 + T004 are complete; T009 integrates with US1's fetch call

### Parallel Opportunities

- T001 and T002 can run in parallel (same file but different keys in the `queries` object — no overlap)
- T003 and T004 can run in parallel (different functions, no overlap)
- US1 and US2 implementation could partially overlap but T009 refactors T006, so sequential is cleaner

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: T001 + T003 (publications query infrastructure)
2. Complete Phase 2: T005 → T006 → T007 (publications section on person page)
3. **STOP and VALIDATE**: Test with real person pages
4. Deploy if ready — publications section delivers primary value

### Incremental Delivery

1. Phase 1: All queries + fetch functions (T001–T004)
2. Phase 2: User Story 1 — publications section (T005–T007) → Validate → Deploy
3. Phase 3: User Story 2 — news section (T008–T010) → Validate → Deploy
4. Phase 4: Polish (T011–T012) → Final validation

---

## Notes

- All changes are in 2 existing files: `src/lib/cms/client.ts` and `src/app/people/[slug]/page.tsx`
- No new files, no new dependencies, no CMS schema changes
- GROQ queries handle all filtering and limiting server-side
- The "View all publications" link goes to `/publications` (no author filter param currently supported)
- Commit after each phase checkpoint
