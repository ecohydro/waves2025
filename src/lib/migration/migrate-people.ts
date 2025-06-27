import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import {
  getMarkdownFiles,
  parseJekyllFile,
  transformPersonFrontMatter,
  generateMDXContent,
  ensureDirectoryExists,
  logProgress,
  logError,
  logWarning,
  parseEducationFromCaption,
} from './utils';
import {
  JekyllPersonFrontMatter,
  MigrationConfig,
  MigrationResult,
  FileProcessingResult,
} from './types';

/**
 * Load authors data from Jekyll _data/authors.yml file
 */
function loadAuthorsData(dataDir: string): Record<string, Record<string, unknown>> | null {
  const authorsPath = path.join(dataDir, 'authors.yml');

  if (!fs.existsSync(authorsPath)) {
    logWarning(`Authors data file not found at ${authorsPath}`);
    return null;
  }

  try {
    const authorsContent = fs.readFileSync(authorsPath, 'utf8');
    const authorsData = yaml.load(authorsContent) as Record<string, Record<string, unknown>>;
    return authorsData;
  } catch (error) {
    logError(`Failed to parse authors.yml: ${error}`);
    return null;
  }
}

/**
 * Process a single person file
 */
function processPersonFile(
  filePath: string,
  targetDir: string,
  authorsData: Record<string, Record<string, unknown>> | null,
  config: MigrationConfig,
): FileProcessingResult {
  const fileName = path.basename(filePath, '.md');
  const warnings: string[] = [];

  try {
    logProgress(`Processing ${fileName}...`, config.verbose);

    // Parse Jekyll file
    const { frontMatter, content } = parseJekyllFile(filePath);
    const jekyllData = frontMatter as unknown as JekyllPersonFrontMatter;

    // Validate required fields
    if (!jekyllData.title) {
      return {
        success: false,
        sourceFile: filePath,
        error: 'Missing required field: title',
      };
    }

    // Transform front matter
    const transformedData = transformPersonFrontMatter(jekyllData, authorsData || undefined);

    // Parse education from header caption if available
    if (jekyllData.header?.caption) {
      const education = parseEducationFromCaption(jekyllData.header.caption);
      if (education.length > 0) {
        transformedData.education = education;
      }
    }

    // Add warnings for missing common fields
    const isCurrentMember = jekyllData['portfolio-item-tag']?.includes('current member');

    if (!transformedData.email && isCurrentMember) {
      warnings.push('Missing email address (current member)');
    }
    if (!transformedData.avatar) {
      warnings.push('Missing avatar image');
    }
    if (!transformedData.excerpt) {
      warnings.push('Missing excerpt/bio');
    }

    // Generate MDX content
    const mdxContent = generateMDXContent(
      transformedData as unknown as Record<string, unknown>,
      content,
    );

    // Write to target file
    const targetFile = path.join(targetDir, `${transformedData.slug}.mdx`);

    if (!config.dryRun) {
      fs.writeFileSync(targetFile, mdxContent, 'utf8');
    }

    logProgress(`✓ Processed ${fileName} → ${transformedData.slug}.mdx`, config.verbose);

    return {
      success: true,
      sourceFile: filePath,
      targetFile,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      success: false,
      sourceFile: filePath,
      error: `Processing failed: ${error}`,
    };
  }
}

/**
 * Migrate all people profiles from Jekyll to Next.js
 */
export async function migratePeople(config: MigrationConfig): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    filesProcessed: 0,
    filesSkipped: 0,
    errors: [],
    warnings: [],
  };

  try {
    logProgress('Starting people migration...', config.verbose);

    // Ensure target directory exists
    ensureDirectoryExists(config.targetDir);

    // Load authors data
    const authorsDataDir = path.join(path.dirname(config.sourceDir), '_data');
    const authorsData = loadAuthorsData(authorsDataDir);

    if (authorsData) {
      logProgress(
        `Loaded authors data with ${Object.keys(authorsData).length} entries`,
        config.verbose,
      );
    }

    // Get all person files
    const personFiles = getMarkdownFiles(config.sourceDir);

    if (personFiles.length === 0) {
      logWarning(`No markdown files found in ${config.sourceDir}`);
      return result;
    }

    logProgress(`Found ${personFiles.length} person files to process`, config.verbose);

    // Process each file
    for (const filePath of personFiles) {
      const fileResult = processPersonFile(filePath, config.targetDir, authorsData, config);

      if (fileResult.success) {
        result.filesProcessed++;
        if (fileResult.warnings) {
          result.warnings.push(
            ...fileResult.warnings.map((w) => `${path.basename(filePath)}: ${w}`),
          );
        }
      } else {
        result.filesSkipped++;
        result.errors.push(`${path.basename(filePath)}: ${fileResult.error}`);
        logError(`Failed to process ${path.basename(filePath)}: ${fileResult.error}`);
      }
    }

    // Summary
    logProgress(
      `Migration complete: ${result.filesProcessed} processed, ${result.filesSkipped} skipped`,
      true,
    );

    if (result.errors.length > 0) {
      result.success = false;
      logError(`Migration completed with ${result.errors.length} errors`);
    }

    if (result.warnings.length > 0) {
      logWarning(`Migration completed with ${result.warnings.length} warnings`);
    }

    return result;
  } catch (error) {
    result.success = false;
    result.errors.push(`Migration failed: ${error}`);
    logError(`Migration failed: ${error}`);
    return result;
  }
}

/**
 * CLI function to run people migration
 */
export async function runPeopleMigration(): Promise<void> {
  const config: MigrationConfig = {
    sourceDir: path.join(process.cwd(), 'legacy', '_people'),
    targetDir: path.join(process.cwd(), 'content', 'people'),
    assetsSourceDir: path.join(process.cwd(), 'legacy', 'assets'),
    assetsTargetDir: path.join(process.cwd(), 'public'),
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
  };

  console.log('🚀 Starting People Migration');
  console.log(`Source: ${config.sourceDir}`);
  console.log(`Target: ${config.targetDir}`);
  console.log(`Dry Run: ${config.dryRun ? 'Yes' : 'No'}`);
  console.log('');

  const result = await migratePeople(config);

  console.log('\n📊 Migration Summary:');
  console.log(`✅ Files processed: ${result.filesProcessed}`);
  console.log(`⏭️  Files skipped: ${result.filesSkipped}`);
  console.log(`❌ Errors: ${result.errors.length}`);
  console.log(`⚠️  Warnings: ${result.warnings.length}`);

  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach((error) => console.log(`  - ${error}`));
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach((warning) => console.log(`  - ${warning}`));
  }

  console.log(
    `\n${result.success ? '✅ Migration completed successfully!' : '❌ Migration completed with errors'}`,
  );

  process.exit(result.success ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  runPeopleMigration().catch(console.error);
}
