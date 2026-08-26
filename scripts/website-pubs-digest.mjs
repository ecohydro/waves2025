#!/usr/bin/env node
/**
 * website-pubs-digest.mjs
 *
 * Read-only weekly check: finds publications on Kelly's Semantic Scholar
 * profile that are NOT yet in the Sanity CMS, and prints them as JSON so a
 * digest can be posted to Slack for approval.
 *
 * This is a dependency-free companion to `npm run ss:upsert-new`. It uses only
 * Node built-ins (global fetch), so it runs anywhere without tsx/esbuild.
 * It performs NO writes. Applying approved items is done separately via the
 * existing `ss:upsert-new -- --apply` script, after human approval.
 *
 * Usage:
 *   node scripts/website-pubs-digest.mjs [--sinceYear 2024] [--json]
 *
 * Env (read from ../.env.local next to the repo root, or process.env):
 *   SEMANTIC_SCHOLAR_AUTHOR_ID   (default 2277507)
 *   SEMANTIC_SCHOLAR_API_KEY     (optional; auto-falls back to public endpoint)
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET   (default production)
 *   SANITY_API_VIEWER_TOKEN | SANITY_API_EDITOR_TOKEN (optional for public reads)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inferResearchAreas } from '../src/lib/cms/research-areas.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

// Load .env.local without overriding anything already in process.env
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

const argv = process.argv.slice(2);
const arg = (flag, def) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : def;
};
const SINCE_YEAR = parseInt(arg('--sinceYear', '2024'), 10);
const AS_JSON = argv.includes('--json');

const AUTHOR_ID = process.env.SEMANTIC_SCHOLAR_AUTHOR_ID || '2277507';
const S2_KEY = process.env.SEMANTIC_SCHOLAR_API_KEY;
const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '6r5yojda';
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const TOKEN = process.env.SANITY_API_VIEWER_TOKEN || process.env.SANITY_API_EDITOR_TOKEN;

const normDoi = (d) => (d ? d.replace(/^https?:\/\/doi\.org\//i, '').trim().toLowerCase() : null);
const normTitle = (t) => (t ? t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() : null);

async function getS2Papers() {
  const fields =
    'title,year,venue,externalIds,publicationDate,authors,openAccessPdf,abstract,publicationVenue';
  const all = [];
  // Paginate so we capture the full profile, not just the first 100.
  for (let offset = 0; offset < 1000; offset += 100) {
    const url =
      `https://api.semanticscholar.org/graph/v1/author/${AUTHOR_ID}/papers` +
      `?fields=${fields}&limit=100&offset=${offset}`;
    let res = await fetch(url, S2_KEY ? { headers: { 'x-api-key': S2_KEY } } : {});
    // Stored key may be expired; fall back to the public endpoint.
    if ((res.status === 401 || res.status === 403) && S2_KEY) {
      res = await fetch(url, {});
    }
    if (!res.ok) throw new Error(`Semantic Scholar ${res.status}: ${await res.text()}`);
    const json = await res.json();
    const batch = json.data || [];
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
}

async function getSanityPubs() {
  const q = encodeURIComponent(
    `*[_type=="publication"]{title,"doi":coalesce(doi,semanticScholar.doi,semanticScholar.externalIds.doi),"paperId":semanticScholar.paperId,year}`
  );
  const url = `https://${PROJECT}.api.sanity.io/v2023-12-19/data/query/${DATASET}?query=${q}`;
  const res = await fetch(url, TOKEN ? { headers: { Authorization: `Bearer ${TOKEN}` } } : {});
  if (!res.ok) throw new Error(`Sanity ${res.status}: ${await res.text()}`);
  return (await res.json()).result || [];
}

const [s2, sanity] = await Promise.all([getS2Papers(), getSanityPubs()]);

const haveDoi = new Set(sanity.map((p) => normDoi(p.doi)).filter(Boolean));
const havePaper = new Set(sanity.map((p) => p.paperId).filter(Boolean));
const haveTitle = new Set(sanity.map((p) => normTitle(p.title)).filter(Boolean));

const candidates = s2
  .filter((p) => (p.year || 0) >= SINCE_YEAR)
  .filter((p) => {
    const doi = normDoi(p.externalIds?.DOI);
    if (doi && haveDoi.has(doi)) return false;
    if (p.paperId && havePaper.has(p.paperId)) return false;
    const t = normTitle(p.title);
    if (t && haveTitle.has(t)) return false;
    return true;
  })
  .map((p) => ({
    title: p.title,
    year: p.year,
    date: p.publicationDate || null,
    venue: p.publicationVenue?.name || p.venue || null,
    doi: p.externalIds?.DOI || null,
    oaPdf: p.openAccessPdf?.url || null,
    authors: (p.authors || []).map((a) => a.name).filter(Boolean),
    // Suggested theme tags, for Kelly to confirm in the approval reply. Nothing is
    // written from here; ss:upsert-new applies the confirmed value.
    suggestedAreas: (() => {
      const s = inferResearchAreas({
        title: p.title,
        abstract: p.abstract,
        venue: p.publicationVenue?.name || p.venue || '',
      });
      return { areas: s.areas, confidence: s.confidence };
    })(),
  }))
  .sort((a, b) => (b.date || String(b.year)).localeCompare(a.date || String(a.year)));

const summary = {
  s2Count: s2.length,
  sanityCount: sanity.length,
  sinceYear: SINCE_YEAR,
  candidateCount: candidates.length,
  candidates,
};

if (AS_JSON) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  console.log(`Semantic Scholar papers: ${s2.length}`);
  console.log(`Sanity publications:     ${sanity.length}`);
  console.log(`New candidates >= ${SINCE_YEAR}: ${candidates.length}`);
  console.log('='.repeat(60));
  for (const c of candidates) {
    console.log(`- ${c.title} (${c.year})`);
    console.log(`  ${c.authors.join(', ')}`);
    console.log(`  ${c.venue || 'venue n/a'}${c.doi ? ` · doi:${c.doi}` : ''}`);
    console.log(
      `  themes: ${c.suggestedAreas.areas.join(', ') || 'NO SUGGESTION - assign by hand'}` +
        ` (${c.suggestedAreas.confidence} confidence)`,
    );
  }
}
