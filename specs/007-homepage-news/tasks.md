# Tasks: Accurate homepage news

## Phase 1: Setup

- [x] T001 Inspect existing behavior and complete spec/plan/contracts in `specs/007-homepage-news/`.

## Phase 2: User Story 1

- [x] T002 [US1] Add focused regression coverage in `src/app/__tests__/home.test.tsx` and establish the pre-fix failures.
- [x] T003 [US1] Implement the primary behavior in `src/app/page.tsx`.

## Phase 3: User Story 2

- [x] T004 [US2] Implement alternate/error/discovery states across the related files listed in `specs/007-homepage-news/plan.md` and verify story acceptance.

## Phase 4: Validation

- [x] T005 Run relevant automated/browser checks and record results and limitations in `specs/007-homepage-news/validation.md`.

## Dependencies and delivery

T001 → T002 → T003 → T004 → T005. Deliver each story as a usable increment. No parallel file edits are planned: shared navigation/Home/CMS changes run sequentially. Test-fixture preparation can be independent, but this batch uses one agent and working branch.
