# Research and decisions

**Decision**: Add status to getAllNews projection and remove the redundant homepage filter. Fetch news/publications with Promise.allSettled, sort/slice fulfilled data, and render distinct empty/error fallback copy. Keep the page cache refreshed on the existing news cadence. Add server-page rendering and query-contract regression checks with representative projected fixtures.

**Rationale and alternatives**: getAllNews filters status in GROQ but omits it in the projection; Home filters the missing field a second time. Removing the redundant filter and aligning projection prevents recurrence.

All implementation choices are resolved. Source evidence is in the dated site review and the files listed in plan.md. No unresolved factual claims are needed for this scope.
