import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
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
  NextJSPersonFrontMatter,
  MigrationConfig,
  MigrationResult,
  FileProcessingResult,
} from './types';

// Enhanced interfaces for CSV integration
interface CSVPersonData {
  Student: string;
  Year: string;
  Institution: string;
  Department: string;
  Role: string;
  Position: string;
  Affiliation: string;
  Organization: string;
  Webpage: string;
  Email: string;
  Sector: string;
  Degree: string;
  Title?: string;
}

interface EnhancedPersonFrontMatter extends NextJSPersonFrontMatter {
  currentPosition?: string;
  currentOrganization?: string;
  currentWebsite?: string;
  currentEmail?: string;
  careerSector?: string;
  graduationYear?: string;
  degree?: string;
  advisoryRole?: string;
  associatedGrants?: string[];
  careerTrajectory?: CareerMilestone[];
  isPI?: boolean;
  piRole?: string;
}

interface CareerMilestone {
  year: string;
  position: string;
  organization: string;
  type: 'education' | 'position' | 'award';
}

/**
 * Load and parse CSV people data (PhD students)
 */
function loadCSVPeopleData(): CSVPersonData[] {
  try {
    const csvPath = path.join(process.cwd(), 'csv_files', 'CV', 'Graduate PhD-Table.csv');

    if (!fs.existsSync(csvPath)) {
      logWarning('CSV PhD students file not found, proceeding without enhancement');
      return [];
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const parsed = Papa.parse<CSVPersonData>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    if (parsed.errors.length > 0) {
      logWarning(`CSV parsing warnings: ${parsed.errors.map((e) => e.message).join(', ')}`);
    }

    logProgress(`Loaded ${parsed.data.length} PhD students from CSV`, true);
    return parsed.data;
  } catch (error) {
    logError(`Failed to load CSV people data: ${error}`);
    return [];
  }
}

/**
 * Load additional people data from other CSV files
 */
function loadAdditionalPeopleData(): {
  postdocs: CSVPersonData[];
  masters: CSVPersonData[];
  undergrads: CSVPersonData[];
} {
  const result = {
    postdocs: [] as CSVPersonData[],
    masters: [] as CSVPersonData[],
    undergrads: [] as CSVPersonData[],
  };

  try {
    // Load postdocs
    const postdocPath = path.join(process.cwd(), 'csv_files', 'CV', 'Postdoc-Table.csv');
    if (fs.existsSync(postdocPath)) {
      const csvContent = fs.readFileSync(postdocPath, 'utf8');
      const parsed = Papa.parse<CSVPersonData>(csvContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
      });
      result.postdocs = parsed.data;
      logProgress(`Loaded ${parsed.data.length} postdocs from CSV`, true);
    }

    // Load masters students
    const mastersPath = path.join(process.cwd(), 'csv_files', 'CV', 'Graduate MA MS-Table.csv');
    if (fs.existsSync(mastersPath)) {
      const csvContent = fs.readFileSync(mastersPath, 'utf8');
      const parsed = Papa.parse<CSVPersonData>(csvContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
      });
      result.masters = parsed.data;
      logProgress(`Loaded ${parsed.data.length} masters students from CSV`, true);
    }

    // Load undergrads
    const undergradsPath = path.join(process.cwd(), 'csv_files', 'CV', 'Undergrad-Table.csv');
    if (fs.existsSync(undergradsPath)) {
      const csvContent = fs.readFileSync(undergradsPath, 'utf8');
      const parsed = Papa.parse<CSVPersonData>(csvContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
      });
      result.undergrads = parsed.data;
      logProgress(`Loaded ${parsed.data.length} undergrad students from CSV`, true);
    }
  } catch (error) {
    logWarning(`Failed to load additional people data: ${error}`);
  }

  return result;
}

/**
 * Find matching CSV record for a Jekyll person
 */
function findMatchingCSVRecord(
  jekyllData: JekyllPersonFrontMatter,
  csvData: CSVPersonData[],
  additionalData: {
    postdocs: CSVPersonData[];
    masters: CSVPersonData[];
    undergrads: CSVPersonData[];
  },
): CSVPersonData | null {
  const allData = [
    ...csvData,
    ...additionalData.postdocs,
    ...additionalData.masters,
    ...additionalData.undergrads,
  ];

  if (allData.length === 0) return null;

  const jekyllName = jekyllData.title.toLowerCase().trim();

  // Try exact name match first
  let match = allData.find(
    (record) => record.Student && record.Student.toLowerCase().trim() === jekyllName,
  );

  if (match) return match;

  // Try partial name match (last name)
  const lastName = jekyllName.split(' ').pop() || '';
  if (lastName.length > 2) {
    match = allData.find(
      (record) => record.Student && record.Student.toLowerCase().includes(lastName),
    );
  }

  if (match) return match;

  // Try first name + last name match
  const nameParts = jekyllName.split(' ');
  if (nameParts.length >= 2) {
    const firstName = nameParts[0];
    match = allData.find((record) => {
      const csvName = record.Student?.toLowerCase() || '';
      return csvName.includes(firstName) && csvName.includes(lastName);
    });
  }

  return match || null;
}

