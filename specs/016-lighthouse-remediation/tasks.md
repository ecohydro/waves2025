# Tasks: Lighthouse accessibility remediation

**Input**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [quickstart.md](quickstart.md)
**Working branch**: Shared `codex/005-accessible-navigation`; preserve all prior work.

## Phase 1 — Setup

- [x] T001 Read `.specify/memory/constitution.md`, audit scope, git status, and run-policy; record shared-branch and scope decisions in `specs/016-lighthouse-remediation/run-state.md` (FR-007).
- [x] T002 Create and review specification, plan, research, and requirements checklist in `specs/016-lighthouse-remediation/` (FR-007, FR-009).

## Phase 2 — Foundation

- [x] T003 Confirm exact failing elements against existing reports at `/Users/kellycaylor/Downloads/waves-lighthouse-2026-09-23/` and local computed styles; record comparison limits in `specs/016-lighthouse-remediation/run-state.md` (FR-009).

## Phase 3 — US1: Readable content and distinguishable links

**Independent test**: Inspect contrast and persistent link affordances on representative routes in both appearances.

- [x] T004 [P] [US1] Correct shared footer contrast in `src/components/layout/Footer.tsx` and `src/components/layout/Footer.module.css`, preserving prior styles (FR-001).
- [x] T005 [P] [US1] Correct research overview/theme call-to-action contrast and pale-blue recruiting paragraph contrast (including `src/components/opportunities/InquiryForm.tsx`) in `src/app/research/ecohydrology/page.tsx`, `src/app/research/sensors/page.tsx`, and `src/app/research/cnh/page.tsx` (FR-001).
- [x] T006 [P] [US1] Provide persistent inline-link distinction in `src/app/publications/page.tsx`, `src/app/people/[slug]/page.tsx`, and affected shared prose styles in `src/app/globals.css`; correct the profile ResearchGate identifier contrast (FR-002, FR-006).

## Phase 4 — US2: Independent person-card destinations

**Independent test**: Keyboard and accessibility-tree inspection establish separate profile/social links; measured targets and reflow establish usable touch selection.

- [x] T007 [US2] Add a focused semantic regression test near `src/app/__tests__/` that detects nested anchors and verifies independently named profile/social destinations, including missing social fields (FR-003, FR-007).
- [x] T008 [US2] Restructure person cards in `src/app/people/page.tsx` as separate profile and social links; size social targets to 44 by 44 CSS pixels with visible focus and no overlap (FR-003, FR-004, FR-008).

## Phase 5 — US3: Visible and accessible labels

**Independent test**: The header home and affected details link accessibility-tree names contain visible wording in order and preserve destinations.

- [x] T009 [P] [US3] Correct visible/accessible label matching in `src/components/layout/Navigation.tsx` and `src/app/opportunities/page.tsx`; update relevant existing regression checks where needed (FR-005, FR-007).

## Phase 6 — Validation and convergence

- [x] T010 Run focused regression checks plus `npm run lint`, `npm run type-check`, `npm run test:fast`, and `npm run build`; record actual results and pre-existing failures in `specs/016-lighthouse-remediation/run-state.md` (FR-007, FR-009).
- [x] T011 Follow `specs/016-lighthouse-remediation/quickstart.md` browser checks for contrast, light/dark appearance, keyboard, accessibility-tree/assistive technology, visible focus, headings/labels, 320-pixel reflow, 200% zoom, and reduced motion; record unperformed checks honestly (FR-001–FR-008, SC-001–SC-003).
- [x] T012 Run comparable mobile/desktop Lighthouse checks for the seven representative routes; retain reports and record scores, differences, and remaining defects in `specs/016-lighthouse-remediation/run-state.md` (FR-009, SC-004).
- [x] T013 Reconcile actual code and validation with `specs/016-lighthouse-remediation/spec.md`, update task completion and limitations, and report local-only results without deployment or certification claims (FR-007, FR-009).

## Dependencies and implementation strategy

T001–T003 precede code work. T004–T006 and T009 involve distinct source locations and may proceed independently; T007 precedes T008 so a meaningful regression can first be demonstrated. T010–T013 follow integration. Within US1, footer, theme, and inline-link changes are separate file groups; US2 test/implementation is sequential; US3 naming is one bounded task. Avoid parallel edits to the same files in this dirty checkout.

Deliver US1's shared contrast benefit first, then independent person-card links and label consistency; complete all authorized stories and validation before reporting. No commit, push, CMS mutation, or deployment is part of this task.

T011 records completed browser checks and explicit remaining manual limits; its completion does not assert a full screen-reader audit or 200% browser-zoom check. See validation.md.
