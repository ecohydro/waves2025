#!/usr/bin/env tsx

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { spawn } from 'child_process';
import { createClient } from '@sanity/client';
import Papa from 'papaparse';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

type PersonDoc = {
  _id: string;
  name: string;
  userGroup?: string;
  currentPosition?: string;
  leaveDate?: string;
  title?: string;
};

type GradRow = {
  Degree?: string;
  Student?: string;
  Year?: string | number;
  Institution?: string;
  Department?: string;
};

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID as string;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET as string;
const editorToken = process.env.SANITY_API_EDITOR_TOKEN || process.env.SANITY_API_TOKEN || '';

if (!projectId || !dataset) {
  throw new Error(
    'Missing Sanity project configuration (NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET).',
  );
}
if (!editorToken) {
  console.warn(
    '(warn) SANITY_API_EDITOR_TOKEN not set; writes may fail. Set SANITY_API_EDITOR_TOKEN or SANITY_API_TOKEN in .env.local',
  );
}

const editorClient = createClient({
  projectId,
  dataset,
  apiVersion: '2023-12-19',
  useCdn: false,
  token: editorToken,
  perspective: 'published',
});

function getFlag(name: string): boolean {
  return process.argv.includes(name);
}

function cleanString(value?: string | number | null): string {
  if (value == null) return '';
  return String(value).trim();
}

function stripDiacritics(input: string): string {
  return input.normalize('NFKD').replace(/\p{Diacritic}+/gu, '');
}

function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

