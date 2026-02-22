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

const newsSlug = 'caylor-lab-at-agu-2016-fall-meeting';

// Current content with dead link
const oldContent = `<img class="size-medium aligncenter" src="http://fallmeeting.agu.org/2016/files/2016/01/FM16-logo-final-2.jpg" alt="" width="483" height="110" />

It's that time of year again where we all convene in San Francisco for the AGU Fall Meeting!`;

// Fixed content without the dead link
const newContent = `It's that time of year again where we all convene in San Francisco for the AGU Fall Meeting!`;

console.log('🔧 Removing dead AGU logo link from post content...\n');

try {
  await client
    .patch(`news-${newsSlug}`)
    .set({
      content: newContent + oldContent.split('It\'s that time')[1],
    })
    .commit();
  
  console.log('✅ Fixed! Dead link removed from post content');
  console.log('   Featured image is now the AGU 2016 Fall Meeting photo');
} catch (err) {
  console.error(`❌ Error: ${err.message}`);
  process.exit(1);
}
