# Implementation Plan: Lighthouse accessibility remediation

**Branch**: Shared `codex/005-accessible-navigation` | **Date**: 2026-09-23 | **Spec**: [spec.md](spec.md)

## Summary

Correct repeated contrast, link affordance, social-target, nested-link, and header-label defects using existing components and styles. Preserve prior edits in the dirty checkout. Compare the resulting local site with the recorded live audit while explicitly disclosing the different code state.

## Technical Context

- Language: TypeScript 5, React 18.
- Stack: Next.js 14.2.30 App Router, Tailwind 3, existing CSS modules and Sanity integration.
- Testing: Existing Vitest, Testing Library, accessibility linting; Lighthouse and browser inspection.
- Target: Desktop and mobile web, light/dark appearances, keyboard and assistive technology.
- Storage/data: No changes to CMS records, schemas, projections, persistence, or integrations.
- Constraints: No new dependencies, no secrets, no branch switch, no commit, no deployment.
- Scope: Shared footer/header, research theme calls to action, publication inline links, person cards/profile links and ResearchGate mark.
- Performance: Preserve rendering architecture and avoid additional client-side interaction code merely to style links.

## Constitution Check

Pre-design and post-design review pass with no intentional departures:

- Identity (I): Retain blue/cyan branding and existing logo; use readable alternatives for weak text colors.
- Voice and integrity (II–IV): No factual, recruiting, scientific, or destination changes.
- Accessibility (V): Require computed contrast in both appearances, non-color link cues, semantic non-nested links, keyboard/assistive-technology checks, visible focus, zoom/reflow, and honest limitations.
- Engineering (VI): Use current stack, scoped styles, existing test tooling, and required lint/type/test/build checks. Preserve unrelated work and published/preview separation.

## Project Structure

Feature documentation lives in `specs/016-lighthouse-remediation/`: spec, plan, research, tasks, quickstart, requirement checklist, and run state. No data-model or API contract artifact is needed because data and external interfaces do not change; the existing UI contract is explicit in FR-001–FR-009.

Expected source locations:

- `src/components/layout/Footer.tsx` and `Footer.module.css`
- `src/components/layout/Navigation.tsx`
- `src/app/research/{ecohydrology,sensors,cnh}/page.tsx` and shared/scoped styling as needed
- `src/app/people/page.tsx` and `src/app/people/[slug]/page.tsx`
- `src/app/publications/page.tsx`, `src/app/globals.css`, `src/app/opportunities/page.tsx`, and `src/components/opportunities/InquiryForm.tsx`
- Existing adjacent test directories for meaningful semantic-link regressions only

## Design

1. Use existing readable neutral or blue tokens and scoped CSS for contrast; assess gradients at the lightest text-adjacent point.
2. Underline inline text links persistently with an offset; preserve distinct hover/focus states.
3. Split person-card profile and social destinations into sibling links; retain descriptive destination names and 44-pixel social hit areas. Do not repair nesting with click interception.
4. Include visible branding in the home link's accessible name while preventing duplicate decorative image announcements; align the Join the Lab details link's name with its visible wording. Verify prose-link shared CSS against existing styles.
5. Apply a readable ResearchGate identifier color while retaining its label and destination.

## Validation

Follow [quickstart.md](quickstart.md). Add focused regression coverage where semantics change; cosmetic checks belong in the browser. Run `npm run lint`, `npm run type-check`, `npm run test:fast`, and `npm run build`. Record any existing failures independently. Rerun representative Lighthouse audits on the local build, preserve reports, and disclose that undeployed results do not alter the live site.

## Complexity Tracking

No constitution exceptions or new abstractions/services are required.
