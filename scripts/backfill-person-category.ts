#!/usr/bin/env tsx

import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@sanity/client';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

type Person = {
  _id: string;
  name: string;
  title?: string;
  userGroup?: string;
  category?: string;
  seo?: { keywords?: string[] };
  keywords?: string[]; // legacy keywords field (alternate location)
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

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2023-12-19',
  useCdn: false,
  token: editorToken,
});

function normalize(value?: string) {
  return (value || '').toLowerCase();
}

function decideCategory(person: Person): string | undefined {
  const title = normalize(person.title);
  const allKeywords = [...(person.seo?.keywords || []), ...(person.keywords || []), title]
    .filter(Boolean)
    .flatMap((s) => (s || '').split(/[;,]/))
    .map((s) => s.trim().toLowerCase());

  const has = (pattern: string | RegExp) =>
    allKeywords.some((k) => (typeof pattern === 'string' ? k.includes(pattern) : pattern.test(k)));

  // Exclusive, ordered matching
  // 1) Undergraduates first
  if (has('undergraduate')) return 'research-intern';
  // 2) High school students
  if (has('high school') || has('high-school')) return 'high-school-student';
  // 3) Principal Investigator
  if (has('principal investigator') || has(' pi ') || has('professor') || has('director')) {
    return 'principal-investigator';
  }
  // 4) Postdocs
  if (has('postdoc') || has('post-doc') || has('postdoctoral')) return 'postdoc';
  // 5) Graduate students – explicitly exclude undergraduates
  if (
    (has('graduate student') || has('phd') || has('ph.d') || has('ms student') || has('msc')) &&
    !has('undergraduate')
  ) {
    return 'graduate-student';
  }
  // 6) Research staff
  if (has('staff') || has('research scientist') || has('research engineer') || has('technician')) {
    return 'research-staff';
  }
  // 7) Interns (generic catch-all if explicitly labeled as intern but not undergraduate)
  if (has('intern') || has('research intern')) return 'research-intern';
  // 8) Visitors
  if (has('visitor') || has('visiting')) return 'visitor';
  return undefined;
}

async function fetchPeople(): Promise<Person[]> {
  const q = `*[_type == "person"]{_id,name,title,userGroup,category,seo{keywords},keywords}`;
  return client.fetch(q);
}

async function main() {
  const apply = process.argv.includes('--yes') && !process.argv.includes('--dry-run');
  const people = await fetchPeople();
  const updates: Array<{ id: string; category: string }> = [];

  for (const p of people) {
    const next = decideCategory(p);
    if (!next) continue;
    if (p.category === next) continue;
    updates.push({ id: p._id, category: next });
  }

  console.log(`Proposed category updates: ${updates.length}`);
  for (const u of updates.slice(0, 50)) {
    console.log(` - ${u.id}: ${u.category}`);
  }

  if (!apply) {
    console.log('\n(no changes applied; pass --yes to update)');
    return;
  }

  for (const u of updates) {
    await client.patch(u.id).set({ category: u.category }).commit();
    console.log(`✅ Updated ${u.id} → ${u.category}`);
  }
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
