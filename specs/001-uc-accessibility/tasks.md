# Tasks: UC Accessibility Compliance

**Input**: Design documents from `/specs/001-uc-accessibility/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested. Test tasks omitted. Automated linting and CI accessibility checks are part of the feature itself (FR-011) and included as implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and configure tooling that all user stories depend on

- [x] T001 Install `eslint-plugin-jsx-a11y` and `vitest-axe` as dev dependencies via `npm install --save-dev eslint-plugin-jsx-a11y vitest-axe`
- [x] T002 Add `plugin:jsx-a11y/recommended` to extends array and re-enable `@next/next/no-img-element` rule in `.eslintrc.json`
- [x] T003 Add `.sr-only` utility class and `@media (prefers-reduced-motion: reduce)` rule (disable all transitions/animations, disable smooth scrolling) in `src/app/globals.css`
- [x] T004 Add skip-to-main-content link as first child of `<body>` (visually hidden until focused) and wrap page children in `<main id="main-content">` in `src/app/layout.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Semantic structure and landmark fixes that all user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Ensure Footer component uses semantic `<footer>` element (or add `role="contentinfo"`) and verify accessibility statement link exists in `src/components/layout/Footer.tsx`
- [x] T006 Verify Navigation component has `aria-label="Main navigation"` on the `<nav>` element in `src/components/layout/Navigation.tsx`
- [x] T007 Run `npm run lint` and fix all new `jsx-a11y` violations across the codebase (iterative — fix files flagged by linter)

**Checkpoint**: Foundation ready — semantic landmarks in place, linting active, skip link functional. User story implementation can now begin.

---

## Phase 3: User Story 1 — Keyboard-Only Navigation (Priority: P1) MVP

**Goal**: Every interactive element on every page is reachable and operable via keyboard alone, with visible focus indicators and no focus traps.

**Independent Test**: Tab through all pages using only keyboard (Tab, Shift+Tab, Enter, Escape). Verify skip link appears on first Tab, focus indicators are visible, mobile menu closes on Escape with focus restored, and no focus traps exist.

### Implementation for User Story 1

- [x] T008 [US1] Style the skip-to-main link in `src/app/globals.css` so it is visually hidden by default and becomes visible with clear styling when focused (high-contrast background, positioned at top of viewport)
- [x] T009 [US1] Audit focus indicator visibility across all interactive elements (links, buttons, cards) and ensure the existing `*:focus` outline in `src/app/globals.css` meets 3:1 contrast ratio against all backgrounds; add `:focus-visible` variant to avoid showing outlines on mouse click
- [x] T010 [P] [US1] Audit `src/components/ui/Card.tsx` for keyboard operability — if cards are clickable, ensure they are focusable and operable via Enter key
- [x] T011 [P] [US1] Audit `src/components/ui/Button.tsx` for visible focus indicators and keyboard operability in `src/components/ui/Button.tsx`
- [x] T012 [US1] Verify tab order follows logical reading sequence across all page routes by navigating each route (`/`, `/news`, `/people`, `/publications`, `/research`, `/contact`, `/accessibility`) and documenting any tab order issues; fix any that use positive `tabIndex`

**Checkpoint**: Keyboard-only navigation works across all pages. Skip link functional, focus visible, no traps.

---

## Phase 4: User Story 2 — Screen Reader Comprehension (Priority: P1)

**Goal**: Screen reader users can understand page structure, navigate by headings, hear meaningful image descriptions, and interact with modal dialogs properly.

**Independent Test**: Navigate site with VoiceOver (macOS). Verify headings list shows logical hierarchy on every page, images are announced with alt text, modal announces as dialog with title, and navigation landmark is labeled.

### Implementation for User Story 2

