# Implementation Plan: Accurate homepage news

**Feature**: [007-homepage-news](spec.md) | **Date**: 2026-09-16

## Summary

Add status to getAllNews projection and remove the redundant homepage filter. Fetch news/publications with Promise.allSettled, sort/slice fulfilled data, and render distinct empty/error fallback copy. Keep the page cache refreshed on the existing news cadence. Add server-page rendering and query-contract regression checks with representative projected fixtures.

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

- `src/app/page.tsx`
- `src/lib/cms/client.ts`
- `src/app/__tests__/home.test.tsx`

## Workflow adaptation

The checkout contains existing uncommitted work. Keep this batch on one codex-prefixed branch and maintain distinct numbered feature directories using the supported SPECIFY_FEATURE override. Only the first feature used create-new-feature.sh; later specs use its template and setup-plan.sh without switching the shared checkout. This avoids false branch isolation or committing unrelated work. No new technology requires regenerating AGENTS.md; canonical guidance is preserved.
