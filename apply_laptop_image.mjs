import { createClient } from 'next-sanity';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: '6r5yojda',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const imageUrl = 'https://images.unsplash.com/photo-1517694712202-14819c9cb6e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MDAwNTB8MHwxfHNlYXJjaHwxfHxjb2RpbmcgbGFwdG9wIHByb2dyYW1taW5nfGVufDB8fHx8fDE3NzE3MjczODB8MA&ixlib=rb-4.0.3&q=80&w=1080';
const newsSlug = 'sharing-data-science-skills-with-the-dataup-program-and-software-carpentry';

console.log('💻 Applying laptop workspace image to data science post...\n');

try {
  // Download image
  console.log('📥 Downloading laptop image from Unsplash...');
  const response = await fetch(imageUrl);
  const buffer = await response.buffer();
  
  // Upload to Sanity
  console.log('📤 Uploading to Sanity...');
  const asset = await client.assets.upload('image', buffer, {
    filename: 'laptop-workspace-coding.jpg',
  });
  
  console.log(`✅ Uploaded: ${asset._id}\n`);
  
  // Update news item
  console.log('🔗 Linking to news item...');
  await client
    .patch(`news-${newsSlug}`)
    .set({
      featuredImage: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id,
        },
        alt: 'Laptop workspace - coding and programming',
        credit: 'Bernd Dittrich / Unsplash',
      },
    })
    .commit();
  
  console.log(`✅ Applied!\n`);
  console.log(`News post updated: Sharing data science skills with the DataUp program and Software Carpentry`);
  console.log(`Featured image: Laptop workspace for coding`);
} catch (err) {
  console.error(`❌ Error: ${err.message}`);
  process.exit(1);
}
