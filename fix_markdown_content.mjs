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

const newsSlug = 'article-published-in-environmental-research-letters';

// Get current content
const news = await client.fetch(
  `*[_type == 'news' && slug.current == '${newsSlug}'][0]`
);

let content = news.content;

console.log('🧹 Cleaning up markdown syntax issues...\n');

// Fix markdown links that aren't being parsed
// [Environmental Research Letters](url) -> <a href="">text</a>
const fixes = [
  {
    old: '[Environmental Research Letters](http://iopscience.iop.org/journal/1748-9326)',
    new: '<a href="http://iopscience.iop.org/journal/1748-9326" target="_blank">Environmental Research Letters</a>',
    description: 'Environmental Research Letters link',
  },
  {
    old: '[Go to the Article](http://iopscience.iop.org/article/10.1088/1748-9326/11/11/115005/meta){: .btn .btn--success}',
    new: '<a href="http://iopscience.iop.org/article/10.1088/1748-9326/11/11/115005/meta" target="_blank" class="btn btn--success">Go to the Article</a>',
    description: 'Go to Article button link (removed Jekyll syntax)',
  },
];

fixes.forEach(fix => {
  if (content.includes(fix.old)) {
    content = content.replace(fix.old, fix.new);
    console.log(`✅ Fixed: ${fix.description}`);
  }
});

console.log('\n🔗 Updating post...');

await client
  .patch(`news-${newsSlug}`)
  .set({ content })
  .commit();

console.log('✅ Done! Markdown issues cleaned up');
