# Research and decisions

**Decision**: Replace the animated overlay/fake loading states with a sticky header and inline navigation disclosure. This avoids a modal focus trap and inert-background machinery entirely. Use CSS for responsive layouts, matchMedia only to reset the open state, and explicit Escape restoration. Update recruitment CTAs on Home, About, and People; retain Contact for general inquiries.

**Rationale and alternatives**: Existing hidden-ancestor menu and incomplete focus trap are demonstrated defects. A disclosure is simpler than the existing custom modal; native dialog was considered but is unnecessary for site navigation.

All implementation choices are resolved. Source evidence is in the dated site review and the files listed in plan.md. No unresolved factual claims are needed for this scope.
