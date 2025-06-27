# Product Requirements Document: Initial Website Scaffolding & Content Migration

## Introduction/Overview

This PRD outlines the initial scaffolding and content migration for the WAVES Research Group website modernization project. The goal is to migrate from a legacy Hugo/Wowchemy site to a modern Next.js platform while preserving 20 years of research history and establishing a maintainable content management system for non-technical lab members.

**Problem Statement**: The current Hugo-based website has become stale due to the technical barrier of Git-based content management, preventing regular updates from lab members. The site contains valuable 20-year research history that needs preservation and modernization.

**Goal**: Create a modern, maintainable website platform that allows non-technical users to update content while preserving all existing research data and establishing a foundation for future growth.

---

## Goals

1. **Content Preservation**: Successfully migrate all existing content (people profiles, publications, projects, news) from Hugo to Next.js without data loss
2. **CMS Implementation**: Establish a user-friendly content management interface that eliminates Git dependency for lab members
3. **Performance Optimization**: Achieve Lighthouse score > 90 and Core Web Vitals compliance
4. **Responsive Design**: Ensure mobile-first responsive design across all devices
5. **SEO Maintenance**: Preserve and enhance existing SEO value with proper meta tags and structured data
6. **External Integration**: Establish connections to ORCID, Google Scholar, and Altmetric for enhanced research visibility

---

## User Stories

### Primary Users: Lab Members (Non-Technical)
- **As a lab member**, I want to update my profile information without using Git so that I can keep my information current
- **As a lab member**, I want to add new publications to the website so that our research is properly documented
- **As a lab member**, I want to create news/blog posts about our research so that we can share our work with the community
- **As a lab member**, I want to upload and manage images so that our website stays visually current

### Secondary Users: Website Visitors
- **As a researcher**, I want to find publications by the WAVES group so that I can cite their work
- **As a potential student**, I want to learn about current research projects so that I can decide if I want to join the lab
- **As a collaborator**, I want to find contact information for lab members so that I can reach out about partnerships

### Tertiary Users: Lab Leadership
- **As the PI**, I want to approve content before it goes live so that quality is maintained
- **As the PI**, I want to track website analytics so that I can measure our research impact

---

## Functional Requirements

### 1. Content Migration System
1.1. The system must extract all people profiles from Hugo front matter and convert to Next.js-compatible format
1.2. The system must migrate all publication metadata (authors, DOIs, abstracts, links) from Hugo to Next.js
1.3. The system must preserve all existing images and media files with proper optimization
1.4. The system must maintain all existing URLs and redirects to prevent broken links
1.5. The system must validate migrated content for completeness and accuracy

### 2. Content Management Interface
2.1. The system must provide a web-based CMS interface accessible to all lab members
2.2. The system must allow users to create and edit people profiles with rich text formatting
2.3. The system must support publication entry with automatic DOI validation and metadata fetching
2.4. The system must enable blog/news post creation with markdown support
2.5. The system must provide image upload and management capabilities
2.6. The system must implement role-based access (editor vs. admin) for content approval workflows

### 3. Search and Discovery
3.1. The system must provide full-text search across all content types
3.2. The system must support filtering publications by year, author, and publication type
3.3. The system must enable search result highlighting and relevance ranking
3.4. The system must provide autocomplete suggestions for search queries

