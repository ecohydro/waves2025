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

  // Check if Huck already exists
  const existing = await client.fetch(
    '*[_type == "person" && slug.current == "huck-rees"][0]'
  );

  if (existing) {
    console.log('✅ Huck Rees already exists in Sanity!');
    console.log('Person ID:', existing._id);
    return;
  }

  const bioShort = "PhD student in Geography studying river systems, floodplains, and wetland dynamics. Researches sediment transport, water availability, carbon sequestration, and river morphology across multiple scales.";

  const bioLong = `Huck is a PhD student in Geography at UC Santa Barbara studying the dynamics of rivers, floodplains, and wetlands and how they respond to change. His work spans questions of sediment transport and storage, water availability, carbon sequestration, and river morphology, connecting processes across a wide range of scales and environments. At the global scale, he develops globally applicable tools for mapping river systems and tracing how sediment is routed and stored across large drainage networks, drawing on remote sensing archives and numerical modeling to build a more complete picture of how the world's rivers function. At the regional scale, he investigates how shifting channel networks in the Okavango Delta redistribute water and reshape wetland ecosystems in response to flood pulses. Closer to home, he studies how beaver-based restoration alters channel morphology, stores sediment, and improves conditions for carbon storage and ecosystem recovery. Drawing on fieldwork, satellite observation, and computational modeling, his research seeks to understand how natural and managed changes to river systems ripple through watersheds, and how thoughtful, empirically driven monitoring and intervention can build resilience in a rapidly changing world.`;

  const personData = {
    _type: 'person',
    _id: 'person-huck-rees',
    name: 'Huck Rees',
    slug: {
      _type: 'slug',
      current: 'huck-rees'
    },
    title: 'PhD Student',
    category: 'graduate-student',
    userGroup: 'current',
    email: 'jamesrees@ucsb.edu',
    bio: bioShort,
    bioLong: bioLong,
    socialMedia: {
      orcid: '0009-0004-4895-2243',
      googleScholar: 'https://scholar.google.com/citations?user=VdIf-LkAAAAJ&hl=en',
      linkedin: 'https://www.linkedin.com/in/james-rees-12b205157/',
    },
    education: [
      {
        _key: 'edu-1',
        degree: 'BA',
        field: 'Geology and History (Minor: GIS)',
        institution: 'UC Davis',
        year: 2019
      },
      {
        _key: 'edu-2',
        degree: 'MA',
        field: 'Geography (Fluvial Geomorphology, Hydrology Certificate)',
        institution: 'University of Colorado Boulder',
        year: 2021
      }
    ],
    researchInterests: [
      'River Systems',
      'Floodplain Dynamics',
      'Wetland Ecosystems',
      'Sediment Transport',
      'Water Availability',
      'Carbon Sequestration',
      'River Morphology',
      'Remote Sensing',
      'Fluvial Geomorphology',
      'Beaver-Based Restoration',
      'Okavango Delta',
      'Watershed Management'
    ],
    isActive: true,
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
