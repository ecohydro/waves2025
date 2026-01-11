#!/usr/bin/env tsx

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@sanity/client';

type Pub = {
  _id: string;
  _type: 'publication';
  title?: string;
  publicationType?: string;
  status?: string;
  [key: string]: unknown;
};

function stripSystemFields<T extends Record<string, unknown>>(doc: T): T {
  const copy = { ...doc } as Record<string, unknown>;
  delete copy._rev;
  delete copy._updatedAt;
  delete copy._createdAt;
  return copy as T;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');

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
    perspective: 'previewDrafts',
  });

  const writeClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2023-12-19',
    useCdn: false,
    token: editorToken,
  });

  const toPublishStatus = (await readClient.fetch(
    `*[_type == "publication" && publicationType == "abstract" && status != "published"]{ _id, _type, title, status }`,
  )) as Pub[];

  const draftAbstracts = (await readClient.fetch(
    `*[_id in path('drafts.**') && _type == "publication" && publicationType == "abstract"]`,
  )) as Pub[];

  let statusFixed = 0;
  let draftsPublished = 0;

  for (const p of toPublishStatus) {
    if (verbose) console.log(`[status] ${p._id} ${p.title} -> published`);
    if (!dryRun) await writeClient.patch(p._id).set({ status: 'published' }).commit();
    statusFixed++;
  }

  for (const draft of draftAbstracts) {
    const draftId = draft._id;
    const publishedId = draftId.replace(/^drafts\./, '');
    const content = stripSystemFields({ ...draft, _id: publishedId, status: 'published' });
    if (verbose) console.log(`[publish] ${draftId} -> ${publishedId}`);
    if (!dryRun) {
      await writeClient
        .transaction()
        .createOrReplace(content as Pub)
        .delete(draftId)
        .commit();
    }
    draftsPublished++;
  }

  console.log(
    `Abstracts publish check complete. Status fixed=${statusFixed}, Drafts published=${draftsPublished}`,
  );
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Publish abstracts failed:', err);
    process.exit(1);
  });
}
