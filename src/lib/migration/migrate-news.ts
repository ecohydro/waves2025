import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MigrationConfig, MigrationResult, FileProcessingResult } from './types';
import {
  ensureDirectoryExists,
  getMarkdownFiles,
  logProgress,
  logError,
  logWarning,
} from './utils';

// Jekyll news post front matter interface
interface JekyllNewsFrontMatter {
  id: string;
  title: string;
  date: string;
  author: string;
  guid: string;
  permalink: string;
  categories: string[];
  tags: string[];
  excerpt: string;
  header?: {
    image: string;
  };
  image?:
    | string
    | {
        teaser: string;
      };
}

// Next.js news post front matter interface
interface NextJSNewsFrontMatter {
  title: string;
  date: string;
  author: string;
  excerpt: string;
  featuredImage?: string;
  categories: string[];
  tags: string[];
  slug: string;
  published: boolean;
  readingTime?: string;
}

/**
 * Generate a URL-friendly slug from a title
 */
function generateNewsSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Convert Jekyll asset path to Next.js public path
 */
function convertAssetPath(jekyllPath: string | undefined): string {
  if (!jekyllPath || typeof jekyllPath !== 'string') return '';

  // Remove 'assets/' prefix and add '/' prefix for Next.js public directory
  return jekyllPath.replace(/^assets\//, '/');
}

/**
 * Calculate reading time for content
 */
function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return `${readingTime} min read`;
}

/**
 * Transform Jekyll news front matter to Next.js format
 */
function transformNewsFrontMatter(jekyllFrontMatter: JekyllNewsFrontMatter): NextJSNewsFrontMatter {
  const slug = generateNewsSlug(jekyllFrontMatter.title);

  // Determine featured image
  let featuredImage: string | undefined;
  if (jekyllFrontMatter.header?.image) {
    featuredImage = convertAssetPath(jekyllFrontMatter.header.image);
  } else if (jekyllFrontMatter.image) {
    // Handle different image field formats
    if (typeof jekyllFrontMatter.image === 'string') {
      featuredImage = convertAssetPath(jekyllFrontMatter.image);
    } else if (typeof jekyllFrontMatter.image === 'object' && jekyllFrontMatter.image !== null) {
      // Handle nested image objects like { teaser: "path/to/image" }
      const imageObj = jekyllFrontMatter.image as Record<string, string>;
      if (imageObj.teaser) {
        featuredImage = convertAssetPath(imageObj.teaser);
      }
    }
  }

  // Clean up categories and tags
  const categories = jekyllFrontMatter.categories || [];
  const tags = jekyllFrontMatter.tags || [];

  // Remove year tags (they're redundant with date)
  const filteredTags = tags.filter((tag) => !/^\d{4}$/.test(tag));

  const transformed: NextJSNewsFrontMatter = {
    title: jekyllFrontMatter.title,
    date: jekyllFrontMatter.date,
    author: jekyllFrontMatter.author,
    excerpt: jekyllFrontMatter.excerpt,
    featuredImage,
    categories,
    tags: filteredTags,
    slug,
    published: true, // All existing posts are published
  };

  // Clean up undefined values
  Object.keys(transformed).forEach((key) => {
    if (transformed[key as keyof NextJSNewsFrontMatter] === undefined) {
      delete transformed[key as keyof NextJSNewsFrontMatter];
    }
  });

  return transformed;
}

/**
 * Process content to clean up Jekyll-specific syntax
 */
