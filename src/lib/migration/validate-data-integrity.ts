#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';

interface IntegrityCheck {
  type: 'duplicate' | 'missing' | 'inconsistent' | 'orphaned';
  severity: 'error' | 'warning' | 'info';
  category: 'people' | 'publications' | 'news' | 'images' | 'general';
  message: string;
  files?: string[];
  details?: Record<string, unknown>;
}

interface IntegrityReport {
  timestamp: string;
  totalChecks: number;
  issues: IntegrityCheck[];
  summary: {
    duplicates: number;
    missing: number;
    inconsistent: number;
    orphaned: number;
  };
}

class DataIntegrityValidator {
  private issues: IntegrityCheck[] = [];

  async validate(): Promise<IntegrityReport> {
    console.log('🔍 Starting data integrity validation...\n');

    try {
      // Check for duplicate content
      await this.checkDuplicateContent();

      // Check for missing referenced files
      await this.checkMissingFiles();

      // Check for data consistency
      await this.checkDataConsistency();

      // Check for orphaned files
      await this.checkOrphanedFiles();

      // Generate report
      const report = this.generateReport();

      // Save reports
      await this.saveReports(report);

      return report;
    } catch (error) {
      console.error('Data integrity validation failed:', error);
      throw error;
    }
  }

  private async checkDuplicateContent(): Promise<void> {
    console.log('🔍 Checking for duplicate content...');

    // Check for duplicate people
    await this.checkDuplicatePeople();

    // Check for duplicate publications
    await this.checkDuplicatePublications();

    // Check for duplicate news posts
    await this.checkDuplicateNews();
  }

