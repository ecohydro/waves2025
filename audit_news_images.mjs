import { createClient } from 'next-sanity';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: '6r5yojda',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

// Fetch all news items
const allNews = await client.fetch(`*[_type == 'news'] | order(publishedAt desc) {
  title,
  slug,
  publishedAt,
  featuredImage,
  _id
}`);

console.log(`📊 Total news items in Sanity: ${allNews.length}\n`);

const withImages = allNews.filter(n => n.featuredImage).length;
const withoutImages = allNews.filter(n => !n.featuredImage).length;

console.log(`✅ With images: ${withImages}`);
console.log(`❌ Without images: ${withoutImages}\n`);

console.log(`📋 News items missing featured images:\n`);

allNews
  .filter(n => !n.featuredImage)
  .slice(0, 40)
  .forEach(n => {
    console.log(`• ${n.title} (${n.slug?.current})`);
  });
