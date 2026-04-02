#!/usr/bin/env tsx

/**
 * Add two missing 2026 published papers to Sanity.
 *
 * Usage:
 *   npx tsx scripts/add-2026-publications.ts              # dry-run
 *   npx tsx scripts/add-2026-publications.ts --apply       # write to Sanity
 */

import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@sanity/client';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID as string;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET as string;
const editorToken = process.env.SANITY_API_EDITOR_TOKEN || process.env.SANITY_API_TOKEN || '';

if (!projectId || !dataset) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET');
}
if (!editorToken) {
  console.warn('(warn) No editor token set; writes will fail.');
}

const sanity = createClient({
  projectId,
  dataset,
  apiVersion: '2023-12-19',
  useCdn: false,
  token: editorToken,
  perspective: 'published',
});

function makeSlug(title: string, year: number): string {
  return (
    title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 80)
      .replace(/-+$/, '') +
    `-${year}`
  );
}

const publications = [
  {
    _id: `publication-${makeSlug('Co-regulation of water use and canopy temperature in desert trees', 2026)}`,
    _type: 'publication' as const,
    title: 'Co-regulation of water use and canopy temperature in desert trees',
    slug: {
      _type: 'slug',
      current: makeSlug('Co-regulation of water use and canopy temperature in desert trees', 2026),
    },
    publicationType: 'journal-article' as const,
    status: 'published' as const,
    publishedDate: '2026-01-01',
    doi: '10.1016/j.agrformet.2025.110929',
    venue: {
      name: 'Agricultural & Forest Meteorology',
    },
    authors: [
      {
        _key: uuidv4(),
        name: 'Bryn Morgan',
        person: { _ref: 'person-bryn-morgan', _type: 'reference' },
        isCorresponding: false,
      },
      {
        _key: uuidv4(),
        name: 'A.T. Trugman',
        isCorresponding: false,
      },
      {
        _key: uuidv4(),
        name: 'Kelly K. Caylor',
        person: { _ref: 'person-kelly-caylor', _type: 'reference' },
        isCorresponding: false,
      },
    ],
    abstract: `Plants employ a range of water-use strategies to withstand limitations in water supply and increases in atmospheric demand. At the same time, water-use strategies alter canopy energy balance, leading to changes in canopy temperature that can impact photosynthesis, creating distinct tradeoffs between water and temperature regulation. However, the extent of these tradeoffs is a key uncertainty in understanding plant responses to hydroclimatic stress. Here, we use a unique dataset of near-surface remotely sensed retrievals of canopy conductance, transpiration, and temperature to assess how desert trees co-regulate their water status and temperature. We leverage a moisture gradient and seasonality in temperature to evaluate species-specific plant responses to both isolated (cool, dry and hot, wet) and combined (hot, dry) water and temperature stress and compare them to reference (cool, wet) conditions. We find that species exhibit different water-use strategies in response to supply- and demand-driven water stress, but exhibit similar responses to thermal stress. Under most conditions, plants face tradeoffs between hydraulic function and avoiding thermal stress. However, when both supply and demand are high, water and canopy temperature regulation can become decoupled. Altogether, our findings reveal two unexpected plant behaviors that may be particularly vulnerable to climate change.`,
    researchAreas: ['Ecohydrology'],
    keywords: [],
    links: {
      publisher: 'https://www.doi.org/10.1016/j.agrformet.2025.110929',
    },
    metrics: {
      citations: 0,
    },
    isFeatured: false,
    isOpenAccess: false,
    seo: {
      metaTitle: 'Co-regulation of water use and canopy temperature in desert trees - WAVES Research Lab',
      metaDescription: 'Plants employ a range of water-use strategies to withstand limitations in water supply and increases in atmospheric demand. At the same time, water-use strategies alter canopy energy balance, leading to changes in canopy temperature that can impact photosynthesis, creating distinct tradeoffs between water and temperature regulation.',
    },
  },
  {
    _id: `publication-${makeSlug('Shifts in evapotranspiration components during heatwaves alter surface cooling', 2026)}`,
    _type: 'publication' as const,
    title: 'Shifts in evapotranspiration components during heatwaves alter surface cooling',
    slug: {
      _type: 'slug',
      current: makeSlug('Shifts in evapotranspiration components during heatwaves alter surface cooling', 2026),
    },
    publicationType: 'journal-article' as const,
    status: 'published' as const,
    publishedDate: '2026-02-01',
    doi: '10.1029/2025EF006562',
    venue: {
      name: "Earth's Future",
    },
    authors: [
      {
        _key: uuidv4(),
        name: 'Han Chen',
        isCorresponding: false,
      },
      {
        _key: uuidv4(),
        name: 'Stephen P. Good',
        person: { _ref: 'person-stephen-good', _type: 'reference' },
        isCorresponding: false,
      },
      {
        _key: uuidv4(),
        name: 'E. Zahn',
        isCorresponding: false,
      },
      {
        _key: uuidv4(),
        name: 'E. Bou-Zeid',
        isCorresponding: false,
      },
      {
        _key: uuidv4(),
        name: 'Kelly K. Caylor',
        person: { _ref: 'person-kelly-caylor', _type: 'reference' },
        isCorresponding: false,
      },
      {
        _key: uuidv4(),
        name: 'R.P. Fiorella',
        isCorresponding: false,
      },
      {
        _key: uuidv4(),
        name: 'M. Haagsma',
        isCorresponding: false,
      },
      {
        _key: uuidv4(),
        name: 'Lixin Wang',
        person: { _ref: 'person-lixin-wang', _type: 'reference' },
        isCorresponding: false,
      },
    ],
    abstract: `Integrating physical processes with machine learning has advanced evapotranspiration (ET) simulation, yet most hybrid models fail to partition total ET into its components: soil evaporation (E) and vegetation transpiration (T). This study introduces Residual Neural Network\u2013Penman\u2013Monteith (RNN-PM), a novel hybrid dual-source ET model designed to overcome this limitation. The model synergizes the physically-based Penman\u2013Monteith framework with three specialized residual neural networks trained to estimate key conductance parameters (canopy conductance, soil surface conductance, and aerodynamic conductance). This explicit parameterization allows for the direct partitioning of total ET. Validation at National Ecological Observatory Network (NEON) flux sites using high-frequency partitioned E and T shows that RNN-PM reliably reproduces ET and the transpiration fraction (T/ET). For ET, the model achieves an average Kling\u2013Gupta efficiency (KGE) of 0.89 and a root-mean-square error (RMSE) of 0.55 mm/day; for T/ET, the KGE is 0.87 with an RMSE of 0.06. Furthermore, RNN-PM demonstrates robust generalization, accurately simulating ET and its components well beyond the initial training dataset, even under extreme climatic conditions. This study extended the analysis by comparing the RNN-PM model with seven established dual-source ET models. The results indicate that RNN-PM outperforms both conventional machine learning models and purely physical process-based models in simulating ET components in most cases. Among the purely physical process-based dual-source models, those based on surface temperature decomposition showed improved performance as the leaf area index (LAI) decreased when evaluated against high-frequency ET component datasets. In contrast, the performance of conductance-based dual-source models declined with decreasing LAI. Although purely machine learning-based models can produce relatively accurate simulations of ET components, they often exhibit limited generalization capability, an issue that the RNN-PM model effectively overcomes. Ultimately, the RNN-PM model represents a significant advance in simulating ET components, offering a novel and scalable approach for improving the representation of land\u2013atmosphere interactions in Earth system models.`,
    researchAreas: ['Ecohydrology'],
    keywords: [],
    links: {
      publisher: 'https://www.doi.org/10.1029/2025EF006562',
    },
    metrics: {
      citations: 0,
    },
    isFeatured: false,
    isOpenAccess: false,
    seo: {
      metaTitle: "Shifts in evapotranspiration components during heatwaves alter surface cooling - WAVES Research Lab",
      metaDescription: 'Integrating physical processes with machine learning has advanced evapotranspiration (ET) simulation, yet most hybrid models fail to partition total ET into its components: soil evaporation (E) and vegetation transpiration (T).',
    },
  },
];

async function main() {
  const dryRun = !process.argv.includes('--apply');
  if (dryRun) {
    console.log('=== DRY RUN (pass --apply to write) ===\n');
  }

  for (const pub of publications) {
    // Check if already exists by DOI
    const existing = await sanity.fetch(
      `*[_type == "publication" && doi == $doi][0]{ _id, title }`,
      { doi: pub.doi },
    );

    if (existing) {
      console.log(`SKIP "${pub.title}" — already exists (${existing._id})`);
      continue;
    }

    console.log(`${dryRun ? 'WOULD CREATE' : 'CREATING'}: "${pub.title}"`);
    console.log(`  DOI: ${pub.doi}`);
    console.log(`  Venue: ${pub.venue.name}`);
    console.log(`  Authors: ${pub.authors.map((a) => a.name).join(', ')}`);
    console.log(`  ID: ${pub._id}`);
    console.log();

    if (!dryRun) {
      await sanity.createOrReplace(pub);
      console.log('  -> Created successfully\n');
    }
  }
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
