# PRD: CMS Integration - Frontend Migration from MDX to Sanity

## Introduction/Overview

This feature migrates the research lab website from its current MDX file-based content system to a fully integrated Sanity CMS solution. The migration will enable easy content editing for group members, API-driven automation from tools like Slack and n8n, and provide a scalable foundation for future growth. While the Sanity CMS backend is already implemented (Task 4.0), the Next.js frontend still reads from MDX files and needs to be updated to use the Sanity client for all content operations.

**Problem Statement:** Currently, content updates require Git knowledge and technical expertise, creating barriers for non-technical group members. The existing Sanity CMS infrastructure is complete but not yet connected to the frontend, limiting its utility.

**Goal:** Enable seamless content management through an intuitive CMS interface while maintaining all existing functionality and supporting future automation needs.

## Goals

1. **Eliminate Technical Barriers:** Enable all group members to update content without Git or technical knowledge
2. **Enable Automation:** Provide API access for AI tools and workflow automation via Slack, n8n, and Cursor
3. **Maintain Content Quality:** Implement approval workflows and role-based permissions for content governance
4. **Preserve Existing Functionality:** Ensure all current website features work seamlessly with the new CMS
5. **Future-Proof Architecture:** Create an extensible foundation that adapts to evolving research lab needs
6. **Zero-Downtime Migration:** Migrate content without interrupting site availability

## User Stories

### Primary User Stories

- **As a site administrator**, I want to use Cursor to automate site edits from Slack so that I can manage content efficiently without manual CMS access
- **As a group member**, I want to update my profile or post a new publication to the site so that my information stays current without technical assistance
- **As a site administrator**, I want to approve updates to the site and specify users who can update without approval so that I can maintain content quality while enabling autonomy for trusted editors
- **As a site administrator**, I want a site structure and framework that adapts to future needs, is easily extensible, and is well-supported in the open source community so that our investment remains valuable long-term

### Supporting User Stories

- **As a content editor**, I want to preview my changes before publishing so that I can ensure quality and accuracy
- **As a researcher**, I want to add collaborators and link publications to projects so that our academic relationships are properly represented
- **As a lab member**, I want to upload and manage images easily so that our content is visually engaging
- **As a site visitor**, I want fast page loads and reliable content so that I can access research information efficiently

## Functional Requirements

### Content Data Migration

1. **The system must migrate all existing people profiles** from MDX files to Sanity with full data integrity
2. **The system must migrate all publication records** with complete metadata, relationships, and media assets
3. **The system must migrate all news/blog posts** preserving content, categories, and publication dates
4. **The system must create backup copies** of all original MDX files before migration
5. **The system must validate migrated content** using automated integrity checks

### Frontend Integration

6. **The system must replace all MDX file reading** with Sanity client data fetching in Next.js pages
7. **The system must update generateStaticParams functions** to use Sanity data for static site generation
8. **The system must implement proper error handling** for CMS connectivity issues with graceful fallbacks
9. **The system must maintain existing URL structures** and redirect patterns for SEO preservation
10. **The system must support preview mode** for draft content review before publication

### API and Automation

11. **The system must provide REST/GraphQL API access** for external automation tools (Slack bots, n8n workflows)
12. **The system must implement webhook support** for real-time content change notifications
13. **The system must support programmatic content creation** via API for automated publishing workflows
14. **The system must include API authentication** and rate limiting for secure automation access

### Content Management

15. **The system must implement role-based permissions** (Admin, Editor, Contributor roles)
16. **The system must support content approval workflows** with draft/review/published states
17. **The system must enable rich text editing** with Markdown support and media embedding
18. **The system must provide content versioning** and change history tracking
19. **The system must support content relationships** (linking people to publications, projects to researchers)

### Performance and Reliability

20. **The system must maintain page load times** under 3 seconds for 95% of requests
21. **The system must implement caching strategies** for Sanity queries and image delivery
22. **The system must include comprehensive error boundaries** to handle CMS failures gracefully
23. **The system must support offline-first preview** capabilities for content editors

## Non-Goals (Out of Scope)