function toLowerAscii(input: string): string {
  // Normalize quotes/apostrophes and remove diacritics
  const unified = input.replace(/[’‘‛ʼ´`]/g, "'").replace(/[“”]/g, '"');
  return stripDiacritics(unified).toLowerCase();
}

function generateNameVariants(fullName: string): string[] {
  const base = normalizeWhitespace(fullName);
  const lower = toLowerAscii(base);

  const variants = new Set<string>();
  variants.add(lower);

  // Remove parenthetical middle/maiden names: "Hilary (Wayland) Cannarella" → "Hilary Cannarella"
  const noParens = toLowerAscii(
    base
      .replace(/\([^)]*\)/g, '')
      .replace(/\s+/g, ' ')
      .trim(),
  );
  if (noParens) variants.add(noParens);

  // Expand parenthetical into middle token: "Hilary (Wayland) Cannarella" → "Hilary Wayland Cannarella"
  const match = base.match(/^(.*?)\(([^)]*)\)(.*)$/);
  if (match) {
    const before = normalizeWhitespace(match[1] || '');
    const middle = normalizeWhitespace(match[2] || '');
    const after = normalizeWhitespace(match[3] || '');
    const expanded = normalizeWhitespace(`${before} ${middle} ${after}`);
    if (expanded) variants.add(toLowerAscii(expanded));
  }

  // Variant with apostrophes removed entirely
  for (const v of Array.from(variants)) {
    variants.add(v.replace(/['"]/g, ''));
  }

  return Array.from(variants);
}

async function parseCsvRows(csvPath: string): Promise<GradRow[]> {
  const file = await fs.readFile(csvPath, 'utf8');
  const parsed = Papa.parse<GradRow>(file, { header: true, skipEmptyLines: true });
  if (parsed.errors?.length) {
    const first = parsed.errors[0];
    console.warn(`Warning parsing ${csvPath}: ${first.message} (row ${first.row})`);
  }
  return (parsed.data || []).map((r) => ({
    Degree: cleanString(r.Degree),
    Student: cleanString(r.Student),
    Year: cleanString(r.Year),
    Institution: cleanString(r.Institution),
    Department: cleanString(r.Department),
  }));
}

function normalizeDegree(input?: string): string {
  const d = cleanString(input).toUpperCase();
  if (d === 'PHD' || d === 'PH.D' || d === 'PH.D.') return 'PhD';
  if (d === 'MS') return 'MS';
  if (d === 'MSE') return 'MSE';
  if (d === 'MA') return 'MA';
  return cleanString(input);
}

function buildCurrentPosition(
  degree?: string,
  year?: string,
  institution?: string,
  department?: string,
): string {
  const degreeNorm = normalizeDegree(degree);
  const tokens = [degreeNorm, year, institution, department]
    .map((t) => cleanString(t))
    .filter((t) => t.length > 0);
  return tokens.join(', ');
}

function yearToLeaveDate(year?: string): string | undefined {
  if (!year) return undefined;
  const y = String(year).trim();
  if (!/^\d{4}$/.test(y)) return undefined; // skip "In Progress" or invalid
  return `${y}-01-01`;
}

async function findPersonByName(studentName: string): Promise<PersonDoc | null> {
  const nameVariants = generateNameVariants(studentName);
  const q = `*[_type == "person" && lower(name) in $names]{ _id, name, userGroup, currentPosition, leaveDate, title }`;
  const docs: PersonDoc[] = await editorClient.fetch(q, { names: nameVariants });
  if (!docs || docs.length === 0) return null;
  // Prefer alumni, then current
  const byAlumni = docs.find((d) => d.userGroup === 'alumni') || null;
  if (byAlumni) return byAlumni;
  const byCurrent = docs.find((d) => d.userGroup === 'current') || null;
  return byCurrent || docs[0];
}

async function findPersonByApproxName(studentName: string): Promise<PersonDoc | null> {
  // Strip parentheses content for tokenization
  const base = normalizeWhitespace(studentName.replace(/\([^)]*\)/g, ' '));
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;
  const first = toLowerAscii(parts[0]);
  const last = toLowerAscii(parts[parts.length - 1]);
  const patternFirst = `*${first}*`;
  const patternLast = `*${last}*`;
  const q = `*[_type == "person" && lower(name) match $p1 && lower(name) match $p2]{ _id, name, userGroup, currentPosition, leaveDate, title }`;
  const docs: PersonDoc[] = await editorClient.fetch(q, { p1: patternFirst, p2: patternLast });
  if (!docs || docs.length === 0) return null;
  const byAlumni = docs.find((d) => d.userGroup === 'alumni') || null;
  if (byAlumni) return byAlumni;
  const byCurrent = docs.find((d) => d.userGroup === 'current') || null;
  return byCurrent || docs[0];
}

async function runGenerator(
  name: string,
): Promise<{ current_position?: string; description?: string }> {
  return new Promise((resolve) => {
    const child = spawn('npx', ['-y', 'tsx', 'scripts/generate-alumni-bio.ts', name], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += String(d)));
    child.stderr.on('data', (d) => (stderr += String(d)));
    child.on('close', () => {
      try {
        const out = stdout.trim();
        let parsed: any;
        try {
          parsed = JSON.parse(out);
        } catch {
          const matches = out.match(/\{[\s\S]*?\}/g);
          parsed = matches && matches.length ? JSON.parse(matches[matches.length - 1]) : {};
        }
        resolve({ current_position: parsed?.current_position, description: parsed?.description });
      } catch {
        resolve({});
      }
    });
  });
}

function looksLikeDegreePosition(value?: string): boolean {
  if (!value) return false;
  const v = String(value).trim();
  return /^(MS|MSE|MA|PhD|Postdoc)\s*,\s*\d{4}\b/.test(v);
}

async function main() {
  const apply = getFlag('--yes') && !getFlag('--dry-run');

  const csvPaths = [
    path.resolve(process.cwd(), 'csv_files/CV/Graduate MA MS-Table.csv'),
    path.resolve(process.cwd(), 'csv_files/CV/Graduate PhD-Table.csv'),
  ];

  const allRows: GradRow[] = [];
  for (const p of csvPaths) {
    const rows = await parseCsvRows(p);
    allRows.push(...rows);
  }

  const updates: Array<{
    name: string;
    degree: string;
    year?: string;
    institution?: string;
    department?: string;
    currentPosition: string;
    leaveDate?: string;
    person?: PersonDoc | null;
  }> = [];

  for (const row of allRows) {
    const name = cleanString(row.Student);
    if (!name) continue;
    const degree = normalizeDegree(row.Degree);
    if (!degree) continue;
    const year = cleanString(row.Year);
    const institution = cleanString(row.Institution);
    const department = cleanString(row.Department);
    const currentPosition = buildCurrentPosition(degree, year, institution, department);
    const leaveDate = yearToLeaveDate(year);

    updates.push({ name, degree, year, institution, department, currentPosition, leaveDate });
  }

  let matched = 0;
  let written = 0;
  const missing: string[] = [];
  const preview: Array<{
    name: string;
    id?: string;
    before?: { title?: string; currentPosition?: string; leaveDate?: string };
    after: { title: string; currentPosition?: string; leaveDate?: string };
  }> = [];

  for (const upd of updates) {
    let person = await findPersonByName(upd.name);
    if (!person) {
      person = await findPersonByApproxName(upd.name);
    }
    upd.person = person;
    if (!person) {
      missing.push(upd.name);
      continue;
    }
    matched += 1;
    // compute suggested generated currentPosition for alumni if needed during preview
    let suggestedCurrentPosition: string | undefined = undefined;
    if (
      person.userGroup === 'alumni' &&
      (!person.currentPosition || looksLikeDegreePosition(person.currentPosition))
    ) {
      const gen = await runGenerator(person.name);
      if (gen.current_position) suggestedCurrentPosition = gen.current_position.trim();
    }

    preview.push({
      name: person.name,
      id: person._id,
      before: {
        title: person.title,
        currentPosition: person.currentPosition,
        leaveDate: person.leaveDate,
      },
      after: {
        title: upd.currentPosition,
        currentPosition: suggestedCurrentPosition,
        leaveDate: upd.leaveDate,
      },
    });

    if (apply) {
      const set: Record<string, any> = { title: upd.currentPosition };
      if (upd.leaveDate) set.leaveDate = upd.leaveDate;
      if (
        person.userGroup === 'alumni' &&
        (!person.currentPosition || looksLikeDegreePosition(person.currentPosition))
      ) {
        // Try generator to fill currentPosition
        try {
          const gen = await runGenerator(person.name);
          const cp = gen.current_position?.trim();
          if (cp) set.currentPosition = cp;
        } catch {}
      }
      await editorClient.patch(person._id).set(set).commit();
      written += 1;
    }
  }

  // Report
  console.log('Graduate updates (dry-run preview):');
  for (const p of preview) {
    console.log(`- ${p.name} (${p.id})`);
    console.log(`    title: "${p.before?.title || ''}" -> "${p.after.title}"`);
    if (p.after.currentPosition || p.before?.currentPosition) {
      console.log(
        `    currentPosition: "${p.before?.currentPosition || ''}" -> "${p.after.currentPosition || ''}"`,
      );
    }
    if (p.after.leaveDate || p.before?.leaveDate) {
      console.log(`    leaveDate: ${p.before?.leaveDate || ''} -> ${p.after.leaveDate || ''}`);
    }
  }

  console.log('\nSummary:');
  console.log(`  Total CSV rows: ${updates.length}`);
  console.log(`  Matched in Sanity: ${matched}`);
  console.log(`  Unmatched: ${missing.length}`);
  if (missing.length) {
    console.log('  Unmatched names:');
    for (const n of missing) console.log(`   - ${n}`);
  }
  if (apply) {
    console.log(`  Updated docs: ${written}`);
  } else {
    console.log('\n(no changes applied; pass --yes to update)');
  }
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
