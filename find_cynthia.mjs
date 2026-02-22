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
  `*[_type == 'news' && (title match "*Michigan*" || title match "*cynthia*")] {
    title,
    slug,
    featuredImage
  }`
);

console.log('Results:');
console.log(JSON.stringify(result, null, 2));
