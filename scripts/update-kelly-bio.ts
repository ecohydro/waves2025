#!/usr/bin/env tsx

import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@sanity/client';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2023-12-19',
    useCdn: false,
    token: process.env.SANITY_API_EDITOR_TOKEN!,
  });

  const bioShort = "Associate Vice Chancellor for Innovation, Professor at Bren School & Geography. Researches dryland ecosystem dynamics, land use, and climate change impacts in sub-Saharan Africa and the US Southwest.";

  const bioLong = `Kelly Caylor is the Associate Vice Chancellor for Innovation in the Office of Research and holds joint appointments at the Bren School and the Department of Geography. In his scholarship, Professor Caylor seeks to develop improved insight into the way that land use and climate change are interacting to affect the dynamics and resilience of global drylands. His primary research sites are in sub-Saharan Africa and the US Southwest, where he is focused on understanding the vulnerability of both managed and unmanaged ecosystems to current and future changes in hydrological dynamics. Professor Caylor conducts research at a number of spatial and temporal scales; from small-scale experiments during individual rainfall events all the way up to continental-scale analyses of climate trends. A major focus of his research is the development of new methods to improve the measurement and prediction of ecosystem water-use efficiency and novel observation networks for the characterization of coupled natural-human system dynamics. He is co-founder of Arable Labs, Inc (www.arable.com). Professor Caylor is the Editor in Chief of the AGU journal, Earth's Future, and has previously served on the editorial boards of Water Resources Research, the Journal of Geophysical Research — Biogeosciences, Vadose Zone Journal, and the Environmental Research Reviews section of Environmental Research Letters. He was a recipient of an Early Career Award from the NSF and was the inaugural recipient of the Early Career Award in Hydrological Sciences given by the American Geophysical Union (AGU).`;

  console.log('Updating Kelly Caylor bio...');

  const result = await client
    .patch('person-kelly-caylor')
    .set({
      bio: bioShort,
      bioLong: bioLong,
    })
    .commit();

  console.log('✅ Bio updated successfully!');
  console.log('\nNew bio (short):');
  console.log(result.bio);
  console.log('\nNew bio (long):');
  console.log(result.bioLong);
}

main().catch((err) => {
  console.error('Error:', err?.message || err);
  process.exit(1);
});
