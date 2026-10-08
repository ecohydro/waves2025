# Feature Specification: Publication filter contrast
Date: 2026-09-18. Shared working branch: codex/005-accessible-navigation.
## User Scenarios & Testing
US1 (P1): Readers can see which publication type and area are selected. Selected and unselected labels remain readable in light/dark appearance, while keyboard users see focus. Acceptance: combined filters retain selection and URLs, selected labels use contrasting solid surfaces and underlining, all controls remain readable at 320px.
Edge cases: two active filters, long labels, dark mode, focus and hover.
## Requirements
Use explicit foreground/background pairs for filter states; preserve aria-current and query behavior. Add no dependencies or data changes.
## Success Criteria
At least 4.5:1 text contrast and 3:1 boundaries/focus. Nontransparent selected background; labels and visible underline remain discernible. Minimum 44px targets and no horizontal overflow.
