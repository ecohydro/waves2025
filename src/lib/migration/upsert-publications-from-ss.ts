#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {
  SemanticScholarAPI,
  enhancePublicationWithSemanticScholar,
} from './semantic-scholar-working';

interface UpsertOptions {
  sourceDir: string;
  outDir: string;
  allowTitleMatch: boolean;
  dryRun: boolean;
}

type FrontMatter = Record<string, unknown> & {
  title?: string;
  doi?: string;
  journal?: string;
  publicationDate?: string;
  url?: string;
  abstract?: string;
  keywords?: string[];
  semanticScholar?: unknown;
  slug?: string;
};

function pruneUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => pruneUndefined(v)).filter((v) => v !== undefined) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue;
      result[k] = pruneUndefined(v as unknown as T) as unknown;
    }
    return result as unknown as T;
  }
  // primitives and null
  return value;
}

function isNonEmptyArray<T>(val: unknown): val is T[] {
  return Array.isArray(val) && val.length > 0;
}

function readAllPublications(
  dir: string,
): Array<{ filePath: string; fm: FrontMatter; content: string }> {
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((f) => path.join(dir, f));

  return files.map((filePath) => {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(raw);
    return { filePath, fm: parsed.data as FrontMatter, content: parsed.content };
  });
}

function normalizeDoi(doi?: string): string | undefined {
  if (!doi) return undefined;
  return doi.replace(/^https?:\/\/doi\.org\//i, '').trim();
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function deriveSlugFromPaper(title: string, year?: number | string): string {
  const base = slugify(title).slice(0, 48);
  return year ? `${base}-${year}` : base;
}

async function upsertByDOI(
  doi: string,
  pubsDir: string,
  outDir: string,
  dryRun: boolean,
): Promise<void> {
  const api = new SemanticScholarAPI();
  const data = await api.searchByDOI(doi);
  if (!data) {
    // eslint-disable-next-line no-console
    console.warn(`No Semantic Scholar data found for DOI: ${doi}`);
    return;
  }

  const publications = readAllPublications(pubsDir);
  const normalized = normalizeDoi(doi);
  const existing = publications.find(({ fm }) => normalizeDoi(fm.doi) === normalized);

  const enhancement = await enhancePublicationWithSemanticScholar(
    { title: data.title, doi: normalized },
    api,
  );

  if (existing) {
    const updatedFm: FrontMatter = {
      ...existing.fm,
      abstract: existing.fm.abstract || data.abstract || existing.fm.abstract,
      keywords: isNonEmptyArray<string>(existing.fm.keywords)
        ? (existing.fm.keywords as string[])
        : (data.fieldsOfStudy as string[] | undefined),
      semanticScholar: (() => {
        const prev = (existing.fm.semanticScholar || {}) as Record<string, unknown>;
        const next = (enhancement.semanticScholar || {}) as Record<string, unknown>;
        return pruneUndefined({ ...prev, ...next, status: 'updated' });
      })(),
      url: existing.fm.url || data.url,
      journal: (existing.fm.journal as string) || data.venue,
      publicationDate: (existing.fm.publicationDate as string) || data.publicationDate,
      doi: normalized,
    };

    const safeUpdatedFm = pruneUndefined(updatedFm);
    const updatedContent = matter.stringify(existing.content, safeUpdatedFm);
    if (dryRun) {
      // eslint-disable-next-line no-console
      console.log(
        `[dry-run] Would update ${path.basename(existing.filePath)} with Semantic Scholar data`,
      );
    } else {
      fs.writeFileSync(existing.filePath, updatedContent);
      // eslint-disable-next-line no-console
      console.log(`✅ Updated existing publication: ${path.basename(existing.filePath)}`);
    }
    return;
  }

  // Create new publication MDX
  const year = data.year;
  const slug = deriveSlugFromPaper(data.title, year);
  const fileName = `${slug}.mdx`;
  const filePath = path.join(outDir, fileName);
  const fm: FrontMatter = {
    title: data.title,
    authors: Array.isArray(data.authors)
      ? data.authors
          .map((a) => ({ name: a.name }))
          .filter((a) => typeof a.name === 'string' && (a.name as string).trim().length > 0)
      : undefined,
    publicationDate: data.publicationDate || (year ? `${year}-01-01` : undefined),
    journal: data.venue,
    doi: normalized,
    url: data.url,
    abstract: data.abstract,
    keywords:
      (isNonEmptyArray<string>(data.fieldsOfStudy) && data.fieldsOfStudy) ||
      (Array.isArray(data.s2FieldsOfStudy)
        ? data.s2FieldsOfStudy.map((f) => f.category).filter(Boolean)
        : undefined),
    slug,
    semanticScholar: enhancement.semanticScholar
      ? { ...(enhancement.semanticScholar as Record<string, unknown>), status: 'new' }
      : enhancement.semanticScholar,
    year: typeof year === 'number' ? year : undefined,
  } as FrontMatter;

  const body = `\n\n`;
  const safeFm = pruneUndefined(fm);
  const fileContent = matter.stringify(body, safeFm);
  if (dryRun) {
    // eslint-disable-next-line no-console
    console.log(`[dry-run] Would create new publication: ${fileName}`);
  } else {
    fs.writeFileSync(filePath, fileContent);
    // eslint-disable-next-line no-console
    console.log(`🆕 Created new publication: ${fileName}`);
  }
}

async function upsertByTitle(
  title: string,
  pubsDir: string,
  outDir: string,
  dryRun: boolean,
): Promise<void> {
  const api = new SemanticScholarAPI();
  const data = await api.searchByTitle(title);
  if (!data) {
    // eslint-disable-next-line no-console
    console.warn(`No Semantic Scholar data found for title: ${title}`);
    return;
  }
  if (data.externalIds?.DOI) {
    return upsertByDOI(String(data.externalIds.DOI), pubsDir, outDir, dryRun);
  }

  // Fallback create when DOI missing
  const publications = readAllPublications(pubsDir);
  const existing = publications.find(
    ({ fm }) => (fm.title || '').toString().toLowerCase() === data.title.toLowerCase(),
  );

  const api2 = new SemanticScholarAPI();
  const enhancement = await enhancePublicationWithSemanticScholar({ title: data.title }, api2);

  if (existing) {
    const updatedFm: FrontMatter = {
      ...existing.fm,
      abstract: existing.fm.abstract || data.abstract || existing.fm.abstract,
      keywords: Array.isArray(existing.fm.keywords) ? existing.fm.keywords : data.fieldsOfStudy,
      semanticScholar: enhancement.semanticScholar,
      url: existing.fm.url || data.url,
      journal: (existing.fm.journal as string) || data.venue,
      publicationDate: (existing.fm.publicationDate as string) || data.publicationDate,
    };
    const updatedContent = matter.stringify(existing.content, updatedFm);
    if (dryRun) {
      // eslint-disable-next-line no-console
      console.log(
        `[dry-run] Would update ${path.basename(existing.filePath)} with Semantic Scholar data`,
      );
    } else {
      fs.writeFileSync(existing.filePath, updatedContent);
      // eslint-disable-next-line no-console
      console.log(`✅ Updated existing publication: ${path.basename(existing.filePath)}`);
    }
    return;
  }

  const year = data.year;
  const slug = deriveSlugFromPaper(data.title, year);
  const fileName = `${slug}.mdx`;
  const filePath = path.join(outDir, fileName);
  const fm: FrontMatter = {
    title: data.title,
    authors: Array.isArray(data.authors) ? data.authors.map((a) => ({ name: a.name })) : undefined,
    publicationDate: data.publicationDate || (year ? `${year}-01-01` : undefined),
    journal: data.venue,
    url: data.url,
    abstract: data.abstract,
    keywords: data.fieldsOfStudy,
    slug,
    semanticScholar: enhancement.semanticScholar,
    year: typeof year === 'number' ? year : undefined,
  } as FrontMatter;

  const body = `\n\n`;
  const fileContent = matter.stringify(body, fm);
  if (dryRun) {
    // eslint-disable-next-line no-console
    console.log(`[dry-run] Would create new publication: ${fileName}`);
  } else {
    fs.writeFileSync(filePath, fileContent);
    // eslint-disable-next-line no-console
    console.log(`🆕 Created new publication: ${fileName}`);
  }
}

function parseListArg(arg?: string): string[] {
  if (!arg) return [];
  try {
    // Support JSON array
    const asJson = JSON.parse(arg);
    if (Array.isArray(asJson)) return asJson.map(String);
  } catch {
    // fallthrough
  }
  // Support comma-separated
  return arg
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const get = (flag: string): string | undefined => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };

  const sourceDir = get('--sourceDir') || 'content/publications';
  const outDir = get('--outDir') || sourceDir;
  const dryRun = args.includes('--dry-run');
  const dois = parseListArg(get('--dois'));
  const titles = parseListArg(get('--titles'));

  if (!fs.existsSync(sourceDir)) throw new Error(`Source directory not found: ${sourceDir}`);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  if (dois.length === 0 && titles.length === 0) {
    // eslint-disable-next-line no-console
    console.log(
      'Usage: tsx src/lib/migration/upsert-publications-from-ss.ts --dois "10.1234/abc,10.2345/def" [--titles "Title A,Title B"] [--sourceDir dir] [--outDir dir] [--dry-run]',
    );
    process.exit(1);
  }

  for (const doi of dois) {
    // eslint-disable-next-line no-console
    console.log(`\n🔎 Processing DOI: ${doi}`);
    // eslint-disable-next-line no-await-in-loop
    await upsertByDOI(doi, sourceDir, outDir, dryRun);
  }

  for (const title of titles) {
    // eslint-disable-next-line no-console
    console.log(`\n🔎 Processing Title: ${title}`);
    // eslint-disable-next-line no-await-in-loop
    await upsertByTitle(title, sourceDir, outDir, dryRun);
  }
}

if (require.main === module) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Upsert failed:', err);
    process.exit(1);
  });
}
