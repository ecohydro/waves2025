#!/usr/bin/env tsx

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { globSync } from 'glob';
import { spawn } from 'child_process';
import matter from 'gray-matter';
import { createClient } from '@sanity/client';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

type Person = {
  _id: string;
  name: string;
  slug?: { current: string };
  title?: string;
  userGroup?: string;
  education?: Array<{ degree?: string; field?: string; institution?: string; year?: number }>;
  leaveDate?: string;
  currentPosition?: string;
  bio?: string;
  keywords?: string[];
  seo?: { keywords?: string[] };
};

// Dedicated editor client
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

function normalizeToken(k: string): string {
  return k
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

function inferInstitution(tokens: Set<string>): string | null {
  const contains = (needle: string) => Array.from(tokens).some((t) => t.includes(needle));
  if (contains('princeton')) return 'Princeton University';
  if (contains('indiana')) return 'Indiana University';
  if (contains('ucsb') || contains('santa_barbara'))
    return 'University of California, Santa Barbara';
  return null;
}

function inferRoleCategory(tokens: Set<string>): 'phd' | 'postdoc' | null {
  const postdoc = ['postdoc', 'postdoctoral_researcher', 'postdoctoral_fellow'];
  const phd = ['phd_graduate', 'graduate_student'];
  if (postdoc.some((t) => tokens.has(t))) return 'postdoc';
  if (phd.some((t) => tokens.has(t))) return 'phd';
  return null;
}

function deriveTokensFromMdx(): Map<string, string[]> {
  const out = new Map<string, string[]>();
  const mdxDir = path.resolve(process.cwd(), 'content/people');
  const files = globSync('*.mdx', { cwd: mdxDir, absolute: true });
  for (const file of files) {
    try {
      const raw = fs.readFileSync(file, 'utf8');
      const fm = matter(raw).data as any;
      const slug: string | undefined = fm.slug || fm.name?.toLowerCase().replace(/\s+/g, '-');
      if (!slug) continue;
      const tokens = new Set<string>();
      const tags: string[] = Array.isArray(fm.tags) ? fm.tags : [];
      for (const t of tags) tokens.add(normalizeToken(String(t)));
      if (fm.status) tokens.add(normalizeToken(String(fm.status)));
      const mapped: string[] = [];
      for (const t of Array.from(tokens)) {
        if (t.includes('postdoc')) mapped.push('postdoc');
        if (t.includes('postdoctoral_fellow')) mapped.push('postdoctoral_fellow');
        if (t.includes('postdoctoral_researcher')) mapped.push('postdoctoral_researcher');
        if (t === 'graduate_student' || t.includes('phd_student')) mapped.push('graduate_student');
        if (t.includes('phd_graduate') || t === 'phd') mapped.push('phd_graduate');
        if (t.includes('princeton')) mapped.push('princeton');
        if (t.includes('indiana')) mapped.push('indiana');
        if (t.includes('ucsb') || t.includes('santa_barbara')) mapped.push('ucsb');
      }
      if (mapped.length > 0) out.set(slug, Array.from(new Set(mapped)));
    } catch {}
  }
  return out;
}

async function fetchAlumni(): Promise<Person[]> {
  const q = `*[_type == "person" && userGroup == "alumni"] | order(leaveDate desc, name asc) {
    _id, name, slug, title, userGroup, education, leaveDate, currentPosition, bio, keywords, seo
  }`;
  return editorClient.fetch(q);
}

async function runGenerator(
  name: string,
  context?: string,
): Promise<{ current_position: string; description: string }> {
  return new Promise((resolve, reject) => {
    const args: string[] = ['scripts/generate-alumni-bio.ts', '--use-search'];
    if (context) {
      args.push('--context', context);
    }
    args.push(name);
    const child = spawn('npx', ['-y', 'tsx', ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += String(d)));
    child.stderr.on('data', (d) => (stderr += String(d)));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) return reject(new Error(stderr || `generator exited ${code}`));
      try {
        // Extract last JSON object in case of logs
        const text = stdout.trim();
        const matches = text.match(/\{[\s\S]*\}/g);
        const payload = matches && matches.length > 0 ? matches[matches.length - 1] : text;
        const parsed = JSON.parse(payload);
        resolve(parsed);
      } catch (e) {
        reject(new Error(`parse error: ${e}`));
      }
    });
  });
}

async function main() {
  const apply = process.argv.includes('--yes') && !process.argv.includes('--dry-run');
  const limitVal = process.argv.includes('--limit')
    ? Number(process.argv[process.argv.indexOf('--limit') + 1])
    : undefined;

  const mdxTokens = deriveTokensFromMdx();
  const people = await fetchAlumni();
  const items: Array<{
    person: Person;
    tokens: Set<string>;
    institution: string | null;
    category: 'phd' | 'postdoc' | null;
  }> = [];

  for (const p of people) {
    const kw =
      p.seo?.keywords && p.seo.keywords.length > 0
        ? p.seo.keywords
        : p.keywords && p.keywords.length > 0
          ? p.keywords
          : p.slug?.current
            ? mdxTokens.get(p.slug.current)
            : undefined;
    const tokens = new Set<string>((kw || []).map(normalizeToken));
    const category = inferRoleCategory(tokens);
    if (!category) continue;
    const institution = inferInstitution(tokens);
    items.push({ person: p, tokens, institution, category });
  }

  const selected = typeof limitVal === 'number' ? items.slice(0, Math.max(0, limitVal)) : items;
  console.log(`Processing ${selected.length} alumni (apply=${apply})`);

  const results: any[] = [];
  for (const { person, institution } of selected) {
    const context = institution || undefined;
    const gen = await runGenerator(person.name, context);
    const nextCurrent = gen.current_position?.trim() || '';
    const nextBio = gen.description?.trim() || '';

    if (apply) {
      await editorClient
        .patch(person._id)
        .set({ currentPosition: nextCurrent, bio: nextBio })
        .commit();
    }

    results.push({
      id: person._id,
      name: person.name,
      slug: person.slug?.current || null,
      currentPositionBefore: person.currentPosition || '',
      bioBefore: person.bio || '',
      currentPositionAfter: nextCurrent,
      descriptionAfter: nextBio,
      updated: !!apply,
    });
    console.log(`Updated: ${person.name}`);
  }

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = path.resolve(process.cwd(), `alumni-updates-${ts}.json`);
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`Report written: ${outPath}`);
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
