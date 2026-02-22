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

const newBio = `Professor at the Bren School of Environmental Science & Department of Geography. Director of the Earth Research Institute at UCSB. Kelly is a recipient of an Early Career Award from the NSF, and was the inaugural recipient of the Early Career Award in Hydrological Sciences from the American Geophysical Union (AGU). He is co-founder of <a href="http://www.arable.com" target="_blank">Arable Labs, Inc</a>. He is currently the Editor in Chief of Earth's Future.`;

console.log('📝 Updating Kelly Caylor bio...\n');

try {
  const result = await client
    .patch('person-kelly-caylor')
    .set({ bio: newBio })
    .commit();
  
  console.log('✅ Updated!\n');
  console.log('New bio:');
  console.log('─'.repeat(60));
  console.log(newBio);
  console.log('─'.repeat(60));
} catch (err) {
  console.error(`❌ Error: ${err.message}`);
  process.exit(1);
}
