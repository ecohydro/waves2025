#!/usr/bin/env tsx

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@sanity/client';
import { SemanticScholarAPI } from '../../lib/migration/semantic-scholar-working';
import { decideCategory } from './categorize-publications';
// Shared theme vocabulary + suggestion heuristic, also used by scripts/website-pubs-digest.mjs
// and src/scripts/cms/sync-publication-areas.mjs.
import { inferResearchAreas } from '../../lib/cms/research-areas.mjs';

type S2Author = { name?: string; authorId?: string };

type S2Paper = {
  paperId: string;
  title?: string;
  year?: number;
  url?: string;
  externalIds?: { DOI?: string };
  abstract?: string;
  venue?: string;
  publicationVenue?: { id?: string; name?: string; type?: string };
  fieldsOfStudy?: string[];
  s2FieldsOfStudy?: Array<{ category?: string; source?: string }>;
  publicationTypes?: string[];
  publicationDate?: string;
  citationCount?: number;
  influentialCitationCount?: number;
  referenceCount?: number;
  tldr?: { text?: string };
  isOpenAccess?: boolean;
  openAccessPdf?: { url?: string };
  authors?: S2Author[];
};

type SanityPerson = {
  _id: string;
  name?: string;
  userGroup?: string;
  socialMedia?: { semanticScholarId?: string };
};

type SanityAuthor = {
  _key?: string;
  name?: string;
  person?: { _type?: string; _ref?: string };
  isCorresponding?: boolean;
  [key: string]: unknown;
};

type ExistingPublication = {
  _id: string;
  title?: string;
  slug?: { current?: string };
  authors?: SanityAuthor[];
  publicationType?: string;
  status?: string;
  category?: string;
  venue?: { name?: string };
  arxivId?: string;
  doi?: string;
  publishedDate?: string;
  semanticScholar?: {
    paperId?: string;
    publicationTypes?: string[];
    venue?: { name?: string };
    enhancedAuthors?: Array<Record<string, unknown>>;
    s2FieldsOfStudy?: Array<Record<string, unknown>>;
  };
};

/* -------------------------------------------------------------------------- */
/* Small utilities                                                            */
/* -------------------------------------------------------------------------- */

function normalizeDoi(doi?: string | null): string | null {
  if (!doi) return null;
  return doi
    .replace(/^https?:\/\/doi\.org\//i, '')
    .trim()
    .toLowerCase();
}

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

const SLUG_MAX_BASE_LENGTH = 60;

/**
 * Truncate a slug at a word (hyphen) boundary so we never cut a word in half.
 */
function truncateSlug(base: string, maxLength = SLUG_MAX_BASE_LENGTH): string {
  if (base.length <= maxLength) return base;
  const cut = base.slice(0, maxLength);
  const lastHyphen = cut.lastIndexOf('-');
  const trimmed = lastHyphen > 0 ? cut.slice(0, lastHyphen) : cut;
  return trimmed.replace(/(^-|-$)+/g, '');
}

/**
 * Build a unique slug for a publication. Follows the site convention of
 * `<title-words>-<year>`, and appends a numeric suffix if that is already taken.
 * `takenSlugs` is mutated so slugs created in the same run stay unique.
 */
function buildUniqueSlug(
  title: string | undefined,
  year: number | string | undefined,
  takenSlugs: Set<string>,
): string {
  const base = truncateSlug(slugify(title || 'untitled')) || 'publication';
  const withYear = year ? `${base}-${year}` : base;

  let candidate = withYear;
  let n = 2;
  while (takenSlugs.has(candidate)) {
    candidate = `${withYear}-${n}`;
    n += 1;
  }
  takenSlugs.add(candidate);
  return candidate;
}

/**
 * Deterministic `_key` for an item in a Sanity object array. Sanity requires a
 * unique `_key` on every array-of-objects member; without one the Studio throws
 * "Missing keys" and array patches behave unpredictably.
 */
function arrayKey(prefix: string, index: number, seed?: string): string {
  const suffix = slugify(seed || '').slice(0, 24);
  return suffix ? `${prefix}-${index}-${suffix}` : `${prefix}-${index}`;
}

function withKeys<T extends Record<string, unknown>>(
  items: T[] | undefined,
  prefix: string,
  seedOf: (item: T) => string | undefined,
): Array<T & { _key: string }> | undefined {
  if (!Array.isArray(items) || items.length === 0) return undefined;
  const used = new Set<string>();
  return items.map((item, index) => {
    const existing = typeof item._key === 'string' ? (item._key as string) : '';
    let key = existing && !used.has(existing) ? existing : arrayKey(prefix, index, seedOf(item));
    while (used.has(key)) key = `${key}-x`;
    used.add(key);
    return { ...item, _key: key };
  });
}

function pruneUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((v) => pruneUndefined(v))
      .filter((v) => v !== undefined) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue;
      result[k] = pruneUndefined(v);
    }
    return result as unknown as T;
  }
  return value;
}

