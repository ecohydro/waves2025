# Feature 010: Honest News navigation

Created 2026-09-16. Shared working branch `codex/005-accessible-navigation` preserves concurrent work.

## Stories and acceptance

- P1: A visitor selects a News category and reaches an archive containing that category, with visible selection, count, and a route back to all news.
- P1: A visitor sees links to real research/publication resources rather than an unimplemented email subscription promise.
- P2: Empty results and a failed archive request have distinct explanations.

## Requirements

Use semantic, descriptively named links with visible focus. Preserve existing routes. Category query strings select exact stored categories, and unknown categories show an honest empty state. Never claim delivery or subscriptions without a service. No CMS edits or new scientific/recruiting claims. Keyboard and 320px reflow must remain usable.
