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
  `*[_type == 'news' && slug.current == 'sharing-data-science-skills-with-the-dataup-program-and-software-carpentry'][0]`
);

console.log('Title:', result.title);
console.log('\nCurrent image:', result.featuredImage?.alt);
console.log('Credit:', result.featuredImage?.credit);
console.log('\nContent excerpt:');
console.log(result.content.slice(0, 300));
