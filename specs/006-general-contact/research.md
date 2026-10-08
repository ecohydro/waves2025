# Research and decisions

**Decision**: Add a client ContactForm with native POST action/method and enhanced fetch submission using Accept: application/json. Preserve a native POST route for no-JavaScript operation. Use the validated FORMSPREE_CONTACT_FORM_ID or fall back to FORMSPREE_RECRUITMENT_FORM_ID. Avoid extracting the recruitment form into a new abstraction; reuse its service convention, honeypot, privacy disclosure, and styles. Unit tests intercept fetch and never send live messages.

**Rationale and alternatives**: Native POST matches the existing recruiting service; fetch enhancement adds inline failure recovery without a dependency. The user explicitly authorized using the existing setup. Service acceptance is distinct from verified inbox delivery.

All implementation choices are resolved. Source evidence is in the dated site review and the files listed in plan.md. No unresolved factual claims are needed for this scope.