/**
 * Extract career trajectory from CSV record
 */
function extractCareerTrajectory(csvRecord: CSVPersonData): CareerMilestone[] {
  const trajectory: CareerMilestone[] = [];

  // Add graduation
  if (csvRecord.Year && csvRecord.Year !== 'In Progress') {
    trajectory.push({
      year: csvRecord.Year,
      position: `${csvRecord.Degree || 'PhD'} Graduate`,
      organization: csvRecord.Institution || 'University of California, Santa Barbara',
      type: 'education',
    });
  }

  // Add current position
  if (csvRecord.Position && csvRecord.Organization) {
    const currentYear = new Date().getFullYear().toString();
    trajectory.push({
      year:
        csvRecord.Year && csvRecord.Year !== 'In Progress'
          ? (parseInt(csvRecord.Year) + 1).toString()
          : currentYear,
      position: csvRecord.Position,
      organization: csvRecord.Organization,
      type: 'position',
    });
  }

  return trajectory;
}

/**
 * Enhanced transformation with CSV data integration
 */
function transformPersonFrontMatterEnhanced(
  jekyllFrontMatter: JekyllPersonFrontMatter,
  csvData: CSVPersonData[],
  additionalData: {
    postdocs: CSVPersonData[];
    masters: CSVPersonData[];
    undergrads: CSVPersonData[];
  },
  authorsData?: Record<string, Record<string, unknown>>,
): EnhancedPersonFrontMatter {
  // Start with basic transformation using existing utility
  const baseTransformed = transformPersonFrontMatter(jekyllFrontMatter, authorsData);

  // Find matching CSV record
  const csvRecord = findMatchingCSVRecord(jekyllFrontMatter, csvData, additionalData);

  // Create enhanced version with CSV data
  const enhanced: EnhancedPersonFrontMatter = {
    ...baseTransformed,
  };

  // Identify Kelly Caylor as PI and add PI-specific metadata
  const isKellyCaylor =
    jekyllFrontMatter.title.toLowerCase().includes('kelly caylor') ||
    jekyllFrontMatter.title.toLowerCase().includes('caylor');

  if (isKellyCaylor) {
    enhanced.isPI = true;
    enhanced.piRole = 'Principal Investigator';
    enhanced.title = 'Kelly Caylor';
    enhanced.role = 'Professor';
    enhanced.excerpt =
      'Professor at the Bren School of Environmental Science & Department of Geography. Director of the Earth Research Institute at UCSB';
    enhanced.email = 'caylor@ucsb.edu';
    enhanced.location = 'Santa Barbara, CA';
    enhanced.website = 'http://caylor.eri.ucsb.edu';
    enhanced.orcid = '0000-0002-6466-6448';
    enhanced.googleScholar = 'VGaoB64AAAAJ&hl';
    enhanced.researchGate = 'Kelly_Caylor';
    enhanced.linkedin = 'kellycaylor';
    enhanced.twitter = 'kcaylor';
    enhanced.github = 'kcaylor';
    enhanced.tags = [...(enhanced.tags || []), 'pi', 'faculty', 'current member'];

    logProgress(`✓ Identified PI: ${jekyllFrontMatter.title}`, false);
  }

  // Enhance with CSV data if found
  if (csvRecord) {
    enhanced.currentPosition = csvRecord.Position || undefined;
    enhanced.currentOrganization = csvRecord.Organization || undefined;
    enhanced.currentWebsite = csvRecord.Webpage || undefined;
    enhanced.currentEmail = csvRecord.Email || undefined;
    enhanced.careerSector = csvRecord.Sector || undefined;
    enhanced.graduationYear = csvRecord.Year !== 'In Progress' ? csvRecord.Year : undefined;
    enhanced.degree = csvRecord.Degree || 'PhD';
    enhanced.advisoryRole = csvRecord.Role || undefined;
    enhanced.careerTrajectory = extractCareerTrajectory(csvRecord);

    // Update email with current email if available and more recent
    if (csvRecord.Email && csvRecord.Email.trim()) {
      enhanced.email = csvRecord.Email.trim();
    }

    // Update website if available
    if (csvRecord.Webpage && csvRecord.Webpage.trim()) {
      enhanced.website = csvRecord.Webpage.trim();
    }

    // Add current member tag if still in progress or recent graduate
    if (
      csvRecord.Year === 'In Progress' ||
      (csvRecord.Year && parseInt(csvRecord.Year) >= new Date().getFullYear() - 2)
    ) {
      enhanced.tags = [...(enhanced.tags || []), 'current member'];
    }

    // Add sector-based tags
    if (csvRecord.Sector) {
      enhanced.tags = [...(enhanced.tags || []), csvRecord.Sector.toLowerCase()];
    }

    logProgress(`✓ Enhanced with CSV data: ${jekyllFrontMatter.title}`, false);
  } else {
    logWarning(`No CSV match found for: ${jekyllFrontMatter.title}`);
  }

  // Clean up undefined values
  Object.keys(enhanced).forEach((key) => {
    const value = enhanced[key as keyof EnhancedPersonFrontMatter];
    if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      delete enhanced[key as keyof EnhancedPersonFrontMatter];
    }
  });

  return enhanced;
}

