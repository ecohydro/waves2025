#!/usr/bin/env tsx

/**
 * Populate the `education` field on alumni graduate-student Person documents
 * using data from the CV export (Graduate PhD-Table.csv).
 *
 * Only processes students where the PI was Chair or Co-Chair.
 *
 * Usage:
 *   npx tsx scripts/populate-phd-education.ts              # dry-run (default)
 *   npx tsx scripts/populate-phd-education.ts --apply       # actually write to Sanity
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { createClient } from '@sanity/client';
import Papa from 'papaparse';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// --- Types ---

type GradRow = {
  Degree: string;
  Student: string;
  Year: string;
  Institution: string;
  Department: string;
  Role: string;
  Title: string;
  Affiliation: string;
  Organization: string;
  Author: string;
  Eval: string;
};

type EducationEntry = {
  _type: 'object';
  _key: string;
  degree: string;
  field: string;
  institution: string;
  year: number;
};

type PersonDoc = {
  _id: string;
  name: string;
  slug?: { current: string };
  userGroup?: string;
  category?: string;
  education?: EducationEntry[];
};

// --- Sanity client ---

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

// --- Helpers ---

/** Normalize a name for fuzzy matching (lowercase, strip punctuation/accents, collapse whitespace). */
function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[''`\u2018\u2019]/g, '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

// --- Main ---

async function main() {
  const dryRun = !process.argv.includes('--apply');
  if (dryRun) {
    console.log('=== DRY RUN (pass --apply to write) ===\n');
  }

  // 1. Read CSV
  const csvPath = path.resolve(
    process.env.HOME || '~',
    'dev/biobib/CV/Graduate PhD-Table.csv',
  );
  const csvText = await fs.readFile(csvPath, 'utf8');
  const { data: rows } = Papa.parse<GradRow>(csvText, { header: true, skipEmptyLines: true });

  // Filter to Chair/Co-Chair only, graduated (Year is a number)
  const graduatedAdvisees = rows.filter((r) => {
    const role = (r.Role || '').toLowerCase();
    return (role === 'chair' || role === 'co-chair') && /^\d{4}$/.test(r.Year);
  });

  console.log(`CSV: ${graduatedAdvisees.length} graduated PhD advisees found\n`);

  // 2. Fetch alumni graduate students from Sanity
  const alumni: PersonDoc[] = await sanity.fetch(
    `*[_type == "person" && userGroup == "alumni" && category == "graduate-student"] {
      _id, name, slug, userGroup, category, education
    }`,
  );
  console.log(`Sanity: ${alumni.length} alumni graduate students\n`);

  // Build lookup by normalized name
  const alumniByName = new Map<string, PersonDoc>();
  for (const p of alumni) {
    alumniByName.set(normalizeName(p.name), p);
  }

  // 3. Match and prepare updates
  let updated = 0;
  let skipped = 0;
  const unmatched: string[] = [];

  for (const row of graduatedAdvisees) {
    const normalizedCsvName = normalizeName(row.Student);
    const person = alumniByName.get(normalizedCsvName);

    if (!person) {
      unmatched.push(row.Student);
      continue;
    }

    // Check if PhD education entry already exists
    const existingPhd = (person.education || []).find(
      (e) => e.degree === 'PhD' && e.year === parseInt(row.Year, 10),
    );
    if (existingPhd) {
      console.log(`  SKIP ${person.name} — already has PhD ${row.Year} entry`);
      skipped++;
      continue;
    }

    const newEntry: EducationEntry = {
      _type: 'object',
      _key: generateKey(),
      degree: 'PhD',
      field: row.Department,
      institution: row.Institution,
      year: parseInt(row.Year, 10),
    };

    console.log(
      `  ${dryRun ? 'WOULD UPDATE' : 'UPDATING'} ${person.name}: PhD ${row.Year}, ${row.Department}, ${row.Institution}`,
    );

    if (!dryRun) {
      // Append to existing education array, or create it
      if (person.education && person.education.length > 0) {
        await sanity.patch(person._id).append('education', [newEntry]).commit();
      } else {
        await sanity.patch(person._id).set({ education: [newEntry] }).commit();
      }
    }
    updated++;
  }

  console.log(`\n--- Summary ---`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped (already had entry): ${skipped}`);
  if (unmatched.length > 0) {
    console.log(`\nUnmatched CSV names (not found in Sanity alumni):`);
    for (const name of unmatched) {
      console.log(`  - ${name}`);
    }
  }
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
