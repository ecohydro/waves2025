#!/usr/bin/env node
/**
 * news-intake.mjs
 *
 * Slack -> Sanity news intake. Takes news items already drafted from Slack
 * messages and writes each one to Sanity as a DRAFT `news` document.
 *
 * The site renders `status == "published"` only, and every document written
 * here carries both the `drafts.` id prefix and `status: 'draft'`. Nothing this
 * script does can reach waveslab.org on its own. Kelly publishes from the
 * Studio, and that click is the approval step.
 *
 * Reading Slack stays in the Cowork task; writing Sanity stays here. That split
 * is what makes the risky half a plain function of its input, and what makes a
 * rerun over the same messages a no-op instead of a second copy.
 *
 * Dependency-free by design, like `website-pubs-digest.mjs`: Node built-ins
 * only, no tsx, no @sanity/client, so it runs in the Cowork workspace where
 * esbuild does not.
 *
 * An item carrying `correctionTs` (the Slack timestamp of a member's follow-up
 * reply) is treated as a correction to the item already drafted from that
 * message rather than as a new item. Corrections apply only while the document
 * is still a draft, only to fields the intake owns, and only once.
 *
 * Usage:
 *   npm run news:intake -- --file /tmp/news-items.json             # dry run
 *   npm run news:intake -- --file /tmp/news-items.json --apply
 *   cat items.json | npm run news:intake -- --stdin --apply --json
 *
 * Flags:
 *   --file <path>   JSON array of drafted items (see IntakeItem in the core)
 *   --stdin         read the same JSON from stdin instead
 *   --apply         write to Sanity (otherwise dry run)
 *   --json          print a machine-readable block for the Slack digest
 *   --verbose       print the full document for each item
 *   --studio <url>  Studio base for review links (default waveslab.org/studio)
 *
 * Env, from .env.local at the repo root or the environment:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET
 *   SANITY_API_EDITOR_TOKEN   required for --apply
 *   SANITY_API_VIEWER_TOKEN   required always: drafts are invisible to
 *                             unauthenticated reads, and an intake that cannot
 *                             see drafts would redraft every pending item
 *   SLACK_FILE_TOKEN          optional; needed to fetch photos from Slack
 *
 * Exit codes: 0 the run completed, and individual items may still have been
 * rejected (see the report); 1 the run could not complete, so nobody should
 * assume the channel was drained.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildCorrectionPatch,
  buildNewsDocument,
  buildPersonIndex,
  correctionAlreadyApplied,
  docIdForSlackTs,
  matchPerson,
  slugifyTitle,
  studioLink,
  uniqueSlug,
  validateItem,
} from './news-intake-core.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

/** Load .env.local without overriding anything already in the environment. */
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

const API_VERSION = 'v2023-12-19';

/* -------------------------------------------------------------------------- */
/* Args and input                                                             */
/* -------------------------------------------------------------------------- */

const argv = process.argv.slice(2);
const flagValue = (flag, fallback) => {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};

const OPTS = {
  file: flagValue('--file'),
  stdin: argv.includes('--stdin'),
  apply: argv.includes('--apply'),
  json: argv.includes('--json'),
  verbose: argv.includes('--verbose'),
  studio: flagValue('--studio', 'https://waveslab.org/studio'),
};