/**
 * Process a single person file with CSV enhancement
 */
function processPersonFileEnhanced(
  filePath: string,
  targetDir: string,
  config: MigrationConfig,
  csvData: CSVPersonData[],
  additionalData: {
    postdocs: CSVPersonData[];
    masters: CSVPersonData[];
    undergrads: CSVPersonData[];
  },
  authorsData?: Record<string, Record<string, unknown>>,
): FileProcessingResult {
  const fileName = path.basename(filePath, '.md');
  const warnings: string[] = [];

  try {
    logProgress(`Processing ${fileName}...`, config.verbose);

    // Parse Jekyll file using existing utility
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

    // Parse education from header caption if available
    if (jekyllData.header?.caption) {
      const education = parseEducationFromCaption(jekyllData.header.caption);
      if (education.length > 0) {
        // Convert education objects to strings for compatibility
        const educationStrings = education.map(
          (edu) => `${edu.degree}, ${edu.field}, ${edu.institution}`,
        );
        // Add education to the data for transformation
        (jekyllData as JekyllPersonFrontMatter & { education: string[] }).education =
          educationStrings;
      }
    }

    // Enhanced transformation with CSV data
    const transformedData = transformPersonFrontMatterEnhanced(
      jekyllData,
      csvData,
      additionalData,
      authorsData,
    );

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

    // Generate enhanced MDX content
    const mdxContent = generateMDXContent(
      transformedData as unknown as Record<string, unknown>,
      content,
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
 * Enhanced people migration with CSV integration
 */
export async function migratePeopleEnhanced(config: MigrationConfig): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    filesProcessed: 0,
    filesSkipped: 0,
    errors: [],
    warnings: [],
  };

  try {
    logProgress('Starting enhanced people migration with CSV integration...', config.verbose);

    // Load CSV data
    const csvData = loadCSVPeopleData();
    const additionalData = loadAdditionalPeopleData();

    // Load authors data from Jekyll
    const authorsDataDir = path.join(path.dirname(config.sourceDir), '_data');
    const authorsData = loadAuthorsData(authorsDataDir);

    if (authorsData) {
      logProgress(
        `Loaded authors data with ${Object.keys(authorsData).length} entries`,
        config.verbose,
      );
    }

    // Ensure target directory exists
    ensureDirectoryExists(config.targetDir);

    // Get all person files
    const personFiles = getMarkdownFiles(config.sourceDir);

    if (personFiles.length === 0) {
      logWarning(`No markdown files found in ${config.sourceDir}`);
      return result;
    }

    logProgress(`Found ${personFiles.length} person files to process`, config.verbose);
    logProgress(`Loaded ${csvData.length} PhD students from CSV`, config.verbose);
    logProgress(
      `Loaded ${additionalData.postdocs.length} postdocs, ${additionalData.masters.length} masters, ${additionalData.undergrads.length} undergrads`,
      config.verbose,
    );

    // Process each file with CSV enhancement
    for (const filePath of personFiles) {
      const fileResult = processPersonFileEnhanced(
        filePath,
        config.targetDir,
        config,
        csvData,
        additionalData,
        authorsData || undefined,
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
 * CLI function to run enhanced people migration
 */
export async function runEnhancedPeopleMigration(): Promise<void> {
  const config: MigrationConfig = {
    sourceDir: path.join(process.cwd(), 'legacy', '_people'),
    targetDir: path.join(process.cwd(), 'content', 'people'),
    assetsSourceDir: path.join(process.cwd(), 'legacy', 'assets'),
    assetsTargetDir: path.join(process.cwd(), 'public'),
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
  };

  console.log('🚀 Starting Enhanced People Migration with CSV Integration');
  console.log(`Source: ${config.sourceDir}`);
  console.log(`Target: ${config.targetDir}`);
  console.log(`CSV Data: csv_files/CV/Graduate PhD-Table.csv (and others)`);
  console.log(`Dry Run: ${config.dryRun ? 'Yes' : 'No'}`);
  console.log('');

  const result = await migratePeopleEnhanced(config);

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
  runEnhancedPeopleMigration();
}
