# Implementation Plan: UC Accessibility Compliance

**Branch**: `001-uc-accessibility` | **Date**: 2026-03-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-uc-accessibility/spec.md`

## Summary

Bring the WAVES Lab Next.js website into WCAG 2.1 AA compliance per UC Electronic Accessibility policy. The site already has a solid foundation (semantic navigation with ARIA, focus styles, Sanity schemas with required alt text). The primary work involves: adding a skip-to-main link and `<main>` landmark, fixing the Modal dialog pattern, adding `prefers-reduced-motion` support, expanding the accessibility statement page, integrating `eslint-plugin-jsx-a11y`, adding axe-core CI testing, and auditing/fixing color contrast issues across pages.

## Technical Context

**Language/Version**: TypeScript 5 / React 18.2 / Next.js 14.2 (App Router)
**Primary Dependencies**: Tailwind CSS 3.4, Sanity CMS client, styled-components
**Storage**: Sanity CMS (content), no local database
**Testing**: Vitest 3.2, @testing-library/react 16.3, @testing-library/dom 10.4, @testing-library/user-event 14.6
**Target Platform**: Web (Vercel deployment), responsive desktop + mobile
**Project Type**: Web application (Next.js SSR/SSG)
**Performance Goals**: Standard web app expectations; no new performance-critical paths introduced
**Constraints**: Must not break existing visual design; changes are additive/corrective
**Scale/Scope**: ~10 routes, ~15 components to audit, 3 Sanity schemas with images

## Constitution Check

*No constitution.md found. No gates to evaluate.*

## Project Structure

### Documentation (this feature)

```text
specs/001-uc-accessibility/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx              # Add skip link + <main> landmark
│   ├── globals.css             # Add prefers-reduced-motion, sr-only utility
│   ├── accessibility/
│   │   └── page.tsx            # Expand accessibility statement
│   ├── news/                   # Audit heading hierarchy + contrast
│   ├── people/                 # Audit heading hierarchy + contrast
│   ├── publications/           # Audit heading hierarchy + contrast
│   └── [other routes]/         # Audit heading hierarchy + contrast
├── components/
│   ├── layout/
│   │   ├── Navigation.tsx      # Already well-implemented; minor label audit
│   │   └── Footer.tsx          # Verify semantic <footer>, accessibility link
│   └── ui/
│       ├── Modal.tsx           # Add role="dialog", focus trap, aria-labelledby
│       ├── Button.tsx          # Audit focus indicators
│       ├── Card.tsx            # Audit focus/keyboard operability
│       └── Input.tsx           # Audit labels, error messaging
├── lib/
│   └── cms/
│       └── schemas/            # Alt text already required; verify all schemas
.eslintrc.json                  # Add eslint-plugin-jsx-a11y
.github/workflows/ci.yml        # Add axe-core accessibility check step
```

**Structure Decision**: No new directories needed. All changes modify existing files. The accessibility improvements are spread across the existing component and page structure.

## Complexity Tracking

> No constitution violations to justify.
