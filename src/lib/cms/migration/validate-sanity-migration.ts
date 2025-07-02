import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@sanity/client';
import fs from 'fs/promises';
import { glob } from 'glob';

// Configuration - only create client when needed
function getSanityClient() {
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2023-07-01',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
  });
}

async function countSanityDocs(type: string): Promise<number> {
  const client = getSanityClient();
  const query = `count(*[_type == "${type}"])`;
  return await client.fetch(query);
}

async function countMDXFiles(pattern: string): Promise<number> {
  const files = await glob(pattern);
  return files.length;
}

export async function validateSanityMigration() {
  console.log('🔍 Validating MDX → Sanity migration...');

  // Count MDX files
  const mdxPeople = await countMDXFiles('content/people/*.mdx');
  const mdxPublications = await countMDXFiles('content/publications/*.mdx');
  const mdxNews = await countMDXFiles('content/news/*.mdx');

  // Count Sanity docs
  const sanityPeople = await countSanityDocs('person');
  const sanityPublications = await countSanityDocs('publication');
  const sanityNews = await countSanityDocs('news');

  console.log(`People: MDX=${mdxPeople}, Sanity=${sanityPeople}`);
  console.log(`Publications: MDX=${mdxPublications}, Sanity=${sanityPublications}`);
  console.log(`News: MDX=${mdxNews}, Sanity=${sanityNews}`);

  const passed =
    sanityPeople >= mdxPeople * 0.9 &&
    sanityPublications >= mdxPublications * 0.9 &&
    sanityNews >= mdxNews * 0.9;

  if (passed) {
    console.log('✅ Basic migration completeness check passed!');
  } else {
    console.log('❌ Migration completeness check failed. Some content may be missing.');
  }
}

// CLI support
if (require.main === module) {
  validateSanityMigration().catch((err) => {
    console.error('Validation failed:', err);
    process.exit(1);
  });
}
