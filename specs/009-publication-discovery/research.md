# Research and decisions

**Decision**: Build filter URLs with URLSearchParams, use aria-current on active filter links, and replace nested buttons. Add a separate preprints view, use isFeatured for highlights, and label record types. Use h3 titles in featured cards and h4 beneath year h3 headings. Link preview titles on the three theme pages. Add focused server-page tests for combined filters, semantic markup, low-citation featured records, and empty results.

**Rationale and alternatives**: The current implementation drops author parameters on navigation and nests buttons inside links. CMS isFeatured already exists; use it without inventing a new ranking or writing CMS content.

All implementation choices are resolved. Source evidence is in the dated site review and the files listed in plan.md. No unresolved factual claims are needed for this scope.
