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
  title,
  slug,
  _id
}`);

const problematic = news.filter(item => {
  // Check for HTML entities like &#8217; &#038; etc
  return /&#\d+;/.test(item.title);
});

console.log(`\n🔍 Found ${problematic.length} posts with HTML entities in titles:\n`);

problematic.forEach(item => {
  console.log(`• ${item.title}`);
  console.log(`  ${item.slug?.current}\n`);
});