- [x] T013 [P] [US2] Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (pointing to modal title id), `aria-describedby` (pointing to modal content if applicable), and implement keyboard focus trap (reuse pattern from Navigation.tsx lines 108-139) with focus restoration on close in `src/components/ui/Modal.tsx`
- [x] T014 [P] [US2] Audit and fix heading hierarchy across all page routes — ensure each page has exactly one `h1`, headings don't skip levels (h1→h3), and headings accurately describe sections. Check files: `src/app/page.tsx`, `src/app/news/page.tsx`, `src/app/news/[slug]/page.tsx`, `src/app/people/page.tsx`, `src/app/publications/page.tsx`, `src/app/research/page.tsx`, `src/app/contact/page.tsx`
- [x] T015 [P] [US2] Audit all image alt text in page components — verify CMS images use `alt={item.featuredImage.alt}` (not fallback to title), and static images have meaningful alt text. Check: `src/app/page.tsx`, `src/app/news/page.tsx`, `src/app/news/[slug]/page.tsx`, `src/app/people/page.tsx`
- [x] T016 [US2] Add `aria-live="polite"` regions for dynamic content: loading states, search results updates, form submission feedback. Audit components that show loading spinners or status messages across `src/components/`

**Checkpoint**: Screen reader announces logical heading structure, meaningful image descriptions, proper dialog behavior, and dynamic content updates.

---

## Phase 5: User Story 3 — Color Contrast and Visual Clarity (Priority: P2)

**Goal**: All text and interactive elements meet WCAG 2.1 AA contrast ratios. Information is not conveyed by color alone.

**Independent Test**: Run automated contrast checker against all pages. Verify 4.5:1 ratio for normal text, 3:1 for large text, and 3:1 for interactive element boundaries. Check that active navigation state has a non-color indicator.

### Implementation for User Story 3

- [x] T017 [P] [US3] Audit color contrast of all text colors against their backgrounds in `src/app/globals.css` and `tailwind.config.js` theme colors; document any failing pairs and fix by adjusting color values while preserving visual design intent
- [x] T018 [P] [US3] Audit interactive element contrast — verify button borders/backgrounds, link colors (default, hover, visited), and form input borders meet 3:1 against adjacent colors in `src/components/ui/Button.tsx`, `src/components/ui/Input.tsx`, and `src/app/globals.css`
- [x] T019 [US3] Verify that color is not the sole indicator for active/selected states — check navigation active state has underline or weight in addition to color change in `src/components/layout/Navigation.tsx`; check any other color-only indicators across components
- [x] T019a [US3] Audit all pages at 200% browser zoom — verify no horizontal scrolling is required and all content remains readable and functional; fix any overflow, truncation, or layout breakage in affected component/page CSS

**Checkpoint**: All text and interactive elements pass WCAG AA contrast requirements. No information conveyed by color alone.

---

## Phase 6: User Story 4 — Accessible Forms and Contact (Priority: P2)

**Goal**: All form inputs have programmatic labels, error messages are associated with fields, and form status is announced to screen readers.

**Independent Test**: Complete the contact form using only a screen reader and keyboard. Verify labels are announced on focus, required fields indicated, errors associated with fields, and success message announced.

### Implementation for User Story 4

- [x] T020 [P] [US4] Audit `src/components/ui/Input.tsx` — ensure all inputs have `id` attributes with matching `<label htmlFor>`, `aria-required` on required fields, `aria-invalid` on error state, and `aria-describedby` pointing to error message element
- [x] T021 [P] [US4] Audit contact form (find contact page component) — ensure form has associated labels, error messages use `role="alert"`, and success message uses `aria-live="polite"` or receives focus
- [x] T022 [US4] Verify form error handling flow: on submit with errors, focus moves to first error field or error summary; errors are programmatically associated with their fields via `aria-describedby`

**Checkpoint**: Forms are fully operable via screen reader and keyboard with clear feedback at every step.

---

## Phase 7: User Story 5 — Accessibility Statement (Priority: P3)

**Goal**: A comprehensive accessibility statement page is available from every page via the footer, containing conformance target, known limitations, and feedback mechanism.

