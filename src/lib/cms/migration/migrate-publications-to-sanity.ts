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

interface MDXPublicationData {
  title: string;
  authors:
    | Array<{
        name: string;
        affiliation?: string;
        corresponding?: boolean;
      }>
    | string;
  semanticScholar?: {
    enhancedAuthors?: Array<{ name?: string; semanticScholarId?: string }>;
  };
  publicationDate: string;
  journal?: string;
  doi?: string;
  url?: string;
  abstract?: string;
  keywords?: string[];
  researchAreas?: string[];
  tags?: string[];
  teaserImage?: string;
  figureImage?: string;
  citationCount?: number;
  altmetricScore?: number;
  slug: string;
  researchArea?: string;
  associatedGrants?: string[];
  authorRelationships?: Array<{
    authorName: string;
    relationshipType: string;
    authorPosition: string;
  }>;
  pages?: number;
  pdfFile?: string;
  year: number;
  volume?: string;
  issue?: string;
  publisher?: string;
  type?: string;
  booktitle?: string;
  arxivId?: string;
  venue?: {
    name: string;
    shortName?: string;
    volume?: string;
    issue?: string;
    pages?: string;
    publisher?: string;
  };
}

interface SanityPublicationDocument {
  _type: 'publication';
  _id: string;
  title: string;
  slug: {
    _type: 'slug';
    current: string;
  };
  publicationType:
    | 'journal-article'
    | 'conference-paper'
    | 'book-chapter'
    | 'preprint'
    | 'thesis'
    | 'report'
    | 'book'
    | 'other';
  authors: Array<{
    _key: string;
    person?: {
      _type: 'reference';
      _ref: string;
    };
    name?: string;
    affiliation?: string;
    email?: string;
    orcid?: string;
    isCorresponding?: boolean;
  }>;
  abstract?: string;
  keywords?: string[];
  venue?: {
    name?: string;
    shortName?: string;
    volume?: string;
    issue?: string;
    pages?: string;
    publisher?: string;
  };
  publishedDate: string;
  submittedDate?: string;
  acceptedDate?: string;
  doi?: string;
  isbn?: string;
  pmid?: string;
  arxivId?: string;
  links?: {
    publisher?: string;
    preprint?: string;
    pdf?: {
      _type: 'file';
      asset: {
        _type: 'reference';
        _ref: string;
      };
    };
    supplementary?: string;
    code?: string;
    dataset?: string;
  };
  metrics?: {
    citations?: number;
    altmetricScore?: number;
    impactFactor?: number;
    quartile?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  };
  status:
    | 'published'
    | 'in-press'
    | 'accepted'
    | 'under-review'
    | 'submitted'
    | 'in-preparation'
    | 'preprint';
  isFeatured?: boolean;
  isOpenAccess?: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

interface MigrationStats {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  pdfUploads: number;
  authorLinksCreated: number;
  errors: Array<{
    file: string;
    error: string;
  }>;
}

/**
 * Determine publication type from venue and metadata
 */
function determinePublicationType(
  publication: MDXPublicationData,
):
  | 'journal-article'
  | 'conference-paper'
  | 'book-chapter'
  | 'preprint'
  | 'thesis'
  | 'report'
  | 'book'
  | 'other' {
  const venue = publication.journal || publication.venue?.name || '';
  const type = publication.type || '';

  // Check for preprints
  if (
    venue.toLowerCase().includes('arxiv') ||
    venue.toLowerCase().includes('biorxiv') ||
    venue.toLowerCase().includes('preprint') ||
    publication.arxivId
  ) {
    return 'preprint';
  }

  // Check for theses
  if (type.toLowerCase().includes('thesis') || type.toLowerCase().includes('dissertation')) {
    return 'thesis';
  }

  // Check for conference papers
  if (
    venue.toLowerCase().includes('conference') ||
    venue.toLowerCase().includes('proceedings') ||
    publication.booktitle ||
    type.toLowerCase().includes('conference')
  ) {
    return 'conference-paper';
  }

  // Check for book chapters
  if (type.toLowerCase().includes('chapter') || venue.toLowerCase().includes('chapter')) {
    return 'book-chapter';
  }

  // Check for books
  if (type.toLowerCase().includes('book') && !type.toLowerCase().includes('chapter')) {
    return 'book';
  }

  // Check for reports
  if (type.toLowerCase().includes('report') || venue.toLowerCase().includes('report')) {
    return 'report';
  }

  // Default to journal article
  return 'journal-article';
}

/**
 * Find person in Sanity by name
 */
async function findPersonByName(name: string): Promise<string | null> {
  try {
    const client = getSanityClient();
    const query = `*[_type == "person" && name match $name][0]._id`;
    const result = await client.fetch(query, { name: `*${name}*` });
    return result || null;
  } catch (error) {
    console.warn(`  ! Failed to find person "${name}":`, error);
    return null;
  }
}

/**
 * Find person by Semantic Scholar author ID stored on the person document
 */
async function findPersonBySemanticScholarId(authorId: string): Promise<string | null> {
  try {
    const client = getSanityClient();
    const query = `*[_type == "person" && socialMedia.semanticScholarId == $id][0]._id`;
    const result = await client.fetch(query, { id: authorId });
    return result || null;
  } catch (error) {
    console.warn(`  ! Failed to find person by Semantic Scholar ID "${authorId}":`, error);
    return null;
  }
}

/**
 * Upload PDF to Sanity and return asset reference
 */
async function uploadPDFToSanity(
  pdfPath: string,
): Promise<{ _type: 'reference'; _ref: string } | null> {
  try {
    const publicPdfPath = path.join(process.cwd(), 'public', pdfPath.replace(/^\//, ''));

    if (!fs.existsSync(publicPdfPath)) {
      console.warn(`  ! PDF not found: ${publicPdfPath}`);
      return null;
    }

    const pdfBuffer = fs.readFileSync(publicPdfPath);
    const client = getSanityClient();
    const asset = await client.assets.upload('file', pdfBuffer, {
      filename: path.basename(pdfPath),
    });

    console.log(`  ✓ Uploaded PDF: ${path.basename(pdfPath)}`);
    return {
      _type: 'reference',
      _ref: asset._id,
    };
  } catch (error) {
    console.error(`  ! Failed to upload PDF ${pdfPath}:`, error);
    return null;
  }
}

/**
 * Process authors array and link to people in Sanity
 */
async function processAuthors(
  authorsData: MDXPublicationData['authors'],
  authorRelationships?: MDXPublicationData['authorRelationships'],
  enhancedAuthors?: Array<{ name?: string; semanticScholarId?: string }>,
): Promise<{
  authors: SanityPublicationDocument['authors'];
  linksCreated: number;
}> {
  const authors: SanityPublicationDocument['authors'] = [];
  let linksCreated = 0;

  // Build a quick lookup from normalized author name -> semanticScholarId
  const normalizedNameToS2Id = new Map<string, string>();
  for (const ea of enhancedAuthors || []) {
    if (!ea?.name || !ea.semanticScholarId) continue;
    const key = String(ea.name).toLowerCase().replace(/\s+/g, ' ').trim();
    if (key) normalizedNameToS2Id.set(key, String(ea.semanticScholarId));
  }

  // Prefer Semantic Scholar enhanced authors (preserves canonical order and identity)
  if (Array.isArray(enhancedAuthors) && enhancedAuthors.length > 0) {
    for (const ea of enhancedAuthors) {
      const canonicalName = ea?.name || '';
      if (!canonicalName) continue;
      const lower = canonicalName.toLowerCase().replace(/\s+/g, ' ').trim();
      const s2Id = lower
        ? normalizedNameToS2Id.get(lower) || ea?.semanticScholarId
        : ea?.semanticScholarId;

      let personRef: string | null = null;
      if (s2Id) {
        personRef = await findPersonBySemanticScholarId(String(s2Id));
      }
      // Fallback to name matching if S2 ID not found
      if (!personRef) {
        personRef = await findPersonByName(canonicalName);
      }

      authors.push({
        _key: uuidv4(),
        name: canonicalName,
        ...(personRef ? { person: { _type: 'reference', _ref: personRef } } : {}),
        isCorresponding: false,
      });
      if (personRef) linksCreated++;
    }

    return { authors, linksCreated };
  }

  // Handle string format (legacy)
  if (typeof authorsData === 'string') {
    const authorNames = authorsData.split(/,\s*and\s*|,\s*|\s*and\s*/).map((name) => name.trim());

    for (const name of authorNames) {
      if (!name) continue;

      // Try S2 ID based linking first
      const s2Id = normalizedNameToS2Id.get(name.toLowerCase());
      const personRef = s2Id
        ? await findPersonBySemanticScholarId(s2Id)
        : await findPersonByName(name);

      authors.push({
        _key: uuidv4(),
        name,
        ...(personRef ? { person: { _type: 'reference', _ref: personRef } } : {}),
        affiliation: 'University of California, Santa Barbara', // Default affiliation
        isCorresponding: false,
      });

      if (personRef) linksCreated++;
    }
  }
  // Handle array format
  else if (Array.isArray(authorsData)) {
    for (const author of authorsData) {
      const lower = author.name?.toLowerCase().replace(/\s+/g, ' ').trim() || '';
      const s2Id = lower ? normalizedNameToS2Id.get(lower) : undefined;
      const personRef = s2Id
        ? await findPersonBySemanticScholarId(s2Id)
        : await findPersonByName(author.name);

      // Find relationship data
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _relationship = authorRelationships?.find(
        (rel) =>
          rel.authorName.toLowerCase().includes(author.name.toLowerCase()) ||
          author.name.toLowerCase().includes(rel.authorName.toLowerCase()),
      );

      authors.push({
        _key: uuidv4(),
        name: author.name,
        ...(personRef ? { person: { _type: 'reference', _ref: personRef } } : {}),
        affiliation: author.affiliation || 'University of California, Santa Barbara',
        isCorresponding: author.corresponding || false,
      });

      if (personRef) linksCreated++;
    }
  }

  return { authors, linksCreated };
}

/**
 * Transform MDX publication data to Sanity format
 */
async function transformPublicationToSanity(mdxData: MDXPublicationData): Promise<{
  document: SanityPublicationDocument;
  linksCreated: number;
  pdfUploaded: boolean;
}> {
  const publicationId = `publication-${mdxData.slug}`;
  let linksCreated = 0;
  let pdfUploaded = false;

  // Process authors
  const { authors, linksCreated: authorLinks } = await processAuthors(
    mdxData.authors,
    mdxData.authorRelationships,
    mdxData.semanticScholar?.enhancedAuthors,
  );
  linksCreated += authorLinks;

  // Upload PDF if available
  let pdfAsset = null;
  if (mdxData.pdfFile) {
    pdfAsset = await uploadPDFToSanity(mdxData.pdfFile);
    pdfUploaded = !!pdfAsset;
  }

  // Determine publication status
  let status: SanityPublicationDocument['status'] = 'published';
  if (mdxData.type?.toLowerCase().includes('preprint')) {
    status = 'preprint';
  }

  const sanityDoc: SanityPublicationDocument = {
    _type: 'publication',
    _id: publicationId,
    title: mdxData.title,
    slug: {
      _type: 'slug',
      current: mdxData.slug,
    },
    publicationType: determinePublicationType(mdxData),
    authors,
    ...(mdxData.abstract && { abstract: mdxData.abstract }),
    ...(mdxData.keywords && { keywords: mdxData.keywords }),
    venue: {
      name: mdxData.journal || mdxData.venue?.name,
      shortName: mdxData.venue?.shortName,
      volume: mdxData.volume || mdxData.venue?.volume,
      issue: mdxData.issue || mdxData.venue?.issue,
      pages: mdxData.pages?.toString() || mdxData.venue?.pages,
      publisher: mdxData.publisher || mdxData.venue?.publisher,
    },
    publishedDate: mdxData.publicationDate,
    ...(mdxData.doi && { doi: mdxData.doi }),
    links: {
      ...(mdxData.url && { publisher: mdxData.url }),
      ...(pdfAsset && {
        pdf: {
          _type: 'file',
          asset: pdfAsset,
        },
      }),
    },
    metrics: {
      ...(mdxData.citationCount !== undefined && { citations: mdxData.citationCount }),
      ...(mdxData.altmetricScore !== undefined && { altmetricScore: mdxData.altmetricScore }),
    },
    status,
    isFeatured: mdxData.researchAreas?.includes('high-impact') || false,
    isOpenAccess: false, // Default, could be enhanced with DOI lookup
    seo: {
      metaTitle: `${mdxData.title} - WAVES Research Lab`,
      metaDescription:
        mdxData.abstract?.substring(0, 160) ||
        `Research publication by WAVES Lab: ${mdxData.title}`,
    },
  };

  // Clean up empty objects
  if (
    Object.keys(sanityDoc.venue || {}).filter(
      (key) => sanityDoc.venue![key as keyof typeof sanityDoc.venue],
    ).length === 0
  ) {
    delete sanityDoc.venue;
  }

  if (Object.keys(sanityDoc.links || {}).length === 0) {
    delete sanityDoc.links;
  }

  if (
    Object.keys(sanityDoc.metrics || {}).filter(
      (key) => sanityDoc.metrics![key as keyof typeof sanityDoc.metrics] !== undefined,
    ).length === 0
  ) {
    delete sanityDoc.metrics;
  }

  return {
    document: sanityDoc,
    linksCreated,
    pdfUploaded,
  };
}

/**
 * Process a single MDX publication file
 */
async function processPublication(filePath: string): Promise<{
  success: boolean;
  error?: string;
  linksCreated?: number;
  pdfUploaded?: boolean;
}> {
  try {
    const fileName = path.basename(filePath, '.mdx');
    console.log(`Processing ${fileName}...`);

    // Read and parse MDX file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontMatter } = matter(fileContent);

    const mdxData = frontMatter as MDXPublicationData;
    mdxData.slug = fileName; // Ensure slug matches filename

    // Validate required fields
    if (!mdxData.title) {
      throw new Error('Missing required field: title');
    }

    if (!mdxData.year && !mdxData.publicationDate) {
      throw new Error('Missing required field: year or publicationDate');
    }

    // Ensure publicationDate is set
    if (!mdxData.publicationDate && mdxData.year) {
      mdxData.publicationDate = `${mdxData.year}-01-01`;
    }

    // Transform to Sanity format
    const {
      document: sanityDoc,
      linksCreated,
      pdfUploaded,
    } = await transformPublicationToSanity(mdxData);

    // Create or update document in Sanity
    const client = getSanityClient();
    const result = await client.createOrReplace(sanityDoc);

    console.log(`  ✓ Created/updated Sanity document: ${result._id}`);
    if (linksCreated > 0) {
      console.log(`  ✓ Linked ${linksCreated} authors to people`);
    }

    return {
      success: true,
      linksCreated,
      pdfUploaded,
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
export async function migratePublicationsToSanity(
  options: {
    sourceDir?: string;
    dryRun?: boolean;
    maxFiles?: number;
    skipPDFs?: boolean;
  } = {},
): Promise<MigrationStats> {
  const {
    sourceDir = path.join(process.cwd(), 'content', 'publications'),
    dryRun = false,
    maxFiles,
    skipPDFs = false,
  } = options;

  const stats: MigrationStats = {
    total: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    pdfUploads: 0,
    authorLinksCreated: 0,
    errors: [],
  };

  console.log('🚀 Starting Publications → Sanity Migration');
  console.log(`Source: ${sourceDir}`);
  console.log(`Dry run: ${dryRun ? 'Yes' : 'No'}`);
  console.log(`Skip PDFs: ${skipPDFs ? 'Yes' : 'No'}`);
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

  console.log(`Found ${files.length} publication files to migrate`);
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
    const result = await processPublication(filePath);

    if (result.success) {
      stats.successful++;
      if (result.linksCreated) {
        stats.authorLinksCreated += result.linksCreated;
      }
      if (result.pdfUploaded) {
        stats.pdfUploads++;
      }
    } else {
      stats.failed++;
      stats.errors.push({
        file: filename,
        error: result.error || 'Unknown error',
      });
    }

    // Add small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('PUBLICATIONS → SANITY MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total files: ${stats.total}`);
  console.log(`Successful: ${stats.successful}`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`Skipped (dry run): ${stats.skipped}`);
  console.log(`PDFs uploaded: ${stats.pdfUploads}`);
  console.log(`Author links created: ${stats.authorLinksCreated}`);
  return stats;
}
