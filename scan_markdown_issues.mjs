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
  content
}`);

const problematic = news.filter(item => {
  // Check for raw markdown links like [text](url)
  return /\[[^\]]+\]\([^)]+\)/.test(item.content);
});

console.log(`\n📋 Scanning for markdown syntax issues...\n`);
console.log(`Found ${problematic.length} posts with potential markdown issues:\n`);

problematic.forEach(item => {
  console.log(`• ${item.title}`);
  console.log(`  ${item.slug?.current}\n`);
});
