# Content Migration Schema: Jekyll to Next.js/MDX

## Overview

This document outlines the migration strategy from the legacy Jekyll site to the new Next.js 14 platform with MDX content. The Jekyll site uses the Minimal Mistakes theme and contains research lab content including people profiles, publications, news posts, and project pages.

## Legacy Jekyll Structure Analysis

### Site Configuration

- **Theme**: Minimal Mistakes Jekyll
- **Base URL**: `http://caylor.eri.ucsb.edu`
- **Collections**: `people`, `publications`, `projects`
- **Content Types**: Markdown files with YAML front matter

### Directory Structure

```
legacy/
├── _people/           # 60+ individual person profiles
├── _publications/     # 100+ research publications
├── _posts/           # News/blog posts (2011-2020)
├── _pages/           # Static pages (home, teaching, opportunities, etc.)
├── _data/            # Site data (authors.yml, navigation.yml, ui-text.yml)
├── _layouts/         # Jekyll layout templates
├── _includes/        # Jekyll include files
├── assets/           # Images, CSS, JS files
├── uploads/          # Additional media files
└── _config.yml       # Site configuration
```

## Content Type Migration Mapping

### 1. People Profiles (`_people/` → `content/people/`)

**Source Structure**: Individual `.md` files in `_people/` directory
**Target Structure**: MDX files in `content/people/` with enhanced metadata

#### Jekyll Front Matter Fields:

```yaml
---
id: 3065
title: 'Kelly Caylor, Professor'
role: 'Professor'
excerpt: 'Kelly is the Director of the Earth Research Institute...'
avatar: 'assets/images/people/Caylor.png'
author: 'Kelly Caylor'
portfolio-item-category: [people]
portfolio-item-tag: [UCSB, faculty, current member]
header:
  image: 'assets/images/people/caylor_header.jpg'
  caption: 'BA, Environmental Sciences, UVA<br />PhD, Environmental Sciences, UVA.'
---
```

#### Next.js/MDX Migration Mapping:

```yaml
---
title: 'Kelly Caylor'
role: 'Professor'
excerpt: 'Kelly is the Director of the Earth Research Institute...'
avatar: '/images/people/caylor.png'
headerImage: '/images/people/caylor_header.jpg'
headerCaption: 'BA, Environmental Sciences, UVA. PhD, Environmental Sciences, UVA.'
tags: [UCSB, faculty, current member]
location: 'Santa Barbara, CA'
email: 'caylor@ucsb.edu' # Required for current members only
website: 'https://caylor.eri.ucsb.edu'
orcid: '0000-0002-6466-6448'
googleScholar: 'VGaoB64AAAAJ&hl'
researchGate: 'Kelly_Caylor'
linkedin: 'kellycaylor'
twitter: 'kcaylor'
github: 'kcaylor'
cv: '/files/kcaylor_cv.pdf'
education:
  - degree: 'PhD'
    institution: 'University of Virginia'
    field: 'Environmental Sciences'
    year: 2003
  - degree: 'BA'
    institution: 'University of Virginia'
    field: 'Environmental Sciences'
    year: 1998
researchAreas:
  - 'Dryland ecohydrology'
  - 'Climate change impacts'
  - 'Environmental sensing'
  - 'Sub-Saharan Africa'
currentProjects:
  - 'Coupled natural-human systems'
  - 'Low-cost environmental sensors'
  - 'Agricultural monitoring'
publications: [] # Will be populated by migration script
slug: 'kelly-caylor'
---
```

### 2. Publications (`_publications/` → `content/publications/`)

**Source Structure**: Individual `.md` files in `_publications/` directory
**Target Structure**: MDX files in `content/publications/` with structured metadata

#### Jekyll Front Matter Fields:

```yaml
---
author: Kelly Caylor
date: 2023-08-01 00:00:00
id: 6934
year: '2023'
title: Evapotranspiration regulates leaf temperature and respiration in dryland vegetation
doi: 10.1016/j.agrformet.2023.109560
excerpt: 'Kibler, C.L. et al. (2023). Evapotranspiration regulates leaf temperature...'
header:
  teaser: assets/images/publications/Caylor2023_6934.png
portfolio-item-category: [publications]
portfolio-item-tag: ['2023', 'Agricultural and Forest Meteorology']
author-tags: [Kelly Caylor]
---
```

