# Feature Specification: Member Publications & News

**Feature Branch**: `003-member-publications-news`
**Created**: 2026-03-21
**Status**: Draft
**Input**: User description: "Recent publications and news items appear on members pages."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Member's Recent Publications (Priority: P1)

A site visitor navigates to an individual member's page and sees a list of that member's recent publications displayed below their profile information. Each publication shows the title, co-authors, publication venue, year, and a link to the full publication detail page. Publications are sorted by date (most recent first) and limited to a reasonable number with an option to view all.

**Why this priority**: Publications are the primary scholarly output of lab members and the most frequently sought information by visitors (potential collaborators, students, hiring committees).

**Independent Test**: Can be fully tested by navigating to any member's page who has authored publications and verifying their publications appear correctly sorted and linked.

**Acceptance Scenarios**:

1. **Given** a member has authored publications in the system, **When** a visitor views that member's page, **Then** the visitor sees up to 5 of the member's most recent publications displayed in reverse chronological order.
2. **Given** a member has more than 5 publications, **When** a visitor views that member's page, **Then** a "View all publications" link appears that navigates to the publications page filtered by that member.
3. **Given** a member has no publications in the system, **When** a visitor views that member's page, **Then** no publications section is displayed (the section is hidden entirely, not shown empty).
4. **Given** a publication has multiple authors including the current member, **When** the publication is displayed on the member's page, **Then** all authors are shown with the current member's name visually distinguished (e.g., bolded).

---

### User Story 2 - View Member's Recent News (Priority: P2)

A site visitor navigates to an individual member's page and sees recent news articles that feature or relate to that member. Each news item shows the title, date, category, excerpt, and featured image thumbnail. News items are sorted by publication date (most recent first).

**Why this priority**: News items provide timely context about a member's activities, awards, and contributions, but are secondary to the enduring record of publications.

**Independent Test**: Can be fully tested by navigating to any member's page who is referenced in news articles and verifying their related news items appear correctly.

**Acceptance Scenarios**:

1. **Given** a member is referenced in published news articles (as author or in relatedPeople), **When** a visitor views that member's page, **Then** the visitor sees up to 3 of the most recent related news items.
2. **Given** a member has more than 3 related news articles, **When** a visitor views that member's page, **Then** a "View all news" link appears.
3. **Given** a member has no related news articles, **When** a visitor views that member's page, **Then** no news section is displayed.
4. **Given** a news article is in draft or archived status, **When** a visitor views a member's page, **Then** that news article does not appear in the member's news section.

---

### User Story 3 - Alumni Publications & News (Priority: P3)

A site visitor navigates to an alumni member's page and sees their publications and news from their time in the lab (and any subsequent collaborations). The display is identical to current members.

**Why this priority**: Alumni pages should showcase their contributions during and after their lab tenure, maintaining the lab's full scholarly record.

**Independent Test**: Can be tested by navigating to an alumni member's page and verifying publications and news appear the same way as for current members.

**Acceptance Scenarios**:

1. **Given** an alumni member has publications in the system, **When** a visitor views the alumni member's page, **Then** the publications section appears identically to a current member's page.
2. **Given** an alumni member has related news articles, **When** a visitor views the alumni member's page, **Then** the news section appears identically to a current member's page.

---

### Edge Cases

- What happens when a member is an author on a publication but their name in the author list doesn't exactly match their person record? (System relies on the person reference link, not name matching.)
- How does the page behave when the CMS is temporarily unavailable? (Graceful degradation — page renders without the publications/news sections rather than failing entirely.)
- What happens when a publication or news item is deleted from the CMS after being linked to a member? (Missing references are silently excluded.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a "Recent Publications" section on individual member pages showing up to 5 of that member's most recent publications sorted by publication date (newest first). Only formal publication types (journal articles, conference papers, book chapters, preprints, theses, reports, books) are included; abstracts and presentations are excluded.
- **FR-002**: Each publication entry MUST display the title, author list, venue name, and publication year.
- **FR-003**: Each publication title MUST link to the publication's detail page within the site.
- **FR-004**: The current member's name MUST be visually distinguished in the author list of each publication (e.g., bolded or highlighted).
- **FR-005**: The system MUST display a "Recent News" section on individual member pages showing up to 3 recent news items where the member is referenced (as author, co-author, or in related people).
- **FR-006**: Each news entry MUST display the title, publication date, category, and excerpt.
- **FR-007**: Each news item MUST link to the full news article page.
- **FR-008**: If a featured image exists for a news item, the system MUST display a thumbnail of it.
- **FR-009**: The publications section MUST be hidden entirely when a member has no publications.
- **FR-010**: The news section MUST be hidden entirely when a member has no related news.
- **FR-011**: When a member has more than 5 publications, the system MUST provide a "View all publications" link that navigates to the publications page filtered by that member via an author query parameter.
- **FR-012**: When a member has more than 3 news items, the system MUST provide a link to view all related news.
- **FR-013**: Only published news articles (not drafts, scheduled, or archived) MUST be displayed.
- **FR-014**: The publications and news sections MUST appear on both current member and alumni member pages.
- **FR-015**: The system MUST match publications to members via the existing author-person reference relationship, not by name string matching.

### Key Entities

- **Person (Member)**: A lab member (current or alumni) with a profile page. Has a unique slug and can be referenced by publications and news.
- **Publication**: A scholarly work (journal article, conference paper, etc.) authored by one or more people. Has a publication date, venue, authors list with person references, and a detail page.
- **News Article**: A published news item that can reference people as authors or related people. Has a publication date, category, excerpt, optional featured image, and a detail page.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of member pages with associated publications display the publications section correctly.
- **SC-002**: 100% of member pages with associated news display the news section correctly.
- **SC-003**: Publications and news sections load as part of the member page without noticeable additional delay (page loads in under 2 seconds on standard broadband).
- **SC-004**: Member pages with no publications or news render cleanly with no empty sections or visual artifacts.
- **SC-005**: All publication and news links navigate to the correct detail pages.

## Assumptions

- Publications are linked to members via the existing `authors[].person` reference field in the publication schema.
- News articles are linked to members via the existing `author`, `coAuthors`, and `relatedPeople` reference fields in the news schema.
- The "View all publications" link will navigate to the existing publications page with an author query parameter to filter results to that member's work.
- The "View all news" link will navigate to the existing news page or archive, filtered to that member.
- The publications section appears before the news section on the member page, reflecting the priority of scholarly output. Both sections are placed after the biography and before education history and social/contact links.
- The display count limits (5 publications, 3 news) are reasonable defaults that balance content richness with page readability.

## Clarifications

### Session 2026-03-21

- Q: Which publication types should appear on member pages? → A: All types except abstracts/presentations.
- Q: Where should publications and news sections be placed on the member page? → A: After biography, before education and social links.
- Q: What should the "View all publications" link do? → A: Link to the publications page with an author query parameter filter.
