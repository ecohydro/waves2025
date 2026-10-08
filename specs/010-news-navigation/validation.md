# Validation — 2026-09-16

Lint, type checking, and 178 tests in 21 files pass, including four News navigation tests covering category filtering/reset/count, unknown categories, service failure, and real category links with no subscription promise.

The first Vercel build rejected a defaulted page-props argument under its generated PageProps constraint. Removed the default and made the test pass an explicit props object. The failed build was not promoted; the verified Contact release remained active. The corrected local and Vercel production builds passed.

Full VoiceOver testing remains outside this release's verified scope. No new CMS claims, recruitment facts, or testimonials were published.


## Production release — September 16, 2026

Published at https://www.waveslab.org in release `dpl_5v4QStx7XmFFPp8FWV1wDxGvG1zN`. This supersedes the earlier unpublished status. The isolated release preserves the inbox-verified Contact implementation and overlays only the scoped navigation, homepage news, projects fallback, publication discovery, and News navigation changes. Unrelated working-tree changes were not included.

Lint, TypeScript checking, all 178 tests in 21 files, and the corrected local and Vercel production builds passed. Live HTTP checks returned 200 for Home, Contact, News, the Research news archive, Projects, and filtered Publications. Browser checks confirmed the homepage news, 320px mobile menu keyboard operation (Escape restores the trigger) without horizontal overflow, Projects research/publication fallback, and the preprint view with one matching record and an explicit not-peer-reviewed label. The Research news category link opened 88 matching articles with an All lab news reset link. Full assistive-technology, dark-mode, and true 200% zoom testing remain outstanding; this release does not certify accessibility conformance. No additional messages or CMS mutations were made in this release.
