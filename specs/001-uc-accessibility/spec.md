# Feature Specification: UC Accessibility Compliance

**Feature Branch**: `001-uc-accessibility`
**Created**: 2026-03-10
**Status**: Draft
**Input**: User description: "Improve accessibility for the site to meet required standards for UC-related content."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Keyboard-Only Navigation (Priority: P1)

A visitor who relies on keyboard navigation (no mouse) arrives at the WAVES Lab website and needs to browse all content — navigate between pages, read research descriptions, view team profiles, and access publications — using only the keyboard.

**Why this priority**: Keyboard accessibility is the foundation of all other assistive technology support. Screen readers, switch devices, and voice control all depend on proper keyboard interaction patterns. Without this, large categories of users are completely blocked.

**Independent Test**: Can be fully tested by navigating every page and interactive element using only Tab, Shift+Tab, Enter, Escape, and arrow keys, confirming all content is reachable and operable.

**Acceptance Scenarios**:

1. **Given** a user on the homepage, **When** they press Tab, **Then** a visible skip link appears allowing them to jump directly to main content
2. **Given** a user navigating via keyboard, **When** they Tab through the navigation menu, **Then** each menu item receives a clearly visible focus indicator and can be activated with Enter
3. **Given** a user interacting with the mobile menu, **When** they press Escape, **Then** the menu closes and focus returns to the menu trigger button
4. **Given** a user on any page with interactive elements (cards, buttons, links), **When** they Tab through the page, **Then** focus order follows a logical reading sequence (top to bottom, left to right) with no focus traps

---

### User Story 2 - Screen Reader Comprehension (Priority: P1)

A visually impaired visitor using a screen reader (e.g., VoiceOver on macOS, NVDA on Windows) accesses the site and needs to understand page structure, content hierarchy, images, and interactive elements through audio descriptions alone.

**Why this priority**: Screen reader users represent a significant portion of users with disabilities. Proper semantic markup and ARIA attributes are essential for these users to understand and interact with the site. This is also a core requirement of WCAG 2.1 AA.

**Independent Test**: Can be tested by navigating the site using VoiceOver (macOS) or NVDA (Windows), verifying that all content is announced with appropriate context, headings create a navigable outline, and images have meaningful descriptions.

**Acceptance Scenarios**:

1. **Given** a screen reader user on any page, **When** they request a headings list, **Then** headings form a logical hierarchy (h1 through h6) with no skipped levels and each heading accurately describes its section
2. **Given** a screen reader user encountering an image, **When** the image is announced, **Then** it has a meaningful alt text description (or is marked decorative if purely visual)
3. **Given** a screen reader user interacting with the modal dialog, **When** the modal opens, **Then** focus moves to the modal, the modal is announced as a dialog with its title, and the user cannot Tab outside the modal until it is dismissed
4. **Given** a screen reader user on the navigation, **When** they encounter the nav element, **Then** it is announced with a descriptive label (e.g., "Main navigation")

---

### User Story 3 - Sufficient Color Contrast and Visual Clarity (Priority: P2)

A visitor with low vision or color vision deficiency views the site and needs all text, icons, and interactive elements to be visually distinguishable against their backgrounds.

**Why this priority**: Color contrast failures are among the most common WCAG violations and affect a broad population (approximately 8% of men have some form of color vision deficiency). This is a measurable, automated-testable requirement.

**Independent Test**: Can be tested by running automated contrast checking tools against all pages and verifying that all text and interactive elements meet minimum contrast ratios.

**Acceptance Scenarios**:

1. **Given** any text on the site, **When** measured against its background, **Then** normal text meets a minimum contrast ratio of 4.5:1 and large text meets 3:1 (WCAG AA)
2. **Given** any interactive element (button, link, form input), **When** in its default and focus states, **Then** it has a contrast ratio of at least 3:1 against adjacent colors
3. **Given** information conveyed through color alone (e.g., active navigation state), **When** viewed without color, **Then** a secondary visual indicator (underline, icon, weight) also conveys the information

---

### User Story 4 - Accessible Forms and Contact (Priority: P2)

A visitor using assistive technology needs to complete the contact form or interact with any form elements on the site, receiving clear labels, instructions, and error feedback.

**Why this priority**: Forms are a primary interaction point. Inaccessible forms prevent users from contacting the lab, which is a core function of the site.

**Independent Test**: Can be tested by completing all forms using only a screen reader and keyboard, verifying labels are announced, required fields are indicated, and errors are clearly communicated.

**Acceptance Scenarios**:

1. **Given** a form field, **When** a screen reader user focuses on it, **Then** the field's label, type, and required status are announced
2. **Given** a user submits a form with errors, **When** the error state is displayed, **Then** errors are announced by the screen reader, associated with their respective fields, and focus moves to the first error
3. **Given** a user completes a form successfully, **When** the success message appears, **Then** it is announced by screen readers (via a live region or focus management)

---

### User Story 5 - Accessibility Statement and Feedback Mechanism (Priority: P3)

A visitor who encounters an accessibility barrier needs to find the site's accessibility statement and a way to report the issue or request content in an alternative format.

**Why this priority**: UC policy requires an accessibility statement. This provides a safety net for issues not yet resolved and demonstrates institutional commitment.

**Independent Test**: Can be tested by verifying the accessibility page exists, is linked from the site footer, contains required policy language, and provides a working contact mechanism.

**Acceptance Scenarios**:

