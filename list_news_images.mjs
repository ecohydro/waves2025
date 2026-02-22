import { createClient } from 'next-sanity';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: '6r5yojda',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

const result = await client.fetch(
  `*[_type == 'news' && defined(featuredImage)] | order(publishedAt desc) {
    title,
    slug,
    publishedAt,
    featuredImage {
      alt,
      credit,
      asset->{
        url,
        originalFilename
      }
    }
  }`
);

result.forEach(item => {
  console.log(`\n📰 ${item.title}`);
  console.log(`   Slug: ${item.slug.current}`);
  console.log(`   Date: ${item.publishedAt}`);
  if (item.featuredImage) {
    console.log(`   Alt: ${item.featuredImage.alt}`);
    console.log(`   Credit: ${item.featuredImage.credit || '(none)'}`);
    console.log(`   File: ${item.featuredImage.asset.originalFilename}`);
  }
});

console.log(`\n\n📊 Total news items with featured images: ${result.length}`);
