#!/usr/bin/env tsx

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@sanity/client';
import { fetchPaperById } from '../../lib/migration/semantic-scholar-utils';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

type Pub = {
  _id: string;
  title: string;
  category?: string;
  abstract?: string | null;
  semanticScholar?: { paperId?: string };
};

function normalizeDoi(doi?: string | null): string | null {
  if (!doi) return null;
  return String(doi)
    .replace(/^https?:\/\/doi\.org\//i, '')
    .trim()
    .toLowerCase();
}

function normalizeTitle(title?: string | null): string | null {
  if (!title) return null;
  return String(title)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function loadCsvAbstracts(csvPath: string): {
  doiToAbstract: Map<string, string>;
  titleToAbstract: Map<string, string>;
} {
  const doiToAbstract = new Map<string, string>();
  const titleToAbstract = new Map<string, string>();
  if (!fs.existsSync(csvPath)) return { doiToAbstract, titleToAbstract };

  const csv = fs.readFileSync(csvPath, 'utf8');
  const parsed = Papa.parse(csv, { header: true });
  const rows = Array.isArray(parsed.data) ? (parsed.data as Array<Record<string, string>>) : [];
  for (const row of rows) {
    const doi = normalizeDoi(row['DOI']);
    const title = normalizeTitle(row['TITLE']);
    const abstract = (row['Abstract'] || '').toString().trim();
    if (!abstract) continue;
    if (doi) doiToAbstract.set(doi, abstract);
    if (title) titleToAbstract.set(title, abstract);
  }
  return { doiToAbstract, titleToAbstract };
}

async function main(): Promise<void> {
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
  });
  const writeClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2023-12-19',
    useCdn: false,
    token: editorToken,
  });

  const pubs = (await readClient.fetch(
    `*[_type == "publication" && category == 'journal' && (!defined(abstract) || abstract == null || abstract == '') && defined(semanticScholar.paperId)]{
      _id, title, category, abstract, semanticScholar
    }`,
  )) as Pub[];

  console.log(`Found ${pubs.length} journal publications missing abstracts`);

  let updated = 0;
  let skipped = 0;
  let updatedFromS2 = 0;
  let updatedFromCsv = 0;

  // Load CSV abstracts
  const csvPath = path.join(process.cwd(), 'csv_files', 'CV', 'Publications-Table.csv');
  const { doiToAbstract, titleToAbstract } = loadCsvAbstracts(csvPath);
  for (const p of pubs) {
    const pid = p.semanticScholar?.paperId;
    if (!pid) {
      skipped++;
      continue;
    }
    try {
      const paper = await fetchPaperById(pid, 'paperId,title,abstract,externalIds');
      let abs = (paper?.abstract || '').toString().trim();

      if (!abs) {
        const doi = normalizeDoi((paper as any)?.externalIds?.DOI || null);
        const titleNorm = normalizeTitle(paper?.title || p.title);
        const csvAbs =
          (doi && doiToAbstract.get(doi)) || (titleNorm && titleToAbstract.get(titleNorm)) || '';
        if (csvAbs) abs = csvAbs.trim();
      }

      if (!abs) {
        console.log(`- No abstract from S2/CSV for ${p._id} (${p.title})`);
        skipped++;
        continue;
      }

      await writeClient.patch(p._id).set({ abstract: abs }).commit();
      updated++;
      if (paper?.abstract) updatedFromS2++;
      else updatedFromCsv++;
      console.log(`✓ Updated abstract for ${p._id} (${paper?.abstract ? 'S2' : 'CSV'})`);
    } catch (e) {
      console.error(`✗ Failed to update ${p._id}:`, e);
      skipped++;
    }
  }

  console.log(
    `Backfill complete. Updated=${updated} (S2=${updatedFromS2}, CSV=${updatedFromCsv}), Skipped=${skipped}`,
  );
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Backfill abstracts failed:', err);
    process.exit(1);
  });
}
