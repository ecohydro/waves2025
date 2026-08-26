# Feature Specification: Fix Social Links Hostnames

**Feature Branch**: `004-fix-social-links`  
**Created**: 2026-04-16  
**Status**: Draft  
**Input**: User description: "Social links that were generated during site migration do not have the correct hostname. We need to systematically review social links on member pages to make sure the hostnames are correct. Right now, they seem to all default to waveslab.org. So while the user/profile id slug is correct, the links are all broken."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor Clicks a Social Link on a Member Page (Priority: P1)

A site visitor views a lab member's profile page and clicks one of their social media links (LinkedIn, GitHub, Twitter/X, ResearchGate, Google Scholar, or ORCID). The link navigates to the correct external platform profile for that person, not to a broken waveslab.org URL.

**Why this priority**: Broken social links are the core reported issue. Every member page is affected, and broken links undermine the credibility and usefulness of the member directory.

**Independent Test**: Visit any member profile page, click each social media link, and verify it navigates to the correct external platform (e.g., linkedin.com, github.com) with the correct user profile.

**Acceptance Scenarios**:

1. **Given** a member has a LinkedIn profile stored in Sanity, **When** a visitor clicks the LinkedIn icon on their profile page, **Then** the browser navigates to `https://www.linkedin.com/in/{correct-profile-slug}`.
2. **Given** a member has a GitHub username stored in Sanity, **When** a visitor clicks the GitHub icon, **Then** the browser navigates to `https://github.com/{correct-username}`.
3. **Given** a member has a Twitter/X handle stored in Sanity, **When** a visitor clicks the Twitter icon, **Then** the browser navigates to `https://twitter.com/{correct-handle}` or `https://x.com/{correct-handle}`.
4. **Given** a member has a ResearchGate profile stored in Sanity, **When** a visitor clicks the ResearchGate icon, **Then** the browser navigates to `https://www.researchgate.net/profile/{correct-profile}`.
5. **Given** a member has a Google Scholar profile stored in Sanity, **When** a visitor clicks the Google Scholar link, **Then** the browser navigates to `https://scholar.google.com/citations?user={correct-id}`.
6. **Given** a member has an ORCID stored in Sanity, **When** a visitor clicks the ORCID link, **Then** the browser navigates to `https://orcid.org/{correct-orcid-id}`.

---

### User Story 2 - Audit All Member Social Links for Correctness (Priority: P1)

A site administrator runs an audit of all social media links stored in Sanity CMS to identify which links have incorrect hostnames (e.g., waveslab.org instead of the correct platform domain). The audit produces a report showing each member, each social link field, the current stored value, and whether it needs correction.

**Why this priority**: Before fixing data, we need to know the full scope of the problem. A systematic audit ensures no broken links are missed and provides a clear picture of what needs to change.

**Independent Test**: Run the audit process and verify it lists all social link fields for all members, flagging those with incorrect hostnames.

**Acceptance Scenarios**:

1. **Given** the Sanity CMS contains member records with social links, **When** the audit runs, **Then** it reports every social link field that contains a waveslab.org hostname or any other incorrect hostname.
2. **Given** a member has a LinkedIn field set to `https://waveslab.org/people/jane-doe`, **When** the audit runs, **Then** it flags this as incorrect and identifies it needs the correct LinkedIn URL.
3. **Given** a member has a correctly formatted social link (e.g., `https://github.com/janedoe`), **When** the audit runs, **Then** it marks this link as valid and does not flag it.

---

### User Story 3 - Batch Correct Social Link Hostnames (Priority: P1)

A site administrator runs a correction process that updates all incorrectly hosted social links in Sanity CMS to use the proper platform hostnames while preserving the correct profile identifier/slug for each member.

**Why this priority**: The fix must be applied to all affected records in Sanity, not just the rendering layer, so that links are correct at the data source.

**Independent Test**: After running the correction, query Sanity for all social media fields and verify every URL uses the correct platform hostname.

**Acceptance Scenarios**:

1. **Given** a member's LinkedIn field contains `https://waveslab.org/people/jane-doe` and the correct LinkedIn slug is `jane-doe`, **When** the correction runs, **Then** the field is updated to `https://www.linkedin.com/in/jane-doe`.
2. **Given** a member's GitHub field contains a waveslab.org URL with username `janedoe`, **When** the correction runs, **Then** the field is updated to `https://github.com/janedoe`.
3. **Given** a correction is applied, **When** the member's profile page is viewed, **Then** all social links navigate to the correct external platforms.
4. **Given** a member has no social links or already-correct social links, **When** the correction runs, **Then** their record is unchanged.

