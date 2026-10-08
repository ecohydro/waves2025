# Feature Specification: Lighthouse accessibility remediation

**Feature Branch**: Shared existing `codex/005-accessible-navigation` checkout; feature ID `016-lighthouse-remediation`.
**Created**: 2026-09-23
**Status**: Ready for implementation
**Input**: User requested the easiest site-wide fixes from the Lighthouse audit to improve accessibility scores and visitor usability.

## User Scenarios & Testing

### User Story 1 — Read page content and identify links (Priority: P1)

Visitors with reduced vision can read footer content, research calls to action, and profile social identifiers, and distinguish inline links without relying on color.

**Why this priority**: Shared elements repeat across many pages, so small corrections benefit many visits.
**Independent Test**: Inspect contrast and link appearance in light and dark appearances on the homepage, research/theme pages, publications, and a person profile.

**Acceptance Scenarios**:

1. **Given** a page with the shared footer or a research call to action, **when** it is viewed in either appearance, **then** normal text has at least 4.5:1 contrast and large text at least 3:1.
2. **Given** a publication author link or profile inline link, **when** it is read without hovering, **then** a persistent non-color cue identifies the link.
3. **Given** a profile ResearchGate identifier, **when** it is visible, **then** its text and essential graphical information meet applicable contrast thresholds.

### User Story 2 — Choose a person's profile or social destination (Priority: P1)

Visitors using touch, keyboard, or assistive technology can independently select a member's profile and available social destinations.

**Why this priority**: Small targets and nested links impair destination selection and document semantics.
**Independent Test**: Tab through a person card and activate each link independently; inspect target dimensions on mobile.

**Acceptance Scenarios**:

1. **Given** a person with social links, **when** navigating with a keyboard or assistive technology, **then** each social destination and the profile link have separate meaningful names, visible focus, and independent activation.
2. **Given** a narrow screen, **when** selecting a social link, **then** its target is at least 44 by 44 CSS pixels and does not overlap another target.

### User Story 3 — Recognize the home link (Priority: P2)

Visitors using speech input or a screen reader can identify the home link by its visible WAVES Lab wording.

**Why this priority**: Consistent visible and accessible names make repeated navigation predictable.
**Independent Test**: Compare the header home link's visible wording and accessibility-tree name.

**Acceptance Scenarios**:

1. **Given** the site header, **when** inspecting the home link, **then** its accessible name includes its visible text in the same order and the destination remains the homepage. The same visible-wording rule applies to the affected Join the Lab details link.

### Edge Cases

- Missing social fields must omit unavailable destinations without leaving empty focus targets.
- Long names and dense social-link sets must wrap without clipping or overlap at 320 CSS pixels and 200% zoom.
- Focus and hover colors must remain readable in both appearances.
- Research gradients must be assessed at the weakest contrast point behind text.
- Existing CMS errors or unpublished content must not be disguised to obtain higher audit scores.

## Requirements

### Functional Requirements

- **FR-001**: Shared footer and affected research calls to action MUST meet 4.5:1 normal-text and 3:1 large-text contrast in both appearances.
- **FR-002**: Affected inline publication and profile links MUST have a persistent non-color cue.
- **FR-003**: Person cards MUST expose profile and social links as separate, non-nested interactive elements with descriptive names and visible keyboard focus.
- **FR-004**: Person-card social targets MUST be at least 44 by 44 CSS pixels, with no overlap and usable reflow.
- **FR-005**: The header home link and affected Join the Lab details link MUST include their visible wording in order within their accessible names.
- **FR-006**: The profile ResearchGate identifier MUST achieve 4.5:1 text contrast and 3:1 essential icon contrast as applicable.
- **FR-007**: Changes MUST preserve destination URLs, content relationships, current branding, preview separation, and unrelated working-tree changes; no dependency, CMS data, or deployment changes are included.
- **FR-008**: Changed experiences MUST remain usable by keyboard and assistive technology, at 200% zoom, at 320 CSS pixels, and with reduced-motion preferences.
- **FR-009**: Validation MUST report actual automated results, browser checks, and remaining limitations; local results MUST be distinguished from live-site baselines and must not imply full accessibility conformance.

## Success Criteria

### Measurable Outcomes

- **SC-001**: No verified instance of the targeted contrast, color-only inline link, undersized social target, or home-label mismatch defects remains in changed components on the representative routes.
- **SC-002**: All available profile and social destinations in tested person cards can be reached and activated independently with a keyboard and have non-overlapping targets.
- **SC-003**: Changed content has no clipping or horizontal overflow at 320 CSS pixels or 200% zoom; focus remains visible in both appearances.
- **SC-004**: Before/after automated accessibility scores and unresolved findings are recorded for the representative routes using comparable settings, without attributing prior local changes to this feature.

## Assumptions and scope

The representative routes are home, research overview, Ecohydrology, people directory, Kelly Caylor's profile, publications, and Join the Lab. Equivalent shared theme treatments may be corrected consistently. This is a targeted remediation, not a redesign, CMS migration, whole-site certification, or deployment. A numerical score increase is evidence to measure, not a substitute for usable behavior or a guaranteed outcome.

## Clarifications

- Q: Must the work wait for a fresh scope approval? → A: No; the user authorized these easy audit remediations, and AGENTS.md explicitly permits routine reversible work without another approval ceremony.
- Q: Should existing work be isolated by switching branches? → A: No; preserve the shared dirty checkout and record it explicitly (AGENTS.md).
- Q: Is 44 pixels a new conformance claim? → A: No; it is a practical design target for the affected social links, not a claim about the whole site.
