import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createClient } from '@sanity/client';
import { v4 as uuidv4 } from 'uuid';

// Configuration
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2023-12-19',
  useCdn: false,
});

interface MDXNewsData {
  title: string;
  date: string;
  author: string;
  excerpt?: string;
  featuredImage?: string;
  categories?: string[];
  tags?: string[];
  slug: string;
  published?: boolean;
  readingTime?: string;
  coAuthors?: string[];
  relatedPublications?: string[];
  relatedProjects?: string[];
  relatedPeople?: string[];
  externalLinks?: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
  gallery?: string[];
  socialMedia?: {
    twitterText?: string;
    linkedinText?: string;
    hashtags?: string[];
  };
}

interface SanityNewsDocument {
  _type: 'news';
  _id: string;
  title: string;
  slug: {
    _type: 'slug';
    current: string;
  };
  excerpt: string;
  content: string;
  featuredImage?: {
    _type: 'image';
    asset: {
      _type: 'reference';
      _ref: string;
    };
    alt: string;
    caption?: string;
    credit?: string;
  };
  publishedAt: string;
  author: {
    _type: 'reference';
    _ref: string;
  };
  coAuthors?: Array<{
    _type: 'reference';
    _ref: string;
  }>;
  category: 'research' | 'publication' | 'lab-news' | 'conference' | 'award' | 'outreach' | 'collaboration' | 'event' | 'general';
  tags?: string[];
  relatedPublications?: Array<{
    _type: 'reference';
    _ref: string;
  }>;
  relatedProjects?: Array<{
    _type: 'reference';
    _ref: string;
  }>;
  relatedPeople?: Array<{
    _type: 'reference';
    _ref: string;
  }>;
  externalLinks?: Array<{
    _key: string;
    title: string;
    url: string;
    description?: string;
  }>;
  gallery?: Array<{
    _type: 'image';
    asset: {
      _type: 'reference';
      _ref: string;
    };
    alt: string;
    caption?: string;
    credit?: string;
  }>;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  isFeatured?: boolean;
  isSticky?: boolean;
  socialMedia?: {
    twitterText?: string;
    linkedinText?: string;
    hashtags?: string[];
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
  };
  analytics?: {
    views?: number;
    lastViewed?: string;
    socialShares?: number;
  };
}

interface MigrationStats {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  imageUploads: number;
  authorLinksCreated: number;
  relatedLinksCreated: number;
  errors: Array<{
    file: string;
    error: string;
  }>;
}

/**
 * Determine news category from existing categories
 */
function determineNewsCategory(categories: string[] = []): SanityNewsDocument['category'] {
  const categoryStr = categories.join(' ').toLowerCase();

  if (categoryStr.includes('research') || categoryStr.includes('study')) {
    return 'research';
  }
  
  if (categoryStr.includes('publication') || categoryStr.includes('paper')) {
    return 'publication';
  }
  
  if (categoryStr.includes('conference') || categoryStr.includes('meeting')) {
    return 'conference';
  }
  
  if (categoryStr.includes('award') || categoryStr.includes('achievement') || categoryStr.includes('fellowship')) {
    return 'award';
  }
  
  if (categoryStr.includes('outreach') || categoryStr.includes('education') || categoryStr.includes('community')) {
    return 'outreach';
  }
  
  if (categoryStr.includes('collaboration') || categoryStr.includes('partnership')) {
    return 'collaboration';
  }
  
  if (categoryStr.includes('event') || categoryStr.includes('workshop') || categoryStr.includes('seminar')) {
    return 'event';
  }
  
  if (categoryStr.includes('lab') || categoryStr.includes('team') || categoryStr.includes('member')) {
    return 'lab-news';
  }

  return 'general';
}

/**
 * Find person in Sanity by name
 */
async function findPersonByName(name: string): Promise<string | null> {
  try {
    const query = `*[_type == "person" && name match $name][0]._id`;
    const result = await client.fetch(query, { name: `*${name}*` });
    return result || null;
  } catch (error) {
    console.warn(`  ! Failed to find person "${name}":`, error);
    return null;
  }
}

/**
 * Find publication in Sanity by title
 */
async function findPublicationByTitle(title: string): Promise<string | null> {
  try {
    const query = `*[_type == "publication" && title match $title][0]._id`;
    const result = await client.fetch(query, { title: `*${title}*` });
    return result || null;
  } catch (error) {
    console.warn(`  ! Failed to find publication "${title}":`, error);
    return null;
  }
}

/**
 * Find project in Sanity by title
 */
async function findProjectByTitle(title: string): Promise<string | null> {
  try {
    const query = `*[_type == "project" && title match $title][0]._id`;
    const result = await client.fetch(query, { title: `*${title}*` });
    return result || null;
  } catch (error) {
    console.warn(`  ! Failed to find project "${title}":`, error);
    return null;
  }
}

