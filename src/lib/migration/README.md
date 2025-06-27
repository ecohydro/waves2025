# Migration Scripts

This directory contains the working migration scripts for converting the Jekyll-based WAVES lab website to Next.js with enhanced data integration.

## 🚀 Main Migration Scripts

### Publications

- **`migrate-publications-semantic.ts`** - Enhanced publications migration with Semantic Scholar API integration
  - Migrates Jekyll publications to Next.js MDX format
  - Enriches with citation data, abstracts, author info from Semantic Scholar
  - Usage: `npx tsx migrate-publications-semantic.ts [source] [target] [options]`

- **`semantic-scholar-background.ts`** - Background processor for continuous Semantic Scholar enhancement
  - Runs as a long-running process to enhance publications over time
  - Graceful shutdown with progress saving and resumption
  - Usage: `npx tsx semantic-scholar-background.ts [source] [target] [options]`

### People

- **`migrate-people-enhanced.ts`** - Enhanced people migration with CSV data integration
  - Migrates Jekyll people profiles to Next.js MDX format
  - Integrates additional data from Kelly's CSV files
  - Smart matching and relationship mapping
  - Usage: `npx tsx migrate-people-enhanced.ts [source] [target] [options]`

### News

- **`migrate-news.ts`** - News/blog posts migration
  - Migrates Jekyll posts to Next.js MDX format
  - Handles date formatting and categorization
  - Usage: `npx tsx migrate-news.ts [source] [target] [options]`

### PDF Enhancement

- **`enhance-publications-with-pdfs.ts`** - PDF content extraction and matching
  - Extracts metadata from PDF files
  - Matches PDFs to publications
  - Enhances publications with PDF-derived data
  - Usage: `npx tsx enhance-publications-with-pdfs.ts`

## 🛠 Core Infrastructure

### API Integration

- **`semantic-scholar-working.ts`** - Semantic Scholar API wrapper
  - Working version without authentication issues
  - Rate limiting and error handling
  - DOI and title-based paper lookup

### Utilities

- **`utils.ts`** - Shared utility functions
  - Slug generation
  - File processing helpers
  - Progress logging

- **`types.ts`** - TypeScript type definitions
  - Jekyll and Next.js content interfaces
  - Migration result types

## 📋 Usage Examples

### Quick Start - Publications with Semantic Scholar

```bash
# Test with a few files
npx tsx migrate-publications-semantic.ts legacy/_publications content/publications --dry-run --max 5

# Run full migration
npx tsx migrate-publications-semantic.ts legacy/_publications content/publications
```

### Background Processing

```bash
# Start background processor (can run for hours)
npx tsx semantic-scholar-background.ts content/publications

# With custom delay (10 seconds between requests)
npx tsx semantic-scholar-background.ts content/publications --delay 10
```

### People Migration

```bash
# Migrate people with CSV enhancement
npx tsx migrate-people-enhanced.ts legacy/_people content/people
```

### News Migration

```bash
# Migrate news posts
npx tsx migrate-news.ts legacy/_posts content/news
```

## 🎯 Recommended Migration Workflow

1. **People First**: `migrate-people-enhanced.ts`
   - Establishes author/person database
   - Creates relationships for publications

2. **Publications**: `migrate-publications-semantic.ts`
   - Migrates basic publication data
   - Adds initial Semantic Scholar data

3. **Background Enhancement**: `semantic-scholar-background.ts`
   - Let run for 1-2 hours to enhance all publications
   - Can be stopped/resumed as needed

4. **News**: `migrate-news.ts`
   - Migrate blog posts and news items

5. **PDF Enhancement**: `enhance-publications-with-pdfs.ts`
   - Match and enhance with PDF metadata

## ⚙️ Configuration

### Environment Variables

- `SEMANTIC_SCHOLAR_API_KEY` - API key for Semantic Scholar (optional, currently disabled)

### Command Line Options

#### Publications Migration

- `--dry-run` - Preview without writing files
- `--max N` - Limit to N files
- `--skip-semantic-scholar` - Skip API enhancement

#### Background Processor

- `--delay N` - Seconds between requests (default: 6)
- `--no-skip-existing` - Re-process files with existing data
- `--batch-size N` - Progress report frequency (default: 10)

#### People Migration

- `--dry-run` - Preview without writing files
- `--csv-dir PATH` - Path to CSV files directory

## 📊 Progress Tracking

### Background Processor

- Creates `semantic-scholar-progress.json` for state persistence
- Graceful shutdown with Ctrl+C
- Automatic resumption from last position
- Real-time progress reports

### Migration Stats

All scripts provide detailed statistics:

- Files processed vs total
- Success/failure rates
- Enhancement rates (for Semantic Scholar)
- Processing time estimates

## 🔧 Troubleshooting

### Rate Limiting

- Semantic Scholar: 100 requests/5min without API key
- Background processor automatically handles rate limits
- Increase `--delay` if hitting limits frequently

### File Issues

- Check file permissions in source/target directories
- Ensure proper Jekyll front matter format
- Validate MDX output with `--dry-run` first

### API Issues

- Semantic Scholar API key currently disabled due to auth issues
- Scripts work without authentication (with rate limits)
- Check network connectivity for API calls

## 📁 File Structure After Migration

```
content/
├── people/
│   ├── person-name.mdx
│   └── ...
├── publications/
│   ├── paper-title-year.mdx
│   └── ...
└── news/
    ├── news-title-date.mdx
    └── ...
```

Each MDX file contains:

- YAML front matter with metadata
- Enhanced data (citations, relationships, etc.)
- Markdown content with generated sections
