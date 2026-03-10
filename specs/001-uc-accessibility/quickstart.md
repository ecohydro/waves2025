# Quickstart: UC Accessibility Compliance

**Date**: 2026-03-10
**Feature**: 001-uc-accessibility

## Prerequisites

- Node.js and npm installed
- Repository cloned, on branch `001-uc-accessibility`
- `npm install` completed

## New Dependencies to Install

```bash
npm install --save-dev eslint-plugin-jsx-a11y vitest-axe
```

## Key Files to Modify

| File | Change |
|------|--------|
| `src/app/layout.tsx` | Add skip link, wrap children in `<main id="main-content">` |
| `src/app/globals.css` | Add `prefers-reduced-motion`, `.sr-only` utility |
| `src/app/accessibility/page.tsx` | Expand with WCAG 2.1 AA statement, known limitations, feedback |
| `src/components/ui/Modal.tsx` | Add `role="dialog"`, `aria-modal`, `aria-labelledby`, focus trap |
| `src/components/layout/Footer.tsx` | Verify semantic `<footer>` element |
| `.eslintrc.json` | Add `plugin:jsx-a11y/recommended`, re-enable `@next/next/no-img-element` |
| `.github/workflows/ci.yml` | Add accessibility test step |

## Testing Approach

### Automated (CI)
- `eslint-plugin-jsx-a11y` catches JSX accessibility violations at lint time
- `vitest-axe` renders components and runs axe-core WCAG checks in unit tests
- CI pipeline runs both lint and test stages, blocking merge on failures

### Manual Checklist
- Tab through all pages — verify focus order, skip link, no traps
- VoiceOver (macOS): verify heading hierarchy, image alt text, dialog announcements
- Browser zoom to 200% — verify no horizontal scroll, readable content
- Enable "Reduce motion" in OS settings — verify no animations
- Use browser contrast checker on all text/background combinations

## Development Workflow

1. Start dev server: `npm run dev`
2. Make changes to components/pages
3. Run lint: `npm run lint` (catches jsx-a11y violations immediately)
4. Run tests: `npm run test` (axe-core checks on rendered components)
5. Manual screen reader verification for ARIA changes
6. Commit and push — CI validates automatically