/**
 * Upload image to Sanity and return asset reference
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function uploadImageToSanity(imagePath: string, _altText: string): Promise<{ _type: 'reference'; _ref: string } | null> {
  try {
    const publicImagePath = path.join(process.cwd(), 'public', imagePath.replace(/^\//, ''));
    
    if (!fs.existsSync(publicImagePath)) {
      console.warn(`  ! Image not found: ${publicImagePath}`);
      return null;
    }

    const imageBuffer = fs.readFileSync(publicImagePath);
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
 * Process related content and create references
 */
async function processRelatedContent(mdxData: MDXNewsData): Promise<{
  relatedPublications: Array<{ _type: 'reference'; _ref: string }>;
  relatedProjects: Array<{ _type: 'reference'; _ref: string }>;
  relatedPeople: Array<{ _type: 'reference'; _ref: string }>;
  linksCreated: number;
}> {
  const relatedPublications: Array<{ _type: 'reference'; _ref: string }> = [];
  const relatedProjects: Array<{ _type: 'reference'; _ref: string }> = [];
  const relatedPeople: Array<{ _type: 'reference'; _ref: string }> = [];
  let linksCreated = 0;

  // Process related publications
  if (mdxData.relatedPublications) {
    for (const pubTitle of mdxData.relatedPublications) {
      const pubRef = await findPublicationByTitle(pubTitle);
      if (pubRef) {
        relatedPublications.push({ _type: 'reference', _ref: pubRef });
        linksCreated++;
      }
    }
  }

  // Process related projects
  if (mdxData.relatedProjects) {
    for (const projTitle of mdxData.relatedProjects) {
      const projRef = await findProjectByTitle(projTitle);
      if (projRef) {
        relatedProjects.push({ _type: 'reference', _ref: projRef });
        linksCreated++;
      }
    }
  }

  // Process related people
  if (mdxData.relatedPeople) {
    for (const personName of mdxData.relatedPeople) {
      const personRef = await findPersonByName(personName);
      if (personRef) {
        relatedPeople.push({ _type: 'reference', _ref: personRef });
        linksCreated++;
      }
    }
  }

  return { relatedPublications, relatedProjects, relatedPeople, linksCreated };
}

/**
 * Calculate reading time from content
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return `${readingTime} min read`;
}

/**
 * Transform MDX news data to Sanity format
 */
