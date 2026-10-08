# Feature Specification: Accurate homepage news

**Feature ID**: `007-homepage-news`
**Working branch**: `codex/005-accessible-navigation`
**Created**: 2026-09-16
**Status**: Implemented locally; see validation.md for verification scope
**Input**: Work through the major site review issues autonomously, using Spec Kit for each improvement.

## User Scenarios & Testing

### User Story 1 (Priority: P1)

Open Home with published news and follow a concise title link to the story.

**Why this priority**: Visitors see available published news and can distinguish temporary loading failures from an empty collection.

**Independent test / acceptance**: Given the relevant page and state, when the visitor follows this journey, all described outcomes hold without unrelated features.

### User Story 2 (Priority: P2)

Open Home when news loading fails and still reach research and publications with an honest fallback.

**Why this priority**: Visitors see available published news and can distinguish temporary loading failures from an empty collection.

**Independent test / acceptance**: Given the relevant page and state, when the visitor follows this journey, all described outcomes hold without unrelated features.

### Edge cases

Missing configuration/data, failed requests, empty results, long labels, keyboard-only input, 320px reflow, reduced motion, and light/dark styles must not make the journey misleading or unusable.

## Requirements

- **FR-001**: Published news returned by the CMS must not be discarded because an unprojected status field is absent.
- **FR-002**: Retain the published-only query boundary and return status consistently with the declared news contract.
- **FR-003**: Handle news and publication requests independently so one failure does not blank Home.
- **FR-004**: Differentiate empty and unavailable states and keep archive links available.
- **FR-005**: Use descriptive archive links and concise title links rather than whole abstracts as link names.

## Success Criteria

- **SC-001**: Both listed journeys pass their acceptance checks.
- **SC-002**: All changed interactive controls are keyboard-operable, descriptively named, and have visible focus.
- **SC-003**: No changed state makes an unsupported claim about delivery, scientific activity, funding, or research quality.

## Assumptions and scope

Use existing routes, content, design tokens, and service configuration. No CMS mutation, production deployment, new recruitment promises, or live test messages. Tests are explicitly part of this improvement. Live inbox delivery and full assistive-technology certification require separate evidence.
