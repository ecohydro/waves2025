# Interface contract

Visitors can send a general inquiry through the configured service and recover from failures without losing their message.

- Reuse the configured recruitment inbox unless a dedicated contact inbox is configured.
- Collect name, email, topic, and message only; do not require recruitment information for general contact.
- POST only after an explicit send action; never put submitted information into a URL or logs.
- Provide labeled controls, field-level errors, first-error focus, sending/success/error feedback, and email fallback.
- Disable duplicate submissions while sending; preserve input on errors and do not assert guaranteed email delivery.
- Explain Formspree processing and route prospective students to the recruitment inquiry.

Existing URLs remain valid. Tests must exercise the public rendered behavior, including errors and empty states, rather than only checking implementation text.

## Service configuration and payload

- Optional `FORMSPREE_CONTACT_FORM_ID`; if absent or invalid, use `FORMSPREE_RECRUITMENT_FORM_ID`. IDs must be alphanumeric. They identify a form, not a service credential.
- Browser submits `POST https://formspree.io/f/{id}` with `FormData`: `name`, `email`, `topic`, message text, `_subject=WAVES general contact`, `_gotcha` (honeypot). When the selected endpoint matches the recruitment endpoint, send message text under `interests`, which that endpoint requires; otherwise use `message`. The textarea name implements this for both native and enhanced submissions. No file upload.
- Both JavaScript-enabled and no-JavaScript forms use a native browser POST to Formspree. Do not send AJAX requests: the existing endpoint's enabled hosted reCAPTCHA rejects them without custom keys.
- JavaScript adds field validation, first-error focus, a duplicate-submit guard, and an announced transition. Keep successful controls enabled during serialization. Reset the guard on `pageshow` after returning from the hosted flow.
- Formspree owns the hosted spam-check and confirmation/error pages. Explain this transition before sending and retain an adjacent email alternative. Do not claim acceptance until the provider confirms it, do not disable spam protection, and never retry automatically.
- No request contents or provider responses are logged by the application. Browser back-cache draft recovery is checked separately from hosted service behavior.
- Reference checked 2026-09-16: [Formspree JavaScript form handling](https://formspree.io/blog/formspree-ajax/).
