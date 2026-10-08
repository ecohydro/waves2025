# Opportunities accessibility review — September 16, 2026

Scope: updated opportunities page, recruitment form, assistance page, and shared skip-link target. This is a targeted engineering review, not a site-wide conformance certification.

## Standards

- [UC Information Technology Accessibility Policy (IMT-1300)](https://policy.ucop.edu/doc/7000611/IMT-1300) and [current UC implementation guidance](https://digitalaccessibility.ucop.edu/frequently-asked-questions/): WCAG 2.1 AA. Older UC web pages still mention WCAG 2.0; use the current policy.
- [California Government Code 7405](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=7405.): references Section 508 accessibility requirements. Institution-specific legal determinations and certification belong with UC Santa Barbara’s accessibility office.

## Fixes and verification

- Increased form control border contrast (gray-500 on white; slate-400 on slate-950).
- Explicit keyboard focus indicators, focusable skip target, and field-level descriptions for research-area validation errors.
- Maintained native labels, required fields, autocomplete, semantic groups and headings, review-before-send, and programmatic focus on the review heading.
- Added an assistance route before the form for visitors blocked by JavaScript or the external spam challenge. This supplements rather than replaces accessible implementation.
- Improved dark-mode heading and link contrast on the accessibility assistance page and linked the current UC policy.
- Six form tests pass, including axe checks in initial, error, and review states. JSDOM does not test visual contrast or layout; those rules are excluded from the automated component audit.
- Browser checks: Tab advances from name to email; Enter triggers validation and focuses the first research-area checkbox with aria-invalid; Space selects the checkbox; Enter opens review and focuses its heading. At the observed 510px viewport the page has no horizontal overflow.

## Remaining assessment boundaries

Full screen-reader testing, 320px/400% zoom, all shared navigation states, all site pages/downloads, and Formspree’s third-party CAPTCHA have not been certified by this review. Live delivery verified September 16, 2026 at 16:37 UTC after Kelly completed the CAPTCHA: Formspree confirmation, stored submission 155694399, and Gmail message 1a0ab1452cf82b3e to caylor@ucsb.edu. The labeled setup test appears in Formspree’s Spam view despite successful email delivery; do not treat this as a normal applicant classification test. Keep spam checks enabled; the assistance route remains available. A campus accessibility review is needed before representing the entire site or third-party workflow as fully conformant.

Production build, lint, and type checking passed. Verified live page on https://www.waveslab.org/opportunities: lab wording, configured Formspree notice, assistance link, stronger control borders, and focusable skip target are present.

Follow-up: inspected the live accessibility tree in both the in-app browser and native Safari. Labels, headings, checkbox descriptions, and controls are exposed. Tried native VoiceOver control twice and the Safari keyboard activation route; VoiceOver control timed out each time. No spoken screen-reader pass is claimed. Actual VoiceOver/NVDA testing remains blocked on access to a functioning screen-reader session.

## Time-bounded native VoiceOver attempt

At Kelly’s request, retried native testing before the September 16 09:50 Pacific deadline. Confirmed VoiceOver enabled in System Settings and caption panel enabled in VoiceOver Utility. Closed the onboarding tutorial and enabled VoiceOver directly. The automation still could not access the VoiceOver caption window; Apple’s documented copy-last-phrase shortcut did not replace a known scratchpad marker. Therefore no observed announcement results are claimed. Confirmed VoiceOver **off** in System Settings afterward, closed testing utility/settings windows, and saved the disposable marker scratchpad to `/tmp/waves-voiceover-test.rtf`. A human-observed screen-reader assessment remains necessary.
