# Validation record

**Date**: 2026-09-16
**State**: Deployed and production Contact-page inbox delivery verified on 2026-09-16. Earlier sections below retain the historical test sequence.

## Feature evidence

- Five focused tests pass: configuration precedence/validation, email-only fallback, field errors/focus, POST/pending lock/failure preservation/successful retry, and network failure. Axe checks cover errors and accepted state. No test sends to Formspree.
- Browser: existing recruitment configuration resolves to a rendered general form. Empty submit remained local, announced errors, focused Name, and associated all field errors programmatically. Checked no overflow at 320px and 640px.
- Form controls use a measured light-mode boundary #6b7280 against white (4.83:1); dark token #94a3b8 against #111827 is 6.92:1. Submit text contrast is 6.70:1; error/focus palette pairs exceed their thresholds.
- Dedicated FORMSPREE_CONTACT_FORM_ID is optional; existing recruitment inbox is the fallback. The durable configuration and request contract is contracts/interface.md. The pre-existing .env.example is ignored by Git; its local example was updated but is not relied on for repository documentation.
- Formspree acceptance/failure responses were mocked. Actual inbox delivery, hosted no-JavaScript confirmation, and spam-check accessibility remain unverified. Requests that cannot be confirmed retain the draft and offer email. No live message was sent.

## Shared final checks

- `npm run lint`: PASS, no ESLint warnings/errors.
- `npm run type-check`: PASS.
- `npm run test:fast`: PASS, 20 files / 172 tests. This includes 19 focused tests for these five improvements; service submissions are mocked.
- `npm run build`: PASS, production compilation/prerendering. Non-blocking environment/tooling warnings: stale Browserslist data and Node localstorage-file warnings. These were not suppressed or addressed by dependency churn.
- `git diff --check`: PASS.

## Accessibility scope and remaining verification

Keyboard and browser accessibility-tree inspection were performed, plus fixture-rendered axe checks. JSDOM axe checks disable color contrast because JSDOM lacks layout; critical new color pairs were calculated separately, with light-mode computed styles checked in the browser. Dark-mode palette calculations are not a dark-mode browser audit. Full VoiceOver/NVDA interaction, dark-mode browser verification, and third-party Formspree spam/confirmation flows remain release follow-ups.

320px browser reflow was verified on Home, Contact, Projects, and filtered Publications; Contact was also checked at 640px. The browser's zoom shortcuts did not change innerWidth/devicePixelRatio, so a true 200% browser-zoom test is not claimed. Native reduced-motion styles remain in place; new navigation uses no animation or artificial timers. Full-site WCAG certification is not claimed.

No CMS writes, production deployment, branch push, or live contact submission was performed. Existing unrelated working-tree changes were preserved.

## User delivery-test follow-up

The user reported the unconfirmed-submission error during the local delivery check. Browser inspection confirmed that the draft remained present and the form targeted the existing inbox endpoint. No console errors were retained; the original response and inbox receipt are unknown. Do not treat the earlier mocked success test as evidence of service compatibility.

