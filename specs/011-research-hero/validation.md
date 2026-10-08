# Validation — 2026-09-18
Browser inspected /research at 1280 and 320 CSS pixels. New panorama loads, accessible tree exposes descriptive alt and a single h1. At 320px, scrollWidth is 320 and hero height expands with text. Image remains separate from copy, with no fixed text height or motion. Computed white on #023e8a contrast is 10.20:1; blue-100 eyebrow is 8.36:1. Existing photo reused without modification or invented site/credit claims. Existing Research Impact metrics below the hero remain outside this change and require editorial verification.

Lint, type checking, all 178 tests in 21 files, production build, and git diff --check passed on 2026-09-18. No new mirror tests added for these cosmetic changes. Existing Browserslist-age and Node localstorage-file warnings remain non-blocking. No CMS mutation, commit, push, or deployment performed. Changes remain in the shared working tree.

Limitations: full VoiceOver/NVDA, true 200% browser zoom, and dark-mode browser rendering were not performed. Dark palette checks below are calculated ratios, not a browser audit or conformance certification.

## Deployment — September 18
Published to https://www.waveslab.org in dpl_7wSpm1MxbriiVYWxwaFXgwVStXeL, superseding the earlier local-only status. Live browser confirmed the panorama loads, Home overlay is rgba(0,0,0,.66), both CTA backgrounds are solid, and both selected publication filters have white text on navy. Vercel build passed without build cache.

## Final production release — September 18
Release dpl_HKAHMLMFkJkf7gsFcHM7DtixYf8t is Ready and aliased to https://www.waveslab.org. Includes features 011–014 on the previous isolated production baseline; unrelated workspace edits excluded. Final Vercel build passed. Live browser verified About white text/navy background, both solid CTA pills with scoped classes, white footer headings, 64px spacing and 8px logo corners. Screenshot confirms visible keyboard focus and layout. Home overlay remains 66% black. Research panorama and publication selection colors were also verified live during this release sequence. Full accessibility limitations above remain.
