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
    .set({
      bioLong: 'Cella is a Ph.D. student at the Bren School of Environmental Science and Management interested in social-ecological dynamics in pastoral and agricultural systems.',
      education: [
        {
          _type: 'education',
          _key: 'cornell-bs',
          degree: 'B.S. Environmental Engineering',
          institution: 'Cornell University',
          year: '2025'
        }
      ]
    })
    .commit();
  
  console.log('✅ Updated Cella Schnabel profile');
  console.log('New bioLong:', result.bioLong);
  console.log('Education:', result.education);
}

main();