#### Next.js/MDX Migration Mapping:

```yaml
---
title: 'Evapotranspiration regulates leaf temperature and respiration in dryland vegetation'
authors:
  - name: 'Kibler, C.L.'
    affiliation: 'University of California, Santa Barbara'
  - name: 'Trugman, A.'
    affiliation: 'University of California, Santa Barbara'
  - name: 'Roberts, D.'
    affiliation: 'University of California, Santa Barbara'
  - name: 'Still, C.'
    affiliation: 'University of California, Santa Barbara'
  - name: 'Scott, R.'
    affiliation: 'University of California, Santa Barbara'
  - name: 'Caylor, K.K.'
    affiliation: 'University of California, Santa Barbara'
    corresponding: true
  - name: 'Stella, J.'
    affiliation: 'University of California, Santa Barbara'
  - name: 'Singer, M.'
    affiliation: 'University of California, Santa Barbara'
publicationDate: '2023-08-01'
journal: 'Agricultural and Forest Meteorology'
volume: ''
issue: ''
pages: ''
doi: '10.1016/j.agrformet.2023.109560'
url: 'https://www.doi.org/10.1016/j.agrformet.2023.109560'
abstract: 'None' # Will be populated if available
keywords: ['evapotranspiration', 'leaf temperature', 'respiration', 'dryland vegetation']
researchAreas: ['ecohydrology', 'plant physiology']
tags: ['2023', 'Agricultural and Forest Meteorology']
teaserImage: '/images/publications/caylor2023_6934.png'
figureImage: '/images/publications/caylor2023_6934_figure.png'
citationCount: 0 # Will be populated by external API
altmetricScore: 0 # Will be populated by external API
slug: 'caylor2023_6934'
---
```

### 3. News/Blog Posts (`_posts/` → `content/news/`)

**Source Structure**: Individual `.md` files in `_posts/` directory with date prefixes
**Target Structure**: MDX files in `content/news/` with enhanced metadata

#### Jekyll Front Matter Fields:

```yaml
---
id: 4888
title: Finding support in a time of physical distancing
date: 2020-05-07T00:00:00+00:00
author: Natasha Krell
guid: https://caylor.eri.ucsb.edu/?p=4888
permalink: /2020/05/07/covid/
categories: [General, News]
tags:
  [
    Lab Group,
    Natasha Krell,
    Rachel Green,
    Marc Mayes,
    Bryn Morgan,
    Kelly Caylor,
    Cascade Tuholske,
    Farai Kaseke,
    Ryan Avery,
    Marcus Thomson,
    Kristina Fauss,
    '2020',
  ]
excerpt: 'With campus shut down and our lives on hold, WAVES lab members stay connected.'
header:
  image: assets/images/zoom_lab_photo.jpg
---
```

#### Next.js/MDX Migration Mapping:

```yaml
---
title: 'Finding support in a time of physical distancing'
date: '2020-05-07'
author: 'Natasha Krell'
excerpt: 'With campus shut down and our lives on hold, WAVES lab members stay connected.'
categories: ['General', 'News']
tags:
  [
    'Lab Group',
    'Natasha Krell',
    'Rachel Green',
    'Marc Mayes',
    'Bryn Morgan',
    'Kelly Caylor',
    'Cascade Tuholske',
    'Farai Kaseke',
    'Ryan Avery',
    'Marcus Thomson',
    'Kristina Fauss',
    '2020',
  ]
headerImage: '/images/news/zoom_lab_photo.jpg'
featured: false
draft: false
slug: 'finding-support-in-a-time-of-physical-distancing'
---
```

### 4. Static Pages (`_pages/` → `content/pages/`)

**Source Structure**: Individual `.md` and `.html` files in `_pages/` directory
**Target Structure**: MDX files in `content/pages/` or direct Next.js page components

#### Key Pages to Migrate:

- `home.md` → `src/app/page.tsx` (homepage)
- `teaching.md` → `content/pages/teaching.mdx`
- `opportunities.md` → `content/pages/opportunities.mdx`
- `environmental_sensing.md` → `content/pages/environmental-sensing.mdx`
- `dryland_ecohydrology.md` → `content/pages/dryland-ecohydrology.mdx`
- `wsc.md` → `content/pages/wsc.mdx`

### 5. Site Data (`_data/` → `src/lib/data/`)

