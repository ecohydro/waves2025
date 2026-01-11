#!/usr/bin/env tsx

import dotenv from 'dotenv';
import path from 'path';
import { spawn } from 'child_process';
import { createClient } from '@sanity/client';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

type PersonDoc = {
  _id: string;
  name: string;
  slug?: { current: string };
  userGroup?: string;
  currentPosition?: string;
  title?: string;
  institution?: string;
  bio?: string;
};

// Set up a dedicated Sanity client using the editor token
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

function getValue(name: string): string | undefined {
  const idx = process.argv.indexOf(name);
  if (idx >= 0 && idx + 1 < process.argv.length) return process.argv[idx + 1];
  return undefined;
}

function parseNameFromArgs(): string {
  const argv = process.argv.slice(2);
  const flagsWithValues = new Set(['--model', '--context', '--slug', '--id']);
  const knownFlags = new Set([
    '--use-search',
    '--no-search',
    '--opt-search',
    '--no-opt-search',
    '--reasoning',
    '--model',
    '--context',
    '--slug',
    '--id',
    '--yes',
    '--dry-run',
  ]);
  const nameParts: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (knownFlags.has(token)) {
      if (flagsWithValues.has(token)) i++;
      continue;
    }
    nameParts.push(token);
  }
  return nameParts.join(' ').trim();
}

async function fetchPersonById(id: string): Promise<PersonDoc | null> {
  const q = `*[_type == "person" && _id == $id][0]{_id,name,slug,userGroup,currentPosition,bio}`;
  return (await editorClient.fetch(q, { id })) || null;
}

async function fetchPersonBySlug(slug: string): Promise<PersonDoc | null> {
  const q = `*[_type == "person" && slug.current == $slug][0]{_id,name,slug,userGroup,currentPosition,bio}`;
  return (await editorClient.fetch(q, { slug })) || null;
}

async function fetchPersonByName(name: string): Promise<PersonDoc | null> {
  const q = `*[_type == "person" && lower(name) == lower($name)]{_id,name,slug,userGroup,currentPosition,bio}[0...5]`;
  const docs: PersonDoc[] = await editorClient.fetch(q, { name });
  if (!docs || docs.length === 0) return null;
  if (docs.length === 1) return docs[0];
  // Prefer alumni, then current; else first
  const alumni = docs.find((d) => d.userGroup === 'alumni');
  if (alumni) return alumni;
  const current = docs.find((d) => d.userGroup === 'current');
  if (current) return current;
  return docs[0];
}

async function runGenerator(
  name: string,
): Promise<{ current_position: string; description: string }> {
  return new Promise((resolve, reject) => {
    const args: string[] = ['scripts/generate-alumni-bio.ts'];
    // forward optional flags
    if (getFlag('--use-search')) args.push('--use-search');
    if (getFlag('--no-search')) args.push('--no-search');
    if (getFlag('--opt-search')) args.push('--opt-search');
    if (getFlag('--no-opt-search')) args.push('--no-opt-search');
    if (getFlag('--reasoning')) args.push('--reasoning');
    const model = getValue('--model');
    if (model) args.push('--model', model);
    const context = getValue('--context');
    if (context) args.push('--context', context);
    args.push(name);

    const child = spawn('npx', ['-y', 'tsx', ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += String(d)));
    child.stderr.on('data', (d) => (stderr += String(d)));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(stderr || `Generator exited with code ${code}`));
      }
      try {
        const out = stdout.trim();
        // Attempt strict parse first
        let parsed: any;
        try {
          parsed = JSON.parse(out);
        } catch {
          // Fallback: extract the last JSON object from mixed output
          const matches = out.match(/\{[\s\S]*?\}/g);
          if (!matches || matches.length === 0)
            throw new Error('No JSON found in generator output');
          const last = matches[matches.length - 1];
          parsed = JSON.parse(last);
        }
        resolve(parsed);
      } catch (e) {
        reject(new Error(`Failed to parse generator output: ${e}`));
      }
    });
  });
}

function extractTitleAndInstitution(
  full: string,
  personName: string,
): {
  jobTitle?: string;
  institution?: string;
} {
  const text = full.trim();
  // Remove leading "Name is " if present (case-insensitive)
  const prefix = new RegExp(
    `^\\s*${personName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s+is\\s+`,
    'i',
  );
  const withoutName = text.replace(prefix, '');
  const parts = withoutName.split(/\s+at\s+/i);
  if (parts.length >= 2) {
    const jobTitle = parts[0].trim();
    const institution = parts.slice(1).join(' at ').trim();
    return { jobTitle, institution };
  }
  return {};
}

async function main() {
  const name = parseNameFromArgs();
  const slug = getValue('--slug');
  const id = getValue('--id');
  const apply = getFlag('--yes') && !getFlag('--dry-run');

  if (!name && !slug && !id) {
    console.error(
      'Usage: npm run bio:update -- [--use-search] [--context "hint"] [--slug <slug> | --id <id> | "Full Name"] [--yes]',
    );
    process.exit(1);
  }

  // Locate person doc
  let person: PersonDoc | null = null;
  if (id) person = await fetchPersonById(id);
  if (!person && slug) person = await fetchPersonBySlug(slug);
  if (!person && name) person = await fetchPersonByName(name);

  if (!person) {
    console.error('❌ Person not found in Sanity. Try providing --slug or --id.');
    process.exit(1);
  }

  const displayName = name || person.name;
  const generated = await runGenerator(displayName);
  const nextCurrentPosition = generated.current_position?.trim() || '';
  const nextBio = generated.description?.trim() || '';
  const { jobTitle: nextTitle, institution: nextInstitution } = nextCurrentPosition
    ? extractTitleAndInstitution(nextCurrentPosition, displayName)
    : {};

  console.log('🧾 Proposed update (dry-run preview):');
  console.log(`  Person: ${person.name} (${person._id})`);
  console.log(`  currentPosition:`);
  console.log(`    before: ${person.currentPosition || ''}`);
  console.log(`    after : ${nextCurrentPosition}`);
  if (nextTitle || person.title) {
    console.log('  title:');
    console.log(`    before: ${person.title || ''}`);
    console.log(`    after : ${nextTitle || ''}`);
  }
  if (nextInstitution || person.institution) {
    console.log('  institution:');
    console.log(`    before: ${person.institution || ''}`);
    console.log(`    after : ${nextInstitution || ''}`);
  }
  console.log(`  bio:`);
  console.log(`    before: ${person.bio || ''}`);
  console.log(`    after : ${nextBio}`);

  if (!apply) {
    console.log('\n(no changes applied; pass --yes to update)');
    return;
  }

  const patchSet: Record<string, string> = { currentPosition: nextCurrentPosition, bio: nextBio };
  if (nextTitle) patchSet.title = nextTitle;
  if (nextInstitution) patchSet.institution = nextInstitution;
  const result = await editorClient.patch(person._id).set(patchSet).commit();

  console.log(`✅ Updated Sanity doc ${result._id}`);
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
