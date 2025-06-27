import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Papa from 'papaparse';
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

// Enhanced interfaces for CSV integration
interface CSVPublicationData {
  NUM: string;
  YEAR: string;
  TITLE: string;
  DOI: string;
  PUBLISHER: string;
  Area: string;
  'Grant #1': string;
  'Grant #2': string;
  'Grant #3': string;
  'Undergrad Author': string;
  'Visitor Author': string;
  'PhD Committee Member': string;
  'Graduate Advisee': string;
  'Postdoctoral Advisee': string;
  A1: string;
  A2: string;
  A3: string;
  A4: string;
  A5: string;
  A6: string;
  A7: string;
  A8: string;
  A9: string;
  A10: string;
  A11: string;
  A12: string;
  A13: string;
  A14: string;
  A15: string;
  A16: string;
  A17: string;
  A18: string;
  A19: string;
  A20: string;
  A21: string;
  A22: string;
  A23: string;
  A24: string;
  A25: string;
  A26: string;
  A27: string;
  A28: string;
  A29: string;
  A30: string;
  A31: string;
}

interface AuthorRelationship {
  authorName: string;
  relationshipType:
    | 'undergraduate'
    | 'visitor'
    | 'phd-committee'
    | 'graduate-advisee'
    | 'postdoctoral-advisee';
  authorPosition?: string; // A1, A2, etc.
}

interface EnhancedPublicationFrontMatter extends NextJSPublicationFrontMatter {
  researchArea?: string;
  associatedGrants: string[];
  collaborators: Author[];
  authorRelationships: AuthorRelationship[];
}

// Removed CreditRole interface - focusing on stable relationship data instead

/**
 * Load and parse CSV publications data
 */