/* -------------------------------------------------------------------------- */
/* Author -> person matching                                                  */
/* -------------------------------------------------------------------------- */

function normalizePersonName(input?: string): string | null {
  if (!input) return null;
  const s = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.'’]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  return s.length > 0 ? s : null;
}

/** Key of the form "caylor|k" — last name plus first initial. */
function lastNameFirstInitial(input?: string): string | null {
  const normalized = normalizePersonName(input);
  if (!normalized) return null;
  const parts = normalized.split(' ').filter(Boolean);
  if (parts.length === 0) return null;
  const last = parts[parts.length - 1];
  const firstInitial = parts[0]?.[0] || '';
  if (!last || !firstInitial) return null;
  return `${last}|${firstInitial}`;
}

type PersonIndex = {
  bySemanticScholarId: Map<string, SanityPerson>;
  byFullName: Map<string, SanityPerson[]>;
  byLastInitial: Map<string, SanityPerson[]>;
  count: number;
};

function buildPersonIndex(people: SanityPerson[]): PersonIndex {
  const bySemanticScholarId = new Map<string, SanityPerson>();
  const byFullName = new Map<string, SanityPerson[]>();
  const byLastInitial = new Map<string, SanityPerson[]>();

  for (const person of people) {
    const ssId = person.socialMedia?.semanticScholarId;
    if (ssId) bySemanticScholarId.set(String(ssId), person);

    const full = normalizePersonName(person.name);
    if (full) {
      if (!byFullName.has(full)) byFullName.set(full, []);
      byFullName.get(full)!.push(person);
    }

    const li = lastNameFirstInitial(person.name);
    if (li) {
      if (!byLastInitial.has(li)) byLastInitial.set(li, []);
      byLastInitial.get(li)!.push(person);
    }
  }

  return { bySemanticScholarId, byFullName, byLastInitial, count: people.length };
}

type MatchOutcome =
  | { status: 'matched'; person: SanityPerson; how: 'semanticScholarId' | 'fullName' | 'lastInitial' }
  | { status: 'ambiguous'; candidates: SanityPerson[] }
  | { status: 'none' };

/**
 * Only confident matches are returned. Anything with more than one plausible
 * person is reported as ambiguous and left unlinked for a human to resolve.
 */
function matchAuthorToPerson(
  author: { name?: string; semanticScholarId?: string },
  index: PersonIndex,
): MatchOutcome {
  if (author.semanticScholarId) {
    const hit = index.bySemanticScholarId.get(String(author.semanticScholarId));
    if (hit) return { status: 'matched', person: hit, how: 'semanticScholarId' };
  }

  const full = normalizePersonName(author.name);
  if (full) {
    const hits = index.byFullName.get(full) || [];
    if (hits.length === 1) return { status: 'matched', person: hits[0], how: 'fullName' };
    if (hits.length > 1) return { status: 'ambiguous', candidates: hits };
  }

  const li = lastNameFirstInitial(author.name);
  if (li) {
    const hits = index.byLastInitial.get(li) || [];
    if (hits.length === 1) return { status: 'matched', person: hits[0], how: 'lastInitial' };
    if (hits.length > 1) return { status: 'ambiguous', candidates: hits };
  }

  return { status: 'none' };
}

type LinkStats = {
  linked: number;
  alreadyLinked: number;
  newLinks: Array<{ author: string; person: string; how: string }>;
  ambiguous: Array<{ name: string; candidates: string[] }>;
  unmatched: Set<string>;
};

function newLinkStats(): LinkStats {
  return {
    linked: 0,
    alreadyLinked: 0,
    newLinks: [],
    ambiguous: [],
    unmatched: new Set<string>(),
  };
}

