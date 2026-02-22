import { createClient } from 'next-sanity';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: '6r5yojda',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const jpgPath = '/tmp/fulbright_logo_hq.jpg';
const buffer = fs.readFileSync(jpgPath);

console.log('📤 Uploading high-quality Fulbright logo...');
const asset = await client.assets.upload('image', buffer, { 
  filename: 'fulbright_logo_hq.jpg'
});

console.log(`✅ Uploaded: ${asset._id}\n`);

// Replace on Natasha's news item
console.log('🔗 Replacing on news item...');
await client
  .patch('news-natasha-krell-wins-fulbright-award-to-kenya')
  .set({
    featuredImage: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
      alt: 'Fulbright U.S. Student Program',
    },
  })
  .commit();

console.log(`✅ Updated Natasha's news item with HQ logo`);