**Source Structure**: YAML files in `_data/` directory
**Target Structure**: TypeScript files in `src/lib/data/` directory

#### Files to Migrate:

- `authors.yml` → `src/lib/data/authors.ts`
- `navigation.yml` → `src/lib/data/navigation.ts`
- `ui-text.yml` → `src/lib/data/ui-text.ts`

## Asset Migration Strategy

### Image Assets

- **Source**: `assets/images/` directory
- **Target**: `public/images/` directory
- **Optimization**: Use Next.js Image component with automatic optimization
- **Structure**:
  ```
  public/images/
  ├── people/          # Profile photos
  ├── publications/    # Publication figures and teasers
  ├── news/           # News post images
  ├── projects/       # Project images
  └── site/           # Site-wide images (logos, headers, etc.)
  ```

### File Assets

- **Source**: `assets/files/` directory (CVs, PDFs, etc.)
- **Target**: `public/files/` directory
- **Structure**:
  ```
  public/files/
  ├── cv/             # Curriculum vitae files
  ├── publications/   # PDF reprints
  └── presentations/  # Presentation slides
  ```

## URL Structure Mapping

### Current Jekyll URLs → New Next.js URLs

- `/people/[name]/` → `/people/[slug]/`
- `/publications/[id]/` → `/publications/[slug]/`
- `/2020/05/07/covid/` → `/news/finding-support-in-a-time-of-physical-distancing`
- `/teaching/` → `/teaching`
- `/opportunities/` → `/opportunities`

### Redirect Strategy

Implement 301 redirects in `next.config.ts` to maintain SEO and user experience:

```typescript
const redirects = [
  {
    source: '/people/:name',
    destination: '/people/:name',
    permanent: true,
  },
  {
    source: '/publications/:id',
    destination: '/publications/:id',
    permanent: true,
  },
  // Add more redirects as needed
];
```

## Content Enhancement Opportunities

### 1. Enhanced Metadata

- Add structured data for SEO
- Include ORCID, Google Scholar, ResearchGate links
- Add research area classifications
- Include publication metrics (citations, Altmetric scores)

### 2. Content Relationships

- Link people to their publications
- Link publications to research areas
- Cross-reference related content
- Add author collaboration networks

### 3. External Integrations

- ORCID API for researcher profiles
- Google Scholar API for citation metrics
- Altmetric API for research impact
- DOI resolution for publication links

## Migration Scripts Required

### 1. People Migration Script

- Parse `_people/` directory
- Extract YAML front matter
- Transform to new MDX format
- Handle image asset migration
- Generate slugs from names

### 2. Publications Migration Script

- Parse `_publications/` directory
- Extract publication metadata
- Transform author lists
- Handle DOI links and abstracts
- Migrate associated images

### 3. News Posts Migration Script

- Parse `_posts/` directory
- Extract post metadata
- Transform categories and tags
- Generate SEO-friendly slugs
- Migrate associated images

### 4. Asset Migration Script

- Copy and optimize images
- Update image paths in content
- Generate responsive image variants
- Create image metadata

### 5. Data Migration Script

- Convert YAML data files to TypeScript
- Transform navigation structure
- Update UI text references
- Maintain data relationships

## Validation and Quality Assurance

### Content Validation

- Verify all front matter fields are properly migrated
- Check for missing required fields
- Validate image paths and assets
- Ensure proper slug generation

### Link Validation

- Verify internal links work correctly
- Check external links are accessible
- Validate redirects function properly
- Test navigation structure

### Performance Validation

- Optimize image sizes and formats
- Verify page load times
- Check Core Web Vitals
- Validate SEO metadata

## Implementation Timeline

### Phase 1: Foundation (Week 1)

- Set up content directory structure
- Create migration script templates
- Establish validation procedures

### Phase 2: Content Migration (Weeks 2-3)

- Migrate people profiles
- Migrate publications
- Migrate news posts
- Migrate static pages

### Phase 3: Asset Migration (Week 4)

- Migrate and optimize images
- Update content references
- Implement image optimization

### Phase 4: Validation and Testing (Week 5)

- Validate migrated content
- Test all functionality
- Fix any issues
- Performance optimization

This migration schema provides a comprehensive roadmap for transforming the Jekyll site to a modern Next.js platform while preserving all content and enhancing functionality.
