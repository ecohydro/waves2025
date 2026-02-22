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

const imagePath = '/root/waves-bot/website/assets/images/Cynthia_michigan.png';
const buffer = fs.readFileSync(imagePath);

console.log('📤 Uploading Cynthia_michigan.png...');
const asset = await client.assets.upload('image', buffer, { filename: 'Cynthia_michigan.png' });

console.log(`✅ Uploaded: ${asset._id}\n`);

// Link to news item
console.log('🔗 Linking to news item...');
await client
  .patch('news-cynthia-gerlein-safdi-named-to-michigan-society-of-fellows')
  .set({
    featuredImage: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
      alt: 'Cynthia Gerlein-Safdi',
    },
  })
  .commit();

console.log(`✅ Linked to cynthia-gerlein-safdi-named-to-michigan-society-of-fellows`);
