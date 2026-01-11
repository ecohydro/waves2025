#!/usr/bin/env tsx

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

type Pub = {
  _id: string;
  title?: string;
  publicationType?: string;
  category?: string;
  doi?: string;
  venue?: { name?: string; shortName?: string; location?: string } | null;
  semanticScholar?: {
    publicationTypes?: string[];
    venue?: { name?: string };
  };
};

type CsvRow = Record<string, string>;

function normalizeTitle(title?: string | null): string | null {
  if (!title) return null;
  return String(title)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function loadConferenceCsv(csvPath: string): Array<{
  title: string;
  conference?: string;
  location?: string;
  year?: string;
  month?: string;
  pages?: string;
}> {
  if (!fs.existsSync(csvPath)) return [];
  const csv = fs.readFileSync(csvPath, 'utf8');
  const parsed = Papa.parse(csv, { header: true });
  const rows = Array.isArray(parsed.data) ? (parsed.data as CsvRow[]) : [];
  return rows
    .map((r) => ({
      title: (r['Title'] || r['TITLE'] || '').toString().trim(),
      conference: (r['Conference'] || '').toString().trim(),
      location: (r['Location'] || '').toString().trim(),
      year: (r['Year'] || '').toString().trim(),
      month: (r['Month'] || '').toString().trim(),
      pages: (r['Pages'] || '').toString().trim(),
    }))
    .filter((r) => r.title);
}

function buildTitleIndex(
  rows: ReturnType<typeof loadConferenceCsv>,
): Map<string, (typeof rows)[number]> {
  const map = new Map<string, (typeof rows)[number]>();
  for (const r of rows) {
    const key = normalizeTitle(r.title);
    if (key) map.set(key, r);
  }
  return map;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');

  const editorToken = process.env.SANITY_API_EDITOR_TOKEN || process.env.SANITY_API_TOKEN;
  const viewerToken =
    process.env.SANITY_API_VIEWER_TOKEN || editorToken || process.env.SANITY_API_TOKEN;
  if (!editorToken) throw new Error('Missing SANITY_API_EDITOR_TOKEN');

  const readClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2023-12-19',
    useCdn: false,
    token: viewerToken,
    perspective: 'drafts',
  });
  const writeClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2023-12-19',
    useCdn: false,
    token: editorToken,
  });

  // 1) Fetch all publications we may need to touch
  const pubs = (await readClient.fetch(
    `*[_type == "publication"]{ _id, title, publicationType, category, doi, venue, semanticScholar }`,
  )) as Pub[];

  // 2) Reclassify rules
  // - Issue #1: Any publication missing venue.name should become category 'conference-abstract' and type 'abstract'
  // - Issue #2: Keep exactly one 'conference-paper' (RF Backscatter...), others should be article or abstract per Issue #1
  // Identify the one conference paper by title contains 'RF Backscatter-Based Sensors for Structural Health Monitoring'
  const CONFERENCE_PAPER_TITLE_TOKEN =
    'rf backscatter-based sensors for structural health monitoring';

  // Load conference CSV for enrichment
  const csvPath = path.join(process.cwd(), 'csv_files', 'CV', 'Conference Abstracts-Table.csv');
  const csvRows = loadConferenceCsv(csvPath);
  const titleIndex = buildTitleIndex(csvRows);

  let updated = 0;
  let enriched = 0;
  let abstractReclassified = 0;
  let journalFixed = 0;

  for (const p of pubs) {
    const titleNorm = normalizeTitle(p.title || '');
    const hasVenueName = Boolean(p.venue?.name && p.venue?.name.trim() !== '');
    const venueName = (p.venue?.name || p.semanticScholar?.venue?.name || '').toLowerCase();
    const looksLikeConference =
      /conference|symposium|workshop|annual meeting|general assembly|society|fall meeting|spring meeting|balkancom|agu|gsa|esa|ecological society|geophysical union|european geosciences/.test(
        venueName,
      );
    const looksLikeJournal =
      /journal|nature|science|proceedings of the|ieee|geophysical research|remote sensing of environment|global change biology|transactions|letters|review|annual review/.test(
        venueName,
      );

    const isTheOneConferencePaper =
      p.publicationType === 'conference-paper' &&
      !!titleNorm &&
      titleNorm.includes(CONFERENCE_PAPER_TITLE_TOKEN);

    const patches: Record<string, unknown> = {};

    // Always honor the single true conference paper regardless of current type
    if (titleNorm && titleNorm.includes(CONFERENCE_PAPER_TITLE_TOKEN)) {
      patches.publicationType = 'conference-paper';
      patches.category = 'conference-proceedings';
    }

    // Issue #2: Only keep that one as conference-paper; downgrade any other 'conference-paper' without clear proceedings venue
    if (p.publicationType === 'conference-paper' && !isTheOneConferencePaper) {
      if (!hasVenueName) {
        // No venue name: treat as abstract
        patches.publicationType = 'abstract';
        patches.category = 'conference-abstract';
        abstractReclassified++;
      } else if (looksLikeConference) {
        // Venue appears to be a conference -> these should be abstracts, not papers
        patches.publicationType = 'abstract';
        patches.category = 'conference-abstract';
        abstractReclassified++;
      } else if (looksLikeJournal) {
        // Venue appears to be a journal -> convert to journal article
        patches.publicationType = 'journal-article';
        // Only set category to journal if not already set or set incorrectly
        if (p.category !== 'journal') patches.category = 'journal';
        journalFixed++;
      }
    }

    // Issue #1: If missing venue.name -> classify as conference abstract/type abstract
    if (!hasVenueName) {
      if (p.category !== 'conference-abstract') patches.category = 'conference-abstract';
      if (p.publicationType !== 'abstract') patches.publicationType = 'abstract';
    }

    // Issue #3: Enrich from CSV when there is a title match
    if (titleNorm && titleIndex.has(titleNorm)) {
      const row = titleIndex.get(titleNorm)!;
      const currentVenueName = p.venue?.name || '';
      const currentLocation = p.venue?.location || '';
      const desiredVenueName = row.conference || '';
      const desiredLocation = row.location || '';

      const venuePatch: Pub['venue'] = { ...(p.venue || {}) };
      let changed = false;
      if (desiredVenueName && desiredVenueName !== currentVenueName) {
        venuePatch.name = desiredVenueName;
        changed = true;
      }
      if (desiredLocation && desiredLocation !== currentLocation) {
        venuePatch.location = desiredLocation;
        changed = true;
      }
      if (changed) {
        patches.venue = venuePatch;
        // If we have the special conference paper, keep as conference-paper; else treat as abstract
        if (!patches.publicationType) {
          if (titleNorm && titleNorm.includes(CONFERENCE_PAPER_TITLE_TOKEN)) {
            patches.publicationType = 'conference-paper';
          } else if (p.publicationType !== 'abstract') {
            patches.publicationType = 'abstract';
          }
        }
        if (!patches.category) {
          if (titleNorm && titleNorm.includes(CONFERENCE_PAPER_TITLE_TOKEN)) {
            patches.category = 'conference-proceedings';
          } else if (p.category !== 'conference-abstract') {
            patches.category = 'conference-abstract';
          }
        }
        enriched++;
      }
    }

    if (Object.keys(patches).length > 0) {
      if (verbose) console.log(`[update] ${p._id} ${p.title} ->`, patches);
      if (!dryRun) await writeClient.patch(p._id).set(patches).commit();
      updated++;
    }
  }

  console.log(
    `Migration complete. Updated=${updated}, Reclassified as Abstract=${abstractReclassified}, Journal fixes=${journalFixed}, Enriched from CSV=${enriched}`,
  );
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
