# Tasks: Fix Social Links Hostnames

**Input**: Design documents from `/specs/004-fix-social-links/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: Included — the plan specifies test-first approach with unit tests for normalization logic and integration test assertions.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure project dependencies and test infrastructure are ready

- [x] T001 Verify Sanity credentials in `.env.local` — confirm `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, and `SANITY_API_EDITOR_TOKEN` are set
- [x] T002 Create `tests/unit/` directory if it does not exist

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extract and test the shared waveslab.org detection and slug extraction logic that US2, US3, and US4 all depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Write unit tests for waveslab.org hostname detection and slug extraction in `tests/unit/social-link-normalization.test.ts` — cover all 6 platforms, waveslab.org URLs, bare slugs, correct URLs, empty values, and `/people/` path prefix stripping
- [x] T004 [P] Extract a shared `isWaveslabUrl(value)` helper function and a `extractSlugFromWaveslabUrl(value)` function — added to `scripts/social-link-utils.ts` (shared utility module). `isWaveslabUrl` returns true if hostname is `waveslab.org` or `www.waveslab.org`. `extractSlugFromWaveslabUrl` strips `/people/`, `/members/`, and leading `/` to return the bare slug
- [x] T005 Add a `rebuildPlatformUrl(fieldName, slug)` function to `scripts/social-link-utils.ts` that maps field name to correct platform URL pattern: `linkedin` → `https://www.linkedin.com/in/{slug}`, `github` → `https://github.com/{slug}`, `twitter` → `https://twitter.com/{slug}`, `researchGate` → `https://www.researchgate.net/profile/{slug}`, `googleScholar` → `https://scholar.google.com/citations?user={slug}`
- [x] T006 Run unit tests to confirm T003 tests fail, then verify T004+T005 implementations make them pass: `npx vitest run tests/unit/social-link-normalization.test.ts` — 30/30 tests pass

**Checkpoint**: Shared normalization logic is tested and working

---

## Phase 3: User Story 2 — Audit All Member Social Links (Priority: P1) 🎯 MVP

**Goal**: Create an audit script that scans all person documents in Sanity and reports which social links have incorrect hostnames

**Independent Test**: Run `npx tsx scripts/audit-social-links.ts` and verify it produces a table listing every social link with its classification (correct/broken-hostname/bare-slug/empty)

- [x] T007 [US2] Create `scripts/audit-social-links.ts` — set up Sanity client (reuse pattern from `scripts/fix-person-social-urls.ts`), fetch all person documents (published + drafts) via GROQ query `*[_type == "person"]{_id, name, socialMedia}`
- [x] T008 [US2] Add classification logic to `scripts/audit-social-links.ts` — for each person's social link field, classify as: `correct` (hostname matches expected platform per data-model.md table), `broken-hostname` (contains waveslab.org or other non-platform domain), `bare-slug` (no hostname), or `empty` (null/undefined/blank)
- [x] T009 [US2] Add report output to `scripts/audit-social-links.ts` — print a table to stdout with columns: Name, Field, Current Value, Status, Suggested Fix. Support `--json` flag for machine-readable output. Print summary counts at the end (total links, correct, broken, bare, empty)
- [x] T010 [US2] Run the audit script against live Sanity data — FINDING: 0 broken-hostname, 21 bare-slug, 7 correct, 428 empty. Root cause is bare slugs (not waveslab.org URLs) being resolved as relative URLs by the browser. Existing fix script already handles normalization.

**Checkpoint**: Audit script works and we know exactly which links are broken

---

## Phase 4: User Story 3 + User Story 1 — Batch Correct & Verify Social Links (Priority: P1)

**Goal**: Extend the existing fix script to detect and correct waveslab.org hostnames, then apply fixes so all social links navigate to the correct platforms

**Independent Test**: Run `npx tsx scripts/fix-person-social-urls.ts` (dry-run), then `--yes` to apply, then re-run audit script to confirm zero broken links. Visit member pages in browser to verify links work.

- [x] T011 [US3] Add `detectAndFixWaveslabUrl(fieldName, value)` function to `scripts/social-link-utils.ts` — calls `isWaveslabUrl()`, then `extractSlugFromWaveslabUrl()`, then `rebuildPlatformUrl()`. Returns the corrected URL or undefined if value is not a waveslab.org URL
- [x] T012 [US3] Integrate `detectAndFixWaveslabUrl` into the existing `computeUpdates()` function in `scripts/fix-person-social-urls.ts` — pre-normalization step that checks for waveslab.org URLs before standard normalization
- [x] T013 [US3] Run fix script in dry-run mode and review proposed changes — 11 documents, 21 fields to update (all bare-slug → full URL)
- [x] T014 [US1] Applied fixes with --yes — re-ran audit: 28 correct, 0 broken, 0 bare-slug. All social links verified correct.
- [ ] T015 [US1] Start dev server with `npm run dev` and manually verify social links on at least 3 member profile pages — click each social link and confirm it navigates to the correct external platform (LinkedIn, GitHub, etc.)

