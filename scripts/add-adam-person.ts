#!/usr/bin/env tsx

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const mod: any = await import('../src/lib/cms/client');

  // Check if Adam already exists
  const existingQuery = '*[_type == "person" && slug.current == "adam-oliphant"][0]';
  const existing = await mod.client.fetch(existingQuery);
  
  if (existing) {
    console.log('✅ Adam Oliphant already exists in Sanity!');
    console.log('Person ID:', existing._id);
    console.log('View at: https://waves2025.sanity.studio/desk/person;' + existing._id);
    return;
  }

  const personData = {
    _type: 'person',
    name: 'Adam J Oliphant',
    slug: {
      _type: 'slug',
      current: 'adam-oliphant'
    },
    email: 'aoliphant@ucsb.edu',
    role: 'PhD Student',
    affiliation: 'Joint Doctoral Program in Geography, SDSU & UC Santa Barbara',
    bio: `Adam J Oliphant is a PhD student in the Joint Doctoral Program in Geography at San Diego State University and UC Santa Barbara. His research focuses on remote sensing, hydrology, and agricultural water management, with an emphasis on using satellite data to evaluate irrigation efficiency and conservation programs.

His dissertation research evaluates evapotranspiration and water conservation in California's Imperial Valley, one of the largest irrigation districts in the United States. The project uses OpenET satellite products and field-level data to understand how irrigation modernization programs affect water use patterns in intensive agricultural systems.`,
    researchAreas: [
      'Remote Sensing',
      'Hydrology',
      'Agricultural Water Management',
      'Evapotranspiration',
      'Irrigation Efficiency',
      'Water Conservation'
    ],
    userGroup: 'current',
    category: 'phd_student',
    tags: [
      'UCSB',
      'SDSU',
      'phd student',
      'current member',
      'remote sensing',
      'hydrology',
      'agriculture'
    ]
  };

  console.log('Creating person record in Sanity...');
  const result = await mod.client.create(personData);
  console.log('✅ Person created successfully!');
  console.log('Person ID:', result._id);
  console.log('View at: https://waves2025.sanity.studio/desk/person;' + result._id);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
