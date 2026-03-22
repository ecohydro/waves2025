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

  // Check if Anna already exists
  const existing = await client.fetch(
    '*[_type == "person" && slug.current == "anna-boser"][0]'
  );

  if (existing) {
    console.log('✅ Anna Boser already exists in Sanity!');
    console.log('Person ID:', existing._id);
    return;
  }

  const bioShort = "Environmental scientist and PhD student studying water in agriculture using satellite remote sensing and machine learning.";

  const bioLong = `Anna Boser is an environmental scientist and PhD student at the Bren School of Environmental Science & Management at UC Santa Barbara. Her research focuses on water in agriculture, using satellite remote sensing and machine learning to study irrigation practices and their impact on water resources, particularly in water-scarce regions. Anna's work aims to inform sustainable water management strategies that enhance food security and economic prosperity in both data-rich agricultural regions like California and under-resourced areas in Sub-Saharan Africa.

However, her technical expertise also extends to other topics, such as the remote sensing of mosquito-borne disease risk and enhancing the usability of spatio-temporal climate data and machine learning models.

She is supported by an NSF GRFP, the Eugene Cota-Robles Fellowship, and a Fulbright Fellowship. Anna holds a BA in Statistics from UC Berkeley, where she was recognized as the top graduating senior in 2020, and is the 2024 recipient of the AGU Science for Solutions Award.

Anna is advised by Ashley Larsen and Kelly Caylor.`;

  const personData = {
    _type: 'person',
    _id: 'person-anna-boser',
    name: 'Anna Boser',
    slug: {
      _type: 'slug',
      current: 'anna-boser'
    },
    title: 'PhD Student',
    category: 'graduate-student',
    userGroup: 'alumni',
    email: 'annaboser@ucsb.edu',
    bio: bioShort,
    bioLong: bioLong,
    education: [
      {
        _key: 'edu-1',
        degree: 'BA',
        field: 'Statistics',
        institution: 'UC Berkeley',
        year: 2020
      }
    ],
    researchInterests: [
      'Water in Agriculture',
      'Satellite Remote Sensing',
      'Machine Learning',
      'Irrigation Practices',
      'Water Resources',
      'Sustainable Water Management',
      'Food Security',
      'Climate Data',
      'Spatio-temporal Modeling'
    ],
    isActive: false, // Alumni
  };

  console.log('Creating person record in Sanity...');
  const result = await client.create(personData);
  console.log('✅ Person created successfully!');
  console.log('Person ID:', result._id);
  console.log('Slug:', result.slug.current);
}

main().catch((err) => {
  console.error('Error:', err?.message || err);
  process.exit(1);
});
