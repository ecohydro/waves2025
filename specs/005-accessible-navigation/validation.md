# Validation record

**Date**: 2026-09-16
**State**: Implemented locally; not deployed.

## Feature evidence

- Three navigation regressions pass: no focus theft on mount, primary destinations, disclosure semantics, complete forward traversal including Search, Escape restoration, and selection close. Axe checks cover open and closed states.
- Browser: at 320 × 720, opened the menu, tabbed from Research through Search, pressed Escape, and observed focus on the trigger with the menu closed. No horizontal overflow; no links/buttons inside an aria-hidden ancestor.
- Desktop screenshot verified a single-row header at 1280px. Home hero text and both primary actions fit at 320px with content-driven height. Replaced the bright photo overlay with a stronger scrim and used darker CTA surfaces.
- Breakpoint reset closes the disclosure and moves focus off mobile controls that would become hidden. This is source-reviewed; not a separately automated breakpoint test.

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
