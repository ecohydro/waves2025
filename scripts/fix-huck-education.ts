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

  console.log('Updating Huck\'s education...');

  await client
    .patch('person-huck-rees')
    .set({
      education: [
        {
          _key: 'edu-1',
          degree: 'BA',
          field: 'Geology and History (Minor: GIS)',
          institution: 'UC Davis',
          year: 2019
        },
        {
          _key: 'edu-2',
          degree: 'MA',
          field: 'Geography (Fluvial Geomorphology, Hydrology Certificate)',
          institution: 'University of Colorado Boulder',
          year: 2023
        }
      ]
    })
    .commit();

  console.log('✅ Education updated! MA year now shows 2023.');
}

main().catch((err) => {
  console.error('Error:', err?.message || err);
  process.exit(1);
});
