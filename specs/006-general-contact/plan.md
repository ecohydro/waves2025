# Implementation Plan: Formspree general contact

**Feature**: [006-general-contact](spec.md) | **Date**: 2026-09-16

## Summary

Add a client ContactForm with native POST action/method and enhanced fetch submission using Accept: application/json. Preserve a native POST route for no-JavaScript operation. Use the validated FORMSPREE_CONTACT_FORM_ID or fall back to FORMSPREE_RECRUITMENT_FORM_ID. Avoid extracting the recruitment form into a new abstraction; reuse its service convention, honeypot, privacy disclosure, and styles. Unit tests intercept fetch and never send live messages.

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

- `src/components/contact/ContactForm.tsx`
- `src/components/contact/__tests__/ContactForm.test.tsx`
- `src/lib/forms/formspree.ts`
- `src/app/contact/page.tsx`
- `src/app/privacy/page.tsx`
- `.env.example` (local ignored example; durable configuration contract is in this feature directory)
- `src/components/opportunities/InquiryForm.tsx` (email alternative only)

## Workflow adaptation

The checkout contains existing uncommitted work. Keep this batch on one codex-prefixed branch and maintain distinct numbered feature directories using the supported SPECIFY_FEATURE override. Only the first feature used create-new-feature.sh; later specs use its template and setup-plan.sh without switching the shared checkout. This avoids false branch isolation or committing unrelated work. No new technology requires regenerating AGENTS.md; canonical guidance is preserved.

## Live-test correction

Keep this correction within feature 006 and its existing working branch. A user test reached the generic error state, but its network response was not retained. Code review identified a stricter success condition than the provider documents. Add failing regressions for HTTP success without a JSON `ok` flag and safe HTTP rejection diagnostics, align implementation with the provider contract, then rerun required checks and rebuild the local preview. Preserve draft values, focus/live announcements, email fallback, and the no-automatic-retry rule. Do not infer inbox receipt or replay the user's submission.

The user subsequently reported HTTP 422. Expose bounded, escaped provider validation explanations in the existing focused alert to make rejected requests actionable. Do not infer the specific cause from the status alone. Preserve draft recovery and avoid logging or resubmitting personal data.

An explicitly authorized diagnostic POST returned `REQUIRED_FIELD_MISSING` for `interests`. Resolve this by selecting the existing recruitment payload name whenever the configured contact endpoint equals the recruitment endpoint. Keep the visible Message label and all validation/focus behavior. A distinct dedicated contact endpoint retains the `message` name. The DOM name must also support native POST; no fabricated recruitment data or spam-setting changes are needed. Include provider field/code context in rejection feedback.

The next live attempt confirmed HTTP 403: hosted reCAPTCHA rejects AJAX without custom keys. Replace AJAX with native browser POST, matching the existing recruitment flow and preserving spam protection. Keep local validation, field mapping, accessible transition copy, email fallback, and back-navigation recovery. Replace obsolete fetch-mock tests with native submission/default-prevention, enabled-field serialization, and pageshow recovery tests. Verify using a clearly labeled browser submission and search the connected inbox for that exact test. Do not claim completion based on mocks.
