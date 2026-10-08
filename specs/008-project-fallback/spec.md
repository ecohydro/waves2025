# Feature Specification: Honest project availability

**Feature ID**: `008-project-fallback`
**Working branch**: `codex/005-accessible-navigation`
**Created**: 2026-09-16
**Status**: Implemented locally; see validation.md for verification scope
**Input**: Work through the major site review issues autonomously, using Spec Kit for each improvement.

## User Scenarios & Testing

### User Story 1 (Priority: P1)

Open Projects with an empty catalogue and reach research themes and publications without a zero-activity claim.

**Why this priority**: Visitors reach useful research when the project catalogue is empty or temporarily unavailable.

**Independent test / acceptance**: Given the relevant page and state, when the visitor follows this journey, all described outcomes hold without unrelated features.

### User Story 2 (Priority: P2)

Open Projects during a request failure and see an unavailable notice; populated records remain navigable normally.

**Why this priority**: Visitors reach useful research when the project catalogue is empty or temporarily unavailable.

**Independent test / acceptance**: Given the relevant page and state, when the visitor follows this journey, all described outcomes hold without unrelated features.

### Edge cases

Missing configuration/data, failed requests, empty results, long labels, keyboard-only input, 320px reflow, reduced motion, and light/dark styles must not make the journey misleading or unusable.

## Requirements

- **FR-001**: Distinguish a failed request from a successfully empty catalogue.
- **FR-002**: Do not show total/active/featured zero counters as evidence of lab activity.
- **FR-003**: Offer research and publication links for empty and failed collections.
- **FR-004**: Preserve project detail routes, status labels, and existing records without fabricating projects.

## Success Criteria

- **SC-001**: Both listed journeys pass their acceptance checks.
- **SC-002**: All changed interactive controls are keyboard-operable, descriptively named, and have visible focus.
- **SC-003**: No changed state makes an unsupported claim about delivery, scientific activity, funding, or research quality.

## Assumptions and scope

Use existing routes, content, design tokens, and service configuration. No CMS mutation, production deployment, new recruitment promises, or live test messages. Tests are explicitly part of this improvement. Live inbox delivery and full assistive-technology certification require separate evidence.
