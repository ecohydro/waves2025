#!/usr/bin/env node
/**
 * One-off repair: move a stray `image` field on news documents into the
 * schema's `featuredImage` field, and give each one alt text.
 *
 * Seven news documents (2021–2025) arrived with their picture stored under a
 * field named `image`, which the news schema does not define. Studio hides it,
 * the GROQ queries never fetch it, and the News page falls back to the
 * placeholder tile. This script copies the asset reference into
 * `featuredImage`, sets alt text, and unsets `image`.
 *
 * Alt text comes from ALT_BY_ASSET below when the asset is known; otherwise the
 * shared default from src/lib/cms/image-alt.ts is used so nothing publishes
 * with an empty alt.
 *
 * Usage:
 *   node scripts/news-fix-featured-image.mjs            # dry run
 *   node scripts/news-fix-featured-image.mjs --apply    # write to Sanity
 *
 * Env (from .env.local): NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
 * SANITY_API_EDITOR_TOKEN (required for --apply).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';
import { defaultImageAlt } from '../src/lib/cms/image-alt.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

function loadEnv() {
  const p = path.join(REPO_ROOT, '.env.local');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
    }
  }
}
loadEnv();

const APPLY = process.argv.includes('--apply');
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_EDITOR_TOKEN || process.env.SANITY_API_TOKEN;
if (!projectId || !dataset) throw new Error('Sanity project/dataset not set');
if (APPLY && !token) throw new Error('SANITY_API_EDITOR_TOKEN is required for --apply');

const client = createClient({ projectId, dataset, apiVersion: '2023-12-19', useCdn: false, token });

/** Alt text keyed by asset _ref, written after viewing each image. */
const ALT_BY_ASSET = {
  'image-d150b5306b5a6bd0c5a89a491413a69ebb134d41-2340x1212-jpg':
    'Close-up of green grass blades tipped with dew drops, backlit by morning sun',
  'image-f5e2c19276eff225d29da82ecf0a6b3d4a55fc69-2340x1212-jpg':
    'Cross-section of a hillside showing a stand of young trees above layered soil and bedrock',
  'image-fefa97cfb0e7c3ee9946249a32f3a2cc153e4154-1000x631-jpg':
    'City skyline under a hazy orange sky with the sun glaring overhead',
  'image-d5c12c3f8f5087ce0e4b2660ccb117717bf2d658-842x508-png':
    'Aerial view of a bright green algal bloom spreading across a lake beside farmland',
  'image-9c8fd2ecb502fbcae0514e7ffc78dcf10f34854e-2340x1277-jpg':
    'Side-by-side portraits of four smiling researchers, including Anna Boser',
  'image-e05aa684067ece3e41681962a6649446f6f2426f-2340x1212-jpg':
    'Irrigation siphon tubes feeding water from a canal into rows of blooming sunflowers',
  'image-55a4db4b86a30dfd4ea495e37d048ca1a33f60b8-2340x1212-jpg':
    'Desert oasis with palm trees and a small pond surrounded by sand dunes',
};

const docs = await client.fetch(
  `*[_type == "news" && defined(image)]{_id, title, image, featuredImage}`,
);
console.log(`${docs.length} news document(s) with a stray "image" field${APPLY ? '' : ' (dry run)'}\n`);

let tx = client.transaction();
for (const d of docs) {
  const ref = d.image?.asset?._ref;
  if (!ref) {
    console.log(`SKIP  ${d._id}  "${d.title}"  (image has no asset ref)`);
    continue;
  }
  if (d.featuredImage?.asset?._ref) {
    console.log(`SKIP  ${d._id}  "${d.title}"  (featuredImage already set)`);
    continue;
  }
  const alt = ALT_BY_ASSET[ref] || defaultImageAlt(d.title);
  const featuredImage = {
    _type: 'image',
    asset: { _type: 'reference', _ref: ref },
    alt,
    ...(d.image.caption ? { caption: d.image.caption } : {}),
    ...(d.image.credit ? { credit: d.image.credit } : {}),
    ...(d.image.hotspot ? { hotspot: d.image.hotspot } : {}),
    ...(d.image.crop ? { crop: d.image.crop } : {}),
  };
  console.log(`FIX   ${d._id}  "${d.title}"\n      alt: ${alt}${ALT_BY_ASSET[ref] ? '' : '  (default)'}`);
  tx = tx.patch(d._id, (p) => p.set({ featuredImage }).unset(['image']));
}

if (APPLY) {
  const res = await tx.commit();
  console.log(`\nCommitted ${res.results?.length ?? 0} patch(es), transaction ${res.transactionId}`);
} else {
  console.log('\nDry run only. Re-run with --apply to write.');
}
