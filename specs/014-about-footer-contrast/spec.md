# Feature Specification: About callout and footer contrast
2026-09-18. Shared branch: codex/005-accessible-navigation.
## User Scenarios & Testing
US1 (P1): Visitors can read the About recruiting callout and identify both links. Acceptance: solid blue background, readable heading/body, two visible pill links with focus.
US2 (P1): Visitors can read shared footer headings and links; the existing logo has softly rounded corners. Acceptance: white headings, high-contrast link states, intact logo proportions, wrapping links at 320px.
Edge cases: dark appearance, focus/hover, mobile layout.
## Requirements
Explicit scoped contrast styles, retain routes/content, preserve existing logo without distortion. No CMS/dependency changes.
## Success Criteria
Text at least 4.5:1, focus 3:1; CTA targets 48px; no horizontal overflow. Logo radius 8px.