function loadCSVPublicationsData(): CSVPublicationData[] {
  try {
    const csvPath = path.join(process.cwd(), 'csv_files', 'CV', 'Publications-Table.csv');

    if (!fs.existsSync(csvPath)) {
      logWarning('CSV publications file not found, proceeding without enhancement');
      return [];
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const parsed = Papa.parse<CSVPublicationData>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    if (parsed.errors.length > 0) {
      logWarning(`CSV parsing warnings: ${parsed.errors.map((e) => e.message).join(', ')}`);
    }

    logProgress(`Loaded ${parsed.data.length} publications from CSV`, true);
    return parsed.data;
  } catch (error) {
    logError(`Failed to load CSV data: ${error}`);
    return [];
  }
}

/**
 * Find matching CSV record for a Jekyll publication
 */
function findMatchingCSVRecord(
  jekyllData: JekyllPublicationFrontMatter,
  csvData: CSVPublicationData[],
): CSVPublicationData | null {
  if (csvData.length === 0) return null;

  const jekyllYear =
    jekyllData.year?.toString() || new Date(jekyllData.date).getFullYear().toString();
  const jekyllTitle = jekyllData.title.toLowerCase().trim();

  // First try: exact title and year match
  let match = csvData.find(
    (record) => record.YEAR === jekyllYear && record.TITLE.toLowerCase().trim() === jekyllTitle,
  );

  if (match) return match;

  // Second try: title similarity (first 50 characters) and year match
  match = csvData.find(
    (record) =>
      record.YEAR === jekyllYear &&
      record.TITLE.toLowerCase().substring(0, 50) === jekyllTitle.substring(0, 50),
  );

  if (match) return match;

  // Third try: title contains key words and year match
  const titleWords = jekyllTitle.split(' ').filter((word) => word.length > 4);
  if (titleWords.length >= 2) {
    match = csvData.find((record) => {
      const csvTitle = record.TITLE.toLowerCase();
      return record.YEAR === jekyllYear && titleWords.every((word) => csvTitle.includes(word));
    });
  }

  return match || null;
}

/**
 * Extract authors from CSV record
 */
function extractAuthorsFromCSV(csvRecord: CSVPublicationData): Author[] {
  const authors: Author[] = [];

  // Extract authors from A1-A31 columns
  for (let i = 1; i <= 31; i++) {
    const authorKey = `A${i}` as keyof CSVPublicationData;
    const authorName = csvRecord[authorKey];

    if (authorName && authorName.trim()) {
      authors.push({
        name: authorName.trim().replace(/"/g, ''), // Remove quotes
        affiliation: i === 1 ? 'University of California, Santa Barbara' : '', // First author gets default affiliation
        corresponding: i === 1, // Assume first author is corresponding
      });
    }
  }

  return authors;
}

/**
 * Extract author relationships from CSV record (stable advisor-advisee data)
 */
function extractAuthorRelationships(csvRecord: CSVPublicationData): AuthorRelationship[] {
  const relationships: AuthorRelationship[] = [];

  // Parse relationship indicators and match to author positions
  const relationshipFields = [
    { field: 'Undergrad Author', type: 'undergraduate' as const },
    { field: 'Visitor Author', type: 'visitor' as const },
    { field: 'PhD Committee Member', type: 'phd-committee' as const },
    { field: 'Graduate Advisee', type: 'graduate-advisee' as const },
    { field: 'Postdoctoral Advisee', type: 'postdoctoral-advisee' as const },
  ];

  relationshipFields.forEach(({ field, type }) => {
    const value = csvRecord[field as keyof CSVPublicationData];
    if (value && value.trim()) {
      // Parse author positions (e.g., "A1,A3,A5")
      const positions = value
        .split(',')
        .map((pos) => pos.trim())
        .filter((pos) => pos);

      positions.forEach((position) => {
        const authorName = csvRecord[position as keyof CSVPublicationData];
        if (authorName && authorName.trim()) {
          relationships.push({
            authorName: authorName.trim().replace(/"/g, ''),
            relationshipType: type,
            authorPosition: position,
          });
        }
      });
    }
  });

  return relationships;
}

/**
 * Extract associated grants from CSV record
 */
function extractAssociatedGrants(csvRecord: CSVPublicationData): string[] {
  const grants: string[] = [];

  ['Grant #1', 'Grant #2', 'Grant #3'].forEach((grantField) => {
    const grant = csvRecord[grantField as keyof CSVPublicationData];
    if (grant && grant.trim()) {
      grants.push(grant.trim());
    }
  });

  return grants;
}

/**
 * Enhanced transformation with CSV data integration
 */
function transformPublicationFrontMatterEnhanced(
  jekyllFrontMatter: JekyllPublicationFrontMatter,
  csvData: CSVPublicationData[],
): EnhancedPublicationFrontMatter {
  // Start with basic transformation
  const slug = generateSlug(
    `${jekyllFrontMatter.author}${jekyllFrontMatter.year}_${jekyllFrontMatter.id}`,
  );

  // Find matching CSV record
  const csvRecord = findMatchingCSVRecord(jekyllFrontMatter, csvData);

  let authors: Author[] = [];
  let journal = '';
  let keywords: string[] = [];
  let researchAreas: string[] = [];

  // If CSV record found, use enhanced data
  if (csvRecord) {
    authors = extractAuthorsFromCSV(csvRecord);
    journal = csvRecord.PUBLISHER || '';
    researchAreas = csvRecord.Area ? [csvRecord.Area] : [];

    logProgress(`✓ Enhanced with CSV data: ${jekyllFrontMatter.title}`, false);
  } else {
    // Fallback to original parsing logic
    authors = parseAuthorsFromExcerpt(jekyllFrontMatter.excerpt || '');
    journal = extractJournalFromTags(jekyllFrontMatter['portfolio-item-tag'] || []);
    researchAreas = determineResearchAreas(jekyllFrontMatter.title, journal);

    logWarning(`No CSV match found for: ${jekyllFrontMatter.title} (${jekyllFrontMatter.year})`);
  }

  // Ensure we have at least one author
  if (authors.length === 0) {
    authors = [
      {
        name: jekyllFrontMatter.author,
        affiliation: 'University of California, Santa Barbara',
        corresponding: true,
      },
    ];
  }

  keywords = generateKeywords(jekyllFrontMatter.title, journal);

  const baseTransformed: NextJSPublicationFrontMatter = {
    title: jekyllFrontMatter.title,
    authors,
    publicationDate:
      typeof jekyllFrontMatter.date === 'string'
        ? jekyllFrontMatter.date.split(' ')[0]
        : new Date(jekyllFrontMatter.date).toISOString().split('T')[0],
    journal,
    doi: csvRecord?.DOI || jekyllFrontMatter.doi,
    url:
      csvRecord?.DOI || jekyllFrontMatter.doi
        ? `https://www.doi.org/${csvRecord?.DOI || jekyllFrontMatter.doi}`
        : undefined,
    abstract: 'None', // Will be populated later if available
    keywords,
    researchAreas,
    tags: jekyllFrontMatter['portfolio-item-tag'] || [],
    teaserImage: convertAssetPath(jekyllFrontMatter.header?.teaser || ''),
    figureImage: convertAssetPath(
      jekyllFrontMatter.header?.teaser?.replace('.png', '_figure.png') || '',
    ),
    citationCount: 0,
    altmetricScore: 0,
    slug,
  };

  // Create enhanced version with CSV data - focus on stable, foundational data
  const enhanced: EnhancedPublicationFrontMatter = {
    ...baseTransformed,
    researchArea: csvRecord?.Area || undefined,
    associatedGrants: csvRecord ? extractAssociatedGrants(csvRecord) : [],
    collaborators: authors.slice(1), // All authors except first are collaborators
    authorRelationships: csvRecord ? extractAuthorRelationships(csvRecord) : [],
  };

  // Clean up undefined values
  Object.keys(enhanced).forEach((key) => {
    const value = enhanced[key as keyof EnhancedPublicationFrontMatter];
    if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      delete enhanced[key as keyof EnhancedPublicationFrontMatter];
    }
  });

  return enhanced;
}

/**
 * Parse author list from citation excerpt (fallback function)
 */
function parseAuthorsFromExcerpt(excerpt: string): Author[] {
  if (!excerpt) return [];

  try {
    const match = excerpt.match(/^([^(]+)\s*\(\d{4}\)/);
    if (!match) return [];

    const authorsString = match[1].trim();

    if (authorsString.includes('et al.')) {
      const beforeEtAl = authorsString.replace(/\s*et al\.$/, '').trim();
      const authorNames = beforeEtAl
        .split(',')
        .map((name) => name.trim())
        .filter((name) => name);

      return authorNames.map((name) => ({
        name: name.replace(/\.$/, ''),
        affiliation: 'University of California, Santa Barbara',
      }));
    }

    const authorNames = authorsString
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name);

    return authorNames.map((name) => ({
      name: name.replace(/\.$/, ''),
      affiliation: 'University of California, Santa Barbara',
    }));
  } catch (error) {
    logWarning(`Failed to parse authors from excerpt: ${error}`);
    return [];
  }
}

/**
 * Extract journal name from tags (fallback function)
 */
function extractJournalFromTags(tags: string[]): string {
  if (!tags || tags.length === 0) return '';

  const journalTags = tags.filter(
    (tag) =>
      typeof tag === 'string' && !tag.match(/^\d{4}$/) && tag !== 'publications' && tag.length > 3,
  );

  return journalTags[0] || '';
}

/**
 * Generate keywords from title and journal (fallback function)
 */
function generateKeywords(title: string, journal: string): string[] {
  const keywords: string[] = [];

  const titleWords = title
    .toLowerCase()
    .split(/\s+/)
    .filter(
      (word) =>
        word.length > 3 && !['the', 'and', 'for', 'with', 'from', 'into', 'using'].includes(word),
    )
    .slice(0, 5);

  keywords.push(...titleWords);

  if (journal.toLowerCase().includes('forest')) {
    keywords.push('forestry');
  }
  if (journal.toLowerCase().includes('climate')) {
    keywords.push('climate science');
  }
  if (journal.toLowerCase().includes('water')) {
    keywords.push('hydrology');
  }

  return [...new Set(keywords)];
}

/**
 * Determine research areas from title and journal (fallback function)
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
        continue;
      }
      seenKeys.add(key);
    }

    processedLines.push(line);
  }

  return processedLines.join('\n');
}

/**
 * Process a single publication file with CSV enhancement
 */
function processPublicationFileEnhanced(
  filePath: string,
  targetDir: string,
  config: MigrationConfig,
  csvData: CSVPublicationData[],
): FileProcessingResult {
  const fileName = path.basename(filePath, '.md');
  const warnings: string[] = [];

  try {
    logProgress(`Processing ${fileName}...`, config.verbose);

    const rawContent = fs.readFileSync(filePath, 'utf8');
    const preprocessedContent = preprocessFileContent(rawContent);

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

    // Enhanced transformation with CSV data
    const transformedData = transformPublicationFrontMatterEnhanced(jekyllData, csvData);

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

    // Generate enhanced MDX content
    const mdxContent = generateMDXContent(
      transformedData as unknown as Record<string, unknown>,
      processedContent,
    );

    // Write to target file
    const targetFile = path.join(targetDir, `${transformedData.slug}.mdx`);

    if (!config.dryRun) {
      fs.writeFileSync(targetFile, mdxContent, 'utf8');
    }

    logProgress(`✓ Enhanced ${fileName} → ${transformedData.slug}.mdx`, config.verbose);

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
 * Enhanced publications migration with CSV integration
 */
export async function migratePublicationsEnhanced(
  config: MigrationConfig,
): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    filesProcessed: 0,
    filesSkipped: 0,
    errors: [],
    warnings: [],
  };

  try {
    logProgress('Starting enhanced publications migration with CSV integration...', config.verbose);

    // Load CSV data
    const csvData = loadCSVPublicationsData();

    // Ensure target directory exists
    ensureDirectoryExists(config.targetDir);

    // Get all publication files
    const publicationFiles = getMarkdownFiles(config.sourceDir);

    if (publicationFiles.length === 0) {
      logWarning(`No markdown files found in ${config.sourceDir}`);
      return result;
    }

    logProgress(`Found ${publicationFiles.length} publication files to process`, config.verbose);
    logProgress(`Loaded ${csvData.length} CSV records for enhancement`, config.verbose);

    // Process each file with CSV enhancement
    for (const filePath of publicationFiles) {
      const fileResult = processPublicationFileEnhanced(
        filePath,
        config.targetDir,
        config,
        csvData,
      );

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
      `Enhanced migration complete: ${result.filesProcessed} processed, ${result.filesSkipped} skipped`,
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
 * CLI function to run enhanced publications migration
 */
export async function runEnhancedPublicationsMigration(): Promise<void> {
  const config: MigrationConfig = {
    sourceDir: path.join(process.cwd(), 'legacy', '_publications'),
    targetDir: path.join(process.cwd(), 'content', 'publications'),
    assetsSourceDir: path.join(process.cwd(), 'legacy', 'assets'),
    assetsTargetDir: path.join(process.cwd(), 'public'),
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
  };

  console.log('🚀 Starting Enhanced Publications Migration with CSV Integration');
  console.log(`Source: ${config.sourceDir}`);
  console.log(`Target: ${config.targetDir}`);
  console.log(`CSV Data: csv_files/CV/Publications-Table.csv`);
  console.log(`Dry Run: ${config.dryRun ? 'Yes' : 'No'}`);
  console.log('');

  const result = await migratePublicationsEnhanced(config);

  console.log('\n📊 Enhanced Migration Summary:');
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
    `\n${result.success ? '✅ Enhanced migration completed successfully!' : '❌ Migration completed with errors'}`,
  );

  process.exit(result.success ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  runEnhancedPublicationsMigration();
}
