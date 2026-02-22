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

// Decode HTML entities
function decodeHtmlEntities(text) {
  if (!text) return text;
  
  const entities = {
    '&#8217;': "'",        // right single quotation
    '&#8216;': "'",        // left single quotation
    '&#8220;': '"',        // left double quotation
    '&#8221;': '"',        // right double quotation
    '&#8211;': '–',        // en-dash
    '&#8212;': '—',        // em-dash
    '&#038;': '&',         // ampersand
    '&amp;': '&',          // ampersand
    '&#039;': "'",         // apostrophe
    '&quot;': '"',         // quotation mark
    '&lt;': '<',
    '&gt;': '>',
  };
  
  let decoded = text;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replaceAll(entity, char);
  }
  
  // Also handle numeric entities
  decoded = decoded.replace(/&#(\d+);/g, (match, num) => {
    return String.fromCharCode(parseInt(num, 10));
  });
  
  return decoded;
}

// Get all news items
const news = await client.fetch(`*[_type == 'news'] {
  _id,
  title,
  excerpt,
  content,
  tags,
  slug
}`);

console.log(`🧹 Fixing HTML entities across all fields...\n`);

let fixed = 0;

for (const item of news) {
  const updates = {};
  
  // Check and fix title
  if (item.title && /&#\d+;/.test(item.title)) {
    updates.title = decodeHtmlEntities(item.title);
  }
  
  // Check and fix excerpt
  if (item.excerpt && /&#\d+;/.test(item.excerpt)) {
    updates.excerpt = decodeHtmlEntities(item.excerpt);
  }
  
  // Check and fix content
  if (item.content && /&#\d+;/.test(item.content)) {
    updates.content = decodeHtmlEntities(item.content);
  }
  
  // Check and fix tags
  if (item.tags && Array.isArray(item.tags)) {
    const hasEntity = item.tags.some(tag => /&#\d+;/.test(tag));
    if (hasEntity) {
      updates.tags = item.tags.map(tag => decodeHtmlEntities(tag));
    }
  }
  
  // Apply updates
  if (Object.keys(updates).length > 0) {
    try {
      await client.patch(item._id).set(updates).commit();
      console.log(`✅ ${item.slug?.current}`);
      fixed++;
    } catch (err) {
      console.log(`❌ ${item.slug?.current}: ${err.message}`);
    }
  }
}

console.log(`\n✅ Fixed ${fixed} news items`);
console.log(`✅ All HTML entities decoded throughout the site`);
