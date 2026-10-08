# Open work and current state

The one place to look for what is unfinished, what was decided, and how the
site ships. Update it whenever one of these changes. Spec folders under
`specs/` hold the detail for each feature; this file holds the summary.

Last updated: 2026-10-08.

## How the site ships

- `main` is production. The Vercel project `waves2025` is connected to the
  GitHub repository, so a push to `main` builds and deploys to
  https://www.waveslab.org; a push to any other branch produces a preview
  deployment. Do not deploy with the Vercel CLI from a working tree: the
  five production deployments made that way in September 2026 had no commit
  attached, and the repository and the live site drifted apart for a month.
- Before pushing to `main`, run on a real machine (not the Cowork sandbox):
  `npm run lint`, `npm run type-check`, `npm run test:fast`, `npm run build`.
  Plain `tsc --noEmit` reports errors in test files; the `type-check` script
  uses `tsconfig.typecheck.json` and is the one that counts.
- The Cowork Linux sandbox cannot run Vitest or the Next build (the macOS
  `node_modules` has no Linux binaries) and cannot delete files. Sessions
  that run there park unwanted files under `_to_delete/`; clear them with
  `npm run cleanup -- --apply` from a terminal.

## Outstanding

Accessibility work (features 005 to 016, all deployed to production on
2026-10-08) was verified by automation and browser inspection. The checks
that need a person have not been done, and the specs say so: no site-wide
WCAG conformance claim should be made until they are.

1. **Screen-reader session.** A full VoiceOver or NVDA pass through the main
   routes: Home, Research, People and a profile, Publications with filters,
   News, Opportunities, Contact.
2. **True 200% browser zoom.** Automation verified 320 px reflow only;
   browser zoom shortcuts did not change `innerWidth`, so a real zoom test
   was never performed.
3. **Dark-mode browser audit.** Feature 016 ran Lighthouse in dark mobile and
   fixed two shared overrides. A human pass over the pages in dark mode has
   not been done.

Older specs with open tasks, predating the accessibility branch:

- `specs/002-people-page-content`: 0 of 12 tasks done.
- `specs/001-uc-accessibility` and `specs/004-fix-social-links`: 2 open tasks each.

## Decided, so do not reopen

- **Research Impact metrics removed** (2026-10-08, commit `0a79b75`). The
  publication and country counts on `/research` were hand-maintained and
  flagged for editorial verification; Kelly chose to drop the section rather
  than keep the numbers current. The publications page carries real figures.
- **Contact form accepted as is** (2026-10-08). Feature 006 recorded that
  live Formspree delivery, the hosted no-JavaScript confirmation, and the
  spam-check flow were never exercised with a real submission. Kelly
  considers the form fine; no further verification is planned.
- **News images.** Every published news item now has a `featuredImage` with
  alt text. Images without alt fall back to `defaultImageAlt()` in
  `src/lib/cms/image-alt.mjs`; the Slack intake fills the same default and
  warns rather than holding the photo back. The AAAS Fellow item uses a
  300×300 photo that the card upscales; a larger original may exist on
  Kelly's machine outside the repo. Low priority.

## Known debt

- `docs/AGENT_HANDOFF.md` is from February 2026 and names a host path from
  another machine. The API and webhook notes in it may still be accurate;
  the host and deployment sections are superseded by this file.
- The many `docs/task-*-completion-summary.md` files are historical.