Code review found that the implementation required JSON `ok: true` in addition to HTTP success, unlike the [provider's documented fetch example](https://formspree.io/blog/formspree-ajax/). Corrected it to use HTTP success and added safe HTTP status diagnostics for rejected requests. Two regression tests failed before the correction and passed afterward. Lint, type checking, all 174 tests across 20 files, production build, and whitespace checks passed. The local server was restarted with the rebuilt application; the user's original draft tab was not reloaded or resubmitted. No deployment or agent-sent message occurred. Inbox receipt, the specific cause of the original failed confirmation, and third-party challenges remain unverified.

## HTTP 422 follow-up

The user subsequently observed HTTP 422. That confirms service rejection for that attempt, but no response body was available to establish the cause. Added bounded validation explanations from Formspree's JSON `errors[].message` or `error` to the existing focused alert. React renders these as escaped text; no provider HTML is interpreted, and no response or submission is logged. Non-JSON failures retain the HTTP status. A regression failed before implementation and passed afterward; lint, type checking, 176 tests in 20 files, production build, and whitespace checks passed. Rebuilt and restarted the local preview without replaying the user's request. T007 remains open pending the real provider explanation and a verified resolution; live delivery is not yet confirmed.

## Confirmed rejection cause and correction

With explicit user authorization, sent one clearly labeled diagnostic submission to the existing lab endpoint. It returned HTTP 422 with `REQUIRED_FIELD_MISSING`, field `interests`, message `is missing`. This establishes the actual rejection cause: the shared recruitment endpoint requires `interests`, while general contact sent `message`. It was not evidence of a CAPTCHA problem.

The contact page now selects `interests` as the Message textarea's submitted name when using the recruitment endpoint, including when the dedicated configuration repeats that same endpoint. Distinct dedicated contact endpoints retain `message`. Native and enhanced POSTs share this mapping; validation focus remains attached to the visible Message control. Provider explanations now include bounded field/code context.

Lint, types, 179 tests in 20 files, production build, and whitespace checks passed. A regression using the actual required-field contract covers native FormData and enhanced submission; another verifies focus on an invalid mapped Message field. Browser inspection of the rebuilt local production page confirms the Message control's name is `interests`. The server was restarted on port 3100. No further live submission was sent beyond the one authorized diagnostic, and successful inbox delivery remains pending a fresh end-to-end test. No deployment occurred.

## Hosted submission correction

The next user test returned HTTP 403 with an explicit provider explanation: AJAX requires a custom reCAPTCHA key or disabling reCAPTCHA. Kept spam protection enabled and replaced AJAX with native browser POST, matching the recruitment flow. Local validation and focus remain; controls stay enabled for browser serialization, duplicate submissions are guarded, and `pageshow` restores the send button on return. Transition copy explains hosted verification and the email alternative. Removed tests of the retired AJAX path; the suite now has 174 passing tests across 20 files. Lint, types, build, and whitespace checks pass.

Live browser verification submitted a clearly labeled diagnostic from the rebuilt local production page. Formspree displayed its hosted “Almost There” reCAPTCHA page rather than either API error. The hosted widget also displayed a provider quota notice. CAPTCHA completion requires action-time approval under the browser-control policy. Approval requested; delivery remains unconfirmed until verification completes and the exact test is found in the connected inbox. No spam-protection settings were changed.

## Live provider acceptance and inbox verification — September 16, 2026

After CAPTCHA completion, the new local Contact form reached Formspree's “The form was submitted successfully” page. Read-only inspection of submission 155759594 found the exact test payload under Spam with status `Unauthorized domain: localhost:3100 does not match waveslab.org`. Thus the hosted success page alone does not establish inbox delivery. Kept the domain restriction and all spam protections intact.

Verified the same endpoint from the existing public recruitment page at `https://www.waveslab.org/opportunities`, using a clearly labeled delivery-verification inquiry, then completed the approved CAPTCHA. Formspree displayed success and the exact verification text arrived at caylor@ucsb.edu in Gmail INBOX at 2026-09-16 21:57:29 UTC (14:57 Pacific), subject “WAVES research inquiry.” Read the delivered message to match its content. No notification or spam settings were changed.

Scope: the new general-contact component's payload and hosted acceptance are verified locally; the shared endpoint's public-domain CAPTCHA-to-inbox route is verified through the existing recruitment page. The new Contact component has not been deployed, so a final production Contact-page delivery check remains required after deployment. Do not conflate these two tests with deployed verification of the new page. Full VoiceOver compatibility remains unverified.


## Production Contact deployment and end-to-end verification

Deployed feature 006 on September 16, 2026 using an isolated release directory reconstructed from the previous production source manifest. Verified all 4,248 baseline source file hashes against deployment `dpl_9kCegxAHvAfNvEgHLNef9AyEj6aA` before overlaying Contact, its component/helper/test, and the related Privacy paragraph. Existing production files changed only at `src/app/contact/page.tsx` and `src/app/privacy/page.tsx`. Other workspace improvements were not published. The shared working tree was preserved, without committing or pushing unrelated work.

- Production deployment: `dpl_511Ea8RkixwTCuPRAuds9AzVZWV2`.
- Immutable deployment URL: https://waves2025-1j9bf77l1-kcaylors-projects.vercel.app
- Public Contact page: https://www.waveslab.org/contact
- Release checks: lint, types, 160 tests across 16 files in the isolated production-based source, and Vercel production build passed. Test counts differ from the broader working tree because other unreleased features were excluded.
- Both Contact and Privacy return HTTP 200. Browser inspection confirmed the new form and its empty-submit validation, including focus on Name.
- Submitted a clearly labeled test through the newly deployed Contact page, completed the approved CAPTCHA, and observed Formspree's success page.
- Verified receipt in Gmail INBOX at 2026-09-16 22:28:38 UTC (15:28 Pacific), subject `WAVES general contact`. Read the message and matched its unique deployment marker, topic, sender, and message text under `interests`.
- Production Contact-to-CAPTCHA-to-inbox delivery is now verified. No Formspree security settings were weakened. Full VoiceOver compatibility remains an unperformed accessibility check.
