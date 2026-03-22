#!/usr/bin/env tsx

import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@sanity/client';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const corrections: Record<string, { category: string; reason: string }> = {
  // Postdoc → Graduate Student
  'person-cascade-tuholske': {
    category: 'graduate-student',
    reason: 'Was PhD student, not postdoc'
  },
  'person-cynthia-gerlein-safdi': {
    category: 'graduate-student',
    reason: 'Title says "PhD Student" but category was postdoc'
  },
  
  // Postdoc → Research Intern (undergraduate)
  'person-elliot-chang': {
    category: 'research-intern',
    reason: 'Was undergraduate student at Princeton, not postdoc'
  },
  
  // PI → Graduate Student
  'person-frances-odonnell': {
    category: 'graduate-student',
    reason: 'Was PhD student at Princeton, not PI'
  },
  'person-stephen-good': {
    category: 'graduate-student',
    reason: 'Was PhD student at Princeton, not PI'
  },
  'person-kaiyu-guan': {
    category: 'graduate-student',
    reason: 'Was PhD student at Princeton, not PI'
  },
  'person-trenton-franz': {
    category: 'graduate-student',
    reason: 'Was PhD student, not PI'
  },
  
  // PI → Postdoc
  'person-lyndon-estes': {
    category: 'postdoc',
    reason: 'Was postdoc, not PI'
  },
  'person-lixin-wang': {
    category: 'postdoc',
    reason: 'Was postdoc, not PI'
  },
  'person-lizzie-king': {
    category: 'postdoc',
    reason: 'Was postdoc at Princeton, not PI'
  },
  
  // PI → Research Staff
  'person-moses-kioko-musyoka': {
    category: 'research-staff',
    reason: 'Was research staff, not PI'
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

  console.log('=== Alumni Category Corrections ===\n');
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

    console.log(`\n${person.name}`);
    console.log(`  Current: ${person.category || 'NO_CATEGORY'}`);
    console.log(`  New: ${correction.category}`);
    console.log(`  Reason: ${correction.reason}`);

    await client
      .patch(personId)
      .set({ category: correction.category })
      .commit();

    console.log(`  ✅ Updated`);
  }

  console.log('\n\n=== Summary ===');
  console.log('All corrections applied!');
}

main().catch((err) => {
  console.error('Error:', err?.message || err);
  process.exit(1);
});
