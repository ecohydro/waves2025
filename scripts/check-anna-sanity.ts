#!/usr/bin/env tsx

import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@sanity/client';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2023-12-19',
    useCdn: false,
    token: process.env.SANITY_API_EDITOR_TOKEN!,
  });

  console.log('=== Checking for Anna Boser in Sanity ===\n');

  // Check published document
  const published = await client.fetch(
    '*[_id == "person-anna-boser"][0]'
  );

  console.log('Published document (_id: person-anna-boser):');
  if (published) {
    console.log('✅ EXISTS');
    console.log(JSON.stringify(published, null, 2));
  } else {
    console.log('❌ NOT FOUND');
  }

  console.log('\n=== Checking draft ===\n');

  // Check draft document
  const draft = await client.fetch(
    '*[_id == "drafts.person-anna-boser"][0]'
  );

  console.log('Draft document (_id: drafts.person-anna-boser):');
  if (draft) {
    console.log('✅ EXISTS');
    console.log(JSON.stringify(draft, null, 2));
  } else {
    console.log('❌ NOT FOUND');
  }

  console.log('\n=== All people named Anna ===\n');
  
  const annas = await client.fetch(
    '*[_type == "person" && name match "Anna*"] { _id, name, slug, userGroup, isActive }'
  );
  
  console.log(JSON.stringify(annas, null, 2));
}

main().catch((err) => {
  console.error('Error:', err?.message || err);
  process.exit(1);
});
