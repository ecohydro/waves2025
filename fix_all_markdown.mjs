import { createClient } from 'next-sanity';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: '6r5yojda',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// Get all news with markdown links
const news = await client.fetch(`*[_type == 'news'] {
  _id,
  slug,
  content
}`);

const problematic = news.filter(item => /\[[^\]]+\]\([^)]+\)/.test(item.content));

console.log(`🧹 Fixing markdown syntax in ${problematic.length} posts...\n`);

let fixed = 0;

for (const item of problematic) {
  let content = item.content;
  const original = content;
  
  // Convert markdown links [text](url) to <a href="url">text</a>
  content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  
  // Remove Jekyll-style syntax like {: .btn .btn--success}
  content = content.replace(/\{:\s*[^}]+\}/g, '');
  
  // Only update if content changed
  if (content !== original) {
    try {
      await client.patch(item._id).set({ content }).commit();
      console.log(`✅ ${item.slug?.current}`);
      fixed++;
    } catch (err) {
      console.log(`❌ ${item.slug?.current}: ${err.message}`);
    }
  }
}

console.log(`\n✅ Fixed ${fixed} posts`);
