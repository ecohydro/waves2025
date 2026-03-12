import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_EDITOR_TOKEN,
  apiVersion: '2023-12-19',
  useCdn: false,
});

function determineCategory(status, tags = []) {
  const tagStr = tags.join(' ').toLowerCase();
  const statusStr = (status || '').toLowerCase();

  // Direct status mappings
  if (statusStr === 'graduate' || statusStr === 'phd_student') {
    return 'graduate-student';
  }
  if (statusStr === 'postdoc') {
    return 'postdoc';
  }
  if (statusStr === 'faculty') {
    return 'principal-investigator';
  }
  if (statusStr === 'staff') {
    return 'research-staff';
  }

  // For alumni or unclear status, check tags
  if (tagStr.includes('high school student')) {
    return 'high-school-student';
  }
  if (tagStr.includes('research intern') || tagStr.includes('undergraduate')) {
    return 'research-intern';
  }
  if (tagStr.includes('research staff')) {
    return 'research-staff';
  }
  if (tagStr.includes('graduate student') || tagStr.includes('phd')) {
    return 'graduate-student';
  }
  if (tagStr.includes('postdoc')) {
    return 'postdoc';
  }
  if (tagStr.includes('visitor')) {
    return 'visitor';
  }

  // Default fallback
  return 'graduate-student';
}

async function main() {
  const peopleDir = path.join(process.cwd(), 'content/people');
  const files = fs.readdirSync(peopleDir).filter(f => f.endsWith('.mdx'));

  console.log(`Processing ${files.length} people files...\n`);

  const mutations = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(peopleDir, file), 'utf-8');
    const { data } = matter(content);
    
    const slug = data.slug || file.replace('.mdx', '');
    const category = determineCategory(data.status, data.tags);
    
    console.log(`${data.name || slug}: status="${data.status}" → category="${category}"`);
    
    mutations.push({
      patch: {
        id: `person-${slug}`,
        set: { category }
      }
    });
  }

  console.log(`\nApplying ${mutations.length} updates to Sanity...`);
  
  // Batch in groups of 50
  for (let i = 0; i < mutations.length; i += 50) {
    const batch = mutations.slice(i, i + 50);
    const result = await client.mutate(batch);
    console.log(`Batch ${Math.floor(i/50) + 1}: ${batch.length} updates applied`);
  }

  console.log('\n✓ Done! Categories restored.');
}

main().catch(console.error);