/**
 * Build the `authors` array for a publication: every item gets a `_key`, and
 * every author that confidently matches a person doc gets a `person` reference.
 * Existing `person` references are preserved.
 */
function buildAuthorsArray(
  s2Authors: S2Author[] | undefined,
  index: PersonIndex,
  stats: LinkStats,
  existingAuthors?: SanityAuthor[],
): Array<SanityAuthor & { _key: string }> {
  const existingByName = new Map<string, SanityAuthor>();
  for (const a of existingAuthors || []) {
    const key = normalizePersonName(a?.name);
    if (key && !existingByName.has(key)) existingByName.set(key, a);
  }

  const source: Array<{ name?: string; semanticScholarId?: string; existing?: SanityAuthor }> =
    Array.isArray(s2Authors) && s2Authors.length > 0
      ? s2Authors.map((a) => ({
          name: a?.name,
          semanticScholarId: a?.authorId,
          existing: existingByName.get(normalizePersonName(a?.name) || ''),
        }))
      : (existingAuthors || []).map((a) => ({ name: a?.name, existing: a }));

  const used = new Set<string>();
  const out: Array<SanityAuthor & { _key: string }> = [];

  source.forEach((entry, i) => {
    const name = (entry.name || entry.existing?.name || '').trim();
    if (!name) return;

    const existing = entry.existing;
    let key =
      typeof existing?._key === 'string' && existing._key && !used.has(existing._key)
        ? existing._key
        : arrayKey('author', i, name);
    while (used.has(key)) key = `${key}-x`;
    used.add(key);

    const author: SanityAuthor & { _key: string } = { _key: key, name };
    if (typeof existing?.isCorresponding === 'boolean') {
      author.isCorresponding = existing.isCorresponding;
    }

    if (existing?.person?._ref) {
      author.person = { _type: 'reference', _ref: existing.person._ref };
      stats.alreadyLinked += 1;
      out.push(author);
      return;
    }

    const outcome = matchAuthorToPerson(
      { name, semanticScholarId: entry.semanticScholarId },
      index,
    );
    if (outcome.status === 'matched') {
      author.person = { _type: 'reference', _ref: outcome.person._id };
      stats.linked += 1;
      stats.newLinks.push({
        author: name,
        person: outcome.person.name || outcome.person._id,
        how: outcome.how,
      });
    } else if (outcome.status === 'ambiguous') {
      stats.ambiguous.push({
        name,
        candidates: outcome.candidates.map((c) => `${c.name} (${c._id})`),
      });
    } else {
      stats.unmatched.add(name);
    }

    out.push(author);
  });

  return out;
}

/**
 * Repair an author array that already exists on a document. Author names,
 * ordering and any hand-made edits are left untouched; this only fills in a
 * missing `_key` and a missing `person` reference.
 */
function healExistingAuthors(
  existingAuthors: SanityAuthor[],
  index: PersonIndex,
  stats: LinkStats,
): Array<SanityAuthor & { _key: string }> {
  const used = new Set<string>();

  return existingAuthors.map((author, i) => {
    const name = (author?.name || '').trim();

    let key =
      typeof author?._key === 'string' && author._key && !used.has(author._key)
        ? author._key
        : arrayKey('author', i, name);
    while (used.has(key)) key = `${key}-x`;
    used.add(key);

    const healed: SanityAuthor & { _key: string } = { ...author, _key: key };

    if (healed.person?._ref) {
      stats.alreadyLinked += 1;
      return healed;
    }
    if (!name) return healed;

    const outcome = matchAuthorToPerson({ name }, index);
    if (outcome.status === 'matched') {
      healed.person = { _type: 'reference', _ref: outcome.person._id };
      stats.linked += 1;
      stats.newLinks.push({
        author: name,
        person: outcome.person.name || outcome.person._id,
        how: outcome.how,
      });
    } else if (outcome.status === 'ambiguous') {
      stats.ambiguous.push({
        name,
        candidates: outcome.candidates.map((c) => `${c.name} (${c._id})`),
      });
    } else {
      stats.unmatched.add(name);
    }
    return healed;
  });
}

/* -------------------------------------------------------------------------- */
/* Publication type + document construction                                   */
/* -------------------------------------------------------------------------- */

