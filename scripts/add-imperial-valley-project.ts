#!/usr/bin/env tsx

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const mod: any = await import('../src/lib/cms/client');

  // First, find Adam's person record
  const adamQuery = '*[_type == "person" && slug.current == "adam-oliphant"][0]';
  const adam = await mod.client.fetch(adamQuery);
  
  if (!adam) {
    console.error('Could not find Adam Oliphant in Sanity. Please create person record first.');
    process.exit(1);
  }

  console.log('Found Adam:', adam._id);

  const projectData = {
    _type: 'project',
    title: 'Evaluating Evapotranspiration and Water Conservation in the Imperial Valley',
    slug: {
      _type: 'slug',
      current: 'imperial-valley-et-conservation'
    },
    shortDescription: 'Evaluating how irrigation practices, conservation programs, and crop changes affect agricultural water use in California\'s Imperial Valley using satellite-based evapotranspiration measurements and field-level data.',
    description: `This research evaluates how irrigation practices, conservation programs, and crop changes affect agricultural water use in the Imperial Valley, California. The Imperial Valley is one of the largest irrigation districts in the United States and receives approximately 3.1 million acre-feet of Colorado River water annually through the Imperial Irrigation District (IID).

The project combines satellite-based evapotranspiration (ET) measurements, water balance calculations, and field-level agricultural data to assess how water use has changed over time and how conservation programs have affected irrigation efficiency.`,
    status: 'active',
    researchAreas: [
      'Remote Sensing',
      'Hydrology',
      'Agricultural Water Management',
      'Evapotranspiration',
      'Water Conservation',
      'Irrigation Efficiency'
    ],
    tags: [
      'OpenET',
      'Imperial Valley',
      'Colorado River',
      'Satellite Remote Sensing',
      'Water Balance',
      'Conservation Programs',
      'Landsat'
    ],
    participants: [
      {
        _type: 'object',
        person: {
          _type: 'reference',
          _ref: adam._id
        },
        role: 'PhD Researcher',
        affiliation: 'SDSU / UC Santa Barbara',
        isPrimaryInvestigator: true
      }
    ],
    technologies: [
      'R',
      'Python',
      'Google Earth Engine',
      'ArcGIS Pro',
      'QGIS',
      'OpenET'
    ],
    methods: [
      'Water Balance Analysis',
      'Satellite Evapotranspiration',
      'Field-Level Analysis',
      'Statistical Modeling',
      'Difference-in-Differences Analysis',
      'Panel Data Analysis'
    ],
    isFeatured: false,
    isPublic: true,
    seo: {
      metaDescription: 'Research evaluating irrigation efficiency and water conservation in California\'s Imperial Valley using satellite evapotranspiration data and field measurements.',
      keywords: [
        'evapotranspiration',
        'Imperial Valley',
        'water conservation',
        'irrigation efficiency',
        'OpenET',
        'satellite remote sensing',
        'agricultural water use'
      ]
    }
  };

  console.log('Creating project in Sanity...');
  const result = await mod.client.create(projectData);
  console.log('✅ Project created successfully!');
  console.log('Project ID:', result._id);
  console.log('View at: https://waves2025.sanity.studio/desk/project;' + result._id);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
