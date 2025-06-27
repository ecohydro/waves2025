#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';

interface FixResult {
  file: string;
  action: string;
  changes: string[];
  success: boolean;
  error?: string;
}

class MigrationFixer {
  private results: FixResult[] = [];

  async fixIssues(): Promise<void> {
    console.log('🔧 Starting migration issue fixes...\n');

    try {
      // Fix people profile issues
      await this.fixPeopleProfiles();

      // Fix publication issues
      await this.fixPublications();

      // Generate report
      await this.generateReport();
    } catch (error) {
      console.error('Fix process failed:', error);
      throw error;
    }
  }

  private async fixPeopleProfiles(): Promise<void> {
    console.log('👥 Fixing people profile issues...');

    const peopleFiles = await glob('content/people/*.mdx');

    for (const filePath of peopleFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter, content: body } = matter(content);

        const changes: string[] = [];
        let needsUpdate = false;

        // Extract name from slug if missing
        if (!frontmatter.name) {
          const slug = frontmatter.slug || path.basename(filePath, '.mdx');
          const name = this.slugToName(slug);
          frontmatter.name = name;
          changes.push(`Added name: "${name}"`);
          needsUpdate = true;
        }

        // Add default status if missing
        if (!frontmatter.status) {
          // Try to infer status from content or use default
          const status = this.inferStatus(frontmatter, body);
          frontmatter.status = status;
          changes.push(`Added status: "${status}"`);
          needsUpdate = true;
        }

        // Ensure slug exists and matches filename
        const expectedSlug = path.basename(filePath, '.mdx');
        if (!frontmatter.slug || frontmatter.slug !== expectedSlug) {
          frontmatter.slug = expectedSlug;
          changes.push(`Fixed slug: "${expectedSlug}"`);
          needsUpdate = true;
        }

        if (needsUpdate) {
          const updatedContent = matter.stringify(body, frontmatter);
          await fs.writeFile(filePath, updatedContent, 'utf-8');

          this.results.push({
            file: filePath,
            action: 'update',
            changes,
            success: true,
          });
        }
      } catch (error) {
        this.results.push({
          file: filePath,
          action: 'update',
          changes: [],
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  private async fixPublications(): Promise<void> {
    console.log('📚 Fixing publication issues...');

    const publicationFiles = await glob('content/publications/*.mdx');

    for (const filePath of publicationFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter, content: body } = matter(content);

        const changes: string[] = [];
        let needsUpdate = false;

        // Extract year from filename or date if missing
        if (!frontmatter.year) {
          const year = this.extractYear(filePath, frontmatter);
          if (year) {
            frontmatter.year = year;
            changes.push(`Added year: ${year}`);
            needsUpdate = true;
          }
        }

        // Ensure slug exists and matches filename
        const expectedSlug = path.basename(filePath, '.mdx');
        if (!frontmatter.slug || frontmatter.slug !== expectedSlug) {
          frontmatter.slug = expectedSlug;
          changes.push(`Fixed slug: "${expectedSlug}"`);
          needsUpdate = true;
        }

        // Ensure authors is an array
        if (frontmatter.authors && typeof frontmatter.authors === 'string') {
          frontmatter.authors = [frontmatter.authors];
          changes.push('Converted authors to array');
          needsUpdate = true;
        }

        if (needsUpdate) {
          const updatedContent = matter.stringify(body, frontmatter);
          await fs.writeFile(filePath, updatedContent, 'utf-8');

          this.results.push({
            file: filePath,
            action: 'update',
            changes,
            success: true,
          });
        }
      } catch (error) {
        this.results.push({
          file: filePath,
          action: 'update',
          changes: [],
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  private slugToName(slug: string): string {
    // Convert slug to proper name format
    return slug
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private inferStatus(frontmatter: Record<string, unknown>, body: string): string {
    // Try to infer status from various clues
    const content = (body + JSON.stringify(frontmatter)).toLowerCase();

    if (content.includes('professor') || content.includes('faculty')) {
      return 'faculty';
    }
    if (content.includes('postdoc') || content.includes('post-doc')) {
      return 'postdoc';
    }
    if (content.includes('phd') || content.includes('graduate') || content.includes('student')) {
      return 'graduate';
    }
    if (content.includes('undergraduate') || content.includes('undergrad')) {
      return 'undergraduate';
    }
    if (content.includes('alumni') || content.includes('former')) {
      return 'alumni';
    }
    if (content.includes('visiting') || content.includes('visitor')) {
      return 'visitor';
    }
    if (content.includes('staff') || content.includes('research')) {
      return 'staff';
    }

    // Default to alumni if we can't determine
    return 'alumni';
  }

  private extractYear(filePath: string, frontmatter: Record<string, unknown>): number | null {
    // Try to extract year from filename (common pattern: author-name-YYYY-number.mdx)
    const filename = path.basename(filePath, '.mdx');

    // Look for 4-digit year in filename
    const yearMatch = filename.match(/(\d{4})/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      const currentYear = new Date().getFullYear();
      if (year >= 1990 && year <= currentYear + 1) {
        return year;
      }
    }

    // Try to extract from date field
    if (frontmatter.date && typeof frontmatter.date === 'string') {
      const date = new Date(frontmatter.date);
      if (!isNaN(date.getTime())) {
        return date.getFullYear();
      }
    }

    // Try to extract from published field
    if (frontmatter.published && typeof frontmatter.published === 'string') {
      const date = new Date(frontmatter.published);
      if (!isNaN(date.getTime())) {
        return date.getFullYear();
      }
    }

    return null;
  }

  private async generateReport(): Promise<void> {
    const successful = this.results.filter((r) => r.success);
    const failed = this.results.filter((r) => !r.success);

    const report = `# Migration Fix Report

Generated on: ${new Date().toISOString()}

## Summary

- **Total Files Processed**: ${this.results.length}
- **Successfully Fixed**: ${successful.length}
- **Failed**: ${failed.length}
- **Success Rate**: ${Math.round((successful.length / this.results.length) * 100)}%

## Successful Fixes

${successful
  .map(
    (result) => `
### ${path.basename(result.file)}

- **Action**: ${result.action}
- **Changes**:
${result.changes.map((change) => `  - ${change}`).join('\n')}
`,
  )
  .join('\n')}

${
  failed.length > 0
    ? `
## Failed Fixes

${failed
  .map(
    (result) => `
### ${path.basename(result.file)}

- **Error**: ${result.error}
`,
  )
  .join('\n')}
`
    : ''
}

---

*This report was generated automatically by the migration fix system.*
`;

    await fs.writeFile('docs/migration/FIX_REPORT.md', report, 'utf-8');

    // Console summary
    console.log('\n📊 Fix Summary:');
    console.log(`✅ Successfully fixed: ${successful.length} files`);
    console.log(`❌ Failed: ${failed.length} files`);
    console.log(`📈 Success rate: ${Math.round((successful.length / this.results.length) * 100)}%`);

    if (failed.length > 0) {
      console.log('\n❌ Failed fixes:');
      failed.slice(0, 5).forEach((result) => {
        console.log(`  - ${path.basename(result.file)}: ${result.error}`);
      });
    }

    const totalChanges = successful.reduce((sum, r) => sum + r.changes.length, 0);
    console.log(`\n🔧 Total changes made: ${totalChanges}`);

    console.log('\n📄 Detailed report saved to: docs/migration/FIX_REPORT.md');
  }
}

// CLI execution
async function main() {
  const fixer = new MigrationFixer();

  try {
    await fixer.fixIssues();
    console.log('\n✅ Migration fixes completed successfully!');
    console.log('💡 Run validation again to verify fixes: ./scripts/validate-all.sh');
  } catch (error) {
    console.error('\n❌ Migration fixes failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { MigrationFixer };