**Independent Test**: Navigate to accessibility page from footer link. Verify it contains WCAG 2.1 AA conformance statement, lists known limitations (PDFs), and provides a way to report barriers with contact information.

### Implementation for User Story 5

- [x] T023 [US5] Expand `src/app/accessibility/page.tsx` with full UC-compliant accessibility statement: WCAG 2.1 AA conformance target, scope of conformance (web pages only), known limitations (downloadable PDFs and publications), feedback mechanism (email address for reporting barriers), date of last review, and link to UC Electronic Accessibility policy

**Checkpoint**: Accessibility statement is complete and reachable from every page.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: CI integration and final validation across all stories

- [x] T024 Add accessibility check step to `.github/workflows/ci.yml` — run `vitest-axe` tests as part of the test job so accessibility violations block merges
- [x] T025 Create a baseline accessibility smoke test in `src/__tests__/accessibility.test.tsx` (or similar) that renders key pages/components and runs axe-core checks to catch regressions
- [ ] T026 ⏳ MANUAL: Run full manual validation per `specs/001-uc-accessibility/quickstart.md` — keyboard navigation, VoiceOver screen reader, 200% zoom, reduced motion, contrast check across all pages
- [ ] T027 ⏳ MANUAL: Update `specs/001-uc-accessibility/checklists/requirements.md` with final pass/fail status for all checklist items

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (Keyboard) and US2 (Screen Reader) can proceed in parallel
  - US3 (Contrast) and US4 (Forms) can proceed in parallel
  - US5 (Statement) has no dependencies on other stories
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 — No dependencies on other stories
- **User Story 2 (P1)**: Can start after Phase 2 — No dependencies on other stories
- **User Story 3 (P2)**: Can start after Phase 2 — No dependencies on other stories
- **User Story 4 (P2)**: Can start after Phase 2 — No dependencies on other stories
- **User Story 5 (P3)**: Can start after Phase 2 — No dependencies on other stories

### Within Each User Story

- Tasks marked [P] within a phase can run in parallel
- Non-[P] tasks depend on prior tasks in the same phase
- Story complete before moving to next priority (unless parallelizing)

### Parallel Opportunities

- T010, T011 can run in parallel (different files, US1); T008 and T009 must be sequential (both modify `globals.css`)
- T013, T014, T015 can run in parallel (different files, US2)
- T017, T018 can run in parallel (different files, US3)
- T020, T021 can run in parallel (different files, US4)
- US1 and US2 can run in parallel (different concerns, both P1)
- US3 and US4 can run in parallel (different concerns, both P2)

---

## Parallel Example: User Story 2

```bash
# Launch all parallel US2 tasks together:
Task: "T013 - Add dialog role, focus trap, aria-labelledby to Modal.tsx"
Task: "T014 - Audit and fix heading hierarchy across all page routes"
Task: "T015 - Audit all image alt text in page components"

# Then sequentially:
Task: "T016 - Add aria-live regions for dynamic content"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T007)
3. Complete Phase 3: User Story 1 — Keyboard Navigation (T008-T012)
4. Complete Phase 4: User Story 2 — Screen Reader (T013-T016)
5. **STOP and VALIDATE**: Test keyboard + screen reader independently
6. This delivers the two P1 stories covering the most critical accessibility needs

### Incremental Delivery

1. Setup + Foundational → Linting active, landmarks in place
2. Add US1 (Keyboard) → Test independently → Core keyboard access works
3. Add US2 (Screen Reader) → Test independently → Full assistive tech support
4. Add US3 (Contrast) → Test independently → Visual compliance
5. Add US4 (Forms) → Test independently → Contact form accessible
6. Add US5 (Statement) → Test independently → Policy compliance
7. Polish → CI gates active, regression prevention in place

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Sanity CMS schemas already enforce alt text — no schema changes needed
- Navigation component already has strong keyboard/ARIA support — minimal changes needed
