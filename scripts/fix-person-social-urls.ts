#!/usr/bin/env tsx

import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@sanity/client';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

type SocialMedia = {
  orcid?: string;
  googleScholar?: string;
  researchGate?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
};

type PersonDoc = {
  _id: string;
  name: string;
  socialMedia?: SocialMedia;
};

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID as string;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET as string;
const editorToken = process.env.SANITY_API_EDITOR_TOKEN || process.env.SANITY_API_TOKEN || '';

if (!projectId || !dataset) {
  throw new Error(
    'Missing Sanity project configuration (NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET).',
  );
}

if (!editorToken) {
  console.warn(
    '(warn) SANITY_API_EDITOR_TOKEN not set; writes may fail. Set SANITY_API_EDITOR_TOKEN or SANITY_API_TOKEN in .env.local',
  );
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2023-12-19',
  useCdn: false,
  token: editorToken,
  perspective: 'published',
});

// Raw client to access draft documents by their raw IDs (e.g., "drafts.<id>")
const rawClient = createClient({
  projectId,
  dataset,
  apiVersion: '2023-12-19',
  useCdn: false,
  token: editorToken,
  perspective: 'raw',
});

function getFlag(name: string): boolean {
  return process.argv.includes(name);
}

function isBlank(value: unknown): boolean {
  return !value || (typeof value === 'string' && value.trim() === '');
}

function ensureHttps(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url.replace(/^\/+/, '')}`;
}

function normalizeGithub(value?: string): string | undefined {
  if (isBlank(value)) return undefined;
  const v = String(value).trim();
  if (/^https?:\/\//i.test(v) || /github\.com/i.test(v)) {
    return ensureHttps(v.replace(/\/$/, ''));
  }
  const handle = v.replace(/^@+/, '').replace(/^\/+|\/+$/g, '');
  const first = handle.split(/[\/#?]/)[0];
  if (!first) return undefined;
  return `https://github.com/${encodeURIComponent(first)}`;
}