  private async checkDuplicatePeople(): Promise<void> {
    const peopleFiles = await glob('content/people/*.mdx');
    const peopleByName = new Map<string, string[]>();
    const peopleByEmail = new Map<string, string[]>();

    for (const filePath of peopleFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter } = matter(content);

        // Check for duplicate names
        if (frontmatter.name) {
          const normalizedName = frontmatter.name.toLowerCase().trim();
          if (!peopleByName.has(normalizedName)) {
            peopleByName.set(normalizedName, []);
          }
          peopleByName.get(normalizedName)!.push(filePath);
        }

        // Check for duplicate emails
        if (frontmatter.email) {
          const normalizedEmail = frontmatter.email.toLowerCase().trim();
          if (!peopleByEmail.has(normalizedEmail)) {
            peopleByEmail.set(normalizedEmail, []);
          }
          peopleByEmail.get(normalizedEmail)!.push(filePath);
        }
      } catch (error) {
        this.addIssue(
          'missing',
          'error',
          'people',
          `Failed to read people file: ${filePath}`,
          [filePath],
          { error: String(error) },
        );
      }
    }

    // Report duplicates
    for (const [name, files] of peopleByName.entries()) {
      if (files.length > 1) {
        this.addIssue('duplicate', 'warning', 'people', `Duplicate person name: "${name}"`, files);
      }
    }

    for (const [email, files] of peopleByEmail.entries()) {
      if (files.length > 1) {
        this.addIssue('duplicate', 'error', 'people', `Duplicate email address: "${email}"`, files);
      }
    }
  }

  private async checkDuplicatePublications(): Promise<void> {
    const publicationFiles = await glob('content/publications/*.mdx');
    const publicationsByTitle = new Map<string, string[]>();
    const publicationsByDoi = new Map<string, string[]>();

    for (const filePath of publicationFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter } = matter(content);

        // Check for duplicate titles
        if (frontmatter.title) {
          const normalizedTitle = frontmatter.title.toLowerCase().trim();
          if (!publicationsByTitle.has(normalizedTitle)) {
            publicationsByTitle.set(normalizedTitle, []);
          }
          publicationsByTitle.get(normalizedTitle)!.push(filePath);
        }

        // Check for duplicate DOIs
        if (frontmatter.doi) {
          const normalizedDoi = frontmatter.doi.toLowerCase().trim();
          if (!publicationsByDoi.has(normalizedDoi)) {
            publicationsByDoi.set(normalizedDoi, []);
          }
          publicationsByDoi.get(normalizedDoi)!.push(filePath);
        }
      } catch (error) {
        this.addIssue(
          'missing',
          'error',
          'publications',
          `Failed to read publication file: ${filePath}`,
          [filePath],
          { error: String(error) },
        );
      }
    }

    // Report duplicates
    for (const [title, files] of publicationsByTitle.entries()) {
      if (files.length > 1) {
        this.addIssue(
          'duplicate',
          'warning',
          'publications',
          `Duplicate publication title: "${title}"`,
          files,
        );
      }
    }

    for (const [doi, files] of publicationsByDoi.entries()) {
      if (files.length > 1) {
        this.addIssue('duplicate', 'error', 'publications', `Duplicate DOI: "${doi}"`, files);
      }
    }
  }

  private async checkDuplicateNews(): Promise<void> {
    const newsFiles = await glob('content/news/*.mdx');
    const newsByTitle = new Map<string, string[]>();
    const newsBySlug = new Map<string, string[]>();

    for (const filePath of newsFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter } = matter(content);

        // Check for duplicate titles
        if (frontmatter.title) {
          const normalizedTitle = frontmatter.title.toLowerCase().trim();
          if (!newsByTitle.has(normalizedTitle)) {
            newsByTitle.set(normalizedTitle, []);
          }
          newsByTitle.get(normalizedTitle)!.push(filePath);
        }

        // Check for duplicate slugs
        if (frontmatter.slug) {
          const normalizedSlug = frontmatter.slug.toLowerCase().trim();
          if (!newsBySlug.has(normalizedSlug)) {
            newsBySlug.set(normalizedSlug, []);
          }
          newsBySlug.get(normalizedSlug)!.push(filePath);
        }
      } catch (error) {
        this.addIssue(
          'missing',
          'error',
          'news',
          `Failed to read news file: ${filePath}`,
          [filePath],
          { error: String(error) },
        );
      }
    }

    // Report duplicates
    for (const [title, files] of newsByTitle.entries()) {
      if (files.length > 1) {
        this.addIssue('duplicate', 'warning', 'news', `Duplicate news title: "${title}"`, files);
      }
    }

    for (const [slug, files] of newsBySlug.entries()) {
      if (files.length > 1) {
        this.addIssue('duplicate', 'error', 'news', `Duplicate news slug: "${slug}"`, files);
      }
    }
  }

  private async checkMissingFiles(): Promise<void> {
    console.log('📁 Checking for missing referenced files...');

    // Check for missing person images
    await this.checkMissingPersonImages();

    // Check for missing publication images
    await this.checkMissingPublicationImages();
  }

  private async checkMissingPersonImages(): Promise<void> {
    const peopleFiles = await glob('content/people/*.mdx');

    for (const filePath of peopleFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter } = matter(content);

        if (frontmatter.slug) {
          // Check for person image files
          const expectedImages = [
            `public/images/people/${frontmatter.slug}.jpg`,
            `public/images/people/${frontmatter.slug}.png`,
            `public/images/people/${frontmatter.slug}_header.jpg`,
            `public/images/people/${frontmatter.slug}_header.png`,
          ];

          let hasImage = false;
          for (const imagePath of expectedImages) {
            try {
              await fs.access(imagePath);
              hasImage = true;
              break;
            } catch {
              // Image doesn't exist, continue checking
            }
          }

          if (!hasImage) {
            this.addIssue(
              'missing',
              'warning',
              'people',
              `No image found for person: ${frontmatter.name || frontmatter.slug}`,
              [filePath],
              { expectedImages },
            );
          }
        }
      } catch {
        // Already handled in duplicate check
      }
    }
  }

  private async checkMissingPublicationImages(): Promise<void> {
    const publicationFiles = await glob('content/publications/*.mdx');

    for (const filePath of publicationFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter } = matter(content);

        if (frontmatter.slug) {
          // Check for publication figure
          const expectedImages = [
            `public/images/publications/${frontmatter.slug}.png`,
            `public/images/publications/${frontmatter.slug}_figure.png`,
          ];

          let hasImage = false;
          for (const imagePath of expectedImages) {
            try {
              await fs.access(imagePath);
              hasImage = true;
              break;
            } catch {
              // Image doesn't exist, continue checking
            }
          }

          if (!hasImage) {
            this.addIssue(
              'missing',
              'info',
              'publications',
              `No figure found for publication: ${frontmatter.title}`,
              [filePath],
              { expectedImages },
            );
          }
        }
      } catch {
        // Already handled in duplicate check
      }
    }
  }

  private async checkDataConsistency(): Promise<void> {
    console.log('🔄 Checking data consistency...');

    // Check slug-filename consistency
    await this.checkSlugConsistency();

    // Check date formats
    await this.checkDateFormats();

    // Check required field completeness
    await this.checkRequiredFields();
  }

  private async checkSlugConsistency(): Promise<void> {
    const allFiles = await glob('content/**/*.mdx');

    for (const filePath of allFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter } = matter(content);

        const filename = path.basename(filePath, '.mdx');

        if (frontmatter.slug && frontmatter.slug !== filename) {
          this.addIssue(
            'inconsistent',
            'warning',
            'general',
            `Slug-filename mismatch in ${filePath}: slug="${frontmatter.slug}", filename="${filename}"`,
            [filePath],
          );
        }
      } catch {
        // Already handled elsewhere
      }
    }
  }

  private async checkDateFormats(): Promise<void> {
    const newsFiles = await glob('content/news/*.mdx');
    const publicationFiles = await glob('content/publications/*.mdx');

    // Check news dates
    for (const filePath of newsFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter } = matter(content);

        if (frontmatter.date) {
          const date = new Date(frontmatter.date);
          if (isNaN(date.getTime())) {
            this.addIssue(
              'inconsistent',
              'error',
              'news',
              `Invalid date format in ${path.basename(filePath)}: "${frontmatter.date}"`,
              [filePath],
            );
          }
        }
      } catch {
        // Already handled elsewhere
      }
    }

    // Check publication years
    for (const filePath of publicationFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter } = matter(content);

        if (frontmatter.year) {
          const year = parseInt(frontmatter.year);
          const currentYear = new Date().getFullYear();

          if (isNaN(year) || year < 1990 || year > currentYear + 1) {
            this.addIssue(
              'inconsistent',
              'error',
              'publications',
              `Invalid year in ${path.basename(filePath)}: "${frontmatter.year}"`,
              [filePath],
            );
          }
        }
      } catch {
        // Already handled elsewhere
      }
    }
  }

  private async checkRequiredFields(): Promise<void> {
    // Check people required fields
    const peopleFiles = await glob('content/people/*.mdx');
    for (const filePath of peopleFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter } = matter(content);

        const requiredFields = ['name', 'slug', 'status'];
        const missingFields = requiredFields.filter((field) => !frontmatter[field]);

        if (missingFields.length > 0) {
          this.addIssue(
            'missing',
            'error',
            'people',
            `Missing required fields in ${path.basename(filePath)}: ${missingFields.join(', ')}`,
            [filePath],
            { missingFields },
          );
        }
      } catch {
        // Already handled elsewhere
      }
    }

    // Check publications required fields
    const publicationFiles = await glob('content/publications/*.mdx');
    for (const filePath of publicationFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter } = matter(content);

        const requiredFields = ['title', 'slug', 'authors', 'year'];
        const missingFields = requiredFields.filter((field) => !frontmatter[field]);

        if (missingFields.length > 0) {
          this.addIssue(
            'missing',
            'error',
            'publications',
            `Missing required fields in ${path.basename(filePath)}: ${missingFields.join(', ')}`,
            [filePath],
            { missingFields },
          );
        }
      } catch {
        // Already handled elsewhere
      }
    }
  }

  private async checkOrphanedFiles(): Promise<void> {
    console.log('🗂️  Checking for orphaned files...');

    // Check for images without corresponding content
    await this.checkOrphanedImages();
  }

  private async checkOrphanedImages(): Promise<void> {
    const peopleFiles = await glob('content/people/*.mdx');
    const publicationFiles = await glob('content/publications/*.mdx');

    // Get all content slugs
    const peopleSlugs = new Set<string>();
    const publicationSlugs = new Set<string>();

    for (const filePath of peopleFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter } = matter(content);
        if (frontmatter.slug) peopleSlugs.add(frontmatter.slug);
      } catch {
        // Skip invalid files
      }
    }

    for (const filePath of publicationFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter } = matter(content);
        if (frontmatter.slug) publicationSlugs.add(frontmatter.slug);
      } catch {
        // Skip invalid files
      }
    }

    // Check for orphaned people images
    const peopleImages = await glob('public/images/people/*.{jpg,png,webp,avif}');
    for (const imagePath of peopleImages) {
      const filename = path.basename(imagePath);
      const slug = filename
        .split('.')[0]
        .replace(/_header$/, '')
        .replace(/-\w+$/, '');

      if (!peopleSlugs.has(slug)) {
        this.addIssue(
          'orphaned',
          'info',
          'images',
          `Orphaned people image: ${filename} (no corresponding person found)`,
          [imagePath],
        );
      }
    }

    // Check for orphaned publication images
    const publicationImages = await glob('public/images/publications/*.{jpg,png,webp,avif}');
    for (const imagePath of publicationImages) {
      const filename = path.basename(imagePath);
      const slug = filename
        .split('.')[0]
        .replace(/_figure$/, '')
        .replace(/-\w+$/, '');

      if (!publicationSlugs.has(slug)) {
        this.addIssue(
          'orphaned',
          'info',
          'images',
          `Orphaned publication image: ${filename} (no corresponding publication found)`,
          [imagePath],
        );
      }
    }
  }

  private addIssue(
    type: IntegrityCheck['type'],
    severity: IntegrityCheck['severity'],
    category: IntegrityCheck['category'],
    message: string,
    files?: string[],
    details?: Record<string, unknown>,
  ): void {
    this.issues.push({ type, severity, category, message, files, details });
  }

  private generateReport(): IntegrityReport {
    const summary = {
      duplicates: this.issues.filter((i) => i.type === 'duplicate').length,
      missing: this.issues.filter((i) => i.type === 'missing').length,
      inconsistent: this.issues.filter((i) => i.type === 'inconsistent').length,
      orphaned: this.issues.filter((i) => i.type === 'orphaned').length,
    };

    return {
      timestamp: new Date().toISOString(),
      totalChecks: this.issues.length,
      issues: this.issues,
      summary,
    };
  }

  private async saveReports(report: IntegrityReport): Promise<void> {
    // Generate markdown report
    const markdownReport = this.generateMarkdownReport(report);
    await fs.writeFile('docs/migration/DATA_INTEGRITY_REPORT.md', markdownReport, 'utf-8');

    // Generate JSON report
    await fs.writeFile(
      'docs/migration/data-integrity-results.json',
      JSON.stringify(report, null, 2),
      'utf-8',
    );

    // Console summary
    console.log('\n📊 Data Integrity Summary:');
    console.log(`🔍 Total issues found: ${report.totalChecks}`);
    console.log(`📋 Duplicates: ${report.summary.duplicates}`);
    console.log(`❌ Missing: ${report.summary.missing}`);
    console.log(`⚠️  Inconsistent: ${report.summary.inconsistent}`);
    console.log(`🗂️  Orphaned: ${report.summary.orphaned}`);

    const criticalIssues = this.issues.filter((i) => i.severity === 'error').length;
    const warnings = this.issues.filter((i) => i.severity === 'warning').length;

    console.log(`\n🚨 Critical issues: ${criticalIssues}`);
    console.log(`⚠️  Warnings: ${warnings}`);

    if (criticalIssues > 0) {
      console.log('\n❌ Critical issues found:');
      this.issues
        .filter((i) => i.severity === 'error')
        .slice(0, 5)
        .forEach((issue) => console.log(`  - ${issue.message}`));
    }

    console.log('\n📄 Detailed reports saved to:');
    console.log('  - docs/migration/DATA_INTEGRITY_REPORT.md');
    console.log('  - docs/migration/data-integrity-results.json');
  }

  private generateMarkdownReport(report: IntegrityReport): string {
    return `# Data Integrity Report

Generated on: ${report.timestamp}

## Summary

- **Total Issues**: ${report.totalChecks}
- **Duplicates**: ${report.summary.duplicates}
- **Missing**: ${report.summary.missing}
- **Inconsistent**: ${report.summary.inconsistent}
- **Orphaned**: ${report.summary.orphaned}

## Issues by Category

### Critical Issues (Errors)
${
  report.issues
    .filter((i) => i.severity === 'error')
    .map((i) => `- **${i.category.toUpperCase()}**: ${i.message}`)
    .join('\n') || 'None'
}

### Warnings
${
  report.issues
    .filter((i) => i.severity === 'warning')
    .map((i) => `- **${i.category.toUpperCase()}**: ${i.message}`)
    .join('\n') || 'None'
}

### Information
${
  report.issues
    .filter((i) => i.severity === 'info')
    .slice(0, 20) // Limit info messages
    .map((i) => `- **${i.category.toUpperCase()}**: ${i.message}`)
    .join('\n') || 'None'
}

## Detailed Issues

${report.issues
  .map(
    (issue) => `
### ${this.getSeverityIcon(issue.severity)} ${issue.type.toUpperCase()}: ${issue.message}

- **Category**: ${issue.category}
- **Severity**: ${issue.severity}
${issue.files ? `- **Files**: ${issue.files.map((f) => `\`${f}\``).join(', ')}` : ''}
${issue.details ? `- **Details**: ${JSON.stringify(issue.details, null, 2)}` : ''}
`,
  )
  .join('\n')}

---

*This report was generated automatically by the data integrity validation system.*
`;
  }

  private getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'error':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❓';
    }
  }
}

// CLI execution
async function main() {
  const validator = new DataIntegrityValidator();

  try {
    const report = await validator.validate();
    console.log('\n✅ Data integrity validation completed!');

    const criticalIssues = report.issues.filter((i) => i.severity === 'error').length;

    if (criticalIssues > 0) {
      console.log('\n❌ Critical data integrity issues found - please fix before proceeding');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Data integrity validation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { DataIntegrityValidator, type IntegrityCheck, type IntegrityReport };
