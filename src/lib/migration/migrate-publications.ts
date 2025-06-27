import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {
  getMarkdownFiles,
  generateMDXContent,
  ensureDirectoryExists,
  logProgress,
  logError,
  logWarning,
  generateSlug,
  convertAssetPath,
} from './utils';
import {
  JekyllPublicationFrontMatter,
  NextJSPublicationFrontMatter,
  Author,
  MigrationConfig,
  MigrationResult,
  FileProcessingResult,
} from './types';

/**
 * Parse author list from citation excerpt
 */
function parseAuthorsFromExcerpt(excerpt: string): Author[] {
  if (!excerpt) return [];

  try {
    // Extract authors from citation format: "Author1, A., Author2, B. et al. (Year). Title..."
    const match = excerpt.match(/^([^(]+)\s*\(\d{4}\)/);
    if (!match) return [];

    const authorsString = match[1].trim();

    // Handle "et al." case
    if (authorsString.includes('et al.')) {
      const beforeEtAl = authorsString.replace(/\s*et al\.$/, '').trim();
      const authorNames = beforeEtAl
        .split(',')
        .map((name) => name.trim())
        .filter((name) => name);

      return authorNames.map((name) => ({
        name: name.replace(/\.$/, ''), // Remove trailing period
        affiliation: 'University of California, Santa Barbara', // Default affiliation
      }));
    }

    // Parse individual authors (simplified - could be enhanced)
    const authorNames = authorsString
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name);

    return authorNames.map((name) => ({
      name: name.replace(/\.$/, ''), // Remove trailing period
      affiliation: 'University of California, Santa Barbara', // Default affiliation
    }));
  } catch (error) {
    logWarning(`Failed to parse authors from excerpt: ${error}`);
    return [];
  }
}

/**
 * Extract journal name from tags
 */
function extractJournalFromTags(tags: string[]): string {
  if (!tags || tags.length === 0) return '';

  // Filter out year tags and common non-journal tags
  const journalTags = tags.filter(
    (tag) =>
      typeof tag === 'string' &&
      !tag.match(/^\d{4}$/) && // Not a year
      tag !== 'publications' &&
      tag.length > 3, // Reasonable journal name length
  );

  return journalTags[0] || '';
}

/**
 * Generate keywords from title and journal
 */
function generateKeywords(title: string, journal: string): string[] {
  const keywords: string[] = [];

  // Extract meaningful words from title (simplified)
  const titleWords = title
    .toLowerCase()
    .split(/\s+/)
    .filter(
      (word) =>
        word.length > 3 && !['the', 'and', 'for', 'with', 'from', 'into', 'using'].includes(word),
    )
    .slice(0, 5); // Limit to first 5 meaningful words

  keywords.push(...titleWords);

  // Add journal-based keywords
  if (journal.toLowerCase().includes('forest')) {
    keywords.push('forestry');
  }
  if (journal.toLowerCase().includes('climate')) {
    keywords.push('climate science');
  }
  if (journal.toLowerCase().includes('water')) {
    keywords.push('hydrology');
  }

  return [...new Set(keywords)]; // Remove duplicates
}

/**
 * Determine research areas from title and journal
 */
function determineResearchAreas(title: string, journal: string): string[] {
  const areas: string[] = [];
  const titleLower = title.toLowerCase();
  const journalLower = journal.toLowerCase();

  if (
    titleLower.includes('drought') ||
    titleLower.includes('dryland') ||
    titleLower.includes('arid')
  ) {
    areas.push('dryland ecohydrology');
  }

  if (
    titleLower.includes('climate') ||
    titleLower.includes('temperature') ||
    titleLower.includes('precipitation')
  ) {
    areas.push('climate science');
  }

  if (
    titleLower.includes('vegetation') ||
    titleLower.includes('plant') ||
    titleLower.includes('forest')
  ) {
    areas.push('plant ecology');
  }

  if (
    titleLower.includes('water') ||
    titleLower.includes('evapotranspiration') ||
    titleLower.includes('soil moisture')
  ) {
    areas.push('hydrology');
  }

  if (
    titleLower.includes('remote sensing') ||
    titleLower.includes('satellite') ||
    titleLower.includes('imagery')
  ) {
    areas.push('remote sensing');
  }

  if (
    titleLower.includes('agriculture') ||
    titleLower.includes('crop') ||
    titleLower.includes('farming')
  ) {
    areas.push('agricultural systems');
  }

  if (journalLower.includes('geophysical')) {
    areas.push('geophysics');
  }

  return areas.length > 0 ? areas : ['environmental science'];
}

