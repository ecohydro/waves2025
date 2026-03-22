import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '6r5yojda',
  dataset: 'production',
  apiVersion: '2025-07-02',
  token: process.env.SANITY_API_EDITOR_TOKEN,
  useCdn: false,
});

async function main() {
  const result = await client
    .patch('person-cella-schnabel')
    .unset(['bio']) // Remove short bio
    .set({
      bioLong: 'Cella is a PhD student at the Bren School of Environmental Science and Management. Cella is interested in social-ecological dynamics in pastoral and agricultural systems.'
    })
    .commit();
  
  console.log('✅ Updated Cella Schnabel profile');
  console.log('New bioLong:', result.bioLong);
  console.log('Short bio removed:', !result.bio);
}

main();
