#!/usr/bin/env tsx

import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@sanity/client';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const corrections: Record<string, { category: string; reason: string }> = {
  'person-abinash-bhattachan': {
    category: 'graduate-student',
    reason: 'Was graduate student, not postdoc'
  },
  'person-bryn-morgan': {
    category: 'graduate-student',
    reason: 'Was PhD student, not postdoc'
  },
  'person-craig-sinkler': {
    category: 'research-intern',
    reason: 'Was undergraduate student, not postdoc'
  },
};

async function main() {
  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2023-12-19',
    useCdn: false,
    token: process.env.SANITY_API_EDITOR_TOKEN!,
  });

  console.log('=== Additional Alumni Category Corrections ===\n');
  console.log(`Total corrections to apply: ${Object.keys(corrections).length}\n`);

  for (const [personId, correction] of Object.entries(corrections)) {
    const person = await client.fetch(
      '*[_id == $id][0] { _id, name, category }',
      { id: personId }
    );

    if (!person) {
      console.log(`❌ ${personId} - NOT FOUND`);
      continue;
    }

    console.log(`${person.name}`);
    console.log(`  Current: ${person.category || 'NO_CATEGORY'}`);
    console.log(`  New: ${correction.category}`);
    console.log(`  Reason: ${correction.reason}`);

    await client
      .patch(personId)
      .set({ category: correction.category })
      .commit();

    console.log(`  ✅ Updated\n`);
  }

  console.log('=== Summary ===');
  console.log('All corrections applied!');
}

main().catch((err) => {
  console.error('Error:', err?.message || err);
  process.exit(1);
});
