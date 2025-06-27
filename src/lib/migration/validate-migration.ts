#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';

interface ValidationResult {
  type: 'people' | 'publications' | 'news' | 'images';
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: Record<string, unknown>;
}

interface ValidationSummary {
  totalChecks: number;
  passed: number;
  warnings: number;
  errors: number;
  results: ValidationResult[];
}

interface ContentStats {
  legacy: {
    people: number;
    publications: number;
    news: number;
    images: number;
  };
  migrated: {
    people: number;
    publications: number;
    news: number;
    images: number;
  };
}

class MigrationValidator {
  private results: ValidationResult[] = [];

  async validate(): Promise<ValidationSummary> {
    console.log('🔍 Starting migration validation...\n');

    try {
      // Validate content migration completeness
      await this.validateContentCompleteness();

      // Validate content structure and format
      await this.validateContentStructure();

      // Validate image migration
      await this.validateImageMigration();

      // Validate cross-references and links
      await this.validateCrossReferences();

      // Generate summary
      const summary = this.generateSummary();

      // Generate reports
      await this.generateReports(summary);

      return summary;
    } catch (error) {
      console.error('Validation failed:', error);
      throw error;
    }
  }

  private async validateContentCompleteness(): Promise<void> {
    console.log('📊 Validating content completeness...');

    const stats = await this.getContentStats();

    // Check people migration
    if (stats.migrated.people === 0) {
      this.addResult('people', 'error', 'No people profiles found in migrated content');
    } else if (stats.migrated.people < stats.legacy.people * 0.9) {
      this.addResult(
        'people',
        'warning',
        `Only ${stats.migrated.people}/${stats.legacy.people} people migrated (${Math.round((stats.migrated.people / stats.legacy.people) * 100)}%)`,
      );
    } else {
      this.addResult(
        'people',
        'success',
        `People migration complete: ${stats.migrated.people}/${stats.legacy.people} (${Math.round((stats.migrated.people / stats.legacy.people) * 100)}%)`,
      );
    }

    // Check publications migration
    if (stats.migrated.publications === 0) {
      this.addResult('publications', 'error', 'No publications found in migrated content');
    } else if (stats.migrated.publications < stats.legacy.publications * 0.9) {
      this.addResult(
        'publications',
        'warning',
        `Only ${stats.migrated.publications}/${stats.legacy.publications} publications migrated (${Math.round((stats.migrated.publications / stats.legacy.publications) * 100)}%)`,
      );
    } else {
      this.addResult(
        'publications',
        'success',
        `Publications migration complete: ${stats.migrated.publications}/${stats.legacy.publications} (${Math.round((stats.migrated.publications / stats.legacy.publications) * 100)}%)`,
      );
    }

    // Check news migration
    if (stats.migrated.news === 0) {
      this.addResult('news', 'error', 'No news posts found in migrated content');
    } else if (stats.migrated.news < stats.legacy.news * 0.9) {
      this.addResult(
        'news',
        'warning',
        `Only ${stats.migrated.news}/${stats.legacy.news} news posts migrated (${Math.round((stats.migrated.news / stats.legacy.news) * 100)}%)`,
      );
    } else {
      this.addResult(
        'news',
        'success',
        `News migration complete: ${stats.migrated.news}/${stats.legacy.news} (${Math.round((stats.migrated.news / stats.legacy.news) * 100)}%)`,
      );
    }

    // Check images migration
    if (stats.migrated.images === 0) {
      this.addResult('images', 'error', 'No images found in migrated content');
    } else if (stats.migrated.images < stats.legacy.images * 0.9) {
      this.addResult(
        'images',
        'warning',
        `Only ${stats.migrated.images}/${stats.legacy.images} images migrated (${Math.round((stats.migrated.images / stats.legacy.images) * 100)}%)`,
      );
    } else {
      this.addResult(
        'images',
        'success',
        `Images migration complete: ${stats.migrated.images}/${stats.legacy.images} (${Math.round((stats.migrated.images / stats.legacy.images) * 100)}%)`,
      );
    }
  }

  private async validateContentStructure(): Promise<void> {
    console.log('🏗️  Validating content structure...');

    // Validate people content
    await this.validatePeopleStructure();

    // Validate publications content
    await this.validatePublicationsStructure();

    // Validate news content
    await this.validateNewsStructure();
  }