function readInput() {
  let raw = null;
  if (OPTS.stdin) raw = fs.readFileSync(0, 'utf8');
  else if (OPTS.file) raw = fs.readFileSync(OPTS.file, 'utf8');
  if (!raw || !raw.trim()) {
    throw new Error('No input. Pass --file <path> or --stdin with a JSON array of items.');
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Input is not valid JSON: ${err.message}`);
  }
  const items = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed && parsed.items)
      ? parsed.items
      : null;
  if (!items) throw new Error('Input must be a JSON array of items, or { "items": [...] }.');
  return items;
}

/* -------------------------------------------------------------------------- */
/* Sanity HTTP                                                                */
/* -------------------------------------------------------------------------- */

const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '6r5yojda';
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const EDITOR_TOKEN = process.env.SANITY_API_EDITOR_TOKEN || process.env.SANITY_API_TOKEN;
const VIEWER_TOKEN =
  process.env.SANITY_API_VIEWER_TOKEN || EDITOR_TOKEN || process.env.SANITY_API_TOKEN;

const apiBase = `https://${PROJECT}.api.sanity.io/${API_VERSION}`;

/**
 * Run a GROQ query. An authenticated query has no `perspective` set, which
 * means drafts come back alongside published documents. That is deliberate:
 * deduplication depends on seeing items Kelly has not published yet.
 */
async function query(groq, params = {}) {
  const res = await fetch(`${apiBase}/data/query/${DATASET}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${VIEWER_TOKEN}`,
    },
    body: JSON.stringify({ query: groq, params }),
  });
  if (!res.ok) {
    // The body of a Sanity error carries the request, and the request carries
    // the bearer token. Report the status and the message only.
    const detail = await res.text().catch(() => '');
    const short = detail.slice(0, 300).replace(/Bearer\s+\S+/gi, 'Bearer [redacted]');
    throw new Error(`Sanity query failed with HTTP ${res.status}: ${short}`);
  }
  const json = await res.json();
  return json.result;
}

async function mutate(mutations) {
  const res = await fetch(`${apiBase}/data/mutate/${DATASET}?returnIds=true`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${EDITOR_TOKEN}`,
    },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    const short = detail.slice(0, 300).replace(/Bearer\s+\S+/gi, 'Bearer [redacted]');
    throw new Error(`Sanity mutation failed with HTTP ${res.status}: ${short}`);
  }
  return res.json();
}

async function uploadImageAsset(buffer, filename, contentType) {
  const url = `${apiBase}/assets/images/${DATASET}?filename=${encodeURIComponent(filename)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': contentType || 'application/octet-stream',
      Authorization: `Bearer ${EDITOR_TOKEN}`,
    },
    body: buffer,
  });
  if (!res.ok) {
    throw new Error(`asset upload failed with HTTP ${res.status}`);
  }
  const json = await res.json();
  return json.document._id;
}

/* -------------------------------------------------------------------------- */
/* Existing state                                                             */
/* -------------------------------------------------------------------------- */

async function fetchNewsState() {
  const rows = await query(`*[_type == "news"]{ _id, "ts": intake.slackTs, "slug": slug.current }`);
  const seenTs = new Map();
  const slugs = new Set();
  let drafts = 0;
  for (const row of rows || []) {
    const id = String(row._id);
    const isDraft = id.startsWith('drafts.');
    if (isDraft) drafts += 1;
    if (row.ts) {
      const ts = String(row.ts);
      const entry = seenTs.get(ts) || { docId: id.replace(/^drafts\./, '') };
      if (isDraft) entry.draftId = id;
      else entry.publishedId = id;
      seenTs.set(ts, entry);
    }
    if (row.slug) slugs.add(String(row.slug));
  }
  return { seenTs, slugs, total: (rows || []).length, drafts };
}

async function fetchDoc(id) {
  return query(`*[_id == $id][0]`, { id });
}

async function fetchPeople() {
  return (
    (await query(`*[_type == "person" && defined(name)]{ _id, name, email, slug, userGroup }`)) || []
  );
}

/* -------------------------------------------------------------------------- */
/* Photos                                                                     */
/* -------------------------------------------------------------------------- */

const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.avif': 'image/avif',
};

/**
 * Read the photo bytes.
 *
 * A Slack `url_private` needs a token. Without one Slack answers 200 with an
 * HTML sign-in page, which would upload cleanly and leave a broken image on the
 * page. The content-type check is what catches that.
 */
