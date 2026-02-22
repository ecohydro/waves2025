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

// Try uploading SVG - if that doesn't work, we'll convert
const svgPath = '/tmp/fulbright_logo.svg';
const buffer = fs.readFileSync(svgPath);

console.log('📤 Uploading Fulbright logo...');
try {
  const asset = await client.assets.upload('image', buffer, { 
    filename: 'fulbright_logo.svg',
    contentType: 'image/svg+xml'
  });
  
  console.log(`✅ Uploaded: ${asset._id}\n`);
  
  // Link to Natasha's Fulbright news item
  console.log('🔗 Linking to news item...');
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
  
  console.log(`✅ Linked Fulbright logo to Natasha's news item`);
} catch (err) {
  console.error(`❌ Error: ${err.message}`);
}