  private async validatePeopleStructure(): Promise<void> {
    const peopleFiles = await glob('content/people/*.mdx');
    let validPeople = 0;
    let invalidPeople = 0;
    const issues: string[] = [];

    for (const filePath of peopleFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter } = matter(content);

        // Check required fields
        const requiredFields = ['name', 'slug', 'status'];
        const missingFields = requiredFields.filter((field) => !frontmatter[field]);

        if (missingFields.length > 0) {
          issues.push(
            `${path.basename(filePath)}: Missing required fields: ${missingFields.join(', ')}`,
          );
          invalidPeople++;
        } else {
          validPeople++;
        }

        // Check slug consistency
        const expectedSlug = path.basename(filePath, '.mdx');
        if (frontmatter.slug !== expectedSlug) {
          issues.push(
            `${path.basename(filePath)}: Slug mismatch - expected '${expectedSlug}', got '${frontmatter.slug}'`,
          );
        }
      } catch (error) {
        issues.push(`${path.basename(filePath)}: Failed to parse - ${error}`);
        invalidPeople++;
      }
    }

    if (invalidPeople === 0) {
      this.addResult(
        'people',
        'success',
        `All ${validPeople} people profiles have valid structure`,
      );
    } else {
      this.addResult(
        'people',
        'warning',
        `${invalidPeople}/${validPeople + invalidPeople} people profiles have structural issues`,
        { issues: issues.slice(0, 10) }, // Show first 10 issues
      );
    }
  }

  private async validatePublicationsStructure(): Promise<void> {
    const publicationFiles = await glob('content/publications/*.mdx');
    let validPublications = 0;
    let invalidPublications = 0;
    const issues: string[] = [];

    for (const filePath of publicationFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter } = matter(content);

        // Check required fields
        const requiredFields = ['title', 'slug', 'authors', 'year'];
        const missingFields = requiredFields.filter((field) => !frontmatter[field]);

        if (missingFields.length > 0) {
          issues.push(
            `${path.basename(filePath)}: Missing required fields: ${missingFields.join(', ')}`,
          );
          invalidPublications++;
        } else {
          validPublications++;
        }

        // Check year format
        if (
          frontmatter.year &&
          (isNaN(frontmatter.year) ||
            frontmatter.year < 1990 ||
            frontmatter.year > new Date().getFullYear() + 1)
        ) {
          issues.push(`${path.basename(filePath)}: Invalid year: ${frontmatter.year}`);
        }

        // Check authors format
        if (frontmatter.authors && !Array.isArray(frontmatter.authors)) {
          issues.push(`${path.basename(filePath)}: Authors should be an array`);
        }
      } catch (error) {
        issues.push(`${path.basename(filePath)}: Failed to parse - ${error}`);
        invalidPublications++;
      }
    }

    if (invalidPublications === 0) {
      this.addResult(
        'publications',
        'success',
        `All ${validPublications} publications have valid structure`,
      );
    } else {
      this.addResult(
        'publications',
        'warning',
        `${invalidPublications}/${validPublications + invalidPublications} publications have structural issues`,
        { issues: issues.slice(0, 10) },
      );
    }
  }

  private async validateNewsStructure(): Promise<void> {
    const newsFiles = await glob('content/news/*.mdx');
    let validNews = 0;
    let invalidNews = 0;
    const issues: string[] = [];

    for (const filePath of newsFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter } = matter(content);

        // Check required fields
        const requiredFields = ['title', 'slug', 'date'];
        const missingFields = requiredFields.filter((field) => !frontmatter[field]);

        if (missingFields.length > 0) {
          issues.push(
            `${path.basename(filePath)}: Missing required fields: ${missingFields.join(', ')}`,
          );
          invalidNews++;
        } else {
          validNews++;
        }

        // Check date format
        if (frontmatter.date && isNaN(Date.parse(frontmatter.date))) {
          issues.push(`${path.basename(filePath)}: Invalid date format: ${frontmatter.date}`);
        }
      } catch (error) {
        issues.push(`${path.basename(filePath)}: Failed to parse - ${error}`);
        invalidNews++;
      }
    }

    if (invalidNews === 0) {
      this.addResult('news', 'success', `All ${validNews} news posts have valid structure`);
    } else {
      this.addResult(
        'news',
        'warning',
        `${invalidNews}/${validNews + invalidNews} news posts have structural issues`,
        { issues: issues.slice(0, 10) },
      );
    }
  }

  private async validateImageMigration(): Promise<void> {
    console.log('🖼️  Validating image migration...');

    // Check if image directories exist
    const imageDirectories = [
      'public/images/people',
      'public/images/publications',
      'public/images/news',
      'public/images/projects',
      'public/images/site',
    ];

    for (const dir of imageDirectories) {
      try {
        await fs.access(dir);
        this.addResult('images', 'success', `Image directory exists: ${dir}`);
      } catch {
        this.addResult('images', 'error', `Missing image directory: ${dir}`);
      }
    }

    // Check for optimized image formats
    const peopleImages = await glob('public/images/people/*.{jpg,png,webp,avif}');
    const webpImages = peopleImages.filter((img) => img.endsWith('.webp'));
    const avifImages = peopleImages.filter((img) => img.endsWith('.avif'));

    if (webpImages.length > 0) {
      this.addResult('images', 'success', `Found ${webpImages.length} WebP optimized images`);
    } else {
      this.addResult('images', 'warning', 'No WebP optimized images found');
    }

    if (avifImages.length > 0) {
      this.addResult('images', 'success', `Found ${avifImages.length} AVIF optimized images`);
    } else {
      this.addResult('images', 'warning', 'No AVIF optimized images found');
    }

    // Check for responsive image sizes
    const thumbnailImages = await glob('public/images/**/*-thumbnail.{jpg,png,webp,avif}');
    const smallImages = await glob('public/images/**/*-small.{jpg,png,webp,avif}');
    const mediumImages = await glob('public/images/**/*-medium.{jpg,png,webp,avif}');
    const largeImages = await glob('public/images/**/*-large.{jpg,png,webp,avif}');

    this.addResult(
      'images',
      'success',
      `Responsive images generated: ${thumbnailImages.length} thumbnail, ${smallImages.length} small, ${mediumImages.length} medium, ${largeImages.length} large`,
    );
  }

  private async validateCrossReferences(): Promise<void> {
    console.log('🔗 Validating cross-references...');

    // Check for broken internal links in publications
    const publicationFiles = await glob('content/publications/*.mdx');
    const peopleFiles = await glob('content/people/*.mdx');
    const peopleNames = new Set();

    // Build list of people names/slugs
    for (const filePath of peopleFiles) {
      const content = await fs.readFile(filePath, 'utf-8');
      const { data: frontmatter } = matter(content);
      if (frontmatter.name) peopleNames.add(frontmatter.name);
      if (frontmatter.slug) peopleNames.add(frontmatter.slug);
    }

    let brokenReferences = 0;
    const brokenLinks: string[] = [];

    for (const filePath of publicationFiles) {
      const content = await fs.readFile(filePath, 'utf-8');
      const { data: frontmatter } = matter(content);

      // Check if authors exist in people collection
      if (frontmatter.authors && Array.isArray(frontmatter.authors)) {
        for (const author of frontmatter.authors) {
          if (typeof author === 'string' && !peopleNames.has(author)) {
            brokenLinks.push(
              `${path.basename(filePath)}: Author '${author}' not found in people collection`,
            );
            brokenReferences++;
          }
        }
      }
    }

    if (brokenReferences === 0) {
      this.addResult('publications', 'success', 'All author references are valid');
    } else {
      this.addResult(
        'publications',
        'warning',
        `Found ${brokenReferences} potentially broken author references`,
        { brokenLinks: brokenLinks.slice(0, 10) },
      );
    }
  }

  private async getContentStats(): Promise<ContentStats> {
    // Count legacy content
    const legacyPeople = await this.countFiles('legacy/_people/*.md');
    const legacyPublications = await this.countFiles('legacy/_publications/*.md');
    const legacyNews = await this.countFiles('legacy/_posts/*.md');
    const legacyImages = await this.countFiles(
      'legacy/assets/images/**/*.{jpg,jpeg,png,gif,webp,svg}',
    );

    // Count migrated content
    const migratedPeople = await this.countFiles('content/people/*.mdx');
    const migratedPublications = await this.countFiles('content/publications/*.mdx');
    const migratedNews = await this.countFiles('content/news/*.mdx');
    const migratedImages = await this.countFiles(
      'public/images/**/*.{jpg,jpeg,png,gif,webp,svg,avif}',
    );

    return {
      legacy: {
        people: legacyPeople,
        publications: legacyPublications,
        news: legacyNews,
        images: legacyImages,
      },
      migrated: {
        people: migratedPeople,
        publications: migratedPublications,
        news: migratedNews,
        images: migratedImages,
      },
    };
  }

  private async countFiles(pattern: string): Promise<number> {
    try {
      const files = await glob(pattern, { ignore: ['**/.DS_Store'] });
      return files.length;
    } catch {
      return 0;
    }
  }

  private addResult(
    type: ValidationResult['type'],
    status: ValidationResult['status'],
    message: string,
    details?: Record<string, unknown>,
  ): void {
    this.results.push({ type, status, message, details });
  }

  private generateSummary(): ValidationSummary {
    const totalChecks = this.results.length;
    const passed = this.results.filter((r) => r.status === 'success').length;
    const warnings = this.results.filter((r) => r.status === 'warning').length;
    const errors = this.results.filter((r) => r.status === 'error').length;

    return {
      totalChecks,
      passed,
      warnings,
      errors,
      results: this.results,
    };
  }

  private async generateReports(summary: ValidationSummary): Promise<void> {
    // Generate markdown report
    const markdownReport = this.generateMarkdownReport(summary);
    await fs.writeFile('docs/migration/VALIDATION_REPORT.md', markdownReport, 'utf-8');

    // Generate JSON report
    await fs.writeFile(
      'docs/migration/validation-results.json',
      JSON.stringify(summary, null, 2),
      'utf-8',
    );

    // Console summary
    console.log('\n📊 Validation Summary:');
    console.log(`✅ Passed: ${summary.passed}`);
    console.log(`⚠️  Warnings: ${summary.warnings}`);
    console.log(`❌ Errors: ${summary.errors}`);
    console.log(`📋 Total checks: ${summary.totalChecks}`);

    const successRate = Math.round((summary.passed / summary.totalChecks) * 100);
    console.log(`📈 Success rate: ${successRate}%`);

    if (summary.errors > 0) {
      console.log('\n❌ Critical issues found:');
      summary.results
        .filter((r) => r.status === 'error')
        .forEach((result) => console.log(`  - ${result.message}`));
    }

    if (summary.warnings > 0) {
      console.log('\n⚠️  Warnings:');
      summary.results
        .filter((r) => r.status === 'warning')
        .slice(0, 5) // Show first 5 warnings
        .forEach((result) => console.log(`  - ${result.message}`));

      if (summary.warnings > 5) {
        console.log(`  ... and ${summary.warnings - 5} more warnings`);
      }
    }

    console.log('\n📄 Detailed reports saved to:');
    console.log('  - docs/migration/VALIDATION_REPORT.md');
    console.log('  - docs/migration/validation-results.json');
  }

  private generateMarkdownReport(summary: ValidationSummary): string {
    const successRate = Math.round((summary.passed / summary.totalChecks) * 100);

    return `# Migration Validation Report

Generated on: ${new Date().toISOString()}

## Summary

- **Total Checks**: ${summary.totalChecks}
- **Passed**: ${summary.passed} ✅
- **Warnings**: ${summary.warnings} ⚠️
- **Errors**: ${summary.errors} ❌
- **Success Rate**: ${successRate}%

## Results by Category

### People Migration
${this.getResultsByType('people', summary.results)}

### Publications Migration
${this.getResultsByType('publications', summary.results)}

### News Migration
${this.getResultsByType('news', summary.results)}

### Images Migration
${this.getResultsByType('images', summary.results)}

## Detailed Results

${summary.results
  .map(
    (result) => `
### ${this.getStatusIcon(result.status)} ${result.type.toUpperCase()}: ${result.message}

${
  result.details
    ? `
**Details:**
${Array.isArray(result.details.issues) ? result.details.issues.map((issue: string) => `- ${issue}`).join('\n') : ''}
${Array.isArray(result.details.brokenLinks) ? result.details.brokenLinks.map((link: string) => `- ${link}`).join('\n') : ''}
`
    : ''
}
`,
  )
  .join('\n')}

## Recommendations

${
  summary.errors > 0
    ? `
### Critical Issues (Must Fix)
${summary.results
  .filter((r) => r.status === 'error')
  .map((r) => `- ${r.message}`)
  .join('\n')}
`
    : ''
}

${
  summary.warnings > 0
    ? `
### Warnings (Should Fix)
${summary.results
  .filter((r) => r.status === 'warning')
  .slice(0, 10)
  .map((r) => `- ${r.message}`)
  .join('\n')}
`
    : ''
}

## Next Steps

1. **Fix critical errors** that prevent the site from functioning
2. **Address warnings** to improve data quality and completeness
3. **Re-run validation** after making fixes
4. **Proceed with testing** once validation passes with minimal warnings

---

*This report was generated automatically by the migration validation system.*
`;
  }

  private getResultsByType(type: string, results: ValidationResult[]): string {
    const typeResults = results.filter((r) => r.type === type);
    const passed = typeResults.filter((r) => r.status === 'success').length;
    const warnings = typeResults.filter((r) => r.status === 'warning').length;
    const errors = typeResults.filter((r) => r.status === 'error').length;

    return `
- **Passed**: ${passed} ✅
- **Warnings**: ${warnings} ⚠️
- **Errors**: ${errors} ❌
`;
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  }
}

// CLI execution
async function main() {
  const validator = new MigrationValidator();

  try {
    const summary = await validator.validate();
    console.log('\n✅ Migration validation completed!');

    // Exit with error code if there are critical errors
    if (summary.errors > 0) {
      console.log('\n❌ Critical errors found - please fix before proceeding');
      process.exit(1);
    }

    if (summary.warnings > 0) {
      console.log('\n⚠️  Warnings found - consider fixing for better data quality');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Migration validation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { MigrationValidator, type ValidationResult, type ValidationSummary };