**Checkpoint**: All social links in Sanity have correct hostnames and member page links work in the browser

---

## Phase 5: User Story 4 — Prevent Future Incorrect Social Links (Priority: P2)

**Goal**: Add Sanity schema validation to reject waveslab.org hostnames at data entry time

**Independent Test**: Open Sanity Studio, edit a person's LinkedIn field to a waveslab.org URL, and verify a validation error appears

- [x] T016 [P] [US4] Add custom validation to URL-type social media fields in `src/sanity/schemaTypes/person.ts` — for `linkedin`, `researchGate`, and `googleScholar` fields, chain a `.custom()` validation that rejects values containing `waveslab.org`
- [x] T017 [P] [US4] Add custom validation to string-type social media fields in `src/sanity/schemaTypes/person.ts` — for `twitter` and `github` fields, add `.custom()` validation that rejects values containing `waveslab.org`
- [x] T018 [P] [US4] Add matching validation rules to `src/lib/cms/schemas/person.ts` — mirrored waveslab.org rejection validation, chained onto existing URI scheme checks
- [ ] T019 [US4] Verify schema validation works — start dev server, open Sanity Studio, attempt to enter `https://waveslab.org/people/test` in a LinkedIn field, confirm validation error appears

**Checkpoint**: Sanity Studio prevents editors from saving waveslab.org URLs in social link fields

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Integration tests and final verification

- [x] T020 [P] Add social link hostname assertions to `tests/integration/sanity-data-validation.test.ts` — added 2 test cases: no waveslab.org URLs, correct platform hostnames for URL fields
- [x] T021 Run full test suite to verify no regressions: `npm test` — 97/97 tests pass across 12 files
- [x] T022 Run quickstart.md validation — audit → dry-run → apply → re-audit workflow verified end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US2 Audit (Phase 3)**: Depends on Foundational — can start after Phase 2
- **US3+US1 Fix & Verify (Phase 4)**: Depends on Phase 3 (need audit results to understand scope)
- **US4 Prevention (Phase 5)**: Depends on Foundational — can run in parallel with Phase 3/4
- **Polish (Phase 6)**: Depends on Phase 4 completion (data must be fixed before integration tests pass)

### User Story Dependencies

- **User Story 2 (Audit)**: Can start after Foundational — no dependencies on other stories
- **User Story 3 (Fix)**: Depends on US2 audit to understand scope, but code can be written in parallel
- **User Story 1 (Verify)**: Depends on US3 fix being applied — verification only
- **User Story 4 (Prevent)**: Independent of US1/2/3 — can be implemented in parallel after Foundational

### Within Each User Story

- Shared logic (Phase 2) before story-specific code
- Tests written first, must fail before implementation
- Dry-run before applying changes
- Verify in browser after applying

### Parallel Opportunities

- T003 and T004 can run in parallel (test file vs implementation file)
- T016, T017, T018 can all run in parallel (different files, independent validation rules)
- T020 can run in parallel with Phase 5 tasks (different files)
- US4 (Phase 5) can be started while waiting for Phase 4 dry-run review

---

## Parallel Example: Foundational Phase

```bash
# Launch unit tests and implementation in parallel:
Task: "Write unit tests in tests/unit/social-link-normalization.test.ts"
Task: "Extract isWaveslabUrl and extractSlugFromWaveslabUrl in scripts/fix-person-social-urls.ts"
```

## Parallel Example: User Story 4

```bash
# Launch all schema validation tasks in parallel:
Task: "Add validation to URL fields in src/sanity/schemaTypes/person.ts"
Task: "Add validation to string fields in src/sanity/schemaTypes/person.ts"
Task: "Add validation to src/lib/cms/schemas/person.ts"
```

---

## Implementation Strategy

### MVP First (User Story 2 — Audit Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (shared logic + tests)
3. Complete Phase 3: User Story 2 (Audit)
4. **STOP and VALIDATE**: Run audit, understand the scope of broken links
5. Share audit results before proceeding with fixes

### Full Fix (User Stories 1 + 2 + 3)

1. Complete Phases 1–3 (Setup → Foundation → Audit)
2. Complete Phase 4: Fix & Verify (US3 + US1)
3. **STOP and VALIDATE**: All links work in browser
4. Deploy if ready

### Complete (All Stories + Prevention)

1. Complete Phases 1–4 (everything above)
2. Complete Phase 5: US4 (Schema validation)
3. Complete Phase 6: Polish (integration tests, final check)
4. Full deployment

---

## Notes

- The existing `scripts/fix-person-social-urls.ts` already handles Sanity client setup, draft documents, dry-run mode, and batch transactions — extend it rather than rewriting
- ORCID field stores bare IDs, not URLs — the waveslab.org issue should not affect ORCID (but the audit will confirm)
- The `website` field on person documents is explicitly OUT OF SCOPE — it may legitimately point to waveslab.org
- Always run dry-run mode first and review output before applying changes with `--yes`
