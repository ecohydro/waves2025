import { createClient } from 'next-sanity';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: '6r5yojda',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

const news = await client.fetch(`*[_type == 'news'] {
  _id,
  title,
  excerpt,
  content,
  tags,
  slug
}`);

const fieldStats = {
  title: 0,
  excerpt: 0,
  content: 0,
  tags: 0,
};

console.log(`\n🔍 Scanning all text fields for HTML entities...\n`);

for (const item of news) {
  if (item.title && /&#\d+;/.test(item.title)) fieldStats.title++;
  if (item.excerpt && /&#\d+;/.test(item.excerpt)) fieldStats.excerpt++;
  if (item.content && /&#\d+;/.test(item.content)) fieldStats.content++;
  if (item.tags && Array.isArray(item.tags)) {
    for (const tag of item.tags) {
      if (/&#\d+;/.test(tag)) {
        fieldStats.tags++;
        break;
      }
    }
  }
}

console.log(`📊 HTML Entities found in:`);
console.log(`   Titles: ${fieldStats.title}`);
console.log(`   Excerpts: ${fieldStats.excerpt}`);
console.log(`   Content: ${fieldStats.content}`);
console.log(`   Tags: ${fieldStats.tags}`);
console.log(`\n   Total affected fields: ${Object.values(fieldStats).reduce((a,b) => a+b)}`);
