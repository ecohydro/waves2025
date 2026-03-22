# Tasks: Member Publications & News

**Input**: Design documents from `/specs/003-member-publications-news/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Schema Fix)

**Purpose**: Fix publication schema to enable person-based queries

- [x] T001 Add `person` reference field to authors array member in `src/sanity/schemaTypes/publication.ts` — add a `person` field of type `reference` to `[{ type: 'person' }]` alongside existing `name` and `isCorresponding` fields

**Checkpoint**: Publication schema now includes person reference in authors array, matching existing GROQ queries and TypeScript types.

---

## Phase 2: Foundational (GROQ Queries & Fetch Functions)

**Purpose**: Add CMS query infrastructure that all user stories depend on

- [x] T002 Add `getPublicationsByPerson` GROQ query to `queries` object in `src/lib/cms/client.ts` — reverse lookup using `references($personId)`, filtering out `publicationType == "abstract"`, ordered by `publishedDate desc`, limited to 6 results, projecting `_id`, `title`, `slug`, `publicationType`, `authors[]` (with `person->` dereference), `venue { name, shortName }`, `publishedDate`, `doi`
- [x] T003 Add `fetchPublicationsByPerson(personId: string, preview?: boolean)` function in `src/lib/cms/client.ts` — calls `fetchData` with the new query, passing `{ personId }` as params, returns `Publication[]`
- [x] T004 Add `getNewsByPerson` GROQ query to `queries` object in `src/lib/cms/client.ts` — matches `author._ref == $personId` OR `$personId in coAuthors[]._ref` OR `$personId in relatedPeople[]._ref`, filtering `status == "published"`, ordered by `publishedAt desc`, limited to 4 results, projecting `_id`, `title`, `slug`, `excerpt`, `featuredImage`, `publishedAt`, `category`
- [x] T005 Add `fetchNewsByPerson(personId: string, preview?: boolean)` function in `src/lib/cms/client.ts` — calls `fetchData` with the new query, passing `{ personId }` as params, returns `News[]`

**Checkpoint**: Two new fetch functions available for use by member detail page. Foundation ready for user story implementation.

---

## Phase 3: User Story 1 - View Member's Recent Publications (Priority: P1) 🎯 MVP

**Goal**: Display up to 5 recent publications on individual member pages, with author highlighting and "View all" link.

**Independent Test**: Navigate to a member page for someone with known publications. Verify publications appear in reverse chronological order, the member's name is bolded in author lists, titles link to publication detail pages, and "View all" link appears if >5 publications exist. Navigate to a member with no publications and verify no publications section appears.

### Implementation for User Story 1

- [x] T006 [US1] In `src/app/people/[slug]/page.tsx`, import `fetchPublicationsByPerson` and `type Publication` from `@/lib/cms/client`
- [x] T007 [US1] In `src/app/people/[slug]/page.tsx`, add a `fetchPublicationsByPerson(person._id, isPreview)` call alongside the existing person fetch (use `Promise.all` or sequential after person is resolved) and store result as `publications`
- [x] T008 [US1] In `src/app/people/[slug]/page.tsx`, add a "Recent Publications" `Card`/`CardContent` section after the Biography card and before the Education card in the main content column (`lg:col-span-2`). Conditionally render only when `publications.length > 0` (FR-009). Section heading: "Recent Publications" styled with `text-2xl font-bold`
- [x] T009 [US1] In the publications section of `src/app/people/[slug]/page.tsx`, render up to 5 publications as a list. Each entry displays: title as a `Link` to `/publications/${pub.slug.current}` (FR-003), author list with the current member's name in `font-bold` matched by `author.person?._id === person._id` (FR-004), venue name from `pub.venue?.name`, and publication year extracted from `publishedDate` (FR-002)
- [x] T010 [US1] In the publications section of `src/app/people/[slug]/page.tsx`, conditionally render a "View all publications" link when `publications.length > 5` that navigates to `/publications?author=${person.slug.current}` (FR-011). Style as a text link with `text-wavesBlue hover:text-blue-800`
- [x] T011 [US1] Add `author` to the `searchParams` type in `src/app/publications/page.tsx` and implement client-side filtering: when `searchParams?.author` is present, filter `filteredPublications` to only those where any `authors[].person?.slug?.current` matches the author param value

**Checkpoint**: User Story 1 complete. Member pages show recent publications with author highlighting. "View all" links to filtered publications page.

---

## Phase 4: User Story 2 - View Member's Recent News (Priority: P2)

**Goal**: Display up to 3 recent news articles on individual member pages, with thumbnails and "View all" link.

**Independent Test**: Navigate to a member page for someone referenced in published news articles. Verify news items appear with title, date, category, excerpt, and thumbnail (if image exists). Verify draft/archived news is excluded. Navigate to a member with no news and verify no news section appears.

### Implementation for User Story 2

- [x] T012 [US2] In `src/app/people/[slug]/page.tsx`, import `fetchNewsByPerson` and add the fetch call (can be added to existing `Promise.all` from T007), store result as `newsItems`
- [x] T013 [US2] In `src/app/people/[slug]/page.tsx`, add a "Recent News" `Card`/`CardContent` section after the publications section and before the Education card. Conditionally render only when `newsItems.length > 0` (FR-010). Section heading: "Recent News" styled with `text-2xl font-bold`
- [x] T014 [US2] In the news section of `src/app/people/[slug]/page.tsx`, render up to 3 news items. Each entry displays: featured image thumbnail using `urlForImage` if `featuredImage` exists (FR-008), title as a `Link` to `/news/${news.slug.current}` (FR-007), formatted publication date from `publishedAt`, category badge, and truncated excerpt (FR-006)
- [x] T015 [US2] In the news section of `src/app/people/[slug]/page.tsx`, conditionally render a "View all news" link when `newsItems.length > 3` that navigates to `/news?person=${person.slug.current}` (FR-012). Style consistent with publications "View all" link
- [x] T016 [US2] Add `person` to the `searchParams` type in `src/app/news/page.tsx` (currently accepts no params — add `searchParams?: { person?: string }` to the component props). When `searchParams?.person` is present, filter `sortedNews` to only articles where `author?.slug?.current`, any `coAuthors[]?.slug?.current`, or any `relatedPeople[]?.slug?.current` matches the param value. Update the `fetchNews` GROQ query projection to include `author->{ slug }`, `coAuthors[]->{ slug }`, and `relatedPeople[]->{ slug }` if not already present

**Checkpoint**: User Story 2 complete. Member pages show recent news with thumbnails. "View all news" links to filtered news page. Both publications and news sections now appear together.

---

## Phase 5: User Story 3 - Alumni Publications & News (Priority: P3)

**Goal**: Verify alumni member pages display publications and news identically to current members.

**Independent Test**: Navigate to an alumni member's page with known publications and/or news. Verify the display is identical to a current member's page.

### Implementation for User Story 3

- [x] T017 [US3] Verify in `src/app/people/[slug]/page.tsx` that the publications and news fetch calls use `person._id` without any `userGroup` filter, ensuring alumni pages fetch and display data identically to current members (FR-014). No code change expected — this task confirms the implementation from US1/US2 works for alumni without modification
- [x] T018 [US3] Verify in the GROQ queries (`getPublicationsByPerson` and `getNewsByPerson` in `src/lib/cms/client.ts`) that there is no filtering by person `userGroup` or `isActive` status, confirming alumni data is included. No code change expected

**Checkpoint**: All user stories complete. Publications and news appear on both current member and alumni pages identically.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Edge case handling and validation

- [x] T019 In `src/app/people/[slug]/page.tsx`, wrap the publications and news fetch calls in try/catch blocks for graceful degradation — if either fetch fails, render the page without that section rather than failing the entire page (edge case: CMS unavailable)
- [x] T020 Run `npm run lint` and fix any linting errors introduced by the new code
- [x] T021 Run quickstart.md verification checklist: test member with publications, member with news, member with both, member with neither, alumni member, "View all" links, and publication detail page links

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (schema must be updated before queries reference it)
- **Phase 3 (US1)**: Depends on Phase 2 (needs fetch functions)
- **Phase 4 (US2)**: Depends on Phase 2 (needs fetch functions). Can run in parallel with Phase 3
- **Phase 5 (US3)**: Depends on Phase 3 and Phase 4 (verification of existing implementation)
- **Phase 6 (Polish)**: Depends on Phase 3 and Phase 4

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2. No dependencies on other stories
- **US2 (P2)**: Can start after Phase 2. No dependencies on US1 (different section). Can run in parallel with US1
- **US3 (P3)**: Depends on US1 and US2 completion (verification only, no new code)

### Within Each User Story

- Imports before data fetching
- Data fetching before rendering
- Core rendering before "View all" links
- Member page changes before publications page changes (US1 only)

### Parallel Opportunities

- T002 and T004 (GROQ queries) touch different query definitions but same file — execute sequentially
- T006-T010 (US1 member page) and T011 (US1 publications page) modify different files — T011 can start after T010
- Phase 3 (US1) and Phase 4 (US2) can run in parallel since they modify different sections of the same file — but sequential is safer to avoid merge conflicts

---

## Parallel Example: User Story 1 + User Story 2

```text
# After Phase 2 completes, these can conceptually start together:
# However, since both modify src/app/people/[slug]/page.tsx,
# sequential execution (US1 then US2) is recommended to avoid conflicts.

# Within US1, T011 can start independently once T010 is done:
Sequential: T006 → T007 → T008 → T009 → T010
Parallel:   T011 (different file: publications/page.tsx)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Schema fix (T001)
2. Complete Phase 2: Foundational queries (T002-T005)
3. Complete Phase 3: Publications on member pages (T006-T011)
4. **STOP and VALIDATE**: Test with known members who have publications
5. Deploy if ready — publications section delivers primary value

### Incremental Delivery

1. Phase 1 + Phase 2 → Query infrastructure ready
2. Add US1 (publications) → Test → Deploy (MVP!)
3. Add US2 (news) → Test → Deploy
4. Verify US3 (alumni) → Confirm no changes needed
5. Polish → Error handling, lint, final verification

---

## Notes

- Total tasks: 21
- US1 tasks: 6 (T006-T011)
- US2 tasks: 5 (T012-T016)
- US3 tasks: 2 (T017-T018, verification only)
- Setup + Foundational: 5 (T001-T005)
- Polish: 3 (T019-T021)
- All modifications touch only 5 existing files — no new files needed
- US3 requires no new code — it verifies that US1/US2 implementation works for alumni
