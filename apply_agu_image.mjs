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

const imageUrl = 'https://eos.org/wp-content/uploads/2017/02/2016-agu-fall-meeting.jpg';
const newsSlug = 'caylor-lab-at-agu-2016-fall-meeting';

console.log('📸 Applying AGU 2016 Fall Meeting image...\n');

try {
  // Download image
  console.log('📥 Downloading image from EOS...');
  const response = await fetch(imageUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }
  
  const buffer = await response.buffer();
  
  // Upload to Sanity
  console.log('📤 Uploading to Sanity...');
  const asset = await client.assets.upload('image', buffer, {
    filename: 'agu-2016-fall-meeting.jpg',
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
        alt: 'AGU 2016 Fall Meeting',
      },
    })
    .commit();
  
  console.log(`✅ Applied!\n`);
  console.log(`News post updated: Caylor Lab at AGU 2016 Fall Meeting`);
} catch (err) {
  console.error(`❌ Error: ${err.message}`);
  process.exit(1);
}
