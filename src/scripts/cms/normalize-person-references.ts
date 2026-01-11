#!/usr/bin/env tsx

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@sanity/client';

type Pub = {
  _id: string;
  title: string;
  authors?: Array<{ _key: string; person?: { _type: 'reference'; _ref: string }; name?: string }>;
};

async function main(): Promise<void> {
  const editorToken = process.env.SANITY_API_EDITOR_TOKEN || process.env.SANITY_API_TOKEN;
  const viewerToken =
    process.env.SANITY_API_VIEWER_TOKEN || editorToken || process.env.SANITY_API_TOKEN;
  if (!editorToken) throw new Error('Missing SANITY_API_EDITOR_TOKEN');

  const readClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2023-12-19',
    useCdn: false,
    token: viewerToken,
    perspective: 'published',
  });
  const writeClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2023-12-19',
    useCdn: false,
    token: editorToken,
    perspective: 'published',
  });

  const pubs = (await readClient.fetch(
    `*[_type=="publication" && defined(authors[])]{ _id, title, authors[]{ _key, person, name } }`,
  )) as Pub[];

  let pubsUpdated = 0;
  let refsFlipped = 0;
  let peoplePublished = 0;

  for (const p of pubs) {
    if (!Array.isArray(p.authors) || p.authors.length === 0) continue;
    let changed = false;
    const newAuthors = [...p.authors];

    for (let i = 0; i < newAuthors.length; i++) {
      const a = newAuthors[i];
      const ref = a.person?._ref;
      if (!ref || !ref.startsWith('drafts.')) continue;

      const draftId = ref;
      const publishedId = ref.replace(/^drafts\./, '');

      // Ensure a published doc exists; if not, publish it by copying draft contents
      const publishedExists = await readClient.fetch(`defined(*[_id==$id][0]._id)`, {
        id: publishedId,
      });
      if (!publishedExists) {
        const draftDoc = await writeClient.fetch(`*[_id==$id][0]`, { id: draftId });
        if (draftDoc) {
          const { _id, _rev, _type, ...rest } = draftDoc;
          await writeClient.createOrReplace({ _id: publishedId, _type: draftDoc._type, ...rest });
          peoplePublished++;
        }
      }

      // Flip reference to published id
      newAuthors[i] = { ...a, person: { _type: 'reference', _ref: publishedId } } as any;
      refsFlipped++;
      changed = true;
    }

    if (changed) {
      await writeClient.patch(p._id).set({ authors: newAuthors }).commit();
      pubsUpdated++;
      // eslint-disable-next-line no-console
      console.log(`✓ Updated author references for ${p._id}`);
    }
  }

  // eslint-disable-next-line no-console
  console.log(
    `Normalization complete. Publications updated=${pubsUpdated}, refs flipped=${refsFlipped}, people published=${peoplePublished}`,
  );
}

if (require.main === module) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Normalize person references failed:', err);
    process.exit(1);
  });
}
