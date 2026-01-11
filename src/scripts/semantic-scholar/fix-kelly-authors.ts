#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createClient } from '@sanity/client';

type FrontMatter = Record<string, unknown> & {
  title?: string;
  doi?: string;
  semanticScholar?: {
    enhancedAuthors?: Array<{ name?: string; semanticScholarId?: string }>;
  };
};

function listMdxFiles(dir: string): string[] {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((f) => path.join(dir, f));
}

function normalizeDoi(doi?: string): string | undefined {
  if (!doi) return undefined;
  return doi.replace(/^https?:\/\/doi\.org\//i, '').trim();
}

function normName(name?: string): string {
  return (name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\.]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const get = (flag: string): string | undefined => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };

  const sourceDir = get('--sourceDir') || 'content/publications';
  if (!fs.existsSync(sourceDir)) throw new Error(`Source directory not found: ${sourceDir}`);

  const kellySid = process.env.SEMANTIC_SCHOLAR_AUTHOR_ID || '2277507';

  const editorToken = process.env.SANITY_API_EDITOR_TOKEN || process.env.SANITY_API_TOKEN;
  if (!editorToken) throw new Error('Editor token required');
  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2023-12-19',
    useCdn: false,
    token: editorToken,
  });

  const kellyPersonId = await client.fetch(
    `*[_type == "person" && socialMedia.semanticScholarId == $sid][0]._id`,
    { sid: kellySid },
  );
  if (!kellyPersonId) throw new Error('Kelly person not found in Sanity');

  let patched = 0;
  for (const filePath of listMdxFiles(sourceDir)) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(raw);
    const fm = data as FrontMatter;
    const ssAuthors = fm.semanticScholar?.enhancedAuthors || [];
    const hasKellyInMDX = ssAuthors.some((a) => String(a.semanticScholarId) === String(kellySid));
    if (!hasKellyInMDX) continue;

    const doi = normalizeDoi(fm.doi);
    const title = fm.title || '';
    const pubId = doi
      ? await client.fetch(`*[_type=="publication" && defined(doi) && lower(doi)==$d][0]._id`, {
          d: doi.toLowerCase(),
        })
      : await client.fetch(`*[_type=="publication" && lower(title) == $t][0]._id`, {
          t: String(title).toLowerCase(),
        });
    if (!pubId) continue;

    const pub = (await client.fetch(`*[_type=="publication" && _id==$id][0]{ _id, authors }`, {
      id: pubId,
    })) as { _id: string; authors?: Array<{ _key?: string; person?: any; name?: string }> };
    const authors = Array.isArray(pub?.authors) ? [...pub!.authors] : [];
    if (authors.length === 0) continue;

    const unknownIdxs = authors
      .map((a, i) => ({ a, i }))
      .filter(({ a }) => !a.person && !a.name)
      .map(({ i }) => i);
    if (unknownIdxs.length === 0) continue;

    // Determine Kelly's canonical name from MDX SS (prefer full form)
    const kellyName =
      ssAuthors.find((a) => String(a.semanticScholarId) === String(kellySid))?.name ||
      ssAuthors.find((a) => normName(a.name).includes('caylor'))?.name ||
      'Kelly K. Caylor';

    // If Kelly already present by name/person, skip
    const alreadyHasKelly = authors.some(
      (a) =>
        a?.person?._ref === kellyPersonId ||
        (normName(a.name).includes('kelly') && normName(a.name).includes('caylor')),
    );
    if (alreadyHasKelly) continue;

    // Patch the first unknown slot to Kelly
    const idx = unknownIdxs[0];
    authors[idx] = {
      _key: authors[idx]?._key || Math.random().toString(36).slice(2),
      name: kellyName,
      person: { _type: 'reference', _ref: kellyPersonId },
    } as any;

    await client.patch(pubId).set({ authors }).commit();
    patched++;
  }

  console.log(`Patched publications for Kelly: ${patched}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Fix Kelly authors failed:', err);
    process.exit(1);
  });
}
