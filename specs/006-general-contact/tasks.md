# Tasks: Formspree general contact

## Phase 1: Setup

- [x] T001 Inspect existing behavior and complete spec/plan/contracts in `specs/006-general-contact/`.

## Phase 2: User Story 1

- [x] T002 [US1] Add focused regression coverage in `src/components/contact/__tests__/ContactForm.test.tsx` and establish the pre-fix failures.
- [x] T003 [US1] Implement the primary behavior in `src/components/contact/ContactForm.tsx`.

## Phase 3: User Story 2

- [x] T004 [US2] Implement alternate/error/discovery states across the related files listed in `specs/006-general-contact/plan.md` and verify story acceptance.

## Phase 4: Validation

- [x] T005 Run relevant automated/browser checks and record results and limitations in `specs/006-general-contact/validation.md`.

## Dependencies and delivery

T001 → T002 → T003 → T004 → T005. Deliver each story as a usable increment. No parallel file edits are planned: shared navigation/Home/CMS changes run sequentially. Test-fixture preparation can be independent, but this batch uses one agent and working branch.

## Live-test follow-up

- [x] T006 Correct HTTP success handling against the provider's documented contract; preserve accessible feedback and draft recovery, expose only a safe HTTP status on rejection, and add regression coverage before rebuilding. The user's local test displayed an unconfirmed-submission error; its original response is unavailable, so the specific cause and inbox receipt remain unknown.

- [x] T007 Investigate the user-reported HTTP 422: expose bounded provider validation explanations as plain text in the existing focused alert, with no logging or automatic retry. Add regression coverage, rebuild, and obtain the actual rejection explanation before attributing a cause.

- [x] T008 Verify local Contact hosted acceptance and shared-endpoint public-domain inbox delivery; record the localhost domain restriction and the separate scopes of these tests.
- [x] T009 After deployment, verify the new public Contact page through CAPTCHA and inbox receipt.