async function loadImage(image) {
  if (image.path) {
    const buffer = fs.readFileSync(image.path);
    const filename = path.basename(image.path);
    return { buffer, filename, contentType: MIME_BY_EXT[path.extname(filename).toLowerCase()] };
  }
  if (!image.url) throw new Error('image has neither a path nor a url');

  const headers = {};
  if (/slack\.com/i.test(image.url)) {
    if (!process.env.SLACK_FILE_TOKEN) {
      throw new Error('photo sits behind Slack auth and SLACK_FILE_TOKEN is not set in .env.local');
    }
    headers.Authorization = `Bearer ${process.env.SLACK_FILE_TOKEN}`;
  }

  const res = await fetch(image.url, { headers });
  if (!res.ok) throw new Error(`fetching the photo returned HTTP ${res.status}`);
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) {
    throw new Error(
      `photo URL returned ${contentType || 'an unknown content type'} rather than an image` +
        (/slack\.com/i.test(image.url) ? ' (usually an expired or unauthorized Slack token)' : ''),
    );
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const filename = decodeURIComponent(new URL(image.url).pathname.split('/').pop() || 'photo');
  return { buffer, filename, contentType };
}

/* -------------------------------------------------------------------------- */
/* Corrections                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Apply a correction a member posted in the thread under their own update.
 *
 * Three guards, in order: the document must still be a draft, because a
 * published page may already have been shared and read; the correction must be
 * newer than the last one applied, so a rerun changes nothing; and only the
 * fields that actually differ are written, so anything Kelly has already fixed
 * in the Studio survives unless the member changed that same field.
 */
async function applyCorrection(item, existing, ctx, base) {
  const { index, state } = ctx;

  if (existing.publishedId) {
    return {
      ...base,
      status: 'needs-manual-edit',
      docId: existing.docId,
      studioUrl: studioLink(OPTS.studio, existing.docId),
      reason: 'the item is already published, so the correction needs a Studio edit',
    };
  }

  const doc = await fetchDoc(existing.draftId);
  if (!doc) {
    return { ...base, status: 'rejected', reason: `draft ${existing.draftId} could not be read` };
  }
  if (correctionAlreadyApplied(doc, item.correctionTs)) {
    return {
      ...base,
      status: 'no-change',
      docId: existing.docId,
      studioUrl: studioLink(OPTS.studio, existing.docId),
      reason: 'this correction was already applied on an earlier run',
    };
  }

  const validation = validateItem(item);
  if (!validation.ok) {
    return {
      ...base,
      status: 'rejected',
      reason: validation.errors.join('; '),
      warnings: validation.warnings,
    };
  }
  const warnings = [...validation.warnings];

  const relatedPersonIds = [];
  for (const mention of item.relatedPeople || []) {
    const hit = matchPerson(
      index,
      String(mention).includes('@') ? { email: mention } : { name: mention },
    );
    if (hit.status === 'matched') relatedPersonIds.push(hit.person._id);
    else warnings.push(`featured person "${mention}" not linked: no unique person document`);
  }
  const authorId = doc.author && doc.author._ref;
  const related = relatedPersonIds.filter((id) => id !== authorId);

  const patch = buildCorrectionPatch({
    existing: doc,
    normalized: validation.value,
    relatedPersonIds: related,
    correctionTs: String(item.correctionTs),
    takenSlugs: state.slugs,
  });
  warnings.push(...patch.warnings);

  if (item.image) {
    warnings.push(
      'the correction mentions a photo; photo changes are not applied automatically and need a Studio edit',
    );
  }

  if (!patch.changed.length) {
    return {
      ...base,
      status: 'no-change',
      docId: existing.docId,
      studioUrl: studioLink(OPTS.studio, existing.docId),
      warnings,
      reason: 'the correction did not change any field the intake owns',
    };
  }

  if (OPTS.verbose) console.log(JSON.stringify({ patch: existing.draftId, set: patch.set }, null, 2));

  if (OPTS.apply) {
    await mutate([{ patch: { id: existing.draftId, set: patch.set } }]);
    if (patch.set.slug) {
      state.slugs.delete((doc.slug && doc.slug.current) || '');
      state.slugs.add(patch.set.slug.current);
    }
  }

  return {
    ...base,
    title: validation.value.title,
    status: OPTS.apply ? 'corrected' : 'would-correct',
    docId: existing.docId,
    slug: patch.set.slug ? patch.set.slug.current : (doc.slug && doc.slug.current) || undefined,
    category: validation.value.category,
    studioUrl: studioLink(OPTS.studio, existing.docId),
    changed: patch.changed,
    warnings,
  };
}

