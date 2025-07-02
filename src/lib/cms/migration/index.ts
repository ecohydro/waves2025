// Main migration functions
export { migratePeopleToSanity } from './migrate-people-to-sanity';
export { migratePublicationsToSanity } from './migrate-publications-to-sanity';
export { migrateNewsToSanity } from './migrate-news-to-sanity';
export { validateSanityMigration } from './validate-sanity-migration';

// Types
export type { MigrationValidationReport } from './validate-sanity-migration';
import type { MigrationValidationReport } from './validate-sanity-migration';

// Internal types for migration stats
interface MigrationStats {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  imageUploads?: number;
  pdfUploads?: number;
  authorLinksCreated?: number;
  relatedLinksCreated?: number;
  errors: Array<{
    file: string;
    error: string;
  }>;
}

/**
 * Complete migration workflow - migrate all content types to Sanity
 */
export async function runCompleteMigration(options: {
  dryRun?: boolean;
  maxFiles?: number;
  skipImages?: boolean;
  skipPDFs?: boolean;
  contentDir?: string;
  outputDir?: string;
} = {}) {
  const { 
    dryRun = false, 
    maxFiles, 
    skipImages = false, 
    skipPDFs = false,
    contentDir,
    outputDir = process.cwd()
  } = options;

  console.log('🚀 Starting Complete Sanity Migration');
  console.log(`Dry run: ${dryRun ? 'Yes' : 'No'}`);
  console.log(`Max files per type: ${maxFiles || 'No limit'}`);
  console.log(`Skip images: ${skipImages ? 'Yes' : 'No'}`);
  console.log(`Skip PDFs: ${skipPDFs ? 'Yes' : 'No'}`);
  console.log('');

  const results: {
    people?: MigrationStats;
    publications?: MigrationStats;
    news?: MigrationStats;
    validation?: MigrationValidationReport;
  } = {};

  try {
    // Import functions dynamically to avoid loading them unless needed
    const { migratePeopleToSanity } = await import('./migrate-people-to-sanity');
    const { migratePublicationsToSanity } = await import('./migrate-publications-to-sanity');
    const { migrateNewsToSanity } = await import('./migrate-news-to-sanity');
    const { validateSanityMigration } = await import('./validate-sanity-migration');

    // Step 1: Migrate people (needed first for relationships)
    console.log('📝 Step 1: Migrating people to Sanity...');
    results.people = await migratePeopleToSanity({
      sourceDir: contentDir ? `${contentDir}/people` : undefined,
      dryRun,
      maxFiles,
      skipImages,
    });

    // Step 2: Migrate publications
    console.log('\n📚 Step 2: Migrating publications to Sanity...');
    results.publications = await migratePublicationsToSanity({
      sourceDir: contentDir ? `${contentDir}/publications` : undefined,
      dryRun,
      maxFiles,
      skipPDFs,
    });

    // Step 3: Migrate news
    console.log('\n📰 Step 3: Migrating news to Sanity...');
    results.news = await migrateNewsToSanity({
      sourceDir: contentDir ? `${contentDir}/news` : undefined,
      dryRun,
      maxFiles,
      skipImages,
    });

    // Step 4: Validate migration (only if not dry run)
    if (!dryRun) {
      console.log('\n🔍 Step 4: Validating migration...');
      results.validation = await validateSanityMigration({
        contentDir,
        outputFile: `${outputDir}/migration-validation-report.json`,
      });
    }

    // Print final summary
    console.log('\n' + '='.repeat(60));
    console.log('COMPLETE MIGRATION SUMMARY');
    console.log('='.repeat(60));
    
    if (results.people) {
      console.log(`People: ${results.people.successful}/${results.people.total} migrated (${results.people.imageUploads} images)`);
    }
    
    if (results.publications) {
      console.log(`Publications: ${results.publications.successful}/${results.publications.total} migrated (${results.publications.pdfUploads} PDFs, ${results.publications.authorLinksCreated} author links)`);
    }
    
    if (results.news) {
      console.log(`News: ${results.news.successful}/${results.news.total} migrated (${results.news.imageUploads} images, ${results.news.relatedLinksCreated} related links)`);
    }

    if (results.validation) {
      console.log(`Validation: ${results.validation.passed}/${results.validation.totalChecks} checks passed (${results.validation.warnings} warnings, ${results.validation.errors} errors)`);
    }

    const totalErrors = [results.people, results.publications, results.news]
      .filter(Boolean)
      .reduce((sum, result) => sum + (result?.failed || 0), 0);

    const hasValidationErrors = results.validation ? results.validation.errors > 0 : false;

    if (totalErrors > 0 || hasValidationErrors) {
      console.log('\n❌ Migration completed with errors');
      return false;
    } else {
      console.log('\n✅ Migration completed successfully!');
      return true;
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    return false;
  }
}

/**
 * CLI wrapper for complete migration
 */
export async function runCompleteMigrationCLI(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  const maxFiles = process.argv.includes('--max-files')
    ? parseInt(process.argv[process.argv.indexOf('--max-files') + 1])
    : undefined;
  const skipImages = process.argv.includes('--skip-images');
  const skipPDFs = process.argv.includes('--skip-pdfs');
  const contentDir = process.argv.includes('--content-dir')
    ? process.argv[process.argv.indexOf('--content-dir') + 1]
    : undefined;
  const outputDir = process.argv.includes('--output-dir')
    ? process.argv[process.argv.indexOf('--output-dir') + 1]
    : undefined;

  const success = await runCompleteMigration({
    dryRun,
    maxFiles,
    skipImages,
    skipPDFs,
    contentDir,
    outputDir,
  });

  process.exit(success ? 0 : 1);
}

// CLI support for complete migration
if (require.main === module) {
  runCompleteMigrationCLI().catch((error) => {
    console.error('Complete migration failed:', error);
    process.exit(1);
  });
}