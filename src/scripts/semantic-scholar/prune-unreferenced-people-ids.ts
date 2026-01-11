#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createClient } from '@sanity/client';

type EnhancedAuthor = { name?: string; semanticScholarId?: string };

type FrontMatter = Record<string, unknown> & {
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

function collectReferencedAuthorIds(sourceDir: string): Set<string> {
  const ids = new Set<string>();
  for (const file of listMdxFiles(sourceDir)) {
    try {
      const raw = fs.readFileSync(file, 'utf8');
      const { data } = matter(raw);
      const fm = data as FrontMatter;
      const authors = fm.semanticScholar?.enhancedAuthors || [];
      for (const a of authors) {
        if (a?.semanticScholarId) ids.add(String(a.semanticScholarId));
      }
    } catch {
      // ignore parse errors
    }
  }
  return ids;
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

  if (!viewerToken) console.warn('Warning: No viewer token set; attempting unauthenticated reads.');
  if (!dryRun && !editorToken) throw new Error('Editor token required to apply removals');

  console.log('🔎 Collecting referenced Semantic Scholar author IDs from MDX...');
  const referenced = collectReferencedAuthorIds(sourceDir);
  console.log(`   Referenced IDs: ${referenced.size}`);

  console.log('👥 Fetching people with semanticScholarId...');
  const people = (await readClient.fetch(
    `*[_type == "person" && defined(socialMedia.semanticScholarId)]{ _id, name, socialMedia }`,
  )) as Person[];
  console.log(`   People with IDs: ${people.length}`);

  const toRemove: Array<{ _id: string; name: string; id: string }> = [];

  for (const p of people) {
    const id = p.socialMedia?.semanticScholarId;
    if (!id) continue;
    if (!referenced.has(String(id))) {
      toRemove.push({ _id: p._id, name: p.name, id: String(id) });
    }
  }

  console.log(`\n📊 Summary: unreferenced IDs to remove: ${toRemove.length}`);
  if (toRemove.length > 0) {
    console.log('First 20 candidates:');
    toRemove.slice(0, 20).forEach((r) => console.log(`  - ${r.name}: ${r.id}`));
  }

  if (!dryRun) {
    for (const r of toRemove) {
      await writeClient.patch(r._id).unset(['socialMedia.semanticScholarId']).commit();
      console.log(`🧹 Removed semanticScholarId from ${r.name}`);
    }
  }

  if (reportPath) {
    const out = { referencedCount: referenced.size, peopleWithIds: people.length, toRemove };
    const outPath = path.isAbsolute(reportPath) ? reportPath : path.join(process.cwd(), reportPath);
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
    console.log(`📝 Report written to ${outPath}`);
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Prune unreferenced people IDs failed:', err);
    process.exit(1);
  });
}