function normalizeTwitter(value?: string): string | undefined {
  if (isBlank(value)) return undefined;
  const v = String(value).trim();
  if (/^https?:\/\//i.test(v) || /(twitter|x)\.com/i.test(v)) {
    return ensureHttps(v.replace(/\/$/, ''));
  }
  const handle = v.replace(/^@+/, '').replace(/^\/+|\/+$/g, '');
  const first = handle.split(/[\/#?]/)[0];
  if (!first) return undefined;
  return `https://twitter.com/${encodeURIComponent(first)}`;
}

// Keep ORCID stored as bare ID (schema type is string and UI composes URL)
function denormalizeOrcidToId(value?: string): string | undefined {
  if (isBlank(value)) return undefined;
  const v = String(value).trim();
  const m = v.match(/orcid\.org\/?([0-9Xx-]{15,})/i);
  if (m && m[1]) return m[1];
  const id = v.replace(/[^0-9Xx-]/g, '');
  return id || undefined;
}

function normalizeGoogleScholar(value?: string): string | undefined {
  if (isBlank(value)) return undefined;
  const v = String(value).trim();
  if (/^https?:\/\//i.test(v) || /scholar\.google/i.test(v)) {
    return ensureHttps(v);
  }
  // Accept raw query like "user=VGaoB64AAAAJ&hl=en"
  if (/user=/i.test(v)) {
    const query = v.includes('?') ? v.split('?')[1] : v;
    return `https://scholar.google.com/citations?${query.replace(/^\?/, '')}`;
  }
  // If bare value contains stray parameters, keep only the first token as ID
  const idOnly = v.split('&')[0];
  return `https://scholar.google.com/citations?user=${encodeURIComponent(idOnly)}`;
}

function normalizeResearchGate(value?: string): string | undefined {
  if (isBlank(value)) return undefined;
  const v = String(value).trim();
  if (/^https?:\/\//i.test(v) || /researchgate\.net/i.test(v)) {
    return ensureHttps(v);
  }
  const pathPart = v.replace(/^\/+/, '');
  if (/^profile\//i.test(pathPart)) {
    return `https://www.researchgate.net/${pathPart}`;
  }
  return `https://www.researchgate.net/profile/${encodeURIComponent(pathPart)}`;
}

function normalizeLinkedIn(value?: string): string | undefined {
  if (isBlank(value)) return undefined;
  const v = String(value).trim();
  if (/^https?:\/\//i.test(v) || /linkedin\.com/i.test(v)) {
    return ensureHttps(v);
  }
  const pathPart = v.replace(/^\/+|\/+$/g, '');
  if (/^(in|company|school|pub|learning)\//i.test(pathPart)) {
    return `https://www.linkedin.com/${pathPart}`;
  }
  return `https://www.linkedin.com/in/${encodeURIComponent(pathPart)}`;
}

function computeUpdates(s: SocialMedia | undefined): Partial<SocialMedia> {
  const updates: Partial<SocialMedia> = {};
  if (!s) return updates;
  const nextScholar = normalizeGoogleScholar(s.googleScholar);
  const nextRG = normalizeResearchGate(s.researchGate);
  const nextLI = normalizeLinkedIn(s.linkedin);
  const nextGH = normalizeGithub(s.github);
  const nextTW = normalizeTwitter(s.twitter);
  const nextORCID = denormalizeOrcidToId(s.orcid);

  if (nextScholar && nextScholar !== s.googleScholar) updates.googleScholar = nextScholar;
  if (nextRG && nextRG !== s.researchGate) updates.researchGate = nextRG;
  if (nextLI && nextLI !== s.linkedin) updates.linkedin = nextLI;
  if (nextGH && nextGH !== s.github) updates.github = nextGH;
  if (nextTW && nextTW !== s.twitter) updates.twitter = nextTW;
  if (nextORCID && nextORCID !== s.orcid) updates.orcid = nextORCID;
  return updates;
}

async function fetchAllPeople(): Promise<PersonDoc[]> {
  const q = `*[_type == "person"]{_id, name, socialMedia}`;
  return client.fetch(q);
}

async function fetchAllDraftPeople(): Promise<PersonDoc[]> {
  const q = `*[_type == "person" && _id in path("drafts.**")] { _id, name, socialMedia }`;
  return rawClient.fetch(q);
}

async function main() {
  const apply = getFlag('--yes') && !getFlag('--dry-run');
  const [people, draftPeople] = await Promise.all([fetchAllPeople(), fetchAllDraftPeople()]);
  const draftByPublishedId = new Map<string, PersonDoc>();
  for (const d of draftPeople) {
    draftByPublishedId.set(d._id.replace(/^drafts\./, ''), d);
  }
  let changedCount = 0;
  let mutationCount = 0;

  console.log(`Scanning ${people.length} person documents...`);

  const tx = client.transaction();
  const patchedDrafts = new Set<string>();
  for (const p of people) {
    const updates = computeUpdates(p.socialMedia);
    const fields = Object.keys(updates);
    if (fields.length === 0) continue;

    changedCount++;
    console.log(`\n${p.name} (${p._id})`);
    for (const key of fields as Array<keyof SocialMedia>) {
      const before = p.socialMedia?.[key] || '';
      const after = (updates as any)[key];
      console.log(`  ${String(key)}:`);
      console.log(`    before: ${before}`);
      console.log(`    after : ${after}`);
    }

    if (apply) {
      const setObj: Record<string, string> = {};
      if (updates.googleScholar) setObj['socialMedia.googleScholar'] = updates.googleScholar;
      if (updates.researchGate) setObj['socialMedia.researchGate'] = updates.researchGate;
      if (updates.linkedin) setObj['socialMedia.linkedin'] = updates.linkedin;
      if (updates.github) setObj['socialMedia.github'] = updates.github;
      if (updates.twitter) setObj['socialMedia.twitter'] = updates.twitter;
      if (updates.orcid) setObj['socialMedia.orcid'] = updates.orcid;
      tx.patch(p._id, { set: setObj });
      mutationCount++;

      // If a draft exists, patch it using its own values
      const draft = draftByPublishedId.get(p._id);
      if (draft) {
        const draftUpdates = computeUpdates(draft.socialMedia);
        const dFields = Object.keys(draftUpdates);
        if (dFields.length > 0) {
          const dSet: Record<string, string> = {};
          if (draftUpdates.googleScholar)
            dSet['socialMedia.googleScholar'] = draftUpdates.googleScholar;
          if (draftUpdates.researchGate)
            dSet['socialMedia.researchGate'] = draftUpdates.researchGate;
          if (draftUpdates.linkedin) dSet['socialMedia.linkedin'] = draftUpdates.linkedin;
          if (draftUpdates.github) dSet['socialMedia.github'] = draftUpdates.github;
          if (draftUpdates.twitter) dSet['socialMedia.twitter'] = draftUpdates.twitter;
          if (draftUpdates.orcid) dSet['socialMedia.orcid'] = draftUpdates.orcid;
          tx.patch(draft._id, { set: dSet });
          mutationCount++;
          patchedDrafts.add(draft._id);
        }
      }
    }
  }

  // Handle drafts that do not have a published counterpart
  for (const d of draftPeople) {
    if (patchedDrafts.has(d._id)) continue;
    const updates = computeUpdates(d.socialMedia);
    const fields = Object.keys(updates);
    if (fields.length === 0) continue;
    changedCount++;
    console.log(`\n${d.name} (${d._id}) [draft]`);
    for (const key of fields as Array<keyof SocialMedia>) {
      const before = d.socialMedia?.[key] || '';
      const after = (updates as any)[key];
      console.log(`  ${String(key)}:`);
      console.log(`    before: ${before}`);
      console.log(`    after : ${after}`);
    }
    if (apply) {
      const setObj: Record<string, string> = {};
      if (updates.googleScholar) setObj['socialMedia.googleScholar'] = updates.googleScholar;
      if (updates.researchGate) setObj['socialMedia.researchGate'] = updates.researchGate;
      if (updates.linkedin) setObj['socialMedia.linkedin'] = updates.linkedin;
      if (updates.github) setObj['socialMedia.github'] = updates.github;
      if (updates.twitter) setObj['socialMedia.twitter'] = updates.twitter;
      if (updates.orcid) setObj['socialMedia.orcid'] = updates.orcid;
      tx.patch(d._id, { set: setObj });
      mutationCount++;
    }
  }

  if (!apply) {
    console.log(`\n(no changes applied; pass --yes to update)`);
    console.log(`Would update ${changedCount} documents.`);
    return;
  }

  if (mutationCount === 0) {
    console.log('No updates necessary; all profiles look correct.');
    return;
  }

  const res = await tx.commit();
  console.log(`\n✅ Applied ${res?.results?.length || mutationCount} updates.`);
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
