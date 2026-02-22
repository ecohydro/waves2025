import { createClient } from 'next-sanity';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: '6r5yojda',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

const people = await client.fetch(`*[_type == 'person'] {
  _id,
  name,
  slug,
  bio,
  biography
}`);

console.log(`\n📋 Auditing ${people.length} people bios for link formatting issues...\n`);

const issues = {
  rawMarkdownLinks: [],      // [text](url) - should be <a> tags
  htmlEntities: [],          // &#8217; etc
  brokenLinks: [],          // broken <a> tags
};

for (const person of people) {
  const bioText = person.bio || person.biography || '';
  
  if (!bioText) continue;
  
  // Check for raw markdown links
  if (/\[[^\]]+\]\([^)]+\)/.test(bioText)) {
    issues.rawMarkdownLinks.push({ name: person.name, field: person.bio ? 'bio' : 'biography' });
  }
  
  // Check for HTML entities
  if (/&#\d+;/.test(bioText)) {
    issues.htmlEntities.push({ name: person.name, field: person.bio ? 'bio' : 'biography' });
  }
  
  // Check for broken <a> tags (missing href or malformed)
  if (/<a\s+(?!href=)/.test(bioText) || /<a[^>]*href=['"]?['"][^>]*>/.test(bioText)) {
    issues.brokenLinks.push({ name: person.name, field: person.bio ? 'bio' : 'biography' });
  }
}

console.log(`🔗 Raw markdown links [text](url): ${issues.rawMarkdownLinks.length}`);
if (issues.rawMarkdownLinks.length > 0) {
  issues.rawMarkdownLinks.forEach(p => console.log(`   • ${p.name}`));
}

console.log(`\n🔤 HTML entities (&#8217; etc): ${issues.htmlEntities.length}`);
if (issues.htmlEntities.length > 0) {
  issues.htmlEntities.forEach(p => console.log(`   • ${p.name}`));
}

console.log(`\n❌ Broken <a> tags: ${issues.brokenLinks.length}`);
if (issues.brokenLinks.length > 0) {
  issues.brokenLinks.forEach(p => console.log(`   • ${p.name}`));
}

const totalIssues = Object.values(issues).reduce((sum, arr) => sum + arr.length, 0);
console.log(`\n📊 Total issues found: ${totalIssues}`);

if (totalIssues === 0) {
  console.log(`✅ All people bios are clean!`);
}
