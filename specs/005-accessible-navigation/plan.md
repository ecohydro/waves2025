# Implementation Plan: Accessible navigation and recruiting routes

**Feature**: [005-accessible-navigation](spec.md) | **Date**: 2026-09-16

## Summary

Replace the animated overlay/fake loading states with a sticky header and inline navigation disclosure. This avoids a modal focus trap and inert-background machinery entirely. Use CSS for responsive layouts, matchMedia only to reset the open state, and explicit Escape restoration. Update recruitment CTAs on Home, About, and People; retain Contact for general inquiries.

## Technical Context

**Language/Version**: TypeScript 5
**Primary Dependencies**: Next.js 14, React 18, Tailwind CSS 3, Sanity; existing Formspree for contact
**Storage**: Existing Sanity content; no new storage
**Testing**: Vitest, Testing Library, vitest-axe, browser checks
**Project Type**: Next.js website
**Performance Goals**: No new runtime dependency; no artificial navigation delays

## Constitution Check

- Identity: retain WAVES name, logo, theme labels, and shared styles.
- Voice/evidence: no new research, admissions, or delivery guarantees.
- Architecture: existing stable routes; clear next actions and honest fallback states.
- Recruiting: point to existing opportunities; separate from general contact.
- Accessibility: semantic links/forms/disclosure; keyboard/focus, status, contrast and reflow checks.
- Technical: tests before behavior changes; published CMS boundary; no live mutation or message during testing.
- Pre-design: PASS. Post-design: PASS with the same constraints.

## Project Structure

- `src/components/layout/Navigation.tsx`
- `src/components/layout/__tests__/Navigation.test.tsx`
- `src/app/page.tsx`
- `src/app/about/page.tsx`
- `src/app/people/page.tsx`

## Workflow adaptation

The checkout contains existing uncommitted work. Keep this batch on one codex-prefixed branch and maintain distinct numbered feature directories using the supported SPECIFY_FEATURE override. Only the first feature used create-new-feature.sh; later specs use its template and setup-plan.sh without switching the shared checkout. This avoids false branch isolation or committing unrelated work. No new technology requires regenerating AGENTS.md; canonical guidance is preserved.

Feature numbers 005–009 continue the existing repository sequence after 004. Local and remote branches were refreshed/inspected before allocation.
