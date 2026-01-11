#!/usr/bin/env tsx

import { createClient } from '@sanity/client';

type Pub = {
  _id: string;
  publicationType?: string;
  venue?: { name?: string };
  arxivId?: string;
  doi?: string;
  semanticScholar?: {
    publicationTypes?: string[];
    venue?: { name?: string };
  };
  category?: string;
};

function decideCategory(
  p: Pub,
): 'journal' | 'conference-proceedings' | 'conference-abstract' | 'preprint' | 'other' | 'unknown' {
  const ssTypes = (p.semanticScholar?.publicationTypes || []).map((s) => s.toLowerCase());
  const s2VenueNameRaw = (p.semanticScholar?.venue?.name || '').toLowerCase();
  const venueName = (p.venue?.name || p.semanticScholar?.venue?.name || '').toLowerCase();
  const pubType = (p.publicationType || '').toLowerCase();

  const proceedingsJournalWhitelist = [
    'proceedings of the national academy of sciences',
    'pnas',
    'proceedings of the royal society a',
    'proceedings of the royal society b',
    'proceedings of the ieee',
  ];
  const isWhitelistedProceedingsJournal = proceedingsJournalWhitelist.some((j) =>
    venueName.includes(j),
  );

  // Strict preprint detection
  if (
    p.arxivId ||
    venueName.includes('arxiv') ||
    ssTypes.includes('preprint') ||
    pubType === 'preprint'
  ) {
    return 'preprint';
  }

  // Journal detection: explicit journal types or known journal hints
  if (
    pubType === 'journal-article' ||
    ssTypes.includes('journal article') ||
    ssTypes.includes('journal-article') ||
    isWhitelistedProceedingsJournal ||
    [
      'journal',
      'nature',
      'science',
      'ecosystems',
      'geophysical research',
      'remote sensing of environment',
      'global change biology',
      'journal of',
    ].some((j) => venueName.includes(j))
  ) {
    // Guard against obvious conference-only venues
    if (!venueName.includes('conference') && !venueName.includes('symposium')) {
      return 'journal';
    }
  }

  // Conference proceedings detection
  if (
    pubType === 'conference-paper' ||
    ssTypes.includes('conference') ||
    ssTypes.includes('conference paper') ||
    // Only treat as conference proceedings if venue has clear conference signals and is not a whitelisted proceedings journal
    (!isWhitelistedProceedingsJournal &&
      (venueName.includes('conference') ||
        venueName.includes('symposium') ||
        venueName.includes('workshop') ||
        venueName.includes('annual meeting') ||
        /proceedings of the .* conference/.test(venueName)))
  ) {
    return 'conference-proceedings';
  }

  // Abstracts or presentations are hard to distinguish reliably – default to 'other' unless venue explicitly says abstract/book of abstracts
  if (
    venueName.includes('abstract') ||
    venueName.includes('book of abstracts') ||
    venueName.includes('poster')
  ) {
    return 'conference-abstract';
  }

  // If S2 provided no venue and we didn't classify as journal or proceedings, default to abstract
  if (!s2VenueNameRaw || s2VenueNameRaw.trim() === '') {
    return 'conference-abstract';
  }

  return 'unknown';
}

async function main(): Promise<void> {
  const editorToken = process.env.SANITY_API_EDITOR_TOKEN || process.env.SANITY_API_TOKEN;
  if (!editorToken) throw new Error('Missing editor token');

  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    token: editorToken,
    apiVersion: '2023-12-19',
    useCdn: false,
  });

  const pubs = (await client.fetch(
    `*[_type == "publication"]{ _id, publicationType, venue, arxivId, doi, semanticScholar, category }`,
  )) as Pub[];

  let updated = 0;
  let unknown = 0;
  for (const p of pubs) {
    const cat = decideCategory(p);
    if (p.category === cat) continue;
    if (cat === 'unknown') unknown++;
    await client.patch(p._id).set({ category: cat }).commit();
    updated++;
  }

  console.log(`Categorized ${updated} publications. Unknown: ${unknown}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Categorization failed:', err);
    process.exit(1);
  });
}
