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
  `*[_type == 'news' && slug.current == 'lixin-wang8217s-paper-in-nature-and-interview'][0]`
);

if (result) {
  console.log('Title:', JSON.stringify(result.title));
  console.log('Has HTML entities:', /&[a-z0-9#]+;/.test(result.title));
  console.log('Has 8217:', result.title.includes('8217'));
} else {
  console.log('Post not found');
}
