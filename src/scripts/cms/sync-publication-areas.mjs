#!/usr/bin/env node
/**
 * sync-publication-areas.mjs
 *
 * Keeps the `researchAreas` theme tags on Sanity publication documents in step with
 * the Area column of the CV export (csv_files/CV/Publications-Table*.csv).
 *
 * Those tags drive the theme filter on /publications and the publication lists on
 * /research/ecohydrology, /research/sensors and /research/cnh, so a missing tag means
 * a paper silently disappears from its theme.
 *
 * The CV is the source of truth. The merge is ADDITIVE by default: every area the CV
 * asserts is added, and an area that exists only in the CMS is left alone. Pass --exact
 * to make the CMS match the CV exactly. Nothing is written without --apply.
 *
 *   npm run cms:sync-areas                    # dry run, prints the diff
 *   npm run cms:sync-areas -- --apply
 *   npm run cms:sync-areas -- --suggest       # also suggest tags for records the CV
 *                                             # does not cover (abstracts, older work)
 *   npm run cms:sync-areas -- --proposals publication-area-proposals.json --apply
 *   npm run cms:sync-areas -- --json area-sync-report.json
 *
 * Dependency-free on purpose: plain node + fetch, no tsx/esbuild, so it runs the same
 * way on a laptop, in CI, and in a sandboxed agent session.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CANONICAL_AREAS,
  AREA_ALIASES,
  mapAreas,
  orderAreas,
  inferResearchAreas,
} from '../../lib/cms/research-areas.mjs';

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const val = (f, d) => {
  const i = args.indexOf(f);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d;
};

const APPLY = has('--apply');
const EXACT = has('--exact');
const SUGGEST = has('--suggest');
const VERBOSE = has('--verbose');
const JSON_OUT = val('--json', null);
const PROPOSALS = val('--proposals', null);

/* ------------------------------------------------------------------ helpers */

function loadEnv() {
  for (const f of ['.env.local', '.env']) {
    const p = path.resolve(process.cwd(), f);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i < 0) continue;
      const k = t.slice(0, i).trim();
      if (!process.env[k]) process.env[k] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    }
  }
}

function parseCSV(text) {
  const rows = [];
  let row = [], cur = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; } else quoted = false;
      } else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n') { row.push(cur); cur = ''; rows.push(row); row = []; }
    else if (c !== '\r') cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

function findCsv() {
  const explicit = val('--csv', null);
  if (explicit) return path.resolve(explicit);
  const dir = path.resolve(process.cwd(), 'csv_files/CV');
  if (!fs.existsSync(dir)) throw new Error(`CV export directory not found: ${dir}`);
  // Numbers exports the sheet as "Publications-Table 1.csv"; tolerate any suffix.
  const matches = fs
    .readdirSync(dir)
    .filter((f) => /^Publications-Table.*\.csv$/i.test(f))
    .map((f) => path.join(dir, f))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  if (!matches.length) throw new Error(`No Publications-Table*.csv found in ${dir}`);
  return matches[0];
}

const normTitle = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/&#\d+;?/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const normDoi = (s) => {
  const t = (s || '').trim();
  if (!t || t === '-') return '';
  return t.toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//, '').replace(/\s+/g, '');
};

const sameList = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

/* ------------------------------------------------------------------- sanity */

function sanityConfig() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const token =
    process.env.SANITY_API_EDITOR_TOKEN ||
    process.env.SANITY_API_TOKEN ||
    process.env.SANITY_API_VIEWER_TOKEN;
  if (!projectId || !dataset) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID / _DATASET');
  if (!token) throw new Error('Missing SANITY_API_EDITOR_TOKEN');
  return { projectId, dataset, token, api: '2023-12-19' };
}

async function query(cfg, groq) {
  const url = `https://${cfg.projectId}.api.sanity.io/v${cfg.api}/data/query/${cfg.dataset}?query=${encodeURIComponent(groq)}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${cfg.token}` } });
  const j = await r.json();
  if (j.error) throw new Error(JSON.stringify(j.error));
  return j.result;
}