function mapPublicationType(
  p: S2Paper,
):
  | 'journal-article'
  | 'conference-paper'
  | 'abstract'
  | 'preprint'
  | 'book-chapter'
  | 'book'
  | 'report'
  | 'thesis'
  | 'other' {
  const types = (Array.isArray(p.publicationTypes) ? p.publicationTypes : []).map((t) =>
    String(t).toLowerCase(),
  );
  const venueType = String(p.publicationVenue?.type || '').toLowerCase();
  const venueName = String(p.venue || '').toLowerCase();

  if (types.some((t) => t.includes('journal'))) return 'journal-article';
  if (types.some((t) => t.includes('conference'))) return 'conference-paper';
  if (types.some((t) => t.includes('preprint'))) return 'preprint';
  if (types.some((t) => t.includes('abstract'))) return 'abstract';
  if (types.some((t) => t.includes('book'))) return 'book';
  if (venueType.includes('journal')) return 'journal-article';
  if (venueType.includes('conference')) return 'conference-paper';
  if (venueName.includes('proceedings')) return 'conference-paper';
  return 'other';
}

function buildSanityDocFromS2(
  p: S2Paper,
  opts: { slug: string; personIndex: PersonIndex; linkStats: LinkStats; suggestAreas?: boolean },
) {
  const doiNorm = normalizeDoi(p?.externalIds?.DOI || null);
  const keywords: string[] = [];
  const fs1 = Array.isArray(p.fieldsOfStudy) ? p.fieldsOfStudy.filter(Boolean) : [];
  const fs2 = Array.isArray(p.s2FieldsOfStudy)
    ? (p.s2FieldsOfStudy.map((f) => f?.category).filter(Boolean) as string[])
    : [];
  for (const k of [...fs1, ...fs2]) if (k && !keywords.includes(k)) keywords.push(k);

  const authors = buildAuthorsArray(p.authors, opts.personIndex, opts.linkStats);

  const semanticScholar = {
    paperId: p.paperId,
    url: p.url || undefined,
    doi: doiNorm || undefined,
    externalIds: p.externalIds || undefined,
    abstract: p.abstract || undefined,
    citationCount: p.citationCount || undefined,
    influentialCitationCount: p.influentialCitationCount || undefined,
    referenceCount: p.referenceCount || undefined,
    isOpenAccess: p.isOpenAccess || undefined,
    openAccessPdfUrl: p.openAccessPdf?.url || undefined,
    fieldsOfStudy: p.fieldsOfStudy || undefined,
    s2FieldsOfStudy: withKeys(
      p.s2FieldsOfStudy as Array<Record<string, unknown>> | undefined,
      's2field',
      (f) => String(f.category || ''),
    ),
    publicationTypes: p.publicationTypes || undefined,
    publicationDate: p.publicationDate || undefined,
    tldr: p?.tldr?.text || undefined,
    venue: p.venue ? { name: p.venue, id: p.publicationVenue?.id } : undefined,
    enhancedAuthors: withKeys(
      Array.isArray(p.authors)
        ? p.authors.map((a) => ({ name: a?.name, semanticScholarId: a?.authorId }))
        : undefined,
      'ss-author',
      (a) => String(a.name || ''),
    ),
    lastUpdated: new Date().toISOString(),
    status: 'new',
  };

  const doc: Record<string, unknown> = {
    _type: 'publication',
    title: p.title || 'Untitled',
    slug: { _type: 'slug', current: opts.slug },
    publicationType: mapPublicationType(p),
    authors,
    abstract: p.abstract || undefined,
    keywords: keywords.length > 0 ? keywords : undefined,
    venue: p.venue ? { name: p.venue } : undefined,
    publishedDate: p.publicationDate || (p.year ? `${p.year}-01-01` : undefined),
    doi: doiNorm || undefined,
    links: { publisher: p.url || undefined },
    isOpenAccess: Boolean(p.isOpenAccess),
    semanticScholar,
    status: 'published',
    lastUpdated: new Date().toISOString(),
  };

  // Theme tags drive the /publications area filter and the three /research pages.
  // A publication that arrives without one disappears from its theme, so suggest a
  // value here rather than leaving the field empty. Kelly's CV Area column overrides
  // this later via `npm run cms:sync-areas`.
  if (opts.suggestAreas !== false) {
    const suggestion = inferResearchAreas({
      title: p.title,
      abstract: p.abstract,
      venue: p.venue || p.publicationVenue?.name,
      keywords,
    });
    if (suggestion.areas.length > 0) doc.researchAreas = suggestion.areas;
  }

  doc.category = decideCategory({
    _id: 'pending',
    publicationType: doc.publicationType as string,
    venue: doc.venue as { name?: string } | undefined,
    doi: doiNorm || undefined,
    semanticScholar: {
      publicationTypes: p.publicationTypes,
      venue: semanticScholar.venue,
    },
  });

  return pruneUndefined(doc);
}

