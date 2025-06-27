# Migration Validation Guide

This guide covers the comprehensive validation system for the WAVES Lab website migration from Jekyll to Next.js.

## Overview

The validation system ensures that all migrated content is complete, accurate, and consistent. It consists of two main components:

1. **Migration Validation**: Checks completeness and structure of migrated content
2. **Data Integrity Validation**: Checks for duplicates, missing files, and data consistency

## Validation Components

### 1. Migration Validation (`validate-migration.ts`)

Validates the overall migration process and content structure:

#### Content Completeness

- Compares counts between legacy and migrated content
- Ensures migration rates above 90% threshold
- Reports missing content categories

#### Content Structure

- Validates frontmatter fields in MDX files
- Checks required fields for each content type
- Verifies data format consistency

#### Cross-References

- Validates author references in publications
- Checks for broken internal links
- Ensures referential integrity

#### Image Migration

- Verifies image directory structure
- Checks for optimized formats (WebP, AVIF)
- Validates responsive image generation

### 2. Data Integrity Validation (`validate-data-integrity.ts`)

Performs deep data quality checks:

#### Duplicate Detection

- **People**: Duplicate names and email addresses
- **Publications**: Duplicate titles and DOIs
- **News**: Duplicate titles and slugs

#### Missing File Detection

- Missing person profile images
- Missing publication figures
- Broken file references

#### Data Consistency

- Slug-filename consistency
- Date format validation
- Required field completeness

#### Orphaned File Detection

- Images without corresponding content
- Unused assets and files

## Usage

### Quick Validation

```bash
# Run comprehensive validation
./scripts/validate-all.sh

# Run only migration validation
./scripts/validate-migration.sh

# Run only data integrity validation
npx tsx src/lib/migration/validate-data-integrity.ts
```

### Programmatic Usage

```typescript
import { MigrationValidator } from './src/lib/migration/validate-migration';
import { DataIntegrityValidator } from './src/lib/migration/validate-data-integrity';

// Migration validation
const migrationValidator = new MigrationValidator();
const migrationSummary = await migrationValidator.validate();

// Data integrity validation
const integrityValidator = new DataIntegrityValidator();
const integrityReport = await integrityValidator.validate();
```

## Validation Criteria

### People Content

**Required Fields:**

- `name`: Full name of the person
- `slug`: URL-friendly identifier
- `status`: Current status (faculty, student, alumni, etc.)

**Optional Fields:**

- `email`: Contact email
- `website`: Personal website
- `orcid`: ORCID identifier
- `bio`: Biography text

**Validation Checks:**

- ✅ All required fields present
- ✅ Slug matches filename
- ✅ No duplicate names or emails
- ✅ Profile image exists

### Publications Content

**Required Fields:**

- `title`: Publication title
- `slug`: URL-friendly identifier
- `authors`: Array of author names
- `year`: Publication year

**Optional Fields:**

- `journal`: Journal name
- `doi`: Digital Object Identifier
- `abstract`: Publication abstract
- `tags`: Subject tags

**Validation Checks:**

- ✅ All required fields present
- ✅ Valid year (1990-current+1)
- ✅ Authors array format
- ✅ No duplicate titles or DOIs
- ✅ Publication figure exists (optional)

### News Content

**Required Fields:**

- `title`: News post title
- `slug`: URL-friendly identifier
- `date`: Publication date

**Optional Fields:**

- `author`: Post author
- `tags`: Topic tags
- `excerpt`: Post summary

**Validation Checks:**

- ✅ All required fields present
- ✅ Valid date format
- ✅ No duplicate titles or slugs
- ✅ Slug matches filename

### Image Content

**Validation Checks:**

- ✅ Directory structure exists
- ✅ Optimized formats generated (WebP, AVIF)
- ✅ Responsive sizes created
- ✅ No orphaned images
- ✅ All referenced images exist

## Reports Generated

### Migration Validation Report

**Location**: `docs/migration/VALIDATION_REPORT.md`

**Contents:**

- Summary statistics (passed/warnings/errors)
- Results by content category
- Detailed validation results
- Recommendations for fixes

### Data Integrity Report

**Location**: `docs/migration/DATA_INTEGRITY_REPORT.md`

**Contents:**

- Issue summary by type
- Critical issues requiring immediate attention
- Warnings that should be addressed
- Informational items for review

### JSON Reports

**Locations**:

- `docs/migration/validation-results.json`
- `docs/migration/data-integrity-results.json`

