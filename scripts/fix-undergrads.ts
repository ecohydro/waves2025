#!/usr/bin/env tsx

import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@sanity/client';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// All undergraduates that need to be changed from graduate-student to research-intern
const undergrads = [
  'Alice Suh',
  'Allison Ingram',
  'Ben Siegfried',
  'Caden Ohlwiler',
  'Dee Luo',
  'Eliza Harkins',
  'Eric Principato',
  'Gabby Ragazzo',
  'Haley Lane',
  'Hannah Safford',
  'Ida Posner',
  'James Odonnell',
  'Jeremy Chen',
  'Johnathan Choi',
  'Julia Signell',
  'Kathleen Ryan',
  'Kathy Zhao',
  'Katie Smith',
  'Marcus Spiegel',
  'Maria Fabiola Rodriguez',
  'Matteo Kruijssen',
  'Miranda Bernard',
  'Preston Kemeny',
  'Ray Grossman',
  'Rodrigo Munoz Rogers',
  'Sally Goodman',
  'Sara Guenther',
  'Sindiso Nyathi',
  'Steve Tuozzolo',
  'Taylor Morgan',
];

async function main() {
  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2023-12-19',
    useCdn: false,
    token: process.env.SANITY_API_EDITOR_TOKEN!,
  });

  console.log('=== Fixing Undergraduate Categories ===\n');
  console.log(`Total undergraduates to fix: ${undergrads.length}\n`);

  let successCount = 0;
  let notFoundCount = 0;

  for (const name of undergrads) {
    // Find person by name
    const person = await client.fetch(
      '*[_type == "person" && name == $name][0] { _id, name, category }',
      { name }
    );

    if (!person) {
      console.log(`❌ ${name} - NOT FOUND`);
      notFoundCount++;
      continue;
    }

    console.log(`${person.name}`);
    console.log(`  Current: ${person.category || 'NO_CATEGORY'}`);
    console.log(`  New: research-intern`);

    await client
      .patch(person._id)
      .set({ category: 'research-intern' })
      .commit();

    console.log(`  ✅ Updated\n`);
    successCount++;
  }

  console.log('=== Summary ===');
  console.log(`✅ Updated: ${successCount}`);
  console.log(`❌ Not found: ${notFoundCount}`);
  console.log(`Total: ${undergrads.length}`);
}

main().catch((err) => {
  console.error('Error:', err?.message || err);
  process.exit(1);
});
