# Validation guide

## Prerequisites

Use the existing installed dependencies and normal local configuration. Do not run CMS mutation scripts. Preserve all unrelated changes. Baseline reports: `/Users/kellycaylor/Downloads/waves-lighthouse-2026-09-23/`.

## Automated checks

From repository root:

```sh
npm run lint
npm run type-check
npm run test:fast
npm run build
```

Run focused tests for person-card independent links and header naming when implemented. Cosmetic styling does not need implementation-mirroring unit tests.

## Browser scenarios

Start the verified local build with `npm run start -- --port 3000` (or choose an available port). Visit `/`, `/research`, `/research/ecohydrology`, `/people`, the verified Kelly Caylor profile route, `/publications`, and `/opportunities`. Include `/research/sensors` and `/research/cnh` if their shared call-to-action treatment changes.

1. Inspect computed text/icon contrast in light and dark appearances, including hover/focus and gradient backgrounds.
2. Verify publication/profile inline links remain identifiable without color or hover.
3. Tab through a person card: profile and each social destination must have independent focus, a descriptive name, and the expected URL. Inspect the accessibility tree and, where available, assistive-technology announcements. Test a card without social destinations too.
4. Confirm social hit areas are at least 44 by 44 CSS pixels and do not overlap at narrow widths.
5. Confirm the header home link's accessible name includes the visible text in order.
6. Inspect at 320 CSS pixels and 200% browser zoom for clipping/overflow. Check reduced-motion preferences and visible focus in both appearances.
7. Run Lighthouse accessibility audits for the seven representative routes on mobile and desktop using comparable settings to the recorded 13.5.0 baseline. Store score, failed checks, and report paths; disclose any version, mode, or data differences.

## Reporting

Record only checks actually performed, with their outcomes and limitations, in `run-state.md`. Explain residual failures and distinguish prior local improvements, this feature, production state, and any blocked checks. A Lighthouse score is not accessibility certification. Deployment is outside this task.