async function transformNewsToSanity(mdxData: MDXNewsData, content: string): Promise<{
  document: SanityNewsDocument;
  imageUploads: number;
  authorLinksCreated: number;
  relatedLinksCreated: number;
}> {
  const newsId = `news-${mdxData.slug}`;
  let imageUploads = 0;
  let authorLinksCreated = 0;

  // Find author reference
  const authorRef = await findPersonByName(mdxData.author);
  if (authorRef) {
    authorLinksCreated++;
  }

  // Process co-authors
  const coAuthorRefs: Array<{ _type: 'reference'; _ref: string }> = [];
  if (mdxData.coAuthors) {
    for (const coAuthor of mdxData.coAuthors) {
      const coAuthorRef = await findPersonByName(coAuthor);
      if (coAuthorRef) {
        coAuthorRefs.push({ _type: 'reference', _ref: coAuthorRef });
        authorLinksCreated++;
      }
    }
  }

  // Upload featured image if available
  let featuredImageAsset = null;
  if (mdxData.featuredImage) {
    featuredImageAsset = await uploadImageToSanity(mdxData.featuredImage, `Featured image for ${mdxData.title}`);
    if (featuredImageAsset) imageUploads++;
  }

  // Process gallery images
  const galleryAssets: Array<{
    _type: 'image';
    asset: { _type: 'reference'; _ref: string };
    alt: string;
    caption?: string;
    credit?: string;
  }> = [];
  
  if (mdxData.gallery) {
    for (const [index, imagePath] of mdxData.gallery.entries()) {
      const asset = await uploadImageToSanity(imagePath, `Gallery image ${index + 1} for ${mdxData.title}`);
      if (asset) {
        galleryAssets.push({
          _type: 'image',
          asset,
          alt: `Gallery image ${index + 1}`,
        });
        imageUploads++;
      }
    }
  }

  // Process related content
  const { relatedPublications, relatedProjects, relatedPeople, linksCreated: relatedLinksCreated } = 
    await processRelatedContent(mdxData);

  // Clean and process content
  const cleanContent = content
    .replace(/\{\{.*?\}\}/g, '') // Remove Jekyll template tags
    .replace(/\{%.*?%\}/g, '') // Remove Jekyll logic tags
    .replace(/&#8217;/g, "'") // Fix HTML entities
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .trim();

  const sanityDoc: SanityNewsDocument = {
    _type: 'news',
    _id: newsId,
    title: mdxData.title,
    slug: {
      _type: 'slug',
      current: mdxData.slug,
    },
    excerpt: mdxData.excerpt || cleanContent.substring(0, 300) + '...',
    content: cleanContent,
    ...(featuredImageAsset && {
      featuredImage: {
        _type: 'image',
        asset: featuredImageAsset,
        alt: `Featured image for ${mdxData.title}`,
      },
    }),
    publishedAt: new Date(mdxData.date).toISOString(),
    author: authorRef 
      ? { _type: 'reference', _ref: authorRef }
      : { _type: 'reference', _ref: 'person-kelly-caylor' }, // Fallback to PI
    ...(coAuthorRefs.length > 0 && { coAuthors: coAuthorRefs }),
    category: determineNewsCategory(mdxData.categories),
    ...(mdxData.tags && { tags: mdxData.tags.filter(tag => !/^\d{4}$/.test(tag)) }), // Remove year tags
    ...(relatedPublications.length > 0 && { relatedPublications }),
    ...(relatedProjects.length > 0 && { relatedProjects }),
    ...(relatedPeople.length > 0 && { relatedPeople }),
    ...(mdxData.externalLinks && {
      externalLinks: mdxData.externalLinks.map(link => ({
        _key: uuidv4(),
        title: link.title,
        url: link.url,
        description: link.description,
      })),
    }),
    ...(galleryAssets.length > 0 && { gallery: galleryAssets }),
    status: mdxData.published === false ? 'draft' : 'published',
    isFeatured: false, // Can be set manually later
    isSticky: false,
    ...(mdxData.socialMedia && { socialMedia: mdxData.socialMedia }),
    seo: {
      metaTitle: `${mdxData.title} - WAVES Research Lab`,
      metaDescription: mdxData.excerpt || cleanContent.substring(0, 160),
      keywords: [
        mdxData.title.split(' '),
        ...(mdxData.tags || []),
        ...(mdxData.categories || []),
      ].flat().filter(Boolean),
    },
    analytics: {
      views: 0,
      socialShares: 0,
    },
  };

  return {
    document: sanityDoc,
    imageUploads,
    authorLinksCreated,
    relatedLinksCreated,
  };
}

/**
 * Process a single MDX news file
 */
async function processNews(filePath: string): Promise<{
  success: boolean;
  error?: string;
  imageUploads?: number;
  authorLinksCreated?: number;
  relatedLinksCreated?: number;
}> {
  try {
    const fileName = path.basename(filePath, '.mdx');
    console.log(`Processing ${fileName}...`);

    // Read and parse MDX file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontMatter, content } = matter(fileContent);
    
    const mdxData = frontMatter as MDXNewsData;
    mdxData.slug = fileName; // Ensure slug matches filename

    // Validate required fields
    if (!mdxData.title) {
      throw new Error('Missing required field: title');
    }
    
    if (!mdxData.date) {
      throw new Error('Missing required field: date');
    }

    if (!mdxData.author) {
      throw new Error('Missing required field: author');
    }

    // Transform to Sanity format
    const { document: sanityDoc, imageUploads, authorLinksCreated, relatedLinksCreated } = 
      await transformNewsToSanity(mdxData, content);
    
    // Create or update document in Sanity
    const result = await client.createOrReplace(sanityDoc);
    
    console.log(`  ✓ Created/updated Sanity document: ${result._id}`);
    if (authorLinksCreated > 0) {
      console.log(`  ✓ Linked ${authorLinksCreated} authors to people`);
    }
    if (relatedLinksCreated > 0) {
      console.log(`  ✓ Created ${relatedLinksCreated} related content links`);
    }

    return { 
      success: true, 
      imageUploads,
      authorLinksCreated,
      relatedLinksCreated,
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
export async function migrateNewsToSanity(options: {
  sourceDir?: string;
  dryRun?: boolean;
  maxFiles?: number;
  skipImages?: boolean;
} = {}): Promise<MigrationStats> {
  const {
    sourceDir = path.join(process.cwd(), 'content', 'news'),
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
    authorLinksCreated: 0,
    relatedLinksCreated: 0,
    errors: [],
  };

  console.log('🚀 Starting News → Sanity Migration');
  console.log(`Source: ${sourceDir}`);
  console.log(`Dry run: ${dryRun ? 'Yes' : 'No'}`);
  console.log(`Skip images: ${skipImages ? 'Yes' : 'No'}`);
  console.log('');

  // Validate environment
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
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

  console.log(`Found ${files.length} news files to migrate`);
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
    const result = await processNews(filePath);

    if (result.success) {
      stats.successful++;
      if (result.imageUploads) {
        stats.imageUploads += result.imageUploads;
      }
      if (result.authorLinksCreated) {
        stats.authorLinksCreated += result.authorLinksCreated;
      }
      if (result.relatedLinksCreated) {
        stats.relatedLinksCreated += result.relatedLinksCreated;
      }
    } else {
      stats.failed++;
      stats.errors.push({
        file: filename,
        error: result.error || 'Unknown error',
      });
    }

    // Add small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('NEWS → SANITY MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total files: ${stats.total}`);
  console.log(`Successful: ${stats.successful}`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`Skipped (dry run): ${stats.skipped}`);
  console.log(`Images uploaded: ${stats.imageUploads}`);
  console.log(`Author links created: ${stats.authorLinksCreated}`);
  console.log(`Related content links: ${stats.relatedLinksCreated}`);
  console.log(`Success rate: ${((stats.successful / (stats.total - stats.skipped)) * 100).toFixed(1)}%`);

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

  migrateNewsToSanity({ dryRun, maxFiles, skipImages })
    .then((stats) => {
      console.log('\nMigration completed!');
      process.exit(stats.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}