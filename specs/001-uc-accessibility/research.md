# Research: UC Accessibility Compliance

**Date**: 2026-03-10
**Feature**: 001-uc-accessibility

## Current State Assessment

### Existing Accessibility Strengths

**Navigation Component** (`src/components/layout/Navigation.tsx`):
- `aria-current="page"` on active links
- `aria-label` on icon buttons (Search, Open menu, Close menu)
- `role="menu"` / `role="menuitem"` on mobile menu
- Keyboard focus trapping with Shift+Tab handling
- Escape key to close mobile menu
- `role="status"` and `sr-only` text on loading spinner

**Footer Component** (`src/components/layout/Footer.tsx`):
- Social media links have descriptive `aria-label` attributes
- Already links to `/accessibility` page

**Sanity CMS Schemas** (`src/lib/cms/schemas/`):
- Alt text is already a **required field** on all image types (news, person, project)
- Validation rules enforce alt text presence
- Description text guides editors: "Important for accessibility and SEO"

**Global Styles** (`src/app/globals.css`):
- Focus outline: `2px solid #0077b6` with `2px` offset on all elements
- Responsive image sizing

**Testing Infrastructure**:
- Vitest + Testing Library already in place
- CI pipeline exists at `.github/workflows/ci.yml`

### Identified Gaps

| Gap | Impact | Spec Requirement | Effort |
|-----|--------|-----------------|--------|
| No skip-to-main link | High | FR-001 | Low |
| No `<main>` landmark wrapper in layout | High | FR-002 | Low |
| Modal missing `role="dialog"`, focus trap, `aria-labelledby` | High | FR-005 | Medium |
| No `prefers-reduced-motion` support | Medium | FR-009 | Low |
| Accessibility page is minimal (22 lines) | Medium | FR-008 | Medium |
| No `eslint-plugin-jsx-a11y` | Medium | FR-011 | Low |
| No accessibility testing in CI | Medium | FR-011 | Medium |
| Footer not using semantic `<footer>` element | Low | FR-002 | Low |
| `@next/next/no-img-element` ESLint rule disabled | Low | FR-003 | Low |
| Heading hierarchy not audited across pages | Medium | FR-010 | Medium |
| Color contrast not audited | Medium | FR-006 | Medium |
| No ARIA live regions for dynamic content | Medium | FR-014 | Medium |

## Research Decisions

### Decision 1: Accessibility Linting Plugin

- **Decision**: Use `eslint-plugin-jsx-a11y` (recommended by Next.js)
- **Rationale**: Already part of the Next.js ecosystem via `next/core-web-vitals` but the strict rules are not enabled. Adding explicit `plugin:jsx-a11y/recommended` gives comprehensive coverage.
- **Alternatives considered**:
  - `eslint-plugin-vuejs-accessibility` — not applicable (React project)
  - Custom rules only — too narrow, misses common patterns

### Decision 2: CI Accessibility Testing Tool

- **Decision**: Use `axe-core` via `@axe-core/cli` or `vitest-axe` for CI integration
- **Rationale**: axe-core is the industry standard for automated WCAG testing, integrates with Testing Library via `jest-axe` / `vitest-axe`, and can test rendered components. Pairs well with existing Vitest setup.
- **Alternatives considered**:
  - Lighthouse CI — heavier setup, broader scope than needed, slower
  - Pa11y — good CLI tool but less React-ecosystem integration
  - Playwright accessibility testing — good for E2E but heavier than unit-level checks

### Decision 3: Focus Trap Implementation for Modal

- **Decision**: Implement custom focus trap in the existing Modal component
- **Rationale**: The Navigation component already has a working focus trap pattern (lines 108-139). Reuse the same approach in Modal for consistency. No need for an external library.
- **Alternatives considered**:
  - `focus-trap-react` library — adds dependency for a pattern already implemented in the codebase
  - `@radix-ui/react-dialog` — full component replacement, too heavy for this fix

### Decision 4: Skip Link Implementation

- **Decision**: Add a visually-hidden-until-focused skip link as the first child in `layout.tsx`, targeting a `<main id="main-content">` wrapper
- **Rationale**: Standard pattern, minimal code. Uses CSS `:focus` to make skip link visible only when focused via keyboard.
- **Alternatives considered**:
  - Multiple skip links (nav, footer, sidebar) — over-engineering for a site with simple structure

### Decision 5: Reduced Motion Support

- **Decision**: Add `@media (prefers-reduced-motion: reduce)` rules in `globals.css` to disable transitions and animations globally
- **Rationale**: Single CSS rule covers all elements. Tailwind's `motion-reduce:` variant can be used for component-specific overrides if needed.
- **Alternatives considered**:
  - Per-component motion preferences — unnecessarily granular for current animations (smooth scroll, page transitions)

### Decision 6: Accessibility Statement Content

- **Decision**: Expand the existing `/accessibility` page with UC-compliant content including WCAG 2.1 AA conformance target, known limitations (PDFs), feedback mechanism (email contact), and last-reviewed date
- **Rationale**: UC policy requires specific elements. The existing page has the route and basic structure; it just needs content.
- **Alternatives considered**:
  - Separate static HTML page — breaks Next.js routing, no benefit
