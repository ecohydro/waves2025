# Feature Specification: Formspree general contact

**Feature ID**: `006-general-contact`
**Working branch**: `codex/005-accessible-navigation`
**Created**: 2026-09-16
**Status**: Implemented locally; see validation.md for verification scope
**Input**: Work through the major site review issues autonomously, using Spec Kit for each improvement.

## User Scenarios & Testing

### User Story 1 (Priority: P1)

Submit a valid general inquiry and receive an announced confirmation only after service acceptance.

**Why this priority**: Visitors can send a general inquiry through the configured service and recover from failures without losing their message.

**Independent test / acceptance**: Given the relevant page and state, when the visitor follows this journey, all described outcomes hold without unrelated features.

### User Story 2 (Priority: P2)

Correct invalid fields or retry a failed request with all entered text preserved; use email if the form is unavailable.

**Why this priority**: Visitors can send a general inquiry through the configured service and recover from failures without losing their message.

**Independent test / acceptance**: Given the relevant page and state, when the visitor follows this journey, all described outcomes hold without unrelated features.

### Edge cases

Missing configuration/data, failed requests, empty results, long labels, keyboard-only input, 320px reflow, reduced motion, and light/dark styles must not make the journey misleading or unusable.

## Requirements

- **FR-001**: Reuse the configured recruitment inbox unless a dedicated contact inbox is configured.
- **FR-002**: Collect name, email, topic, and message only; do not require recruitment information for general contact.
- **FR-003**: POST only after an explicit send action; never put submitted information into a URL or logs.
- **FR-004**: Provide labeled controls, field-level errors, first-error focus, sending/success/error feedback, and email fallback.
- **FR-005**: Disable duplicate submissions while sending; preserve input on errors and do not assert guaranteed email delivery.
- **FR-006**: Explain Formspree processing and route prospective students to the recruitment inquiry.

## Success Criteria

- **SC-001**: Both listed journeys pass their acceptance checks.
- **SC-002**: All changed interactive controls are keyboard-operable, descriptively named, and have visible focus.
- **SC-003**: No changed state makes an unsupported claim about delivery, scientific activity, funding, or research quality.

## Assumptions and scope

Use existing routes, content, design tokens, and service configuration. No CMS mutation, production deployment, new recruitment promises, or live test messages. Tests are explicitly part of this improvement. Live inbox delivery and full assistive-technology certification require separate evidence.