---

### User Story 4 - Prevent Future Incorrect Social Links (Priority: P2)

When new members are added or existing social links are edited in Sanity CMS, the system validates that social link URLs use correct platform hostnames and rejects or normalizes values that point to waveslab.org or other incorrect domains.

**Why this priority**: After fixing the current data, we need guardrails to prevent the same issue from recurring during future data entry or migrations.

**Independent Test**: Attempt to save a social link with an incorrect hostname in Sanity and verify it is either rejected with an error message or automatically corrected.

**Acceptance Scenarios**:

1. **Given** an editor enters `https://waveslab.org/people/new-member` as a LinkedIn URL in Sanity, **When** they attempt to save, **Then** the system either rejects the value with a helpful error or normalizes it to a proper LinkedIn URL.
2. **Given** an editor enters a bare username/handle (e.g., `janedoe`) in a social link field, **When** they save, **Then** the system normalizes it to the full correct platform URL.

### Edge Cases

- What happens when a social link field contains only a profile slug with no hostname at all (e.g., `jane-doe` instead of a full URL)?
- How does the system handle social links that point to waveslab.org but where the slug does not map cleanly to a platform profile (e.g., the slug is a full name path like `/people/jane-doe` that doesn't match any platform username)?
- What happens when a member has both published and draft versions of their Sanity document with different social link values?
- How does the system handle members who genuinely have no social media profiles (empty/null fields)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST audit all person documents in Sanity CMS and identify social link fields containing incorrect hostnames (waveslab.org or other non-platform domains).
- **FR-002**: System MUST produce a report showing each affected member, the social link field, the current (incorrect) value, and the expected correct platform hostname.
- **FR-003**: System MUST correct social link URLs by replacing incorrect hostnames with the correct platform domain while preserving the profile identifier/slug portion of the URL.
- **FR-004**: System MUST handle corrections for all supported social platforms: LinkedIn (linkedin.com), GitHub (github.com), Twitter/X (twitter.com or x.com), ResearchGate (researchgate.net), Google Scholar (scholar.google.com), and ORCID (orcid.org).
- **FR-005**: System MUST support a dry-run mode that shows proposed changes without modifying any data.
- **FR-006**: System MUST update both published and draft versions of affected Sanity documents.
- **FR-007**: System MUST leave correctly formatted social links and empty/null fields unchanged.
- **FR-008**: System MUST normalize bare usernames/handles into full platform URLs where the platform can be determined from the field name.
- **FR-009**: System SHOULD validate social link URLs at data entry time in Sanity to prevent incorrect hostnames from being saved in the future.

### Key Entities

- **Person**: A lab member with a profile in Sanity CMS, containing optional social media link fields.
- **Social Media Links**: A set of optional URL fields (LinkedIn, GitHub, Twitter, ResearchGate, Google Scholar, ORCID) associated with each person, intended to link to their profiles on external platforms.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of social media links on member profile pages navigate to the correct external platform (zero links pointing to waveslab.org or other incorrect domains).
- **SC-002**: All social link fields in Sanity CMS contain properly formatted URLs with correct platform hostnames, verified by a post-fix audit returning zero flagged records.
- **SC-003**: The correction process preserves the correct profile identifier for each member — no member loses access to their correct external profile link.
- **SC-004**: The correction process supports dry-run mode, allowing administrators to preview all changes before applying them.
- **SC-005**: After the fix, new or edited social links entered with incorrect hostnames are either rejected or automatically normalized to the correct platform domain.

## Assumptions

- The profile identifier/slug portion of the waveslab.org URLs corresponds to the correct username or profile path on the target platform. If there are cases where the slug does not map directly (e.g., a waveslab.org slug like `jane-doe` that differs from a LinkedIn profile slug), these will need manual review.
- The existing `fix-person-social-urls.ts` normalization script provides a foundation that can be extended to detect and correct waveslab.org hostnames.
- Social link fields in Sanity follow the established schema: `socialMedia.linkedin`, `socialMedia.github`, `socialMedia.twitter`, `socialMedia.researchGate`, `socialMedia.googleScholar`, `socialMedia.orcid`.
- The `website` field on person documents is separate from social media links and may legitimately point to waveslab.org (e.g., a member's page on the lab site). This field is out of scope for this fix.
