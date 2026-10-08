# Feature Specification: Research hero
Created: 2026-09-18. Status: implemented and locally validated.
Shared working branch: codex/005-accessible-navigation; SPECIFY_FEATURE=011-research-hero. Preserve unrelated edits.
Input: Improve the Research Themes hero image.

## User Scenarios & Testing
### US1 — Understand research through authentic imagery (P1)
Visitors see an authentic field landscape connecting water, vegetation, and people, with a readable introduction.
Acceptance: desktop displays a panoramic image and one Research Themes h1; mobile preserves the subject and readable text with no overflow. A screen-reader user receives a meaningful image description.
### Edge cases
Long or enlarged text must expand the hero. A missing image leaves the introduction usable. Mobile crop must retain river and landscape context.
## Requirements
FR-001: Reuse an existing site photograph without fabricated sites, instruments, people, or attribution.
FR-002: Keep title and introduction outside the photograph on a high-contrast surface in both appearances.
FR-003: Provide meaningful image alternative, no animation, responsive image delivery, and a stable image region.
FR-004: Preserve existing research routes and content below the hero.
## Success Criteria
Title and introduction remain fully visible at 320 CSS pixels and enlarged text; normal text contrast exceeds 4.5:1. The photograph loads at mobile and desktop widths and has a meaningful alternative. No new dependencies or CMS edits.
## Assumptions
The existing site's field photography can be reused in this context. No location, identity, research result, or photographer is inferred.
