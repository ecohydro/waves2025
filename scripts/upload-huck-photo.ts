#!/usr/bin/env tsx

import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@sanity/client';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2023-12-19',
    useCdn: false,
    token: process.env.SANITY_API_EDITOR_TOKEN!,
  });

  const photoPath = '/root/.openclaw/media/inbound/c99f4c7a-6791-4bca-b585-8ed30a86005d.jpg';

  console.log('Uploading photo to Sanity...');
  
  const imageAsset = await client.assets.upload('image', fs.createReadStream(photoPath), {
    filename: 'huck-rees.jpg',
  });

  console.log('✅ Photo uploaded!');
  console.log('Asset ID:', imageAsset._id);

  console.log('\nAttaching photo to Huck\'s profile...');
  
  await client
    .patch('person-huck-rees')
    .set({
      avatar: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAsset._id,
        },
        alt: 'Huck Rees',
      },
    })
    .commit();

  console.log('✅ Photo attached to profile!');
}

main().catch((err) => {
  console.error('Error:', err?.message || err);
  process.exit(1);
});
