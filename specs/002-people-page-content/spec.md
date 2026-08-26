# Feature Specification: People Page Content — News & Publications

**Feature Branch**: `002-people-page-content`
**Created**: 2026-03-13
**Status**: Draft
**Input**: User description: "People pages (individual group member pages) include their most recent news (if any) and their recent publications (if any)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View a Member's Recent Publications (Priority: P1)

A visitor navigates to an individual group member's profile page and sees a list of that person's most recent publications. This helps visitors quickly assess the member's research output and find relevant papers without navigating to the full publications page and filtering manually.

**Why this priority**: Publications are the primary research output of lab members and the most common reason visitors look up individual researchers. This delivers the highest standalone value.

**Independent Test**: Can be fully tested by navigating to any group member's page who has authored publications and verifying their publications appear in reverse chronological order.

**Acceptance Scenarios**:

1. **Given** a person page for a member who has authored publications, **When** a visitor views the page, **Then** the page displays a "Recent Publications" section showing that member's most recent publications (up to 5) in reverse chronological order.
2. **Given** a person page for a member who has no authored publications, **When** a visitor views the page, **Then** no "Recent Publications" section is displayed.
3. **Given** a person page showing recent publications, **When** a visitor clicks on a publication title, **Then** they are taken to that publication's detail page.
4. **Given** a person page with more than 5 publications, **When** a visitor views the "Recent Publications" section, **Then** a "View all publications" link is provided that navigates to the publications page.

---

### User Story 2 - View a Member's Recent News (Priority: P2)

A visitor navigates to an individual group member's profile page and sees recent news items that feature or are authored by that member. This provides context about the member's current activities, awards, conference participation, and other noteworthy events.

**Why this priority**: News items provide valuable context about a member's activities but are secondary to publications in terms of research relevance. Some members may not have news items, making this less universally applicable.

**Independent Test**: Can be fully tested by navigating to any group member's page who is associated with news items and verifying their news appears in reverse chronological order.

**Acceptance Scenarios**:

1. **Given** a person page for a member who is associated with news items (as author, co-author, or related person), **When** a visitor views the page, **Then** the page displays a "Recent News" section showing that member's most recent news items (up to 3) in reverse chronological order.
2. **Given** a person page for a member with no associated news, **When** a visitor views the page, **Then** no "Recent News" section is displayed.
3. **Given** a person page showing recent news, **When** a visitor clicks on a news item title, **Then** they are taken to that news article's detail page.

---

### Edge Cases

- What happens when a member has publications but all are in non-published status (e.g., "in-preparation", "submitted")? Only published or accepted publications should appear.
- What happens when a member is listed as a co-author on a publication but is not the primary author? They should still see that publication on their page.
- What happens when a news item references a member via the `relatedPeople` field but the member is not the author? The news item should still appear on that member's page.
- What happens for alumni who have left the lab? Their page should still show publications and news from when they were active.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The individual person page MUST display a "Recent Publications" section listing up to 5 of the member's most recent publications in reverse chronological order, if any exist.
- **FR-002**: The individual person page MUST display a "Recent News" section listing up to 3 of the member's most recent news items in reverse chronological order, if any exist.
- **FR-003**: A publication MUST appear on a member's page if that member is listed as any author (primary or co-author) on the publication.
- **FR-004**: A news item MUST appear on a member's page if the member is the author, a co-author, or listed in the related people for that news item.
- **FR-005**: The "Recent Publications" section MUST only include publications with a status of "published", "in-press", or "accepted".
- **FR-006**: Each publication entry MUST display at minimum: title, publication year, and venue name (or publication type if venue is not available).
- **FR-007**: Each news entry MUST display at minimum: title, publication date, and category.
- **FR-008**: Each publication and news entry MUST link to its respective detail page.
- **FR-009**: If a member has more than 5 qualifying publications, the section MUST include a "View all publications" link to the publications page.
- **FR-010**: Sections with no content (zero publications or zero news) MUST be hidden entirely rather than showing an empty state.
- **FR-011**: Both sections MUST work for current members and alumni alike.
- **FR-012**: The "Recent Publications" and "Recent News" sections MUST appear after the existing biography/profile content, in the order: publications first, then news.

### Key Entities

- **Person**: A lab group member (current or alumni) with a unique slug, who can be linked to publications and news.
- **Publication**: A research output authored by one or more persons, with a publication date and status.
- **News**: A news item authored by or related to one or more persons, with a publication date and category.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Visitors viewing a member's page who has publications can see their recent publications without additional navigation.
- **SC-002**: Visitors viewing a member's page who has news can see their recent news without additional navigation.
- **SC-003**: 100% of person pages correctly show or hide the publications section based on whether the member has qualifying publications.
- **SC-004**: 100% of person pages correctly show or hide the news section based on whether the member has associated news.
- **SC-005**: All displayed publication and news links navigate to the correct detail pages.

## Clarifications

### Session 2026-03-13

- Q: Where should the "Recent Publications" and "Recent News" sections appear on the person page relative to existing content? → A: After the biography/profile content (bio first, then publications, then news).

## Assumptions

- Publications are associated with people via the `authors` array on the publication, where each author entry can reference a person document.
- News items are associated with people via the `author`, `coAuthors`, and `relatedPeople` fields on the news document.
- The existing detail pages for publications and news already work correctly and do not need modification.
- The "Recent Publications" cap of 5 items and "Recent News" cap of 3 items are reasonable defaults; these can be adjusted later.
- No new CMS schema changes are needed — the existing relationships between people, publications, and news are sufficient.
