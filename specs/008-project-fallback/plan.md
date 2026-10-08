# Implementation Plan: Honest project availability

**Feature**: [008-project-fallback](spec.md) | **Date**: 2026-09-16

## Summary

Track project loading failure explicitly, remove the inventory counter strip, and render contextual fallback text with links to populated Research and Publications. Preserve existing project cards, label their links with project titles, and route the footer research overview link to /research. No CMS writes.

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

- `src/app/projects/page.tsx`
- `src/components/layout/Footer.tsx`
- `src/app/__tests__/projects.test.tsx`

## Workflow adaptation

The checkout contains existing uncommitted work. Keep this batch on one codex-prefixed branch and maintain distinct numbered feature directories using the supported SPECIFY_FEATURE override. Only the first feature used create-new-feature.sh; later specs use its template and setup-plan.sh without switching the shared checkout. This avoids false branch isolation or committing unrelated work. No new technology requires regenerating AGENTS.md; canonical guidance is preserved.
