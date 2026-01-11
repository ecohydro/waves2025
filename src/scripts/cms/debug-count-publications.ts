#!/usr/bin/env tsx

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@sanity/client';

async function main(): Promise<void> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
  const token =
    process.env.SANITY_API_VIEWER_TOKEN ||
    process.env.SANITY_API_EDITOR_TOKEN ||
    process.env.SANITY_API_TOKEN;

  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2023-12-19',
    useCdn: false,
    token,
    perspective: 'published',
  });

  const pubs = (await client.fetch(
    `*[_type == "publication"]{ _id, title, publicationType, category, status }`,
  )) as Array<{
    _id: string;
    title?: string;
    publicationType?: string;
    category?: string;
    status?: string;
  }>;

  const counts = pubs.reduce(
    (acc, p) => {
      acc.total++;
      const pt = p.publicationType || '—';
      const cat = p.category || '—';
      const st = p.status || '—';
      acc.byType[pt] = (acc.byType[pt] || 0) + 1;
      acc.byCategory[cat] = (acc.byCategory[cat] || 0) + 1;
      acc.byStatus[st] = (acc.byStatus[st] || 0) + 1;
      return acc;
    },
    {
      total: 0,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
    },
  );

  console.log(JSON.stringify(counts, null, 2));

  const sampleAbstracts = pubs
    .filter((p) => p.publicationType === 'abstract' || p.category === 'conference-abstract')
    .slice(0, 10);
  if (sampleAbstracts.length) {
    console.log('\nSample abstracts (first 10):');
    for (const p of sampleAbstracts) {
      console.log(`- ${p._id} | ${p.publicationType} | ${p.category} | ${p.status} | ${p.title}`);
    }
  } else {
    console.log('\nNo abstracts found in published perspective.');
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