- **No changes to Sanity CMS configuration** - the backend is already complete and tested
- **No modification of existing design/styling** - focus is on data integration, not UI changes
- **No migration of legacy Hugo/Jekyll files** - only current MDX content is in scope
- **No custom CMS interface development** - use standard Sanity Studio
- **No search functionality changes** - maintain existing search capabilities
- **No hosting platform changes** - continue using current Vercel deployment

## Design Considerations

### Content Relationships

- Maintain existing content linking patterns (publications ↔ authors, projects ↔ participants)
- Preserve academic metadata structure (DOI, ORCID, citation formats)
- Support rich media galleries and document attachments

### User Experience

- Ensure CMS interface remains intuitive for non-technical users
- Maintain familiar content editing workflows where possible
- Provide clear feedback for content status and approval states

### API Design

- Follow RESTful patterns for external integrations
- Include comprehensive documentation for automation tool integration
- Support both single-item and batch operations for efficiency

## Technical Considerations

### Data Migration

- **Use existing migration scripts** as foundation for MDX→Sanity conversion
- **Implement data validation** using current integrity checking patterns
- **Create migration rollback procedures** for safety during transition

### Performance Optimization

- **Implement GROQ query optimization** for efficient data fetching
- **Use Sanity's CDN capabilities** for image and asset delivery
- **Cache Sanity queries** appropriately for static generation

### Error Handling

- **Graceful degradation** when CMS is unavailable
- **Retry logic** for transient API failures
- **Comprehensive logging** for debugging automation issues

### Testing Requirements

- **Follow existing TDD patterns** established in project rules
- **Create integration tests** for all Sanity client functions
- **Implement validation scripts** for content integrity
- **Test automation API endpoints** with realistic scenarios

## Legacy Code Integration

### Reuse Existing Components

- **Migration utilities** (`src/lib/migration/`) for data transformation logic
- **Validation scripts** for content integrity checking
- **Image optimization** patterns and utilities
- **URL mapping** and redirect generation systems

### Data Structure Compatibility

- **Preserve existing metadata schemas** where possible
- **Maintain publication enhancement patterns** from CSV integration
- **Keep relationship mapping** for advisor-advisee networks
- **Retain academic categorization** systems (research areas, grants)

## Success Metrics

### Functional Success

- **100% content migration** with zero data loss
- **All pages load from Sanity** instead of MDX files
- **API endpoints respond** within 500ms for 95% of requests
- **Content editing workflows** complete successfully for all user roles

### User Adoption

- **First successful content edit** by non-technical group member within 1 week
- **Successful Slack automation** integration within 2 weeks
- **Zero Git-related support requests** for content updates after migration

### Performance Metrics

- **Page load times** remain under 3 seconds
- **Lighthouse scores** maintain >90 for performance
- **Build times** stay under 5 minutes for full site generation
- **CMS response times** under 200ms for content queries

### Quality Assurance

- **All existing tests pass** with Sanity integration
- **Content validation** shows 100% integrity
- **No broken links or missing assets** after migration
- **Preview functionality** works for all content types

## Open Questions

### Migration Strategy

- Should migration happen all at once or be phased by content type?
- What's the rollback plan if issues are discovered post-migration?
- How should we handle content that's in active editing during migration?

### Automation Integration

- Which Slack commands/workflows should be prioritized for initial API integration?
- What level of content validation should be enforced for automated submissions?
- Should automated content require approval or auto-publish for certain users?

### Performance Optimization

- What caching strategy will work best with the existing Vercel deployment?
- Should we implement any client-side caching for frequently accessed content?
- How should we handle large media uploads through the CMS?

### User Management

- How should initial CMS user accounts be created and managed?
- What onboarding process will help group members transition to the new system?
- Should we maintain any MDX editing capability as a fallback option?

---

**Created:** December 2024  
**Owner:** Research Lab Development Team  
**Priority:** High (Required for site launch)  
**Estimated Effort:** 2-3 weeks full implementation  
**Dependencies:** Completed Sanity CMS backend (Task 4.0)
