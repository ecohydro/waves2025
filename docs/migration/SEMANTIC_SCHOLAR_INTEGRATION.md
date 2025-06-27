# Semantic Scholar API Integration

## Overview

This document describes the integration of Semantic Scholar API to enhance publication data during the migration from Jekyll to Next.js. The integration enriches publication metadata with citation counts, abstracts, author information, and other scholarly metrics.

## Features

### Publication Enhancement

- **Citation Metrics**: Citation count, influential citation count, reference count
- **Author Information**: Enhanced author data with affiliations, h-index, paper count
- **Content Enhancement**: Abstracts, TL;DR summaries, fields of study
- **Access Information**: Open access status, PDF links
- **Venue Details**: Publication venue information

### Search Capabilities

- **DOI Lookup**: Direct paper lookup using DOI
- **Title Search**: Fuzzy title matching for papers without DOIs
- **Rate Limiting**: Automatic rate limiting and retry logic

## Files

### Core Integration

- `src/lib/migration/semantic-scholar-working.ts` - Main API integration (working version)
- `src/lib/migration/semantic-scholar.ts` - Original version (has auth issues)
- `src/lib/migration/migrate-publications-semantic.ts` - Enhanced migration script

### Environment

- `.env.local` - Contains Semantic Scholar API key (currently not working)

## API Key Status

**Current Status**: API key authentication is disabled due to authentication issues.

The provided API key (`PWJLuNS7DL3g28oceoSKB61yYsR1lSES7MEpnG7K`) returns 403 Forbidden errors when used. The integration currently works without authentication using the shared rate limit (100 requests per 5 minutes).

### To Enable API Key:

1. Verify the API key is valid with Semantic Scholar
2. Uncomment the API key lines in `semantic-scholar-working.ts`
3. Test authentication

## Usage

### Basic Enhancement

```typescript
import { enhancePublicationWithSemanticScholar } from './semantic-scholar-working';

const publication = {
  title: 'Paper Title',
  doi: '10.1000/182',
  year: 2023,
};

const enhanced = await enhancePublicationWithSemanticScholar(publication);
```

### Migration Script

```bash
# Run enhanced migration with Semantic Scholar data
npx tsx src/lib/migration/migrate-publications-semantic.ts legacy/_publications content/publications --dry-run --max 5

# Skip Semantic Scholar enhancement
npx tsx src/lib/migration/migrate-publications-semantic.ts legacy/_publications content/publications --skip-semantic-scholar
```

## Enhanced Publication Schema

The integration adds a `semanticScholar` field to publication frontmatter:

```yaml
title: 'Paper Title'
authors: 'Author 1, Author 2'
year: 2023
semanticScholar:
  paperId: 'abc123'
  url: 'https://www.semanticscholar.org/paper/abc123'
  citationCount: 42
  influentialCitationCount: 8
  referenceCount: 25
  isOpenAccess: true
  openAccessPdfUrl: 'https://example.com/paper.pdf'
  fieldsOfStudy: ['Computer Science', 'Machine Learning']
  tldr: 'This paper presents a novel approach to...'
  venue:
    name: 'Nature'
    id: 'venue123'
  enhancedAuthors:
    - name: 'Author 1'
      semanticScholarId: 'author123'
      affiliations: ['University A']
      paperCount: 50
      citationCount: 1000
      hIndex: 15
  lastUpdated: '2023-12-27T21:48:00.000Z'
```

## Rate Limiting

### Without API Key

- **Limit**: 100 requests per 5 minutes (shared across all unauthenticated users)
- **Strategy**: 5-second delays between requests
- **Retry**: Automatic 60-second wait on 429 errors

### With API Key (when working)

- **Limit**: 1 request per second per key
- **Strategy**: 3-second delays between requests
- **Benefits**: Dedicated rate limit, higher throughput

## Error Handling

The integration gracefully handles:

- **404 Not Found**: Paper not in Semantic Scholar database
- **429 Rate Limited**: Automatic retry with exponential backoff
- **400 Bad Request**: Invalid DOI or search parameters
- **Network Errors**: Timeout and connection issues

Failed enhancements don't stop the migration process - they simply log warnings and continue.

## Content Enhancement

### Generated MDX Sections

The enhanced publications include additional MDX content:

```markdown
## Abstract

[Paper abstract from Semantic Scholar]

## Summary

[TL;DR summary if available]

## Citation Metrics

- **Citations**: 42
- **Influential Citations**: 8
- **References**: 25

## Access

- **Open Access**: Yes
- **PDF**: [Download](https://example.com/paper.pdf)

## Author Information

### Author Name

- **Affiliations**: University A, Lab B
- **Papers**: 50
- **Citations**: 1000
- **H-Index**: 15

## Links

- [Semantic Scholar](https://www.semanticscholar.org/paper/abc123)
- [DOI](https://doi.org/10.1000/182)
```

## Testing

### Test Files

- `test-semantic-scholar.ts` - Test the main integration
- `test-simple-api.ts` - Test basic API connectivity

### Manual Testing

```bash
# Test basic API connectivity
npx tsx test-simple-api.ts

# Test full enhancement
npx tsx test-semantic-scholar.ts
```

## Future Improvements

1. **API Key Resolution**: Get working API key from Semantic Scholar
2. **Batch Processing**: Use batch endpoints for better efficiency
3. **Caching**: Cache results to avoid redundant API calls
4. **Author Matching**: Match publication authors to lab members
5. **Citation Tracking**: Track citation changes over time

## API Documentation

- **Semantic Scholar API**: https://api.semanticscholar.org/
- **Documentation**: https://www.semanticscholar.org/product/api
- **Rate Limits**: https://www.semanticscholar.org/product/api#api-key-form

## Migration Statistics

When running the enhanced migration, you'll see statistics like:

- Total publications processed
- Semantic Scholar enhancement rate
- Success/failure rates
- Processing time

Example output:

```
Enhanced with Semantic Scholar: 85/100 (85%)
Success rate: 97.0%
Semantic Scholar enhancement rate: 87.6%
```
