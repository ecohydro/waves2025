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

  console.log('Fixing Anna\'s status...');

  await client
    .patch('person-anna-boser')
    .set({
      isActive: true,  // Alumni should be active to appear on the site
    })
    .commit();

  console.log('✅ Status updated!');
  console.log('\nAnna\'s settings:');
  console.log('  userGroup: alumni');
  console.log('  category: graduate-student');
  console.log('  isActive: true');
  console.log('  title: PhD Student');
}

main().catch((err) => {
  console.error('Error:', err?.message || err);
  process.exit(1);
});
