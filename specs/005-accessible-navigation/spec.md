# Feature Specification: Accessible navigation and recruiting routes

**Feature ID**: `005-accessible-navigation`
**Working branch**: `codex/005-accessible-navigation`
**Created**: 2026-09-16
**Status**: Implemented locally; see validation.md for verification scope
**Input**: Work through the major site review issues autonomously, using Spec Kit for each improvement.

## User Scenarios & Testing

### User Story 1 (Priority: P1)

Open the mobile navigation, traverse every link including Search in either direction, close with Escape, and continue at the trigger.

**Why this priority**: Visitors can reach Research, Join the Lab, and every mobile link using keyboard and assistive technology.

**Independent test / acceptance**: Given the relevant page and state, when the visitor follows this journey, all described outcomes hold without unrelated features.

### User Story 2 (Priority: P2)

Find Research and Join the Lab in both navigation layouts and from existing recruitment calls to action.

**Why this priority**: Visitors can reach Research, Join the Lab, and every mobile link using keyboard and assistive technology.

**Independent test / acceptance**: Given the relevant page and state, when the visitor follows this journey, all described outcomes hold without unrelated features.

### Edge cases

Missing configuration/data, failed requests, empty results, long labels, keyboard-only input, 320px reflow, reduced motion, and light/dark styles must not make the journey misleading or unusable.

## Requirements

- **FR-001**: Navigation must expose expanded state, use ordinary links, and never hide focusable content from assistive technology.
- **FR-002**: Use an inline disclosure rather than a modal so normal Tab order reaches page content; Escape closes and restores focus.
- **FR-003**: Do not move focus on initial render; close on route change and desktop breakpoint transition.
- **FR-004**: Keep the header visible and allow the brand and navigation to reflow at 320 CSS pixels.
- **FR-005**: Retain all existing routes; label the recruiting route Join the Lab and expose Research as a primary destination.

## Success Criteria

- **SC-001**: Both listed journeys pass their acceptance checks.
- **SC-002**: All changed interactive controls are keyboard-operable, descriptively named, and have visible focus.
- **SC-003**: No changed state makes an unsupported claim about delivery, scientific activity, funding, or research quality.

## Assumptions and scope

Use existing routes, content, design tokens, and service configuration. No CMS mutation, production deployment, new recruitment promises, or live test messages. Tests are explicitly part of this improvement. Live inbox delivery and full assistive-technology certification require separate evidence.
