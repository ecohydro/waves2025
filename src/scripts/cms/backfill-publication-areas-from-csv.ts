import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { createClient } from '@sanity/client';

interface CsvRow {
  TITLE?: string;
  DOI?: string;
  Area?: string;
  YEAR?: string | number;
}

function normalizeAreas(input?: string): string[] {
  if (!input) return [];
  return input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const v = s.toLowerCase();
      if (v === 'ecohydrology') return 'Ecohydrology';
      if (v === 'sensors' || v === 'sensor' || v === 'environmental sensing') return 'Sensors';
      if (
        v === 'cnh' ||
        v === 'coupled natural-human systems' ||
        v === 'coupled natural human systems'
      )
        return 'Coupled Natural-Human Systems';
      return s;
    })
    .filter((v, i, a) => a.indexOf(v) === i);
}

async function main() {
  const csvPath = path.resolve(process.cwd(), 'csv_files/CV/Publications-Table.csv');
  const csv = fs.readFileSync(csvPath, 'utf8');
  const parsed = Papa.parse<CsvRow>(csv, { header: true });
  const rows = parsed.data;

  const editorToken = process.env.SANITY_API_EDITOR_TOKEN || process.env.SANITY_API_TOKEN;
  if (!editorToken) {
    throw new Error('SANITY_API_EDITOR_TOKEN required');
  }

  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2023-12-19',
    token: editorToken,
    useCdn: false,
  });

  // Build lookup map: key by DOI first, fallback by Title+Year
  type RowKey = { doi?: string; title?: string; year?: string };
  const getRowKey = (r: CsvRow): RowKey => ({
    doi: r.DOI?.trim() && r.DOI !== '-' ? r.DOI.trim() : undefined,
    title: r.TITLE?.trim(),
    year: r.YEAR ? String(r.YEAR).trim() : undefined,
  });

  const updates: Array<{ _id: string; areas: string[]; source: RowKey }> = [];

  for (const row of rows) {
    const areas = normalizeAreas(row.Area);
    if (areas.length === 0) continue;

    const key = getRowKey(row);
    let doc = null as null | { _id: string };
    if (key.doi) {
      doc = await client.fetch(`*[_type == "publication" && doi == $doi][0]{ _id }`, {
        doi: key.doi,
      });
    }

    if (!doc && key.title) {
      doc = await client.fetch(
        `*[_type == "publication" && title match $title] | order(publishedDate desc) [0]{ _id }`,
        { title: key.title },
      );
    }

    if (!doc) continue;
    updates.push({ _id: doc._id, areas, source: key });
  }

  if (updates.length === 0) {
    console.log('No updates to apply.');
    return;
  }

  const tx = client.transaction();
  for (const u of updates) {
    tx.patch(u._id, (p) => p.set({ researchAreas: u.areas }));
  }

  await tx.commit();
  console.log(`Updated researchAreas on ${updates.length} publications.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

