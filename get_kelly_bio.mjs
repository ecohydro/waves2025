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

if (result) {
  console.log('Current Kelly Caylor bio:');
  console.log('─'.repeat(60));
  console.log(result.bio || result.biography || '(empty)');
  console.log('─'.repeat(60));
} else {
  console.log('Kelly Caylor not found');
}
