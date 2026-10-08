# Feature Specification: Accessible publication discovery

**Feature ID**: `009-publication-discovery`
**Working branch**: `codex/005-accessible-navigation`
**Created**: 2026-09-16
**Status**: Implemented locally; see validation.md for verification scope
**Input**: Work through the major site review issues autonomously, using Spec Kit for each improvement.

## User Scenarios & Testing

### User Story 1 (Priority: P1)

Filter an author by theme and switch publication type without silently losing other selections; clear all selections.

**Why this priority**: Readers can combine author, theme, and publication-type filters and discover deliberately featured research.

**Independent test / acceptance**: Given the relevant page and state, when the visitor follows this journey, all described outcomes hold without unrelated features.

### User Story 2 (Priority: P2)

Read editorially featured work regardless of citation count and follow a theme-page publication to its record.

**Why this priority**: Readers can combine author, theme, and publication-type filters and discover deliberately featured research.

**Independent test / acceptance**: Given the relevant page and state, when the visitor follows this journey, all described outcomes hold without unrelated features.

### Edge cases

Missing configuration/data, failed requests, empty results, long labels, keyboard-only input, 320px reflow, reduced motion, and light/dark styles must not make the journey misleading or unusable.

## Requirements

- **FR-001**: Use single semantic links for URL filters, expose selected state, and preserve compatible filter parameters.
- **FR-002**: Provide visible active-filter context, reset navigation, and a helpful zero-results state.
- **FR-003**: Feature CMS-selected records instead of using a citation threshold; do not invent editorial rationales.
- **FR-004**: Keep chronological results and publication-type distinctions; handle preprints distinctly from peer-reviewed papers.
- **FR-005**: Use logical heading levels for publication years and nested titles; link research-theme titles to publication records.

## Success Criteria

- **SC-001**: Both listed journeys pass their acceptance checks.
- **SC-002**: All changed interactive controls are keyboard-operable, descriptively named, and have visible focus.
- **SC-003**: No changed state makes an unsupported claim about delivery, scientific activity, funding, or research quality.

## Assumptions and scope

Use existing routes, content, design tokens, and service configuration. No CMS mutation, production deployment, new recruitment promises, or live test messages. Tests are explicitly part of this improvement. Live inbox delivery and full assistive-technology certification require separate evidence.