**Usage**: Programmatic access to validation results for CI/CD integration

## Issue Severity Levels

### 🚨 Critical (Error)

Issues that prevent the site from functioning correctly:

- Missing required fields
- Invalid data formats
- Duplicate unique identifiers

### ⚠️ Warning

Issues that should be addressed but don't break functionality:

- Missing optional images
- Duplicate non-unique content
- Inconsistent formatting

### ℹ️ Information

Items for review that may or may not require action:

- Orphaned files
- Optimization opportunities
- Data quality suggestions

## Common Issues and Solutions

### Migration Completeness Issues

#### Low Migration Rate

```
Only 45/50 people migrated (90%)
```

**Solution**: Check migration script logs for errors, verify source data integrity

#### Missing Content Categories

```
No news posts found in migrated content
```

**Solution**: Run the specific migration script for the missing content type

### Structure Issues

#### Missing Required Fields

```
Missing required fields in john-doe.mdx: email, status
```

**Solution**: Add missing fields to the frontmatter:

```yaml
---
name: 'John Doe'
slug: 'john-doe'
email: 'john.doe@example.com'
status: 'faculty'
---
```

#### Slug-Filename Mismatch

```
Slug-filename mismatch: slug="jane_smith", filename="jane-smith"
```

**Solution**: Update slug to match filename or rename file:

```yaml
---
slug: 'jane-smith' # Match filename
---
```

### Data Integrity Issues

#### Duplicate Content

```
Duplicate person name: "John Smith"
```

**Solution**: Review duplicate entries and merge or differentiate:

- Add middle initials or suffixes
- Verify if they are different people
- Merge duplicate entries if same person

#### Missing Images

```
No image found for person: Jane Doe
```

**Solution**: Add person image or create placeholder:

```bash
# Add image to public/images/people/
cp source-image.jpg public/images/people/jane-doe.jpg
```

#### Invalid Dates

```
Invalid date format in news-post.mdx: "2020-13-45"
```

**Solution**: Fix date format in frontmatter:

```yaml
---
date: '2020-12-15' # Use valid ISO date
---
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Validate Migration
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: ./scripts/validate-all.sh
      - name: Upload validation reports
        uses: actions/upload-artifact@v3
        with:
          name: validation-reports
          path: docs/migration/*REPORT.md
```

### Exit Codes

- `0`: Validation passed (no critical errors)
- `1`: Critical errors found (must fix before proceeding)

## Best Practices

### Before Migration

1. **Backup source data** before running migration scripts
2. **Run validation** on a small sample first
3. **Review validation criteria** to understand requirements

### During Migration

1. **Run validation frequently** to catch issues early
2. **Fix critical errors immediately** before proceeding
3. **Address warnings** to improve data quality

### After Migration

1. **Run comprehensive validation** before going live
2. **Review all reports** for completeness
3. **Set up automated validation** in CI/CD pipeline

## Troubleshooting

### Validation Script Fails

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Run with verbose output
npx tsx --inspect src/lib/migration/validate-migration.ts
```

### Memory Issues with Large Datasets

```typescript
// Reduce batch size in validation scripts
const batchSize = 10; // Reduce from default
```

### Permission Errors

```bash
# Fix file permissions
chmod -R 755 content/
chmod -R 755 public/images/
```

## Extending Validation

### Adding Custom Checks

```typescript
// Add to MigrationValidator class
private async validateCustomField(): Promise<void> {
  // Custom validation logic
  const files = await glob('content/**/*.mdx');

  for (const file of files) {
    const { data } = matter(await fs.readFile(file, 'utf-8'));

    if (data.customField && !this.isValidCustomField(data.customField)) {
      this.addResult('publications', 'warning',
        `Invalid custom field in ${file}`);
    }
  }
}
```

### Custom Validation Rules

```typescript
interface CustomValidationRule {
  name: string;
  check: (content: any) => boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

const customRules: CustomValidationRule[] = [
  {
    name: 'email-format',
    check: (data) => !data.email || /\S+@\S+\.\S+/.test(data.email),
    message: 'Invalid email format',
    severity: 'error',
  },
];
```

## Performance Optimization

### Large Datasets

- Process files in batches
- Use streaming for very large files
- Implement caching for repeated checks

### Parallel Processing

```typescript
// Process files in parallel
const results = await Promise.all(files.map((file) => this.validateFile(file)));
```

This validation system ensures high-quality, consistent data throughout the migration process and provides clear guidance for resolving any issues that arise.
