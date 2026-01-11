#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createClient } from '@sanity/client';

type EnhancedAuthor = { name?: string; semanticScholarId?: string };

function listMdxFiles(dir: string): string[] {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((f) => path.join(dir, f));
}

function normalizeName(input?: string): string {
  const s = (input || '')
    .replace(/"/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\.]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  return s;
}

function extractInitial(name: string): string | null {
  const parts = normalizeName(name).split(' ');
  const first = parts[0];
  return first && first.length > 0 ? first[0] : null;
}

function extractLast(name: string): string | null {
  const parts = normalizeName(name).split(' ');
  const last = parts[parts.length - 1];
  return last || null;
}

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function collectAuthorIndex(sourceDir: string): Array<{ name: string; id: string }> {
  const rows: Array<{ name: string; id: string }> = [];
  for (const file of listMdxFiles(sourceDir)) {
    try {
      const raw = fs.readFileSync(file, 'utf8');
      const { data } = matter(raw);
      const authors = ((data as any)?.semanticScholar?.enhancedAuthors || []) as EnhancedAuthor[];
      for (const a of authors) {
        if (a?.name && a.semanticScholarId) {
          rows.push({ name: a.name, id: String(a.semanticScholarId) });
        }
      }
    } catch {}
  }
  return rows;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const get = (flag: string): string | undefined => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };

  const namesCsv = get('--names');
  const sourceDir = get('--sourceDir') || 'content/publications';
  if (!namesCsv) {
    console.error(
      'Usage: tsx src/scripts/semantic-scholar/create-stub-people.ts --names "Name1,Name2,..." [--sourceDir content/publications]',
    );
    process.exit(1);
  }
  if (!fs.existsSync(sourceDir)) throw new Error(`Source directory not found: ${sourceDir}`);

  const targetNames = namesCsv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const authorRows = collectAuthorIndex(sourceDir);

  const viewerToken =
    process.env.SANITY_API_VIEWER_TOKEN ||
    process.env.SANITY_API_EDITOR_TOKEN ||
    process.env.SANITY_API_TOKEN;
  const editorToken = process.env.SANITY_API_EDITOR_TOKEN || process.env.SANITY_API_TOKEN;
  if (!editorToken) throw new Error('SANITY_API_EDITOR_TOKEN (or SANITY_API_TOKEN) required');

  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2023-12-19',
    useCdn: false,
    token: editorToken,
  });

  // Build quick search helpers
  const normToIds = new Map<string, Set<string>>();
  for (const r of authorRows) {
    const n = normalizeName(r.name);
    if (!normToIds.has(n)) normToIds.set(n, new Set());
    normToIds.get(n)!.add(r.id);
  }

  const results: Array<{ name: string; status: string; id?: string; reason?: string }> = [];

  for (const name of targetNames) {
    const norm = normalizeName(name);
    const last = extractLast(name);
    const firstInit = extractInitial(name);

    // Exact normalized match
    let candidates = Array.from(normToIds.get(norm) || []);

    if (candidates.length === 0 && last && firstInit) {
      // Try fuzzy: same last name and first initial matches
      const possible: Set<string> = new Set();
      for (const [k, ids] of normToIds.entries()) {
        const parts = k.split(' ');
        const kLast = parts[parts.length - 1];
        const kFirstInit = parts[0]?.[0];
        if (kLast === last && kFirstInit === firstInit) {
          ids.forEach((id) => possible.add(id));
        }
      }
      candidates = Array.from(possible);
    }

    if (candidates.length !== 1) {
      results.push({
        name,
        status: 'skipped',
        reason: candidates.length === 0 ? 'no-id-found-in-mdx' : 'ambiguous-ids',
      });
      continue;
    }

    const s2Id = candidates[0];

    // Upsert person doc
    const existingId = await client.fetch(`*[_type == "person" && name match $name][0]._id`, {
      name: `*${name}*`,
    });
    const slug = slugifyName(name);
    const doc: any = {
      _type: 'person',
      name,
      slug: { _type: 'slug', current: slug },
      title: 'PhD Student',
      userGroup: 'current',
      isActive: true,
      socialMedia: { semanticScholarId: s2Id },
    };

    if (existingId) {
      await client
        .patch(existingId)
        .set({
          name,
          slug: { _type: 'slug', current: slug },
          userGroup: 'current',
          'socialMedia.semanticScholarId': s2Id,
        })
        .commit();
      results.push({ name, status: 'updated', id: s2Id });
    } else {
      const created = await client.create(doc);
      results.push({ name, status: 'created', id: s2Id });
    }
  }

  console.log(JSON.stringify({ results }, null, 2));
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Create stub people failed:', err);
    process.exit(1);
  });
}