/* -------------------------------------------------------------------------- */
/* One item                                                                   */
/* -------------------------------------------------------------------------- */

async function processItem(item, ctx) {
  const { index, state, capturedAt } = ctx;

  const base = {
    slackTs: item && item.slackTs,
    submittedBy: item && item.submittedByName,
    title: item && item.title,
    permalink: item && item.slackPermalink,
    status: 'rejected',
    warnings: [],
    photo: 'none',
  };

  // 1. Already in the dataset, published or still a draft.
  const existing = item && item.slackTs ? state.seenTs.get(String(item.slackTs)) : undefined;
  if (existing && !item.correctionTs) {
    return {
      ...base,
      status: 'duplicate',
      docId: existing.docId,
      studioUrl: studioLink(OPTS.studio, existing.docId),
      reason: 'this Slack message already has a news document',
    };
  }
  if (existing) return applyCorrection(item, existing, ctx, base);
  if (item && item.correctionTs) {
    return {
      ...base,
      status: 'rejected',
      reason:
        'this item carries a correction, but no news document exists for that Slack message yet',
    };
  }

  // 2. Shape.
  const validation = validateItem(item);
  if (!validation.ok) {
    return {
      ...base,
      status: 'rejected',
      reason: validation.errors.join('; '),
      warnings: validation.warnings,
    };
  }
  const normalized = validation.value;
  const warnings = [...validation.warnings];

  // 3. Author. Never guessed: a wrong byline is worse than an unfiled item.
  const match = matchPerson(index, { email: item.authorEmail, name: item.authorName });
  if (match.status !== 'matched') {
    const who = item.authorName || item.authorEmail || item.submittedByName || 'unknown';
    const reason =
      match.status === 'ambiguous'
        ? `author "${who}" matches more than one person document: ${match.candidates
            .map((c) => `${c.name} (${c._id})`)
            .join(', ')}`
        : `author "${who}" does not match any person document`;
    return { ...base, status: 'rejected', reason, warnings };
  }
  const author = match.person;
  if (match.how === 'last-initial') {
    warnings.push(`author matched on last name plus first initial only: ${author.name}`);
  }

  // 4. Other people featured in the item. Best effort, never fatal.
  const relatedPersonIds = [];
  for (const mention of item.relatedPeople || []) {
    const hit = matchPerson(index, String(mention).includes('@') ? { email: mention } : { name: mention });
    if (hit.status === 'matched') relatedPersonIds.push(hit.person._id);
    else warnings.push(`featured person "${mention}" not linked: no unique person document`);
  }

  // 5. Slug and id.
  const slug = uniqueSlug(slugifyTitle(normalized.title), state.slugs);
  const docId = docIdForSlackTs(item.slackTs);

  // 6. Photo.
  let imageAssetId;
  let photo = normalized.image ? 'held-back' : item.image ? 'held-back' : 'none';
  if (normalized.image) {
    if (!OPTS.apply) {
      photo = 'attached';
    } else {
      try {
        const { buffer, filename, contentType } = await loadImage(normalized.image);
        imageAssetId = await uploadImageAsset(buffer, filename, contentType);
        photo = 'attached';
      } catch (err) {
        photo = 'failed';
        warnings.push(`photo not attached: ${err.message}`);
      }
    }
  }

  const doc = buildNewsDocument({
    item,
    normalized,
    slug,
    docId,
    author,
    imageAssetId,
    relatedPersonIds,
    capturedAt,
  });

  if (OPTS.verbose) console.log(JSON.stringify(doc, null, 2));

  if (OPTS.apply) {
    await mutate([{ createIfNotExists: doc }]);
  }

  // Claim the slug and the timestamp for the rest of this run, so two items in
  // the same batch cannot collide with each other.
  state.slugs.add(slug);
  state.seenTs.set(String(item.slackTs), docId);

  return {
    ...base,
    title: normalized.title,
    status: OPTS.apply ? 'created' : 'would-create',
    warnings,
    docId,
    slug,
    author: author.name,
    category: normalized.category,
    photo,
    studioUrl: studioLink(OPTS.studio, docId),
  };
}

