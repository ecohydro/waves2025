#!/usr/bin/env node
/**
 * news-review.mjs
 *
 * The approval half of the Slack news workflow. `news-intake.mjs` turns member
 * messages into drafts; this takes Kelly's word from chat and acts on it.
 *
 * Kelly does not open the Studio. He reads the drafted item in Slack, opens the
 * preview link if he wants to see the rendered page, and replies in plain
 * language. The task running this script turns that reply into a decisions
 * file, and this script performs it.
 *
 * Two modes:
 *
 *   --list                  every intake draft still waiting, as JSON, with the
 *                           full text, the photo, and a preview link. This is
 *                           what the digest is built from.
 *   --file decisions.json   act on Kelly's decisions. Dry run unless --apply.
 *
 * A decision looks like:
 *
 *   { "docId": "news-slack-1786377522-028519", "action": "publish",
 *     "edits": { "title": "A better headline", "category": "award" } }
 *   { "docId": "...", "action": "discard", "reason": "not for the site" }
 *   { "docId": "...", "action": "hold" }
 *
 * Publishing moves the document out of the `drafts.` namespace and sets
 * `status: 'published'` in one transaction, which is what puts it on the page.
 * Discarding deletes the draft, and only ever a draft this pipeline created.
 *
 * Dependency-free Node, built-ins only, for the same reason as the intake: the
 * Cowork workspace has no working tsx.
 *
 * Usage:
 *   npm run news:review -- --list --json
 *   npm run news:review -- --file /tmp/decisions.json            # dry run
 *   npm run news:review -- --file /tmp/decisions.json --apply
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildEditPatch,
  buildPublishMutations,
  canDiscard,
  liveLink,
  previewLink,
  readyToPublish,
  studioLink,
} from './news-intake-core.mjs';

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

const API_VERSION = 'v2023-12-19';
const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '6r5yojda';
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const EDITOR_TOKEN = process.env.SANITY_API_EDITOR_TOKEN || process.env.SANITY_API_TOKEN;
const VIEWER_TOKEN = process.env.SANITY_API_VIEWER_TOKEN || EDITOR_TOKEN;
const PREVIEW_SECRET = process.env.SANITY_PREVIEW_SECRET;
const apiBase = `https://${PROJECT}.api.sanity.io/${API_VERSION}`;

const argv = process.argv.slice(2);
const flagValue = (flag, fallback) => {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const OPTS = {
  list: argv.includes('--list'),
  file: flagValue('--file'),
  stdin: argv.includes('--stdin'),
  apply: argv.includes('--apply'),
  json: argv.includes('--json'),
  site: flagValue('--site', process.env.NEXT_PUBLIC_SITE_URL || 'https://www.waveslab.org'),
  studio: flagValue('--studio', 'https://waveslab.org/studio'),
};

/* -------------------------------------------------------------------------- */
/* Sanity HTTP                                                                */
/* -------------------------------------------------------------------------- */

function scrub(text) {
  return String(text).slice(0, 300).replace(/Bearer\s+\S+/gi, 'Bearer [redacted]');
}

async function query(groq, params = {}) {
  const res = await fetch(`${apiBase}/data/query/${DATASET}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${VIEWER_TOKEN}` },
    body: JSON.stringify({ query: groq, params }),
  });
  if (!res.ok) throw new Error(`Sanity query failed with HTTP ${res.status}: ${scrub(await res.text().catch(() => ''))}`);
  return (await res.json()).result;
}

async function mutate(mutations) {
  const res = await fetch(`${apiBase}/data/mutate/${DATASET}?returnIds=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${EDITOR_TOKEN}` },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) throw new Error(`Sanity mutation failed with HTTP ${res.status}: ${scrub(await res.text().catch(() => ''))}`);
  return res.json();
}

/* -------------------------------------------------------------------------- */
/* Listing what is waiting                                                    */
/* -------------------------------------------------------------------------- */

