# Feature Specification: Homepage hero contrast
Date: 2026-09-18. Shared branch: codex/005-accessible-navigation.
## User Scenarios & Testing
US1 (P1): A visitor can read the hero description and affiliations and recognize Explore Research and Join the Lab as prominent links.
Acceptance: both CTAs have solid pill backgrounds, clear hover/focus, at least 44px targets, working existing destinations. All hero text meets AA contrast over the brightest image areas; 320px layout has no overflow.
Edge cases: bright photograph, dark appearance, keyboard focus, long/wrapped text.
## Requirements
Preserve homepage content and routes; remove image brightening; ensure a real dark overlay and solid CTA backgrounds; underline affiliation links; avoid image-dependent text contrast and new dependencies.
## Success Criteria
Normal text contrast at least 4.5:1, large text/focus at least 3:1; both CTA destinations unchanged; browser-computed overlay and button backgrounds nontransparent; mobile reflow without clipping.
