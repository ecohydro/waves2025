# Run state: Lighthouse accessibility remediation

Source: User request to address easy repeated Lighthouse accessibility findings; conversation baseline audit.
Phase: done
Status: done
Updated: 2026-09-23

## Open questions

None. Scope is already authorized; no new permission ceremony is introduced.

## Decisions

- Preflight: Parent agent ran `speckit-harness ensure --agent codex` successfully before this documentation work; harness 1.0.5.
- Specify/clarify: Scope follows the user's audit remediation request; AGENTS.md authorizes routine reversible implementation. No unresolved factual/product choices require questions.
- Plan: Preserve shared branch `codex/005-accessible-navigation`; all unrelated dirty work remains untouched. Spec scripts use feature ID 016 and explicit feature-directory override; their reported branch may reflect the override rather than actual git branch.
- Plan: No API or data model change; UI requirements serve as the interface contract. No new dependencies, CMS mutations, commits, or deployment.
- Analyze: Specification quality reviewed; functional requirements and success criteria have task coverage. No critical or high consistency findings.
- Hooks: `.specify/extensions.yml` was absent at documentation creation; no hooks dispatched.

## Blocked tasks

No implementation blockers. Remaining manual evaluation limits are recorded below; deployment is outside this task.

## Deferred findings

- Historical production scores and the existing dirty local checkout are different baselines; report this limitation when comparing results.
- No site-wide accessibility conformance or deployment claim is authorized by these local remediations.

## Validation record

- Initial integrated checks: lint and type-check pass; 22 test files / 180 tests pass; production build passes (Node emits an experimental localStorage availability warning).
- Browser: all nine affected routes inspected at 320 CSS pixels with no horizontal page overflow and one h1. People social links measured 44×44 CSS pixels, separate in accessibility tree; keyboard focus and destinations verified. Profile focus outline inset to avoid clipping by card overflow.
- Inline publication author and profile prose links have computed persistent underlines. Footer computed contrast 9.96:1; research white-on-blue callout contrast 4.87:1; ResearchGate identifier contrast 5.47:1.
- Initial local mobile Lighthouse: home/research/ecohydrology/people/profile/publications 100, opportunities 97. Three pale-blue recruiting paragraphs fail at 4.37:1; direct text color fixes added to opportunity supporting section and InquiryForm notice. This is within the existing contrast requirement, no form behavior changes.
- Final checks complete: 21 Lighthouse reports (seven routes × light mobile, light desktop, dark mobile), all 100/100 with no failed audits or runtime errors. Actual 200% browser zoom and full screen-reader session remain unperformed; viewport reflow and accessibility-tree inspection do not substitute for those checks.

## Convergence review

Independent review found the pre-existing dark-mode `.bg-wavesBlue` override (#0284c7) made white text only 4.095:1. Removed that override so the established #0077b6 token remains 4.87:1 in both appearances; no new global override was introduced. All other reviewed task changes had no concrete regression finding. This directly satisfies the existing contrast requirement.

- Dark audit confirmed a second shared override forced muted gray text to #64748b on #111827 (3.72:1). Removed the `.text-gray-400` dark override so Tailwind defaults and scoped footer colors apply. This improves shared footer labels and links without adding specificity or `!important`.
- Required harness preflight initialized/refreshed Spec Kit 1.0.9 integration and harness 1.0.5, updating `.specify` scripts/templates and agent instructions. These generated support-file changes are additional to application fixes; no commits were made.

## Final result

Implementation complete. Lint, type-check, 180 fast tests, production build and diff whitespace checks passed. Reports and comparison limits are recorded in validation.md. A final independent code review found the dark-blue override issue, which was fixed and re-audited. No commit, push, or deployment.