const PENDING_QUERY = `*[_type == "news" && _id in path("drafts.**") && intake.source == "slack"] | order(publishedAt desc) {
  _id, title, excerpt, content, category, tags, publishedAt, status,
  "slug": slug.current,
  "authorName": author->name,
  "photo": featuredImage.asset->url,
  "photoAlt": featuredImage.alt,
  intake
}`;

async function listPending() {
  const rows = (await query(PENDING_QUERY)) || [];
  return rows.map((row) => {
    const docId = String(row._id).replace(/^drafts\./, '');
    return {
      docId,
      title: row.title,
      excerpt: row.excerpt,
      content: row.content,
      category: row.category,
      tags: row.tags,
      author: row.authorName,
      publishedAt: row.publishedAt,
      slug: row.slug,
      photo: row.photo || null,
      photoAlt: row.photoAlt || null,
      submittedBy: row.intake && row.intake.submittedByName,
      slackPermalink: row.intake && row.intake.slackPermalink,
      capturedAt: row.intake && row.intake.capturedAt,
      previewUrl: row.slug ? previewLink(OPTS.site, row.slug, PREVIEW_SECRET) : null,
      studioUrl: studioLink(OPTS.studio, docId),
    };
  });
}

/* -------------------------------------------------------------------------- */
/* Acting on decisions                                                        */
/* -------------------------------------------------------------------------- */

function readDecisions() {
  const raw = OPTS.stdin
    ? fs.readFileSync(0, 'utf8')
    : OPTS.file
      ? fs.readFileSync(OPTS.file, 'utf8')
      : null;
  if (!raw || !raw.trim()) throw new Error('No input. Pass --file <path> or --stdin, or use --list.');
  const parsed = JSON.parse(raw);
  const decisions = Array.isArray(parsed) ? parsed : parsed.decisions;
  if (!Array.isArray(decisions)) {
    throw new Error('Input must be a JSON array of decisions, or { "decisions": [...] }.');
  }
  return decisions;
}

async function fetchDraft(docId) {
  return query(`*[_id == $id][0]`, { id: `drafts.${docId}` });
}

async function allSlugs() {
  const rows = (await query(`*[_type == "news"]{ "slug": slug.current }`)) || [];
  return new Set(rows.map((r) => r.slug).filter(Boolean));
}

async function handle(decision, slugs) {
  const docId = decision && decision.docId;
  const action = ((decision && decision.action) || 'hold').toLowerCase();
  const out = { docId, action, warnings: [] };

  if (!docId) return { ...out, status: 'rejected', reason: 'no docId on the decision' };
  if (!['publish', 'discard', 'hold'].includes(action)) {
    return { ...out, status: 'rejected', reason: `unknown action "${action}"` };
  }

  const draft = await fetchDraft(docId);
  if (!draft) {
    const published = await query(`*[_id == $id][0]{ _id, "slug": slug.current, status }`, {
      id: docId,
    });
    if (published) {
      return {
        ...out,
        status: 'no-change',
        title: published.title,
        liveUrl: published.slug ? liveLink(OPTS.site, published.slug) : undefined,
        reason: 'already published',
      };
    }
    return { ...out, status: 'rejected', reason: `no draft found for ${docId}` };
  }

  out.title = draft.title;

  if (action === 'hold') {
    return { ...out, status: 'held', reason: decision.reason || 'left for a later run' };
  }

  if (action === 'discard') {
    const allowed = canDiscard(draft);
    if (!allowed.ok) return { ...out, status: 'rejected', reason: allowed.reason };
    if (OPTS.apply) await mutate([{ delete: { id: draft._id } }]);
    return {
      ...out,
      status: OPTS.apply ? 'discarded' : 'would-discard',
      reason: decision.reason || undefined,
    };
  }

  // publish
  let working = draft;
  let changed = [];
  if (decision.edits && Object.keys(decision.edits).length) {
    const patch = buildEditPatch(draft, decision.edits, slugs);
    out.warnings.push(...patch.warnings);
    changed = patch.changed;
    if (changed.length) {
      if (OPTS.apply) await mutate([{ patch: { id: draft._id, set: patch.set } }]);
      working = { ...draft, ...patch.set };
      if (patch.set.slug) slugs.add(patch.set.slug.current);
    }
  }

  const ready = readyToPublish(working);
  if (!ready.ok) {
    return {
      ...out,
      status: 'rejected',
      changed,
      reason: `not ready to publish, missing: ${ready.missing.join(', ')}`,
      studioUrl: studioLink(OPTS.studio, docId),
    };
  }

  const { publishedId, mutations } = buildPublishMutations(working, {
    approvedAt: new Date().toISOString(),
  });
  if (OPTS.apply) await mutate(mutations);

  return {
    ...out,
    status: OPTS.apply ? 'published' : 'would-publish',
    changed,
    title: working.title,
    docId: publishedId,
    liveUrl: liveLink(OPTS.site, working.slug.current),
  };
}