1. **Given** a visitor on any page, **When** they look in the footer, **Then** they find a link to the accessibility statement page
2. **Given** a visitor on the accessibility page, **When** they read the content, **Then** it includes the site's conformance target (WCAG 2.1 AA), known limitations, and a way to report barriers
3. **Given** a visitor who wants to report a barrier, **When** they use the feedback mechanism, **Then** they can describe the issue and provide contact information for follow-up

---

### Edge Cases

- What happens when a user has reduced motion preferences enabled? Animations and transitions should be suppressed or minimized via `prefers-reduced-motion`.
- How does the site handle zoom up to 200%? Content must remain readable and functional without horizontal scrolling at up to 200% zoom on standard viewport widths.
- What happens when images fail to load? Alt text should still convey meaning, and layout should not break.
- How do embedded third-party elements (if any) affect accessibility? Third-party widgets must meet the same standards or be wrapped with accessible alternatives.
- What about linked PDFs and downloadable publications? These are out of scope and will be listed as a known limitation in the accessibility statement.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Site MUST include a skip navigation link as the first focusable element on every page, allowing users to bypass repeated navigation and jump to the main content area
- **FR-002**: All pages MUST use semantic HTML elements (`nav`, `main`, `header`, `footer`, `section`, `article`) to convey document structure
- **FR-003**: All images MUST have appropriate alternative text — meaningful descriptions for informational images, empty alt attributes for decorative images. CMS image schemas MUST enforce alt text as a required field at authoring time
- **FR-004**: All interactive elements (links, buttons, form controls) MUST be operable via keyboard with visible focus indicators that meet a minimum 3:1 contrast ratio
- **FR-005**: Modal dialogs MUST implement proper ARIA dialog pattern: `role="dialog"`, `aria-labelledby`, `aria-describedby`, focus trapping, and focus restoration on close
- **FR-006**: All text content MUST meet WCAG 2.1 AA color contrast minimums (4.5:1 for normal text, 3:1 for large text)
- **FR-007**: All form inputs MUST have programmatically associated labels, clear error messaging, and accessible validation feedback
- **FR-008**: The site MUST include an accessibility statement page linked from the footer on every page, describing conformance level, known limitations, and a feedback mechanism
- **FR-009**: The site MUST respect the user's `prefers-reduced-motion` preference by disabling or minimizing animations
- **FR-010**: Heading levels MUST follow a logical hierarchy (no skipped levels) on every page
- **FR-011**: The site MUST include automated accessibility checks at two levels: a dev-time linting plugin for immediate feedback during development, and a CI pipeline gate that blocks merges when accessibility violations are detected
- **FR-012**: Page content MUST be readable and functional when zoomed to 200% without requiring horizontal scrolling
- **FR-013**: Navigation landmarks MUST have descriptive accessible labels (e.g., `aria-label="Main navigation"`)
- **FR-014**: Dynamic content changes (loading states, success/error messages) MUST be announced to screen readers via ARIA live regions or focus management

### Key Entities

- **Page**: Any route in the site; has a document structure with landmarks, headings, and main content area
- **Interactive Element**: Buttons, links, form controls, modals — any element a user can activate or manipulate; must be keyboard operable and screen reader accessible
- **Media**: Images, icons, and any future video/audio content; must have text alternatives
- **Accessibility Statement**: A dedicated page describing the site's conformance target, known issues, and contact information for barrier reporting

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All pages pass automated WCAG 2.1 AA conformance checks with zero critical or serious violations
- **SC-002**: A keyboard-only user can reach and operate 100% of interactive elements on every page without encountering focus traps
- **SC-003**: All text on the site meets WCAG 2.1 AA contrast ratios (4.5:1 normal text, 3:1 large text) verified across all pages
- **SC-004**: Screen reader users can navigate a logical heading structure on every page, with no skipped heading levels
- **SC-005**: The accessibility statement page is reachable from every page via a footer link and contains conformance target, known limitations, and a feedback mechanism
- **SC-006**: Site content remains readable and fully functional when browser zoom is set to 200%
- **SC-007**: All animations and transitions are suppressed when the user has enabled reduced motion preferences
- **SC-008**: Automated accessibility checks catch new violations at two levels: dev-time linting provides immediate feedback, and a CI pipeline gate blocks merges with accessibility violations

## Clarifications

### Session 2026-03-10

- Q: Should remediation of downloadable documents (PDFs) be in scope? → A: Out of scope — document as known limitation in accessibility statement; address separately.
- Q: What should happen when a CMS editor adds an image without alt text? → A: Schema enforcement — make alt text a required field in Sanity so images can't be published without it.
- Q: Where should automated accessibility checks run? → A: Both dev-time linting plugin and CI pipeline gate to block merges with violations.

## Assumptions

- The target conformance level is **WCAG 2.1 Level AA**, which aligns with UC's Electronic Accessibility policy and ADA Section 508 requirements.
- The site does not currently embed third-party widgets that would require separate accessibility remediation. If third-party content is added in the future, it will need separate evaluation.
- Video and audio content are not currently present on the site. If added, captions and transcripts would be required under a separate effort.
- Downloadable documents (PDFs, publications) are out of scope for this feature. The accessibility statement will list them as a known limitation to be addressed in a future effort.
- The existing accessibility page at `/accessibility` will be enhanced rather than replaced.
- Automated testing will supplement but not replace manual testing with assistive technologies.

## Dependencies

- Existing UI component library in `/src/components/ui/` will need modifications to meet requirements
- Sanity CMS image schemas already enforce alt text as a required field on all image types (news, person, project); verify this remains in place during implementation
- Current ESLint configuration will need an accessibility linting plugin added
