#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createClient } from '@sanity/client';
import { SemanticScholarAPI } from '../../lib/migration/semantic-scholar-working';

type EnhancedAuthor = { name?: string; semanticScholarId?: string };

type FrontMatter = Record<string, unknown> & {
  title?: string;
  semanticScholar?: {
    enhancedAuthors?: EnhancedAuthor[];
  };
};

type Person = {
  _id: string;
  name: string;
  socialMedia?: { semanticScholarId?: string };
};

function listMdxFiles(dir: string): string[] {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((f) => path.join(dir, f));
}

function normalizeName(input?: string): string | null {
  if (!input) return null;
  const s = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\.]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  return s.length > 0 ? s : null;
}

function buildAuthorIndex(sourceDir: string): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();
  for (const file of listMdxFiles(sourceDir)) {
    try {
      const raw = fs.readFileSync(file, 'utf8');
      const { data } = matter(raw);
      const fm = data as FrontMatter;
      const authors = fm.semanticScholar?.enhancedAuthors || [];
      for (const a of authors) {
        const key = normalizeName(a.name);
        const id = a.semanticScholarId && String(a.semanticScholarId);
        if (!key || !id) continue;
        if (!index.has(key)) index.set(key, new Set<string>());
        index.get(key)!.add(id);
      }
    } catch {
      // ignore individual parse errors
    }
  }
  return index;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const get = (flag: string): string | undefined => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };

  const sourceDir = get('--sourceDir') || 'content/publications';
  const dryRun = !args.includes('--apply');
  const reportPath = get('--report');
  const maxApply = get('--max') ? parseInt(String(get('--max')), 10) : undefined;

  if (!fs.existsSync(sourceDir)) throw new Error(`Source directory not found: ${sourceDir}`);

  const viewerToken =
    process.env.SANITY_API_VIEWER_TOKEN ||
    process.env.SANITY_API_EDITOR_TOKEN ||
    process.env.SANITY_API_TOKEN;
  const editorToken = process.env.SANITY_API_EDITOR_TOKEN || process.env.SANITY_API_TOKEN;

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

  if (!viewerToken) {
    console.warn('Warning: No viewer token set. Attempting unauthenticated reads.');
  }
  if (!dryRun && !editorToken) {
    throw new Error('Editor token required to apply updates');
  }

  const doSearch = args.includes('--search');
  const api = new SemanticScholarAPI();

  // Build reverse index: person name -> occurrences in MDX (for basic cross-check)
  const mdxOccurrences = new Map<string, number>();
  for (const file of listMdxFiles(sourceDir)) {
    try {
      const raw = fs.readFileSync(file, 'utf8');
      const { data } = matter(raw);
      const fm = data as FrontMatter;
      const authors = fm.semanticScholar?.enhancedAuthors || [];
      for (const a of authors) {
        const k = normalizeName(a.name);
        if (!k) continue;
        mdxOccurrences.set(k, (mdxOccurrences.get(k) || 0) + 1);
      }
    } catch {}
  }

  console.log('🔎 Building author index from MDX...');
  const authorIndex = buildAuthorIndex(sourceDir);
  console.log(`   Indexed ${authorIndex.size} distinct author names with IDs`);

  console.log('👥 Fetching people from Sanity...');
  const people = (await readClient.fetch(
    `*[_type == "person"]{ _id, name, socialMedia }`,
  )) as Person[];
  console.log(`   Found ${people.length} people`);

  type Row = {
    personId: string;
    name: string;
    currentId?: string;
    proposedId?: string;
    candidates: string[];
    status: 'ok' | 'ambiguous' | 'missing' | 'unchanged';
  };

  const rows: Row[] = [];
  let willUpdate = 0;

  for (const p of people) {
    const key = normalizeName(p.name);
    if (!key) continue;
    const candidates = Array.from(authorIndex.get(key) || []);
    const currentId = p.socialMedia?.semanticScholarId;
    let status: Row['status'] = 'missing';
    let proposedId: string | undefined = undefined;

    if (candidates.length === 0) {
      if (doSearch) {
        const results = await api.searchAuthorsByName(p.name, { limit: 5 });
        if (Array.isArray(results) && results.length > 0) {
          // Prefer exact (case-insensitive) name matches
          const exact = results.filter((r) => normalizeName(r.name) === key);
          const chosen = exact[0] || results[0];
          proposedId = chosen?.authorId;
          status = currentId === proposedId ? 'unchanged' : 'ok';
        } else {
          status = currentId ? 'ok' : 'missing';
        }
      } else {
        status = currentId ? 'ok' : 'missing';
      }
    } else if (candidates.length === 1) {
      proposedId = candidates[0];
      status = currentId === proposedId ? 'unchanged' : 'ok';
    } else {
      // Ambiguous: multiple IDs observed in MDX; try to disambiguate via search rank
      if (doSearch) {
        const results = await api.searchAuthorsByName(p.name, { limit: 5 });
        const preferred = results.find((r) => candidates.includes(String(r.authorId)));
        if (preferred) {
          proposedId = preferred.authorId;
          status = currentId === proposedId ? 'unchanged' : 'ok';
        } else {
          status = 'ambiguous';
        }
      } else {
        status = 'ambiguous';
      }
    }

    rows.push({
      personId: p._id,
      name: p.name,
      currentId,
      proposedId,
      candidates,
      status,
    });

    if (!dryRun && status === 'ok' && proposedId && proposedId !== currentId) {
      if (!maxApply || willUpdate < maxApply) {
        await writeClient
          .patch(p._id)
          .set({ 'socialMedia.semanticScholarId': proposedId })
          .commit();
        willUpdate++;
        console.log(`✅ Set semanticScholarId for ${p.name} -> ${proposedId}`);
      }
    }
  }

  const summary = {
    totalPeople: people.length,
    indexedAuthors: authorIndex.size,
    ok: rows.filter((r) => r.status === 'ok').length,
    unchanged: rows.filter((r) => r.status === 'unchanged').length,
    ambiguous: rows.filter((r) => r.status === 'ambiguous').length,
    missing: rows.filter((r) => r.status === 'missing').length,
    willUpdate,
  };

  console.log('\n📊 Mapping summary');
  console.log(summary);

  if (reportPath) {
    const out = { summary, rows };
    const outPath = path.isAbsolute(reportPath) ? reportPath : path.join(process.cwd(), reportPath);
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
    console.log(`📝 Report written to ${outPath}`);
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Map people author IDs failed:', err);
    process.exit(1);
  });
}
