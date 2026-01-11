import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createClient } from '@sanity/client';
import { v4 as uuidv4 } from 'uuid';

// Configuration - only create client when needed
function getSanityClient() {
  const editorToken =
    process.env.SANITY_API_EDITOR_TOKEN || process.env.SANITY_API_TOKEN || undefined;
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    token: editorToken!,
    apiVersion: '2023-12-19',
    useCdn: false,
  });
}

interface MDXPersonData {
  title: string;
  role?: string;
  excerpt?: string;
  avatar?: string;
  headerImage?: string;
  headerCaption?: string;
  tags?: string[];
  location?: string;
  email?: string;
  website?: string;
  orcid?: string;
  googleScholar?: string;
  researchGate?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  cv?: string;
  education?: Array<{
    degree: string;
    institution: string;
    field: string;
    year: number;
  }>;
  researchAreas?: string[];
  currentProjects?: string[];
  slug: string;
  name?: string;
  status?: string;
  isPI?: boolean;
  currentPosition?: string;
  currentOrganization?: string;
  joinDate?: string;
  leaveDate?: string;
}

interface SanityPersonDocument {
  _type: 'person';
  _id: string;
  name: string;
  slug: {
    _type: 'slug';
    current: string;
  };
  title?: string;
  userGroup: 'current' | 'alumni' | 'collaborator' | 'visitor';
  avatar?: {
    _type: 'image';
    asset: {
      _type: 'reference';
      _ref: string;
    };
    alt: string;
  };
  email?: string;
  website?: string;
  socialMedia?: {
    orcid?: string;
    googleScholar?: string;
    researchGate?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  education?: Array<{
    _key: string;
    degree: string;
    field: string;
    institution: string;
    year: number;
  }>;
  researchInterests?: string[];
  bio?: string;
  bioLong?: string;
  joinDate?: string;
  leaveDate?: string;
  currentPosition?: string;
  isActive: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

interface MigrationStats {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  imageUploads: number;
  errors: Array<{
    file: string;
    error: string;
  }>;
}

/**
 * Parse education from header caption text
 */
function parseEducationFromCaption(caption: string): Array<{
  degree: string;
  institution: string;
  field: string;
  year: number;
}> {
  const education: Array<{
    degree: string;
    institution: string;
    field: string;
    year: number;
  }> = [];

  // Common patterns: "PhD, Computer Science, MIT (2010)"
  const patterns = [
    /([A-Z]{2,4}),\s*([^,]+),\s*([^,\(]+)[\s\(]*(\d{4})?/g,
    /([A-Z]{2,4})\s+in\s+([^,]+),\s*([^,\(]+)[\s\(]*(\d{4})?/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(caption)) !== null) {
      const [, degree, field, institution, yearStr] = match;
      const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();

      education.push({
        degree: degree.trim(),
        field: field.trim(),
        institution: institution.trim(),
        year,
      });
    }
  }

  return education;
}

/**
 * Determine user group from tags and status
 */
function determineUserGroup(
  tags: string[] = [],
  status?: string,
): 'current' | 'alumni' | 'collaborator' | 'visitor' {
  const tagStr = tags.join(' ').toLowerCase();
  const statusStr = (status || '').toLowerCase();

  if (tagStr.includes('current member') || statusStr === 'current') {
    return 'current';
  }

  if (tagStr.includes('alumni') || tagStr.includes('former') || statusStr === 'alumni') {
    return 'alumni';
  }

  if (tagStr.includes('collaborator') || statusStr === 'collaborator') {
    return 'collaborator';
  }

  if (tagStr.includes('visitor') || statusStr === 'visitor') {
    return 'visitor';
  }

  // Default based on role indicators
  if (tagStr.includes('graduate') || tagStr.includes('postdoc') || tagStr.includes('phd')) {
    return 'alumni'; // Assume older entries are alumni
  }

  return 'current';
}

/**
 * Upload image to Sanity and return asset reference
 */
async function uploadImageToSanity(
  imagePath: string,
): Promise<{ _type: 'reference'; _ref: string } | null> {
  try {
    const publicImagePath = path.join(process.cwd(), 'public', imagePath.replace(/^\//, ''));

    if (!fs.existsSync(publicImagePath)) {
      console.warn(`  ! Image not found: ${publicImagePath}`);
      return null;
    }

    const imageBuffer = fs.readFileSync(publicImagePath);
    const client = getSanityClient();
    const asset = await client.assets.upload('image', imageBuffer, {
      filename: path.basename(imagePath),
    });

    console.log(`  ✓ Uploaded image: ${path.basename(imagePath)}`);
    return {
      _type: 'reference',
      _ref: asset._id,
    };
  } catch (error) {
    console.error(`  ! Failed to upload image ${imagePath}:`, error);
    return null;
  }
}

/**
 * Transform MDX person data to Sanity format
 */
async function transformPersonToSanity(
  mdxData: MDXPersonData,
  content: string,
): Promise<SanityPersonDocument> {
  const personId = `person-${mdxData.slug}`;

  // Parse education from header caption if available
  let education = mdxData.education || [];
  if (!education.length && mdxData.headerCaption) {
    education = parseEducationFromCaption(mdxData.headerCaption);
  }

  // Upload avatar image if available
  let avatarAsset = null;
  if (mdxData.avatar) {
    avatarAsset = await uploadImageToSanity(mdxData.avatar);
  }

  const sanityDoc: SanityPersonDocument = {
    _type: 'person',
    _id: personId,
    name: mdxData.name || mdxData.title,
    slug: {
      _type: 'slug',
      current: mdxData.slug,
    },
    title: mdxData.role,
    userGroup: determineUserGroup(mdxData.tags, mdxData.status),
    ...(avatarAsset && {
      avatar: {
        _type: 'image',
        asset: avatarAsset,
        alt: `Photo of ${mdxData.title}`,
      },
    }),
    ...(mdxData.email && { email: mdxData.email }),
    ...(mdxData.website && { website: mdxData.website }),
    socialMedia: {
      ...(mdxData.orcid && { orcid: mdxData.orcid }),
      ...(mdxData.googleScholar && { googleScholar: mdxData.googleScholar }),
      ...(mdxData.researchGate && { researchGate: mdxData.researchGate }),
      ...(mdxData.linkedin && { linkedin: mdxData.linkedin }),
      ...(mdxData.twitter && { twitter: mdxData.twitter }),
      ...(mdxData.github && { github: mdxData.github }),
    },
    ...(education.length > 0 && {
      education: education.map((edu) => ({
        _key: uuidv4(),
        degree: edu.degree,
        field: edu.field,
        institution: edu.institution,
        year: edu.year,
      })),
    }),
    ...(mdxData.researchAreas && { researchInterests: mdxData.researchAreas }),
    bio: mdxData.excerpt,
    bioLong: content.trim() || mdxData.excerpt,
    ...(mdxData.joinDate && { joinDate: mdxData.joinDate }),
    ...(mdxData.leaveDate && { leaveDate: mdxData.leaveDate }),
    ...(mdxData.currentPosition && { currentPosition: mdxData.currentPosition }),
    isActive: true,
    seo: {
      metaTitle: `${mdxData.title} - WAVES Research Lab`,
      metaDescription:
        mdxData.excerpt ||
        `Learn about ${mdxData.title}, ${mdxData.role || 'researcher'} at WAVES Research Lab.`,
      keywords: [
        mdxData.title.split(' '),
        ...(mdxData.researchAreas || []),
        ...(mdxData.tags || []),
      ]
        .flat()
        .filter(Boolean),
    },
  };

  // Clean up empty objects
  if (Object.keys(sanityDoc.socialMedia || {}).length === 0) {
    delete sanityDoc.socialMedia;
  }

  return sanityDoc;
}

/**
 * Process a single MDX person file
 */
async function processPerson(
  filePath: string,
): Promise<{ success: boolean; error?: string; imageUploads?: number }> {
  try {
    const fileName = path.basename(filePath, '.mdx');
    console.log(`Processing ${fileName}...`);

    // Read and parse MDX file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontMatter, content } = matter(fileContent);

    const mdxData = frontMatter as MDXPersonData;
    mdxData.slug = fileName; // Ensure slug matches filename

    // Validate required fields
    if (!mdxData.title) {
      throw new Error('Missing required field: title');
    }

    // Transform to Sanity format
    const sanityDoc = await transformPersonToSanity(mdxData, content);

    // Create or update document in Sanity
    const client = getSanityClient();
    const result = await client.createOrReplace(sanityDoc);

    console.log(`  ✓ Created/updated Sanity document: ${result._id}`);

    return {
      success: true,
      imageUploads: mdxData.avatar ? 1 : 0,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`  ✗ Failed to process ${path.basename(filePath)}:`, errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Main migration function
 */
export async function migratePeopleToSanity(
  options: {
    sourceDir?: string;
    dryRun?: boolean;
    maxFiles?: number;
    skipImages?: boolean;
  } = {},
): Promise<MigrationStats> {
  const {
    sourceDir = path.join(process.cwd(), 'content', 'people'),
    dryRun = false,
    maxFiles,
    skipImages = false,
  } = options;

  const stats: MigrationStats = {
    total: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    imageUploads: 0,
    errors: [],
  };

  console.log('🚀 Starting People → Sanity Migration');
  console.log(`Source: ${sourceDir}`);
  console.log(`Dry run: ${dryRun ? 'Yes' : 'No'}`);
  console.log(`Skip images: ${skipImages ? 'Yes' : 'No'}`);
  console.log('');

  // Validate environment
  if (
    !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    !(process.env.SANITY_API_EDITOR_TOKEN || process.env.SANITY_API_TOKEN)
  ) {
    throw new Error('Missing required Sanity environment variables');
  }

  // Check source directory
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Source directory does not exist: ${sourceDir}`);
  }

  // Get all MDX files
  const files = fs
    .readdirSync(sourceDir)
    .filter((file) => file.endsWith('.mdx'))
    .slice(0, maxFiles);

  stats.total = files.length;

  console.log(`Found ${files.length} people files to migrate`);
  console.log('');

  // Process each file
  for (const [index, filename] of files.entries()) {
    console.log(`[${index + 1}/${files.length}] ${filename}`);

    if (dryRun) {
      console.log(`  → Would process ${filename} (dry run)`);
      stats.skipped++;
      continue;
    }

    const filePath = path.join(sourceDir, filename);
    const result = await processPerson(filePath);

    if (result.success) {
      stats.successful++;
      if (result.imageUploads) {
        stats.imageUploads += result.imageUploads;
      }
    } else {
      stats.failed++;
      stats.errors.push({
        file: filename,
        error: result.error || 'Unknown error',
      });
    }

    // Add small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('PEOPLE → SANITY MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total files: ${stats.total}`);
  console.log(`Successful: ${stats.successful}`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`Skipped (dry run): ${stats.skipped}`);
  console.log(`Images uploaded: ${stats.imageUploads}`);
  console.log(
    `Success rate: ${((stats.successful / (stats.total - stats.skipped)) * 100).toFixed(1)}%`,
  );

  if (stats.errors.length > 0) {
    console.log('\nErrors:');
    stats.errors.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
  }

  return stats;
}

// CLI support
if (require.main === module) {
  const dryRun = process.argv.includes('--dry-run');
  const maxFiles = process.argv.includes('--max-files')
    ? parseInt(process.argv[process.argv.indexOf('--max-files') + 1])
    : undefined;
  const skipImages = process.argv.includes('--skip-images');

  migratePeopleToSanity({ dryRun, maxFiles, skipImages })
    .then((stats) => {
      console.log('\nMigration completed!');
      process.exit(stats.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