/* -------------------------------------------------------------------------- */
/* Sanity lookups                                                             */
/* -------------------------------------------------------------------------- */

type SanityClient = ReturnType<typeof createClient>;

async function fetchExistingKeys(client: SanityClient): Promise<{
  byPaperId: Set<string>;
  byDoi: Set<string>;
  byTitle: Set<string>;
  slugs: Set<string>;
}> {
  const rows = (await client.fetch(
    `*[_type == "publication"]{ 'pid': semanticScholar.paperId, 'doi': select(defined(doi)=>lower(doi), null), 'title': select(defined(title)=>lower(title), null), 'slug': slug.current }`,
  )) as Array<{ pid?: string; doi?: string | null; title?: string | null; slug?: string | null }>;
  const byPaperId = new Set<string>();
  const byDoi = new Set<string>();
  const byTitle = new Set<string>();
  const slugs = new Set<string>();
  for (const r of rows) {
    if (r?.pid) byPaperId.add(String(r.pid));
    if (r?.doi) byDoi.add(String(r.doi));
    if (r?.title) byTitle.add(String(r.title));
    if (r?.slug) slugs.add(String(r.slug));
  }
  return { byPaperId, byDoi, byTitle, slugs };
}

const PUBLICATION_PROJECTION = `{
  _id, title, slug, authors, publicationType, status, category,
  venue, arxivId, doi, publishedDate, semanticScholar
}`;

async function findPublicationId(
  client: SanityClient,
  opts: { paperId?: string; doi?: string | null; title?: string | null },
): Promise<string | null> {
  if (opts.paperId) {
    const id = await client.fetch(
      `*[_type == "publication" && semanticScholar.paperId == $pid][0]._id`,
      { pid: String(opts.paperId) },
    );
    if (id) return id as string;
  }
  if (opts.doi) {
    const id = await client.fetch(`*[_type == "publication" && lower(doi) == $d][0]._id`, {
      d: String(opts.doi).toLowerCase(),
    });
    if (id) return id as string;
  }
  if (opts.title) {
    const id = await client.fetch(`*[_type == "publication" && lower(title) == $t][0]._id`, {
      t: String(opts.title).toLowerCase(),
    });
    if (id) return id as string;
  }
  return null;
}

async function fetchPeople(client: SanityClient): Promise<SanityPerson[]> {
  return (await client.fetch(
    `*[_type == "person" && defined(name)]{ _id, name, userGroup, socialMedia }`,
  )) as SanityPerson[];
}

/* -------------------------------------------------------------------------- */
/* Healing an existing publication document                                   */
/* -------------------------------------------------------------------------- */

function authorsNeedRepair(
  current: SanityAuthor[] | undefined,
  next: Array<SanityAuthor & { _key: string }>,
): boolean {
  if (!Array.isArray(current)) return next.length > 0;
  if (current.length !== next.length) return true;
  for (let i = 0; i < next.length; i += 1) {
    const a = current[i];
    const b = next[i];
    if (!a?._key || a._key !== b._key) return true;
    if ((a.name || '') !== (b.name || '')) return true;
    if ((a.person?._ref || '') !== (b.person?._ref || '')) return true;
  }
  return false;
}

/**
 * Backfill anything a publication doc is missing: slug, author `_key`s,
 * person references, publicationType, status and category. Never overwrites a
 * value that is already set (except author arrays, which are rebuilt in place
 * while preserving existing keys and links).
 */