/**
 * Transform Jekyll publication front matter to Next.js format
 */
function transformPublicationFrontMatter(
  jekyllFrontMatter: JekyllPublicationFrontMatter,
): NextJSPublicationFrontMatter {
  const slug = generateSlug(
    `${jekyllFrontMatter.author}${jekyllFrontMatter.year}_${jekyllFrontMatter.id}`,
  );
  const authors = parseAuthorsFromExcerpt(jekyllFrontMatter.excerpt || '');
  const journal = extractJournalFromTags(jekyllFrontMatter['portfolio-item-tag'] || []);
  const keywords = generateKeywords(jekyllFrontMatter.title, journal);
  const researchAreas = determineResearchAreas(jekyllFrontMatter.title, journal);

  const transformed: NextJSPublicationFrontMatter = {
    title: jekyllFrontMatter.title,
    authors:
      authors.length > 0
        ? authors
        : [
            {
              name: jekyllFrontMatter.author,
              affiliation: 'University of California, Santa Barbara',
              corresponding: true,
            },
          ],
    publicationDate:
      typeof jekyllFrontMatter.date === 'string'
        ? jekyllFrontMatter.date.split(' ')[0]
        : new Date(jekyllFrontMatter.date).toISOString().split('T')[0], // Extract date part
    journal,
    doi: jekyllFrontMatter.doi,
    url: jekyllFrontMatter.doi ? `https://www.doi.org/${jekyllFrontMatter.doi}` : undefined,
    abstract: 'None', // Will be populated later if available
    keywords,
    researchAreas,
    tags: jekyllFrontMatter['portfolio-item-tag'] || [],
    teaserImage: convertAssetPath(jekyllFrontMatter.header?.teaser || ''),
    figureImage: convertAssetPath(
      jekyllFrontMatter.header?.teaser?.replace('.png', '_figure.png') || '',
    ),
    citationCount: 0, // Will be populated by external API
    altmetricScore: 0, // Will be populated by external API
    slug,
  };

  // Clean up undefined values
  Object.keys(transformed).forEach((key) => {
    if (transformed[key as keyof NextJSPublicationFrontMatter] === undefined) {
      delete transformed[key as keyof NextJSPublicationFrontMatter];
    }
  });

  return transformed;
}

/**
 * Process publication content to update image paths and links
 */
function processPublicationContent(content: string): string {
  let processedContent = content;

  // Update Jekyll image syntax to MDX
  processedContent = processedContent.replace(
    /!\[\s*([^\]]*)\s*\]\(\s*{{\s*"([^"]+)"\s*\|\s*absolute_url\s*}}\s*\)(\{[^}]*\})?/g,
    (match, alt, imagePath) => {
      const newPath = convertAssetPath(imagePath);
      return `![${alt}](${newPath})`;
    },
  );

  // Update Jekyll liquid syntax for asset paths
  processedContent = processedContent.replace(
    /{{\s*"([^"]+)"\s*\|\s*absolute_url\s*}}/g,
    (match, imagePath) => convertAssetPath(imagePath),
  );

  // Update Jekyll button syntax to MDX
  processedContent = processedContent.replace(
    /\[([^\]]+)\]\(([^)]+)\)\{:\s*\.btn\s*\.btn--success\s*\}/g,
    '[$1]($2)',
  );

  return processedContent;
}

