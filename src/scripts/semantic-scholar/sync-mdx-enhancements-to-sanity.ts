#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createClient } from '@sanity/client';

interface FrontMatter {
  title?: string;
  doi?: string;
  abstract?: string;
  keywords?: string[];
  journal?: string;
  publicationDate?: string;
  url?: string;
  semanticScholar?: Record<string, any>;
}

// Prefer explicit viewer/editor tokens with fallback to legacy token
const editorToken =
  process.env.SANITY_API_EDITOR_TOKEN || process.env.SANITY_API_TOKEN || undefined;
const viewerToken =
  process.env.SANITY_API_VIEWER_TOKEN || editorToken || process.env.SANITY_API_TOKEN || undefined;

const sanityReadClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2023-12-19',
  useCdn: false,
  token: viewerToken,
});

const sanityWriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2023-12-19',
  useCdn: false,
  token: editorToken,
});

async function findPublicationIdByDoiOrTitle(doi?: string, title?: string): Promise<string | null> {
  if (doi) {
    const doiClean = doi.replace(/^https?:\/\/doi\.org\//i, '').trim();
    const byDoi = await sanityReadClient.fetch(
      `*[_type == "publication" && defined(doi) && lower(doi) == $doi][0]{ _id }`,
      { doi: doiClean.toLowerCase() },
    );
    if (byDoi?._id) return byDoi._id;
  }
  if (title) {
    const byTitle = await sanityReadClient.fetch(
      `*[_type == "publication" && lower(title) == $title][0]{ _id }`,
      { title: String(title).toLowerCase() },
    );
    if (byTitle?._id) return byTitle._id;
  }
  return null;
}

function listMdxFiles(dir: string): string[] {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((f) => path.join(dir, f));
}

function pruneUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => pruneUndefined(v)).filter((v) => v !== undefined) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue;
      result[k] = pruneUndefined(v as unknown as T) as unknown;
    }
    return result as unknown as T;
  }
  return value;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const get = (flag: string): string | undefined => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };

  const sourceDir = get('--sourceDir') || 'content/publications';
  const dryRun = args.includes('--dry-run');
  const maxCount = get('--max') ? parseInt(String(get('--max')), 10) : undefined;
  const includeSemantic = true; // Always include Semantic Scholar block now that schema supports it

  if (!fs.existsSync(sourceDir)) throw new Error(`Source directory not found: ${sourceDir}`);
  if (!editorToken && !dryRun) {
    throw new Error('SANITY_API_EDITOR_TOKEN (or SANITY_API_TOKEN) is required for live updates');
  }

  const files = listMdxFiles(sourceDir);
  let processed = 0;
  let updated = 0;
  let skipped = 0;

  for (const filePath of files) {
    if (maxCount && processed >= maxCount) break;
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data: fm } = matter(raw);
    const front = fm as FrontMatter;

    const id = await findPublicationIdByDoiOrTitle(front.doi, front.title);
    if (!id) {
      skipped++;
      continue;
    }

    const updates: Record<string, any> = {};
    if (front.abstract) updates.abstract = front.abstract;
    if (Array.isArray(front.keywords) && front.keywords.length > 0)
      updates.keywords = front.keywords;
    if (front.journal) updates.venue = { name: front.journal };
    if (front.publicationDate) updates.publishedDate = front.publicationDate;
    if (front.doi) updates.doi = front.doi.replace(/^https?:\/\/doi\.org\//i, '').trim();
    if (front.url) updates.links = { ...(updates.links || {}), publisher: front.url };

    if (includeSemantic && front.semanticScholar) {
      const s2 = front.semanticScholar || {};
      const authors = Array.isArray(s2.enhancedAuthors)
        ? s2.enhancedAuthors
            .filter((a: any) => a && (a.name || a.semanticScholarId))
            .map((a: any) => ({ name: a.name, authorId: a.semanticScholarId }))
        : undefined;

      updates.semanticScholar = pruneUndefined({
        paperId: s2.paperId,
        url: s2.url,
        publicationTypes: s2.publicationTypes,
        venue: s2.venue,
        isOpenAccess: s2.isOpenAccess,
        authors,
        lastUpdated: s2.lastUpdated,
      });

      const citationCount = s2['citationCount'];
      if (typeof citationCount === 'number') {
        updates.metrics = { ...(updates.metrics || {}), citations: citationCount };
      }
      if (typeof s2['isOpenAccess'] === 'boolean') {
        updates.isOpenAccess = s2['isOpenAccess'];
      }
      if (Array.isArray(s2.keywords) && s2.keywords.length > 0) {
        updates.keywords = Array.from(new Set([...(updates.keywords || []), ...s2.keywords]));
      }
      if (typeof s2.abstract === 'string' && !updates.abstract) {
        updates.abstract = s2.abstract;
      }
    }

    if (Object.keys(updates).length === 0) {
      skipped++;
      continue;
    }

    if (dryRun) {
      console.log(`🧪 [dry-run] Would update Sanity doc ${id} with: ${JSON.stringify(updates)}`);
    } else {
      await sanityWriteClient.patch(id).set(updates).commit();
      console.log(`✅ Updated Sanity doc ${id}`);
      updated++;
    }

    processed++;
  }

  console.log(`\n📊 Sync summary: processed=${processed}, updated=${updated}, skipped=${skipped}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Sync MDX enhancements to Sanity failed:', err);
    process.exit(1);
  });
}