function buildHealPatch(
  pub: ExistingPublication,
  opts: {
    s2Paper?: S2Paper;
    personIndex: PersonIndex;
    linkStats: LinkStats;
    takenSlugs: Set<string>;
  },
): Record<string, unknown> {
  const patch: Record<string, unknown> = {};

  if (!pub.publicationType && opts.s2Paper) {
    patch.publicationType = mapPublicationType(opts.s2Paper);
  }
  if (!pub.status) patch.status = 'published';

  if (!pub.slug?.current) {
    const year =
      opts.s2Paper?.year ||
      (pub.publishedDate ? Number(String(pub.publishedDate).slice(0, 4)) : undefined);
    patch.slug = {
      _type: 'slug',
      current: buildUniqueSlug(pub.title || opts.s2Paper?.title, year, opts.takenSlugs),
    };
  }

  // Existing author arrays are repaired in place rather than resynced from
  // Semantic Scholar, so curated names and ordering survive. S2 is only used
  // to populate an author array that is missing or empty.
  const hasAuthors = Array.isArray(pub.authors) && pub.authors.length > 0;
  const nextAuthors = hasAuthors
    ? healExistingAuthors(pub.authors as SanityAuthor[], opts.personIndex, opts.linkStats)
    : buildAuthorsArray(opts.s2Paper?.authors, opts.personIndex, opts.linkStats);
  if (nextAuthors.length > 0 && authorsNeedRepair(pub.authors, nextAuthors)) {
    patch.authors = nextAuthors;
  }

  // Object arrays nested under semanticScholar also need `_key` values.
  const enhancedAuthors = pub.semanticScholar?.enhancedAuthors;
  if (Array.isArray(enhancedAuthors) && enhancedAuthors.some((a) => !a?._key)) {
    patch['semanticScholar.enhancedAuthors'] = withKeys(enhancedAuthors, 'ss-author', (a) =>
      String(a.name || ''),
    );
  }
  const s2Fields = pub.semanticScholar?.s2FieldsOfStudy;
  if (Array.isArray(s2Fields) && s2Fields.some((f) => !f?._key)) {
    patch['semanticScholar.s2FieldsOfStudy'] = withKeys(s2Fields, 's2field', (f) =>
      String(f.category || ''),
    );
  }

  if (!pub.category || pub.category === 'unknown') {
    const decided = decideCategory({
      _id: pub._id,
      publicationType: (patch.publicationType as string) || pub.publicationType,
      venue: pub.venue,
      arxivId: pub.arxivId,
      doi: pub.doi,
      semanticScholar: pub.semanticScholar,
      category: pub.category,
    });
    if (decided !== pub.category) patch.category = decided;
  }

  return patch;
}

/* -------------------------------------------------------------------------- */
/* CLI                                                                        */
/* -------------------------------------------------------------------------- */

function parseArgs() {
  const argv = process.argv.slice(2);
  const get = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  return {
    authorId: get('--authorId') || process.env.SEMANTIC_SCHOLAR_AUTHOR_ID || '2277507',
    sinceYear: get('--sinceYear') ? parseInt(get('--sinceYear') as string, 10) : 2024,
    limit: get('--limit') ? parseInt(get('--limit') as string, 10) : 200,
    apply: argv.includes('--apply'),
    verbose: argv.includes('--verbose') || argv.includes('-v'),
    noAuth: argv.includes('--no-auth'),
    heal: !argv.includes('--no-heal'),
    healAll: argv.includes('--heal-all'),
    noLink: argv.includes('--no-link'),
    // Suppress the suggested researchAreas on newly created documents.
    noAreas: argv.includes('--no-areas'),
  } as const;
}