async function mutate(cfg, mutations) {
  const url = `https://${cfg.projectId}.api.sanity.io/v${cfg.api}/data/mutate/${cfg.dataset}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ mutations }),
  });
  const j = await r.json();
  if (j.error) throw new Error(JSON.stringify(j.error));
  return j;
}

/* --------------------------------------------------------------------- main */

async function main() {
  loadEnv();
  const cfg = sanityConfig();

  const csvPath = findCsv();
  const rows = parseCSV(fs.readFileSync(csvPath, 'utf8'));
  const header = rows[0];
  const iTitle = header.indexOf('TITLE');
  const iDoi = header.indexOf('DOI');
  const iArea = header.indexOf('Area');
  const iYear = header.indexOf('YEAR');
  const iType = header.indexOf('Type');
  if (iTitle < 0 || iArea < 0) throw new Error(`CSV is missing TITLE/Area columns: ${csvPath}`);

  const cvRows = rows
    .slice(1)
    .filter((r) => (r[iTitle] || '').trim())
    // Bracketed placeholders are unwritten manuscripts tracked in the CV, not publications.
    .filter((r) => !/^\s*\[/.test(r[iTitle]))
    .map((r) => ({
      title: r[iTitle].trim(),
      doi: (r[iDoi] || '').trim(),
      area: (r[iArea] || '').trim(),
      year: (r[iYear] || '').trim(),
      type: (r[iType] || '').trim(),
    }));

  const pubs = await query(
    cfg,
    '*[_type == "publication"]{_id, title, abstract, keywords, doi, publicationType, category, researchAreas, "venue": coalesce(venue.name, semanticScholar.venue.name), "year": coalesce(publishedDate, semanticScholar.publicationDate)}',
  );

  const byDoi = new Map();
  const byTitle = new Map();
  for (const p of pubs) {
    const d = normDoi(p.doi);
    if (d && !byDoi.has(d)) byDoi.set(d, p);
    const t = normTitle(p.title);
    if (t && !byTitle.has(t)) byTitle.set(t, p);
  }

  const report = {
    csv: path.basename(csvPath),
    generatedAt: new Date().toISOString(),
    mode: EXACT ? 'exact' : 'additive',
    applied: APPLY,
    counts: {},
    patches: [],
    unchanged: 0,
    unmatchedCvRows: [],
    unknownAreaValues: [],
    untagged: [],
    suggestions: [],
  };

  const unknownSeen = new Map();
  const matchedIds = new Set();
  const nextAreas = new Map(); // _id -> areas after this run

  /* --- 1. the CV, which wins --------------------------------------------- */
  for (const r of cvRows) {
    const { areas: want, unknown } = mapAreas(r.area);
    for (const u of unknown) unknownSeen.set(u, (unknownSeen.get(u) || 0) + 1);

    let p = null, how = null;
    const d = normDoi(r.doi);
    if (d && byDoi.has(d)) { p = byDoi.get(d); how = 'doi'; }
    if (!p) {
      const t = normTitle(r.title);
      if (t && byTitle.has(t)) { p = byTitle.get(t); how = 'title'; }
    }
    if (!p) {
      report.unmatchedCvRows.push({ year: r.year, type: r.type, area: r.area, doi: r.doi, title: r.title });
      continue;
    }
    matchedIds.add(p._id);
    if (!want.length) continue;

    const got = Array.isArray(p.researchAreas) ? p.researchAreas.filter(Boolean) : [];
    // Collapse legacy spellings already in the CMS onto the controlled list.
    const gotMapped = got.map((g) => AREA_ALIASES[String(g).toLowerCase()] || g);
    const merged = EXACT ? want : [...want, ...gotMapped];
    const ordered = orderAreas(merged);
    nextAreas.set(p._id, ordered);

    if (sameList(ordered, got)) { report.unchanged++; continue; }
    report.patches.push({
      _id: p._id, source: 'cv', matchedBy: how,
      year: String(p.year || r.year || '').slice(0, 4),
      title: p.title, from: got, to: ordered,
    });
  }

  /* --- 2. a reviewed proposals file, for records the CV does not cover ---- */
  if (PROPOSALS) {
    const file = JSON.parse(fs.readFileSync(path.resolve(PROPOSALS), 'utf8'));
    const list = Array.isArray(file) ? file : file.proposals || [];
    const byId = new Map(pubs.map((p) => [p._id, p]));
    for (const prop of list) {
      const p = byId.get(prop._id);
      if (!p) { console.warn(`  proposal for unknown document ${prop._id}, skipped`); continue; }
      // The CV always wins; a proposal only fills a gap the CV left.
      if (nextAreas.has(p._id)) continue;
      const got = Array.isArray(p.researchAreas) ? p.researchAreas.filter(Boolean) : [];
      const ordered = orderAreas([...(prop.areas || []), ...got]);
      if (!ordered.length) continue;
      nextAreas.set(p._id, ordered);
      if (sameList(ordered, got)) { report.unchanged++; continue; }
      report.patches.push({
        _id: p._id, source: 'proposal',
        year: String(p.year || '').slice(0, 4),
        title: p.title, from: got, to: ordered,
      });
    }
  }

  /* --- 3. what is still untagged, and what we would suggest for it -------- */
  for (const p of pubs) {
    const got = Array.isArray(p.researchAreas) ? p.researchAreas.filter(Boolean) : [];
    const effective = nextAreas.get(p._id) || got;
    if (effective.length) continue;
    const row = {
      _id: p._id,
      year: String(p.year || '').slice(0, 4),
      type: p.publicationType || p.category || '',
      venue: p.venue || null,
      inCv: matchedIds.has(p._id),
      title: p.title,
    };
    report.untagged.push(row);
    if (SUGGEST) {
      const s = inferResearchAreas(p);
      report.suggestions.push({ ...row, areas: s.areas, confidence: s.confidence, nonResearch: s.nonResearch });
    }
  }

  report.unknownAreaValues = [...unknownSeen.entries()].map(([value, count]) => ({ value, count }));
  report.counts = {
    cvRows: cvRows.length,
    cmsPublications: pubs.length,
    patches: report.patches.length,
    unchanged: report.unchanged,
    unmatchedCvRows: report.unmatchedCvRows.length,
    untagged: report.untagged.length,
  };
  // Theme distribution after this run, which is what the site will show.
  const dist = {};
  for (const p of pubs) {
    for (const a of nextAreas.get(p._id) || p.researchAreas || []) dist[a] = (dist[a] || 0) + 1;
  }
  report.distribution = dist;

  /* --- output ------------------------------------------------------------ */
  console.log(`CV export      : ${report.csv}`);
  console.log(`Mode           : ${report.mode}${APPLY ? ' (APPLY)' : ' (dry run)'}`);
  console.log(`CV rows        : ${report.counts.cvRows}`);
  console.log(`CMS pubs       : ${report.counts.cmsPublications}`);
  console.log(`Already correct: ${report.unchanged}`);
  console.log(`To patch       : ${report.counts.patches}`);
  console.log(`CV row, no doc : ${report.counts.unmatchedCvRows}`);
  console.log(`Untagged after : ${report.counts.untagged}`);
  console.log(`Distribution   : ${CANONICAL_AREAS.map((a) => `${a}=${dist[a] || 0}`).join('  ')}`);

  if (report.unknownAreaValues.length) {
    console.log('\nUnrecognised Area values in the CV (not written; add them to AREA_ALIASES):');
    for (const u of report.unknownAreaValues) console.log(`  ${u.value} (${u.count})`);
  }
  if (report.unmatchedCvRows.length && VERBOSE) {
    console.log('\nCV rows with no matching publication document:');
    for (const r of report.unmatchedCvRows) {
      console.log(`  ${r.year} ${r.type} [${r.area}] ${r.title.slice(0, 80)}`);
    }
  }
  if (report.patches.length) {
    console.log('\nPatches:');
    for (const p of report.patches) {
      console.log(`  ${p.year} ${p.source.padEnd(8)} [${p.from.join(', ') || '-'}] -> [${p.to.join(', ')}]  ${p.title.slice(0, 70)}`);
    }
  }
  if (SUGGEST && report.suggestions.length) {
    console.log('\nSuggestions for still-untagged records (review before writing):');
    for (const s of report.suggestions) {
      console.log(`  ${s.year} ${s.confidence.padEnd(4)} [${s.areas.join(', ') || 'NO SUGGESTION'}]  ${s.title.slice(0, 70)}`);
    }
  }

  if (JSON_OUT) {
    fs.writeFileSync(JSON_OUT, JSON.stringify(report, null, 2));
    console.log(`\nReport written to ${JSON_OUT}`);
  }

  if (!APPLY) {
    console.log('\nDry run. Re-run with --apply to write these patches.');
    return;
  }
  if (!report.patches.length) {
    console.log('\nNothing to write.');
    return;
  }
  const mutations = report.patches.map((p) => ({ patch: { id: p._id, set: { researchAreas: p.to } } }));
  for (let i = 0; i < mutations.length; i += 50) {
    await mutate(cfg, mutations.slice(i, i + 50));
    console.log(`Wrote ${Math.min(i + 50, mutations.length)}/${mutations.length}`);
  }
  console.log('Done.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e.message || e);
    process.exit(1);
  });
}
