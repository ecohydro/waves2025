# Tasks: Accessible publication discovery

## Phase 1: Setup

- [x] T001 Inspect existing behavior and complete spec/plan/contracts in `specs/009-publication-discovery/`.

## Phase 2: User Story 1

- [x] T002 [US1] Add focused regression coverage in `src/app/__tests__/publications.test.tsx` and establish the pre-fix failures.
- [x] T003 [US1] Implement the primary behavior in `src/app/publications/page.tsx`.

## Phase 3: User Story 2

- [x] T004 [US2] Implement alternate/error/discovery states across the related files listed in `specs/009-publication-discovery/plan.md` and verify story acceptance.

## Phase 4: Validation

- [x] T005 Run relevant automated/browser checks and record results and limitations in `specs/009-publication-discovery/validation.md`.

## Dependencies and delivery

T001 → T002 → T003 → T004 → T005. Deliver each story as a usable increment. No parallel file edits are planned: shared navigation/Home/CMS changes run sequentially. Test-fixture preparation can be independent, but this batch uses one agent and working branch.
