# Implementation plan

Use existing Next.js server pages, CMS query, and components. Link category headings to `/news/archive?category=...`; filter archive results by exact category, show selected context/reset and distinct request failure. Replace newsletter CTA with research/publication destinations. Add focused behavioral regression tests and run lint, types, fast tests, and build. Verify published links and filtered archive after deployment.

Constitution check: semantic links, visible focus, honest data/error and service claims, existing identity and routes, no invented content. No new dependencies. This is separate feature 010, sharing the existing dirty branch rather than overwriting work. Deploy with previously tested features 005, 007, 008, and 009 after checks pass.
