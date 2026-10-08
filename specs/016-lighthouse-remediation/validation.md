# Lighthouse accessibility remediation — validation

Date: September 23, 2026. Lighthouse 13.5.0. Local Next.js production build on http://127.0.0.1:3100, reading existing published CMS content. No deployment or CMS writes.

## Scores

| Page | Prior live mobile / desktop | Local mobile | Local desktop | Local dark mobile |
|---|---:|---:|---:|---:|
| Homepage | 96 / 96 | [100](/Users/kellycaylor/Downloads/waves-lighthouse-remediation-2026-09-23/home-mobile.report.html) | [100](/Users/kellycaylor/Downloads/waves-lighthouse-remediation-2026-09-23/home-desktop.report.html) | [100](/Users/kellycaylor/Downloads/waves-lighthouse-remediation-2026-09-23/home-dark-mobile.report.html) |
| Research overview | 96 / 96 | [100](/Users/kellycaylor/Downloads/waves-lighthouse-remediation-2026-09-23/research-mobile.report.html) | [100](/Users/kellycaylor/Downloads/waves-lighthouse-remediation-2026-09-23/research-desktop.report.html) | [100](/Users/kellycaylor/Downloads/waves-lighthouse-remediation-2026-09-23/research-dark-mobile.report.html) |
| Ecohydrology | 96 / 96 | [100](/Users/kellycaylor/Downloads/waves-lighthouse-remediation-2026-09-23/ecohydrology-mobile.report.html) | [100](/Users/kellycaylor/Downloads/waves-lighthouse-remediation-2026-09-23/ecohydrology-desktop.report.html) | [100](/Users/kellycaylor/Downloads/waves-lighthouse-remediation-2026-09-23/ecohydrology-dark-mobile.report.html) |
| People directory | 92 / 92 | [100](/Users/kellycaylor/Downloads/waves-lighthouse-remediation-2026-09-23/people-mobile.report.html) | [100](/Users/kellycaylor/Downloads/waves-lighthouse-remediation-2026-09-23/people-desktop.report.html) | [100](/Users/kellycaylor/Downloads/waves-lighthouse-remediation-2026-09-23/people-dark-mobile.report.html) |
| Kelly Caylor profile | 93 / 93 | [100](/Users/kellycaylor/Downloads/waves-lighthouse-remediation-2026-09-23/kelly-caylor-mobile.report.html) | [100](/Users/kellycaylor/Downloads/waves-lighthouse-remediation-2026-09-23/kelly-caylor-desktop.report.html) | [100](/Users/kellycaylor/Downloads/waves-lighthouse-remediation-2026-09-23/kelly-caylor-dark-mobile.report.html) |
| Publications | 92 / 92 | [100](/Users/kellycaylor/Downloads/waves-lighthouse-remediation-2026-09-23/publications-mobile.report.html) | [100](/Users/kellycaylor/Downloads/waves-lighthouse-remediation-2026-09-23/publications-desktop.report.html) | [100](/Users/kellycaylor/Downloads/waves-lighthouse-remediation-2026-09-23/publications-dark-mobile.report.html) |
| Join the Lab | 97 / 97 | [100](/Users/kellycaylor/Downloads/waves-lighthouse-remediation-2026-09-23/join-the-lab-mobile.report.html) | [100](/Users/kellycaylor/Downloads/waves-lighthouse-remediation-2026-09-23/join-the-lab-desktop.report.html) | [100](/Users/kellycaylor/Downloads/waves-lighthouse-remediation-2026-09-23/join-the-lab-dark-mobile.report.html) |

The prior live audit and local checkout are different code states: this checkout already included unrelated changes. These results validate the combined local build, not an isolated causal score experiment. Light mobile/desktop reports were produced before the final dark-only CSS override removals; those removals do not apply in light appearance. Recruiting reports were rerun after its final text contrast edits.

## Changes

- Shared footer copyright color: 3.08:1 → 9.96:1 contrast.
- Research callout text is white, 4.87:1 on the established WAVES blue.
- Removed two existing dark CSS overrides that reduced contrast: brightened blue backgrounds and darkened muted-gray text. This also fixes publication year badges and footer links in dark appearance.
- Publication author and profile prose links stay underlined without hover.
- Person-card social links are separate from the profile link, have descriptive accessible names and 44×44 targets, and retain visible keyboard focus. Email/website links no longer require a socialMedia object.
- Header and recruiting details accessible names include their visible text.
- ResearchGate identifier contrast improved to 5.47:1.
- Pale-blue recruiting notices use darker text. No form submission behavior changed.

## Checks actually performed

- npm run lint: pass, no warnings/errors.
- npm run type-check: pass.
- npm run test:fast: 22 files / 180 tests passed. Two added people-link regressions failed before the fix and passed afterwards.
- npm run build: pass. Node emitted an experimental localStorage availability warning; build completed.
- git diff --check: pass.
- Browser: nine affected routes checked at 320 CSS pixels, one h1 each, no page-level horizontal overflow.
- Browser: people social hit areas measured 44×44, profile/social keyboard order and destination names inspected in accessibility tree. Focus outline visually inspected and inset to prevent clipping.
- Browser: computed persistent underlines verified for 216 rendered publication author links and the profile prose link; callout and footer colors measured.
- Dark Lighthouse runs used --force-dark-mode and --force-prefers-reduced-motion. Dark rendering confirmed by reported computed color failures before correction and a saved Lighthouse screenshot.

## Limits

- These are seven representative initial page states, not a full-site crawl or WCAG conformance certification.
- Full screen-reader interaction testing and actual 200% browser zoom remain unperformed. Browser keyboard zoom commands did not change the measured viewport/DPR; 320-pixel reflow is recorded separately, not claimed as a zoom test.
- Forms were not submitted; behavior was unchanged.
- Dark mobile was audited, not dark desktop. Existing reduced-motion CSS was reviewed; no interactive animation audit was performed.
- Required Spec Kit preflight refreshed generated .specify support scripts/templates and agent instructions in the already-dirty shared checkout. No commit, push, or deployment was performed.