function processContent(content: string): string {
  let processed = content;

  // Remove Jekyll-specific syntax
  processed = processed.replace(/\{\{.*?\}\}/g, ''); // Remove Jekyll template tags
  processed = processed.replace(/\{%.*?%\}/g, ''); // Remove Jekyll logic tags

  // Clean up extra whitespace
  processed = processed.replace(/\n\s*\n\s*\n/g, '\n\n'); // Remove excessive line breaks

  // Clean up HTML entities
  processed = processed.replace(/&#8217;/g, "'"); // Right single quotation mark
  processed = processed.replace(/&#8216;/g, "'"); // Left single quotation mark
  processed = processed.replace(/&#8220;/g, '"'); // Left double quotation mark
  processed = processed.replace(/&#8221;/g, '"'); // Right double quotation mark
  processed = processed.replace(/&#038;/g, '&'); // Ampersand
  processed = processed.replace(/&#58;/g, ':'); // Colon

  return processed.trim();
}

/**
 * Generate MDX file content with front matter
 */
function generateMDXContent(frontMatter: Record<string, unknown>, content: string): string {
  const yamlFrontMatter = matter.stringify('', frontMatter);
  return `${yamlFrontMatter}\n${content}`;
}

/**
 * Process a single news post file
 */
function processNewsFile(
  filePath: string,
  targetDir: string,
  config: MigrationConfig,
): FileProcessingResult {
  const fileName = path.basename(filePath);
  const warnings: string[] = [];

  try {
    // Parse Jekyll file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(fileContent);
    const jekyllData = parsed.data as JekyllNewsFrontMatter;
    const content = parsed.content;

    // Transform front matter
    const transformedData = transformNewsFrontMatter(jekyllData);

    // Process content
    const processedContent = processContent(content);

    // Calculate reading time
    transformedData.readingTime = calculateReadingTime(processedContent);

    // Add warnings for missing common fields
    if (!transformedData.excerpt) {
      warnings.push('Missing excerpt');
    }
    if (!transformedData.featuredImage) {
      warnings.push('Missing featured image');
    }
    if (!transformedData.author) {
      warnings.push('Missing author');
    }

    // Generate MDX content
    const mdxContent = generateMDXContent(
      transformedData as unknown as Record<string, unknown>,
      processedContent,
    );

    // Write to target file
    const targetFile = path.join(targetDir, `${transformedData.slug}.mdx`);

    if (!config.dryRun) {
      fs.writeFileSync(targetFile, mdxContent, 'utf8');
    }

    logProgress(`✓ ${fileName} → ${transformedData.slug}.mdx`, config.verbose);

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
 * News migration function
 */
export async function migrateNews(config: MigrationConfig): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    filesProcessed: 0,
    filesSkipped: 0,
    errors: [],
    warnings: [],
  };

  try {
    logProgress('Starting news migration...', config.verbose);

    // Ensure target directory exists
    ensureDirectoryExists(config.targetDir);

    // Get all news post files
    const newsFiles = getMarkdownFiles(config.sourceDir);

    if (newsFiles.length === 0) {
      logWarning(`No markdown files found in ${config.sourceDir}`);
      return result;
    }

    logProgress(`Found ${newsFiles.length} news files to process`, config.verbose);

    // Process each file
    for (const filePath of newsFiles) {
      const fileResult = processNewsFile(filePath, config.targetDir, config);

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
      `News migration complete: ${result.filesProcessed} processed, ${result.filesSkipped} skipped`,
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
 * CLI function to run news migration
 */
export async function runNewsMigration(): Promise<void> {
  const config: MigrationConfig = {
    sourceDir: path.join(process.cwd(), 'legacy', '_posts'),
    targetDir: path.join(process.cwd(), 'content', 'news'),
    assetsSourceDir: path.join(process.cwd(), 'legacy', 'assets'),
    assetsTargetDir: path.join(process.cwd(), 'public'),
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
  };

  console.log('🚀 Starting News Migration');
  console.log(`Source: ${config.sourceDir}`);
  console.log(`Target: ${config.targetDir}`);
  console.log(`Dry Run: ${config.dryRun ? 'Yes' : 'No'}`);
  console.log('');

  const result = await migrateNews(config);

  // Print summary
  console.log('');
  console.log('📊 Migration Summary:');
  console.log(`✅ Files processed: ${result.filesProcessed}`);
  console.log(`⏭️  Files skipped: ${result.filesSkipped}`);
  console.log(`❌ Errors: ${result.errors.length}`);
  console.log(`⚠️  Warnings: ${result.warnings.length}`);

  if (result.errors.length > 0) {
    console.log('');
    console.log('❌ Errors:');
    result.errors.forEach((error) => console.log(`  - ${error}`));
  }

  if (result.warnings.length > 0) {
    console.log('');
    console.log('⚠️  Warnings:');
    result.warnings.forEach((warning) => console.log(`  - ${warning}`));
  }

  if (result.success) {
    console.log('');
    console.log('✅ News migration completed successfully!');
  } else {
    console.log('');
    console.log('❌ Migration completed with errors');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runNewsMigration().catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}
