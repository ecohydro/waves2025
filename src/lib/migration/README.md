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
  - Rate limiting and error handling
  - DOI and title-based paper lookup

- **`semantic-scholar-utils.ts`** - Focused utilities for the new workflow
  - `fetchAuthorInfoById(authorId, fields?)`: uses the `author/batch` endpoint to retrieve author info (including paperIds)
  - `fetchPaperById(paperId, fields?)`: retrieves a single paper by Semantic Scholar paperId
  - Respects `SEMANTIC_SCHOLAR_API_KEY` automatically via `x-api-key`

### Utilities

- **`utils.ts`** - Shared utility functions
  - Slug generation
  - File processing helpers
  - Progress logging

- **`types.ts`** - TypeScript type definitions
  - Jekyll and Next.js content interfaces
  - Migration result types

- **`author-info-cli.ts`** - Quick CLI to fetch an author and (optionally) their papers
  - Usage: `npx tsx src/lib/migration/author-info-cli.ts --authorId <id> [--papers] [--limit N --offset N]`
  - Respects `SEMANTIC_SCHOLAR_API_KEY`; pass `--no-auth` to disable auth

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

### Author-based Upsert Workflow (Semantic Scholar)

This is the preferred strategy for comprehensive upserts:

1. Retrieve author info with `author/batch` using `fetchAuthorInfoById(authorId, 'name,url,paperCount,hIndex,papers')`.
2. Iterate the returned `papers` list and, for each `paperId`:
   - Fetch the full paper with `fetchPaperById(paperId)`.
   - Upsert into our publications dataset:
     - If a matching record exists, update it and set `semanticScholar.status: 'updated'`.
     - Otherwise, create a new record and set `semanticScholar.status: 'new'`.
   - Always persist `semanticScholar.paperId` to support fast future updates and de-duplication.

Notes:

- The background and upsert scripts now tag `semanticScholar.status` and store `semanticScholar.paperId`.
- You can still upsert by DOI or title, but paperId provides the most reliable identifier for future syncs.

## ⚙️ Configuration

### Environment Variables

- `SEMANTIC_SCHOLAR_API_KEY` - API key for Semantic Scholar (enabled). Place in `.env.local`.
- `SEMANTIC_SCHOLAR_DISABLE_API_KEY` - Set to `true` to temporarily disable the API key and use shared rate limits.
- `SEMANTIC_SCHOLAR_USER_AGENT` - Optional custom user agent for API requests.

All utilities and scripts will automatically use `SEMANTIC_SCHOLAR_API_KEY` via the `x-api-key` header when available.

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

- If you see 403 responses with an API key, try removing or regenerating the key.
- Scripts work without authentication (shared rate limits apply).
- Check network connectivity for API calls

## 🧪 Testing

### Unit Tests (fast)

Run only our focused unit tests (mocks fetch):

```
npx vitest run src/lib/migration/__tests__/semantic-scholar-utils.test.ts
```

### Integration Test (live API)

Validates response shape from the live API using `author_information.json` to resolve `authorId`:

```
npx vitest run --config vitest.integration.config.ts tests/integration/semantic-scholar-api.int.test.ts
```

This test does not assert on the entire payload (papers list may change over time), only on stable response shape and essential fields.

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
