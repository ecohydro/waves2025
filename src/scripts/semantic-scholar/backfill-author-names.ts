#!/usr/bin/env tsx

import { createClient } from '@sanity/client';

type Author = {
  _key?: string;
  person?: { _type: 'reference'; _ref: string };
  name?: string;
  isCorresponding?: boolean;
};

type Pub = {
  _id: string;
  authors?: Author[];
  semanticScholar?: {
    enhancedAuthors?: Array<{ name?: string; semanticScholarId?: string }>;
  };
};

function genKey(): string {
  return Math.random().toString(36).slice(2);
}

async function main(): Promise<void> {
  const editorToken = process.env.SANITY_API_EDITOR_TOKEN || process.env.SANITY_API_TOKEN;
  if (!editorToken) throw new Error('Editor token required');

  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2023-12-19',
    useCdn: false,
    token: editorToken,
  });

  const pubs = (await client.fetch(
    `*[_type == "publication" && count(authors[!defined(person) && !defined(name)]) > 0]{ _id, authors, semanticScholar }`,
  )) as Pub[];

  let fixedCount = 0;
  for (const p of pubs) {
    const authors = Array.isArray(p.authors) ? [...p.authors] : [];
    const ss = p.semanticScholar?.enhancedAuthors || [];
    if (authors.length === 0 || ss.length === 0) continue;

    // If lengths align, use positional backfill for missing entries
    const aligned = authors.length === ss.length;
    let changed = false;

    if (aligned) {
      for (let i = 0; i < authors.length; i++) {
        const a = authors[i];
        if (!a.person && !a.name) {
          const nm = ss[i]?.name;
          if (nm && nm.trim().length > 0) {
            authors[i] = {
              _key: a._key || genKey(),
              name: nm,
              isCorresponding: false,
            };
            changed = true;
          }
        }
      }
    } else {
      // Fallback: fill any empty author slot with the next unused SS name
      const usedNames = new Set(
        authors.map((a) => (a.name || '').toLowerCase().trim()).filter((v) => v.length > 0),
      );
      const ssQueue = ss.map((e) => (e.name || '').trim()).filter((n) => n.length > 0);
      for (let i = 0; i < authors.length && ssQueue.length > 0; i++) {
        const a = authors[i];
        if (!a.person && !a.name) {
          // pick first unused
          const idx = ssQueue.findIndex((n) => !usedNames.has(n.toLowerCase()));
          if (idx >= 0) {
            const nm = ssQueue.splice(idx, 1)[0];
            usedNames.add(nm.toLowerCase());
            authors[i] = { _key: a._key || genKey(), name: nm, isCorresponding: false };
            changed = true;
          }
        }
      }
    }

    if (changed) {
      await client.patch(p._id).set({ authors }).commit();
      fixedCount++;
    }
  }

  console.log(`Backfilled publications: ${fixedCount}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Backfill author names failed:', err);
    process.exit(1);
  });
}
