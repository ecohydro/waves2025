# Content Directory Structure

This directory contains all the migrated content from the legacy Jekyll site, organized for the Next.js 14 platform.

## Directory Structure

```
content/
├── people/           # Individual person profiles (MDX files)
├── publications/     # Research publications (MDX files)
├── news/            # News/blog posts (MDX files)
└── pages/           # Static pages (MDX files)
```

## Content Types

### People Profiles (`people/`)

- **Source**: `legacy/_people/` directory
- **Format**: MDX files with enhanced metadata
- **Naming**: `[slug].mdx` (e.g., `kelly-caylor.mdx`)
- **Fields**: title, role, excerpt, avatar, location, email, social links, education, research areas, etc.

### Publications (`publications/`)

- **Source**: `legacy/_publications/` directory
- **Format**: MDX files with structured metadata
- **Naming**: `[slug].mdx` (e.g., `caylor2023_6934.mdx`)
- **Fields**: title, authors, journal, doi, publication date, abstract, keywords, etc.

### News Posts (`news/`)

- **Source**: `legacy/_posts/` directory
- **Format**: MDX files with blog post metadata
- **Naming**: `[slug].mdx` (e.g., `finding-support-in-a-time-of-physical-distancing.mdx`)
- **Fields**: title, date, author, excerpt, categories, tags, header image, etc.

### Static Pages (`pages/`)

- **Source**: `legacy/_pages/` directory
- **Format**: MDX files for static content
- **Naming**: `[slug].mdx` (e.g., `teaching.mdx`, `opportunities.mdx`)
- **Fields**: title, content, metadata for SEO

## Migration Process

1. **Content Migration Scripts**: Run migration scripts to convert Jekyll content to MDX format
2. **Asset Migration**: Copy and optimize images from `legacy/assets/` to `public/images/`
3. **File Migration**: Copy files (CVs, PDFs) from `legacy/assets/files/` to `public/files/`
4. **Validation**: Verify all content migrated correctly with proper metadata

## File Naming Conventions

- **Slugs**: URL-friendly versions of titles (lowercase, hyphens instead of spaces)
- **Images**: Descriptive names with appropriate extensions
- **Metadata**: Consistent field names across all content types

## Content Relationships

- People profiles link to their publications
- Publications link to their authors
- News posts can reference people and publications
- Cross-references maintained through consistent slug naming