/* -------------------------------------------------------------------------- */
/* Main                                                                       */
/* -------------------------------------------------------------------------- */

async function main() {
  const items = readInput();

  if (!VIEWER_TOKEN) {
    throw new Error(
      'A viewer or editor token is required. Drafts are invisible to unauthenticated reads, ' +
        'and an intake that cannot see drafts would redraft every pending item.',
    );
  }
  if (OPTS.apply && !EDITOR_TOKEN) {
    throw new Error('SANITY_API_EDITOR_TOKEN is required to apply changes');
  }

  const capturedAt = new Date().toISOString();
  const state = await fetchNewsState();
  const people = await fetchPeople();
  const index = buildPersonIndex(people);

  console.log(
    `📥 ${items.length} item(s) in · ${state.total} news docs (${state.drafts} draft) · ` +
      `${state.seenTs.size} already from Slack · ${index.count} person docs` +
      (OPTS.apply ? '' : ' · DRY RUN'),
  );

  const outcomes = [];
  for (const item of items) {
    try {
      outcomes.push(await processItem(item, { index, state, capturedAt }));
    } catch (err) {
      outcomes.push({
        slackTs: item && item.slackTs,
        submittedBy: item && item.submittedByName,
        title: item && item.title,
        status: 'rejected',
        reason: `unexpected failure: ${err.message}`,
        warnings: [],
      });
    }
  }

  const MARKS = {
    created: '✅',
    'would-create': '📝',
    corrected: '✏️',
    'would-correct': '✏️',
    duplicate: '⏭️',
    'no-change': '⏭️',
    'needs-manual-edit': '🖐',
    rejected: '⚠️',
  };

  console.log('');
  for (const o of outcomes) {
    console.log(`${MARKS[o.status] || '⚠️'} [${o.status}] ${o.title || '(untitled)'}`);
    if (o.author) {
      console.log(`     author: ${o.author}  ·  category: ${o.category}  ·  photo: ${o.photo}`);
    }
    if (o.changed && o.changed.length) console.log(`     changed: ${o.changed.join(', ')}`);
    if (o.slug) console.log(`     slug: ${o.slug}`);
    if (o.studioUrl) console.log(`     review: ${o.studioUrl}`);
    if (o.reason) console.log(`     reason: ${o.reason}`);
    for (const w of o.warnings) console.log(`     ⚠︎ ${w}`);
  }

  const tally = (status) => outcomes.filter((o) => o.status === status).length;
  const counts = {
    created: tally('created'),
    wouldCreate: tally('would-create'),
    corrected: tally('corrected'),
    wouldCorrect: tally('would-correct'),
    duplicate: tally('duplicate'),
    noChange: tally('no-change'),
    needsManualEdit: tally('needs-manual-edit'),
    rejected: tally('rejected'),
  };
  console.log(
    `\n📊 created=${counts.created} wouldCreate=${counts.wouldCreate} ` +
      `corrected=${counts.corrected} wouldCorrect=${counts.wouldCorrect} ` +
      `duplicate=${counts.duplicate} noChange=${counts.noChange} ` +
      `needsManualEdit=${counts.needsManualEdit} rejected=${counts.rejected}`,
  );

  if (OPTS.json) {
    console.log('\n---INTAKE-JSON---');
    console.log(JSON.stringify({ apply: OPTS.apply, counts, items: outcomes }, null, 2));
  }
}

main().catch((err) => {
  // Log the message only. An error object from a Sanity request carries the
  // request headers, and those headers carry the bearer token.
  console.error(`❌ ${err && err.message ? err.message : String(err)}`);
  process.exit(1);
});
