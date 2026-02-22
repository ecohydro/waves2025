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
  `*[_type == 'person' && name == 'Kelly Caylor'][0]`
);

console.log('Kelly bio field:');
console.log(JSON.stringify(result.bio, null, 2));