/**
 * Preprocess file content to fix YAML issues
 */
function preprocessFileContent(content: string): string {
  // Fix duplicate YAML keys by keeping the first occurrence
  const lines = content.split('\n');
  const seenKeys = new Set<string>();
  const processedLines: string[] = [];
  let inFrontMatter = false;

  for (const line of lines) {
    if (line.trim() === '---') {
      if (!inFrontMatter) {
        inFrontMatter = true;
      } else {
        inFrontMatter = false;
      }
      processedLines.push(line);
      continue;
    }

    if (inFrontMatter && line.includes(':')) {
      const key = line.split(':')[0].trim();
      if (seenKeys.has(key)) {
        // Skip duplicate key
        continue;
      }
      seenKeys.add(key);
    }

    processedLines.push(line);
  }

  return processedLines.join('\n');
}

/**
 * Process a single publication file
 */
function processPublicationFile(
  filePath: string,
  targetDir: string,
  config: MigrationConfig,
): FileProcessingResult {
  const fileName = path.basename(filePath, '.md');
  const warnings: string[] = [];

  try {
    logProgress(`Processing ${fileName}...`, config.verbose);

    // Read and preprocess file content
    const rawContent = fs.readFileSync(filePath, 'utf8');
    const preprocessedContent = preprocessFileContent(rawContent);

    // Parse Jekyll file
    const parsed = matter(preprocessedContent);
    const jekyllData = parsed.data as unknown as JekyllPublicationFrontMatter;
    const content = parsed.content;

    // Validate required fields
    if (!jekyllData.title) {
      return {
        success: false,
        sourceFile: filePath,
        error: 'Missing required field: title',
      };
    }

    if (!jekyllData.author) {
      return {
        success: false,
        sourceFile: filePath,
        error: 'Missing required field: author',
      };
    }

    // Transform front matter
    const transformedData = transformPublicationFrontMatter(jekyllData);

    // Process content
    const processedContent = processPublicationContent(content);

    // Add warnings for missing common fields
    if (!transformedData.doi) {
      warnings.push('Missing DOI');
    }
    if (!transformedData.journal) {
      warnings.push('Missing journal information');
    }
    if (!transformedData.teaserImage) {
      warnings.push('Missing teaser image');
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
 * Migrate all publications from Jekyll to Next.js
 */
export async function migratePublications(config: MigrationConfig): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    filesProcessed: 0,
    filesSkipped: 0,
    errors: [],
    warnings: [],
  };

  try {
    logProgress('Starting publications migration...', config.verbose);

    // Ensure target directory exists
    ensureDirectoryExists(config.targetDir);

    // Get all publication files
    const publicationFiles = getMarkdownFiles(config.sourceDir);

    if (publicationFiles.length === 0) {
      logWarning(`No markdown files found in ${config.sourceDir}`);
      return result;
    }

    logProgress(`Found ${publicationFiles.length} publication files to process`, config.verbose);

    // Process each file
    for (const filePath of publicationFiles) {
      const fileResult = processPublicationFile(filePath, config.targetDir, config);

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
 * CLI function to run publications migration
 */
export async function runPublicationsMigration(): Promise<void> {
  const config: MigrationConfig = {
    sourceDir: path.join(process.cwd(), 'legacy', '_publications'),
    targetDir: path.join(process.cwd(), 'content', 'publications'),
    assetsSourceDir: path.join(process.cwd(), 'legacy', 'assets'),
    assetsTargetDir: path.join(process.cwd(), 'public'),
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
  };

  console.log('🚀 Starting Publications Migration');
  console.log(`Source: ${config.sourceDir}`);
  console.log(`Target: ${config.targetDir}`);
  console.log(`Dry Run: ${config.dryRun ? 'Yes' : 'No'}`);
  console.log('');

  const result = await migratePublications(config);

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
  runPublicationsMigration().catch(console.error);
}
