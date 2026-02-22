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

// Get all news items with HTML entities
const news = await client.fetch(`*[_type == 'news'] {
  _id,
  title,
  slug
}`);

const problematic = news.filter(item => /&#\d+;/.test(item.title));

console.log(`🧹 Fixing HTML entities in ${problematic.length} titles...\n`);

let fixed = 0;

for (const item of problematic) {
  const decodedTitle = decodeHtmlEntities(item.title);
  
  if (decodedTitle !== item.title) {
    try {
      await client.patch(item._id).set({ title: decodedTitle }).commit();
      console.log(`✅ ${decodedTitle}`);
      fixed++;
    } catch (err) {
      console.log(`❌ ${item.title}: ${err.message}`);
    }
  }
}

console.log(`\n✅ Fixed ${fixed} titles`);
