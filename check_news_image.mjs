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

const result = await client.fetch(
  `*[_type == 'news' && slug.current == 'natasha-krell-wins-fulbright-award-to-kenya'][0]`
);
console.log(JSON.stringify(result, null, 2));