async function main() {
  const { authorId, sinceYear, limit, apply, verbose, noAuth, heal, healAll, noLink, noAreas } =
    parseArgs();

  if (noAuth) {
    process.env.SEMANTIC_SCHOLAR_DISABLE_API_KEY = 'true';
  }

  const editorToken = process.env.SANITY_API_EDITOR_TOKEN || process.env.SANITY_API_TOKEN;
  const viewerToken =
    process.env.SANITY_API_VIEWER_TOKEN || editorToken || process.env.SANITY_API_TOKEN;

  if (!viewerToken) {
    console.warn('Warning: Missing SANITY_API_VIEWER_TOKEN; attempting unauthenticated reads.');
  }
  if (apply && !editorToken) {
    throw new Error('Editor token required to apply changes');
  }

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
  });

  const api = new SemanticScholarAPI();

  if (verbose) {
    console.log('Config:');
    console.log({ authorId, sinceYear, limit, apply, noAuth, heal, healAll, noLink });
  }

  const keys = await fetchExistingKeys(readClient);
  if (verbose) {
    console.log(
      `Existing keys → paperIds=${keys.byPaperId.size}, dois=${keys.byDoi.size}, titles=${keys.byTitle.size}, slugs=${keys.slugs.size}`,
    );
  }

  const people = noLink ? [] : await fetchPeople(readClient);
  const personIndex = buildPersonIndex(people);
  if (!noLink) {
    console.log(`👥 Loaded ${personIndex.count} person docs for author linking`);
  }
  const linkStats = newLinkStats();

  console.log(`🔎 Fetching recent papers for author ${authorId} from Semantic Scholar...`);
  const resp: unknown = await api.getAuthorPapers(authorId, {
    fields:
      'paperId,title,year,externalIds,venue,publicationVenue,url,abstract,fieldsOfStudy,s2FieldsOfStudy,publicationTypes,publicationDate,isOpenAccess,openAccessPdf,authors',
    limit,
  });
  // `getAuthorPapers` swallows network and API errors and returns null. Treating
  // that as "no new papers" would make an outage indistinguishable from a quiet
  // week, so fail loudly instead — the exit code is what an unattended run has
  // to rely on.
  if (!resp || !Array.isArray((resp as { data?: unknown })?.data)) {
    throw new Error(
      `Semantic Scholar returned no usable response for author ${authorId}. ` +
        'This is a fetch failure, not an empty result — see the logged error above. ' +
        'No documents were created or patched.',
    );
  }
  const papers: S2Paper[] = (resp as { data: S2Paper[] }).data;
  const recent = papers.filter((p) => (p.year ? Number(p.year) >= sinceYear : true));

  if (verbose)
    console.log(`Total fetched=${papers.length}, recent>=${sinceYear} → ${recent.length}`);

  const candidates: Array<{ status: 'missing' | 'exists'; reason?: string; paper: S2Paper }> = [];
  for (const p of recent) {
    const doiNorm = normalizeDoi(p?.externalIds?.DOI || null);
    const titleNorm = (p?.title || '').toLowerCase().trim() || null;

    const hasPid = keys.byPaperId.has(String(p.paperId));
    const hasDoi = doiNorm ? keys.byDoi.has(doiNorm) : false;
    const hasTitle = titleNorm ? keys.byTitle.has(titleNorm) : false;

    if (hasPid || hasDoi || hasTitle) {
      const reason = hasPid ? 'paperId' : hasDoi ? 'doi' : 'title';
      candidates.push({ status: 'exists', reason, paper: p });
    } else {
      candidates.push({ status: 'missing', paper: p });
    }
  }

  const missing = candidates.filter((c) => c.status === 'missing').map((c) => c.paper);

  console.log(
    JSON.stringify(
      {
        authorId,
        sinceYear,
        fetched: papers.length,
        recent: recent.length,
        missingCandidates: missing.length,
      },
      null,
      2,
    ),
  );

  let created = 0;
  let healed = 0;

  const healExisting = async (
    target: string | ExistingPublication,
    s2Paper?: S2Paper,
  ): Promise<void> => {
    const pub =
      typeof target === 'string'
        ? ((await readClient.fetch(
            `*[_type=='publication' && _id==$id][0]${PUBLICATION_PROJECTION}`,
            { id: target },
          )) as ExistingPublication | null)
        : target;
    if (!pub) return;
    const existingId = pub._id;

    const patch = buildHealPatch(pub, {
      s2Paper,
      personIndex,
      linkStats,
      takenSlugs: keys.slugs,
    });
    if (Object.keys(patch).length === 0) {
      if (verbose) console.log(`   No patch needed for ${existingId}`);
      return;
    }

    const summary = Object.keys(patch)
      .map((k) => (k === 'authors' ? `authors(${(patch.authors as unknown[]).length})` : k))
      .join(', ');

    healed += 1;
    if (apply) {
      await writeClient.patch(existingId).set(patch).commit();
      console.log(`🔧 Patched ${existingId} → ${summary}`);
    } else {
      console.log(`🧪 [dry-run] Would patch ${existingId} → ${summary}`);
    }
  };

  for (const p of missing) {
    const doiNorm = normalizeDoi(p?.externalIds?.DOI || null);
    const titleNorm = (p?.title || '').toLowerCase().trim() || null;
    const existingId = await findPublicationId(readClient, {
      paperId: String(p.paperId),
      doi: doiNorm,
      title: titleNorm,
    });
    if (existingId) {
      if (verbose) console.log(`⏭️  Found existing → ${existingId} | ${p.title}`);
      if (heal) await healExisting(existingId, p);
      continue;
    }

    const slug = buildUniqueSlug(p.title, p.year, keys.slugs);
    const doc = buildSanityDocFromS2(p, {
      slug,
      personIndex,
      linkStats,
      suggestAreas: !noAreas,
    });
    const docAuthors = (doc as { authors?: SanityAuthor[] }).authors || [];

    console.log('\n🆕 Candidate:');
    console.log(
      JSON.stringify(
        {
          paperId: p.paperId,
          title: p.title,
          year: p.year,
          doi: doiNorm,
          url: p.url,
          venue: p.venue,
          slug,
          category: (doc as { category?: string }).category,
          researchAreas:
            (doc as { researchAreas?: string[] }).researchAreas || 'NONE - assign by hand',
          authors: docAuthors.length,
          linkedAuthors: docAuthors.filter((a) => a.person?._ref).length,
        },
        null,
        2,
      ),
    );

    created += 1;
    if (apply) {
      const createdDoc = await writeClient.create(
        doc as unknown as { _type: string; [key: string]: unknown },
      );
      console.log(`✅ Created publication → ${createdDoc._id}`);
    } else {
      console.log('🧪 [dry-run] Would create new publication in Sanity');
      if (verbose) console.log(JSON.stringify(doc, null, 2));
    }
  }

  if (heal) {
    const existingFromS2 = candidates.filter((c) => c.status === 'exists');
    for (const c of existingFromS2) {
      const id = await findPublicationId(readClient, {
        paperId: String(c.paper.paperId),
        doi: normalizeDoi(c.paper?.externalIds?.DOI || null),
        title: (c.paper?.title || '').toLowerCase().trim() || null,
      });
      if (id) await healExisting(id, c.paper);
    }
  }

  if (healAll) {
    console.log('\n🩺 Sweeping every publication for missing slug / keys / links / category...');
    const allPubs = (await readClient.fetch(
      `*[_type == "publication"]${PUBLICATION_PROJECTION}`,
    )) as ExistingPublication[];
    for (const pub of allPubs) {
      await healExisting(pub, undefined);
    }
  }

  console.log(
    `\n📊 Summary: missingCandidates=${missing.length}, ${
      apply ? 'created' : 'wouldCreate'
    }=${created}, ${apply ? 'patched' : 'wouldPatch'}=${healed}`,
  );

  if (!noLink) {
    console.log(
      `🔗 Author links: new=${linkStats.linked}, alreadyLinked=${linkStats.alreadyLinked}, ambiguous=${linkStats.ambiguous.length}, unmatched=${linkStats.unmatched.size}`,
    );
    if (linkStats.ambiguous.length > 0) {
      console.log('\n⚠️  Ambiguous author names (left unlinked, resolve manually):');
      for (const a of linkStats.ambiguous) {
        console.log(`   - ${a.name} → ${a.candidates.join(' | ')}`);
      }
    }
    if (verbose && linkStats.newLinks.length > 0) {
      console.log('\n🔗 Author links made in this run:');
      const seen = new Set<string>();
      for (const l of linkStats.newLinks) {
        const line = `   - ${l.author} → ${l.person} (${l.how})`;
        if (seen.has(line)) continue;
        seen.add(line);
        console.log(line);
      }
    }
    if (verbose && linkStats.unmatched.size > 0) {
      console.log('\nℹ️  Authors with no person doc (expected for external co-authors):');
      console.log(`   ${Array.from(linkStats.unmatched).sort().join(', ')}`);
    }
  }
}

if (require.main === module) {
  main().catch((err: unknown) => {
    // Log the message only. Dumping the whole error object prints the failing
    // request's headers, which include the Sanity bearer token.
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Upsert new publications from S2 failed: ${message}`);
    process.exit(1);
  });
}