### 4. External Integrations
4.1. The system must integrate with ORCID API to auto-populate researcher profiles
4.2. The system must connect to Google Scholar for citation metrics
4.3. The system must integrate with Altmetric for research impact tracking
4.4. The system must support [ScholarAI](https://scholarai.io) integration for enhanced research discovery

### 5. Performance and SEO
5.1. The system must achieve Lighthouse performance score > 90
5.2. The system must implement proper meta tags and Open Graph data
5.3. The system must generate XML sitemaps for search engine indexing
5.4. The system must support structured data markup for publications and people

---

## Non-Goals (Out of Scope)

- **Real-time collaboration**: Multiple users editing simultaneously
- **Advanced analytics dashboard**: Complex reporting beyond basic page views
- **Multi-language support**: Internationalization beyond English
- **E-commerce functionality**: Any payment or purchasing features
- **User registration**: Public user accounts or community features
- **Advanced workflow automation**: Complex approval chains beyond basic editor/admin roles

---

## Design Considerations

### Visual Design
- **Brand Consistency**: Maintain existing WAVES branding, colors, and visual identity
- **Modern Aesthetics**: Update to contemporary design patterns while preserving brand recognition
- **Accessibility**: WCAG 2.1 AA compliance for inclusive design
- **Typography**: Academic-appropriate font choices with good readability

### User Experience
- **Intuitive Navigation**: Clear information architecture based on existing site structure
- **Mobile-First**: Responsive design optimized for mobile devices
- **Fast Loading**: Optimized images and code for quick page loads
- **Error Handling**: Clear error messages and recovery paths

### Content Organization
- **People Section**: Current members, alumni, and individual profile pages
- **Publications**: Journal articles, conference papers, preprints with filtering
- **Research Projects**: Current and past research areas with descriptions
- **News/Blog**: Lab updates, research highlights, and announcements

---

## Technical Considerations

### Technology Stack
- **Frontend**: Next.js 14 with TypeScript and App Router
- **Styling**: Tailwind CSS with custom design system
- **CMS**: Netlify CMS or Sanity for content management
- **Hosting**: Vercel with automatic deployments
- **Search**: Algolia or similar search-as-a-service
- **Image Optimization**: Next.js Image component with automatic optimization

### Data Architecture
- **Content Storage**: Markdown/MDX files with YAML front matter
- **Metadata Management**: Structured data for publications and people
- **Media Management**: Optimized image storage with CDN delivery
- **Backup Strategy**: Git-based version control with automated backups

### Integration Requirements
- **ORCID API**: Researcher profile synchronization
- **Google Scholar**: Citation metrics and profile linking
- **Altmetric**: Research impact tracking
- **ScholarAI**: Enhanced research discovery and analysis

---

## Legacy Code Integration

### Hugo Content Analysis
Based on examination of the legacy site, the following content structures need migration:

**People Profiles** (60+ authors):
- Location: `legacy/content/authors/[username]/_index.md`
- Format: Hugo front matter with YAML metadata
- Key fields: name, role, bio, education, social links, user groups
- Migration approach: Convert to Next.js MDX with standardized front matter

**Publications** (Multiple categories):
- Location: `legacy/content/publication/[type]/`
- Types: journal-article, conference-paper, preprint
- Format: Hugo front matter with publication metadata
- Key fields: authors, title, abstract, DOI, publication info, links
- Migration approach: Standardize to consistent publication schema

**Research Projects**:
- Location: `legacy/content/project/[project-name]/`
- Current projects: climate_resillience, ecohydrology, environmental_sensing
- Format: Hugo landing pages with sections and blocks
- Migration approach: Convert to Next.js pages with modern component structure

**Media Assets**:
- Location: `legacy/assets/media/`
- Content: Research images, team photos, project visuals
- Migration approach: Optimize and migrate to Next.js public directory

### Reusable Components
- **Publication Cards**: Display publication metadata consistently
- **People Cards**: Show researcher profiles with social links
- **Search Components**: Unified search interface across content types
- **Navigation**: Responsive navigation with breadcrumbs

---

## Success Metrics

### Technical Performance
- **Lighthouse Score**: > 90 for all pages
- **Page Load Time**: < 3 seconds on mobile devices
- **Core Web Vitals**: Pass all Google metrics
- **Uptime**: 99.9% availability

### Content Management
- **Content Update Time**: < 5 minutes for simple changes
- **User Adoption**: 80% of lab members actively using CMS within 3 months
- **Content Freshness**: Monthly updates maintained consistently

### User Experience
- **Search Response Time**: < 1 second for search queries
- **Mobile Usability**: 100% of pages mobile-optimized
- **Accessibility**: WCAG 2.1 AA compliance achieved

### Research Impact
- **SEO Performance**: Maintain or improve search rankings
- **Citation Tracking**: Successful integration with ORCID and Google Scholar
- **Research Visibility**: Increased traffic from academic search engines

---

## Open Questions

1. **CMS Selection**: Should we use Netlify CMS (Git-based but with UI) or Sanity (headless CMS with more features)?
2. **Content Approval Workflow**: What level of approval is needed before content goes live?
3. **Image Management**: Should we implement automatic image optimization and CDN delivery?
4. **Search Implementation**: Should we use Algolia, Elasticsearch, or a simpler solution?
5. **Analytics Requirements**: What specific metrics are most important for tracking research impact?
6. **Backup Strategy**: How frequently should we backup content and what retention policy?
7. **Training Requirements**: What level of training will lab members need for the new CMS?
8. **Future Scalability**: How should we plan for potential growth in content volume?

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Set up Next.js project structure
- Implement basic routing and navigation
- Create design system and component library
- Set up development and deployment pipeline

### Phase 2: Content Migration (Week 3-4)
- Develop migration scripts for Hugo content
- Migrate people profiles and publications
- Optimize and migrate media assets
- Validate migrated content integrity

### Phase 3: CMS Implementation (Week 5-6)
- Implement content management interface
- Set up user roles and permissions
- Create content editing workflows
- Test CMS functionality with lab members

### Phase 4: Integration & Optimization (Week 7-8)
- Implement external API integrations
- Optimize performance and SEO
- Conduct user testing and feedback
- Deploy to production environment

---

## Risk Mitigation

### Technical Risks
- **Migration Data Loss**: Implement comprehensive backup and validation procedures
- **Performance Issues**: Establish performance monitoring from day one
- **CMS Adoption**: Provide training and documentation for lab members
- **Integration Failures**: Plan fallback options for external API dependencies

### Content Risks
- **User Resistance**: Provide clear benefits and training for new CMS
- **Content Quality**: Establish editorial guidelines and approval processes
- **Data Consistency**: Implement validation rules and automated checks
- **Version Control**: Maintain Git history for all content changes

This PRD provides a comprehensive roadmap for modernizing the WAVES research lab website while preserving valuable research history and establishing a maintainable platform for future growth. 