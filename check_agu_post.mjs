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
  `*[_type == 'news' && slug.current == 'caylor-lab-at-agu-2016-fall-meeting'][0]`
);

console.log('Current featured image:');
console.log(`  Alt: ${result.featuredImage?.alt}`);
console.log(`  Credit: ${result.featuredImage?.credit}`);
console.log('');
