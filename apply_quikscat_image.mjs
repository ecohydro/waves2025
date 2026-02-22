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

const imageUrl = 'https://podaac.jpl.nasa.gov/sites/default/files/mission_themes/featured_image/QuikSCAT-quick-recovery-EOS-satellite-mission-opt-pad.jpg';
const newsSlug = 'nasa-jet-propulsion-lab-surp-grant-received';

console.log('🛰️  Applying QuikSCAT image to NASA JPL SURP grant post...\n');

try {
  // Download image
  console.log('📥 Downloading QuikSCAT image from NASA/JPL...');
  const response = await fetch(imageUrl);
  const buffer = await response.buffer();
  
  // Upload to Sanity
  console.log('📤 Uploading to Sanity...');
  const asset = await client.assets.upload('image', buffer, {
    filename: 'quikscat-satellite-mission.jpg',
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
        alt: 'QuikSCAT satellite - Quick Recovery EOS Mission',
        credit: 'NASA/JPL',
      },
    })
    .commit();
  
  console.log(`✅ Applied!\n`);
  console.log(`News post updated: NASA Jet Propulsion Lab SURP grant received`);
  console.log(`Featured image: QuikSCAT satellite mission photo`);
} catch (err) {
  console.error(`❌ Error: ${err.message}`);
  process.exit(1);
}
