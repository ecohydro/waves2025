# Site improvement implementation record

Implemented locally on `codex/005-accessible-navigation`, September 16, 2026. Each improvement follows the repository's Spec Kit specification → plan/research/contracts → tasks → implementation → validation sequence. A shared branch preserves the pre-existing dirty working tree; these are separate feature records, not isolated commits.

| Spec Kit feature | Outcome | Validation |
| --- | --- | --- |
| [005 Accessible navigation](../../specs/005-accessible-navigation/spec.md) | Keyboard-operable disclosure, Research/Join the Lab destinations, responsive hero and recruitment CTAs | [Checks](../../specs/005-accessible-navigation/validation.md) |
| [006 General contact](../../specs/006-general-contact/spec.md) | Formspree form, existing-inbox fallback, recoverable errors, accessible feedback, email alternative and privacy copy | [Checks](../../specs/006-general-contact/validation.md) |
| [007 Homepage news](../../specs/007-homepage-news/spec.md) | Published-query contract repair, independent failures, concise story/paper links | [Checks](../../specs/007-homepage-news/validation.md) |
| [008 Project availability](../../specs/008-project-fallback/spec.md) | Honest empty/error fallback and useful research links instead of misleading zero counts | [Checks](../../specs/008-project-fallback/validation.md) |
| [009 Publication discovery](../../specs/009-publication-discovery/spec.md) | Semantic combined filters, preprint view, editorial selections, correct title hierarchy, linked theme previews | [Checks](../../specs/009-publication-discovery/validation.md) |

## Initial local verification (historical)

Lint, type checking, 172 tests across 20 files, production build, and whitespace checks passed. Read-only browser checks covered real CMS data and keyboard/mobile behavior. Details and limitations are recorded per feature; this is not a full WCAG certification or verification of live inbox delivery. No production deployment or message was sent.

## Contact configuration

General contact uses optional `FORMSPREE_CONTACT_FORM_ID`, falling back to the already configured `FORMSPREE_RECRUITMENT_FORM_ID`. No new environment variable is required to use the existing inbox. [The contract](../../specs/006-general-contact/contracts/interface.md) documents the payload and failure handling. Recruitment uses its existing review/send workflow and now also has an adjacent email alternative.

## Remaining editorial and site-wide work

The original review also recommends research case studies, verified student/mentoring experiences, dated recruiting availability, and consented alumni examples. These require content verification; this batch does not invent those claims or populate CMS records. News category navigation/subscription copy and a comprehensive full-route browser accessibility CI gate remain separate improvements. True 200% zoom, dark-mode browser testing, full VoiceOver/NVDA checks, and the external Formspree confirmation/spam flow remain release verification follow-ups.

Keep each subsequent improvement in its own Spec Kit directory. AGENTS.md now records that workflow preference.

## Recruitment release check — September 16, 2026

- Re-ran lint, TypeScript checking, all 172 tests in 20 files, and `git diff --check`: passed.
- Served the existing optimized production build locally on port 3100. All 12 checked routes returned HTTP 200 with one main landmark, a page title, and a skip link: home, contact, opportunities, research, three research themes, people, publications/preprints, projects, accessibility, and privacy.
- Browser checks confirmed required contact fields prevent an empty submission and focus the first invalid field. At 320 CSS pixels, the menu links were keyboard reachable, Escape restored the menu trigger, and the page had no horizontal overflow.
- Verified Vercel authentication and the presence of the production recruitment Formspree ID used as the contact fallback. No environment values were copied into this record.
- No real message was sent and no deployment was made. Live submission, any Formspree challenge, and inbox receipt require a user delivery check. Full VoiceOver/NVDA, true 200% browser zoom, and dark-mode browser checks remain unverified; these targeted results do not establish full accessibility conformance.

### Contact integration correction

Live testing exposed two provider requirements missed by the original mocked checks: the shared recruitment endpoint requires message text under `interests`, and its enabled hosted reCAPTCHA rejects AJAX without custom keys. The current implementation maps the field and uses native browser POST with accessible local validation and a disclosed transition to Formspree. Spam protection remains enabled. Latest verification details and live-delivery status are in feature 006's validation record; earlier AJAX results are historical.

Live verification: the new local Contact payload reaches Formspree, but localhost is intentionally filtered by the provider’s domain restriction. A separate test from the existing public recruitment page completed CAPTCHA and reached the lab inbox on September 16 at 14:57 Pacific. The shared delivery route is verified; the new Contact page still requires deployment and a final public-page delivery check.


### General contact published and verified

Feature 006 and its related privacy copy were deployed independently on September 16, 2026: https://www.waveslab.org/contact. Release `dpl_511Ea8RkixwTCuPRAuds9AzVZWV2` preserves the previous production source except for the contact implementation and privacy copy; the other workspace improvements remain unpublished. Lint, types, 160 isolated-release tests, and the Vercel build passed. A test through the published Contact page completed CAPTCHA and arrived in the lab inbox at 15:28 Pacific with subject “WAVES general contact.” The message content was verified against the unique deployment marker. This supersedes the earlier pending-deployment and delivery notes for feature 006 only.


## Production release — September 16, 2026

Published at https://www.waveslab.org in release `dpl_5v4QStx7XmFFPp8FWV1wDxGvG1zN`. This supersedes the earlier unpublished status. The isolated release preserves the inbox-verified Contact implementation and overlays only the scoped navigation, homepage news, projects fallback, publication discovery, and News navigation changes. Unrelated working-tree changes were not included.

Lint, TypeScript checking, all 178 tests in 21 files, and the corrected local and Vercel production builds passed. Live HTTP checks returned 200 for Home, Contact, News, the Research news archive, Projects, and filtered Publications. Browser checks confirmed the homepage news, 320px mobile menu keyboard operation (Escape restores the trigger) without horizontal overflow, Projects research/publication fallback, and the preprint view with one matching record and an explicit not-peer-reviewed label. The Research news category link opened 88 matching articles with an All lab news reset link. Full assistive-technology, dark-mode, and true 200% zoom testing remain outstanding; this release does not certify accessibility conformance. No additional messages or CMS mutations were made in this release.


Feature [010 News navigation](../../specs/010-news-navigation/spec.md) adds working category archive links, category-specific counts and reset navigation, distinct empty/error states, and research/publication links in place of a subscription promise. Its [validation record](../../specs/010-news-navigation/validation.md) records actual checks.

Remaining editorial work is captured in [Recruiting and research editorial inputs](recruiting-editorial-inputs.md): verified recruiting availability/funding, real mentoring practices, three evidence-backed research case studies, and consented alumni examples. These remain unpublished until facts are verified. The comprehensive accessibility CI gate and final manual accessibility checks also remain outstanding. No user action is required before leaving today. Source changes remain in the shared working tree; this deployment did not create a commit or push.

## Final production release — September 18
Release dpl_HKAHMLMFkJkf7gsFcHM7DtixYf8t is Ready and aliased to https://www.waveslab.org. Includes features 011–014 on the previous isolated production baseline; unrelated workspace edits excluded. Final Vercel build passed. Live browser verified About white text/navy background, both solid CTA pills with scoped classes, white footer headings, 64px spacing and 8px logo corners. Screenshot confirms visible keyboard focus and layout. Home overlay remains 66% black. Research panorama and publication selection colors were also verified live during this release sequence. Full accessibility limitations above remain.