/* -------------------------------------------------------------------------- */
/* Main                                                                       */
/* -------------------------------------------------------------------------- */

async function main() {
  if (!VIEWER_TOKEN) throw new Error('A viewer or editor token is required to read drafts');

  if (OPTS.list) {
    const pending = await listPending();
    console.log(`📋 ${pending.length} item(s) waiting on Kelly`);
    if (!PREVIEW_SECRET) {
      console.log(
        '   (no SANITY_PREVIEW_SECRET set, so no preview links; the digest carries the full text)',
      );
    }
    for (const item of pending) {
      console.log(`\n• ${item.title}`);
      console.log(`  ${item.author || 'unknown author'} · ${item.category} · ${item.docId}`);
      if (item.previewUrl) console.log(`  preview: ${item.previewUrl}`);
    }
    if (OPTS.json) {
      console.log('\n---REVIEW-JSON---');
      console.log(JSON.stringify({ pending }, null, 2));
    }
    return;
  }

  const decisions = readDecisions();
  if (OPTS.apply && !EDITOR_TOKEN) throw new Error('SANITY_API_EDITOR_TOKEN is required to apply');

  const slugs = await allSlugs();
  const results = [];
  for (const decision of decisions) {
    try {
      results.push(await handle(decision, slugs));
    } catch (err) {
      results.push({
        docId: decision && decision.docId,
        action: decision && decision.action,
        status: 'rejected',
        reason: `unexpected failure: ${err.message}`,
        warnings: [],
      });
    }
  }

  const MARKS = {
    published: '🌊',
    'would-publish': '📝',
    discarded: '🗑',
    'would-discard': '🗑',
    held: '⏸',
    'no-change': '⏭️',
    rejected: '⚠️',
  };

  console.log(OPTS.apply ? '' : '  DRY RUN\n');
  for (const r of results) {
    console.log(`${MARKS[r.status] || '⚠️'} [${r.status}] ${r.title || r.docId}`);
    if (r.changed && r.changed.length) console.log(`     edited: ${r.changed.join(', ')}`);
    if (r.liveUrl) console.log(`     live: ${r.liveUrl}`);
    if (r.reason) console.log(`     ${r.reason}`);
    for (const w of r.warnings || []) console.log(`     ⚠︎ ${w}`);
  }

  const tally = (s) => results.filter((r) => r.status === s).length;
  console.log(
    `\n📊 published=${tally('published')} wouldPublish=${tally('would-publish')} ` +
      `discarded=${tally('discarded')} held=${tally('held')} rejected=${tally('rejected')}`,
  );

  if (OPTS.json) {
    console.log('\n---REVIEW-JSON---');
    console.log(JSON.stringify({ apply: OPTS.apply, results }, null, 2));
  }
}

main().catch((err) => {
  console.error(`❌ ${err && err.message ? err.message : String(err)}`);
  process.exit(1);
});
