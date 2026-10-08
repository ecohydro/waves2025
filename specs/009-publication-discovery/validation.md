# Validation record

**Date**: 2026-09-16
**State**: Implemented locally; not deployed.

## Feature evidence

- Four publication regression/accessibility tests pass: single semantic filter links retain author/theme/type, selected state/reset are exposed, zero-citation CMS-featured work is eligible, year/title heading nesting is correct, preprint empty state recovers, and populated markup passes axe structural checks.
- Browser: filtered Kelly Caylor + Ecohydrology showed 101 records; selecting Preprints preserved both filters and displayed a truthful zero-result state. No nested link/button controls or horizontal overflow at 320px. Active-filter white/#1e40af contrast is 8.72:1.
- The three research theme templates now link publication titles to their records. CMS isFeatured governs highlights; when no matching records are marked, no highlight section is fabricated. Preprints are labeled separately from journal articles and conference records.

## Shared final checks

- `npm run lint`: PASS, no ESLint warnings/errors.
- `npm run type-check`: PASS.
- `npm run test:fast`: PASS, 20 files / 172 tests. This includes 19 focused tests for these five improvements; service submissions are mocked.
- `npm run build`: PASS, production compilation/prerendering. Non-blocking environment/tooling warnings: stale Browserslist data and Node localstorage-file warnings. These were not suppressed or addressed by dependency churn.
- `git diff --check`: PASS.

## Accessibility scope and remaining verification

Keyboard and browser accessibility-tree inspection were performed, plus fixture-rendered axe checks. JSDOM axe checks disable color contrast because JSDOM lacks layout; critical new color pairs were calculated separately, with light-mode computed styles checked in the browser. Dark-mode palette calculations are not a dark-mode browser audit. Full VoiceOver/NVDA interaction, dark-mode browser verification, and third-party Formspree spam/confirmation flows remain release follow-ups.

320px browser reflow was verified on Home, Contact, Projects, and filtered Publications; Contact was also checked at 640px. The browser's zoom shortcuts did not change innerWidth/devicePixelRatio, so a true 200% browser-zoom test is not claimed. Native reduced-motion styles remain in place; new navigation uses no animation or artificial timers. Full-site WCAG certification is not claimed.

No CMS writes, production deployment, branch push, or live contact submission was performed. Existing unrelated working-tree changes were preserved.


## Production release — September 16, 2026

Published at https://www.waveslab.org in release `dpl_5v4QStx7XmFFPp8FWV1wDxGvG1zN`. This supersedes the earlier unpublished status. The isolated release preserves the inbox-verified Contact implementation and overlays only the scoped navigation, homepage news, projects fallback, publication discovery, and News navigation changes. Unrelated working-tree changes were not included.

Lint, TypeScript checking, all 178 tests in 21 files, and the corrected local and Vercel production builds passed. Live HTTP checks returned 200 for Home, Contact, News, the Research news archive, Projects, and filtered Publications. Browser checks confirmed the homepage news, 320px mobile menu keyboard operation (Escape restores the trigger) without horizontal overflow, Projects research/publication fallback, and the preprint view with one matching record and an explicit not-peer-reviewed label. The Research news category link opened 88 matching articles with an All lab news reset link. Full assistive-technology, dark-mode, and true 200% zoom testing remain outstanding; this release does not certify accessibility conformance. No additional messages or CMS mutations were made in this release.
