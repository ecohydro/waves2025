#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fetchAuthorInfoById, fetchPaperById } from '../../lib/migration/semantic-scholar-utils';

type FrontMatter = Record<string, unknown> & {
  title?: string;
  doi?: string;
  journal?: string;
  publicationDate?: string;
  url?: string;
  abstract?: string;
  keywords?: string[];
  semanticScholar?: Record<string, unknown>;
  slug?: string;
  year?: number;
  authors?: Array<{ name: string }>;
};

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
  return value;
}

function listMdxFiles(dir: string): string[] {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((f) => path.join(dir, f));
}

function loadExistingKeys(dir: string): {
  byPaperId: Set<string>;
  byDoi: Set<string>;
} {
  const byPaperId = new Set<string>();
  const byDoi = new Set<string>();
  for (const file of listMdxFiles(dir)) {
    try {
      const raw = fs.readFileSync(file, 'utf8');
      const parsed = matter(raw);
      const fm = parsed.data as FrontMatter;
      const ss = (fm.semanticScholar || {}) as Record<string, unknown>;
      const paperId = (ss.paperId as string) || '';
      if (paperId) byPaperId.add(paperId);
      const doi = normalizeDoi((fm.doi as string) || (ss['doi'] as string));
      if (doi) byDoi.add(doi);
    } catch {
      // ignore parse errors on individual files
    }
  }
  return { byPaperId, byDoi };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const get = (flag: string): string | undefined => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };

  const authorId = get('--authorId');
  if (!authorId) {
    console.error(
      'Usage: tsx src/scripts/semantic-scholar/add-new-publications-by-author.ts --authorId <id> [--sourceDir dir] [--outDir dir] [--max N] [--dry-run] [--delay S]',
    );
    process.exit(1);
  }

  const sourceDir = get('--sourceDir') || 'content/publications';
  const outDir = get('--outDir') || sourceDir;
  const dryRun = args.includes('--dry-run');
  const maxCount = get('--max') ? parseInt(String(get('--max')), 10) : undefined;
  const delaySeconds = get('--delay') ? parseInt(String(get('--delay')), 10) : 2;

  if (!fs.existsSync(sourceDir)) throw new Error(`Source directory not found: ${sourceDir}`);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  if (args.includes('--no-auth')) {
    process.env.SEMANTIC_SCHOLAR_DISABLE_API_KEY = 'true';
  }

  console.log(`🔎 Fetching author ${authorId} ...`);
  const author = await fetchAuthorInfoById(authorId, 'name,url,paperCount,hIndex,papers');
  if (!author) {
    console.error('❌ Author fetch failed or not found');
    process.exit(2);
  }

  const papers = Array.isArray(author.papers) ? author.papers : [];
  if (papers.length === 0) {
    console.log('ℹ️ No papers returned for this author with current fields.');
    return;
  }

  const existing = loadExistingKeys(sourceDir);
  const candidates = papers
    .map((p) => String(p.paperId))
    .filter((id) => id && !existing.byPaperId.has(id));

  console.log(`📚 Papers from author: ${papers.length}`);
  console.log(`🆕 New candidates (by paperId): ${candidates.length}`);

  let created = 0;
  for (const paperId of candidates) {
    if (maxCount && created >= maxCount) break;

    console.log(`\n🔸 Creating for paperId: ${paperId}`);
    const paper = await fetchPaperById(paperId);
    if (!paper) {
      console.warn('  ⚠️ Skipping (paper not found)');
      continue;
    }

    // Skip if DOI already exists in our corpus
    const doiNorm = normalizeDoi((paper.externalIds?.DOI as string | undefined) || undefined);
    if (doiNorm && existing.byDoi.has(doiNorm)) {
      console.log('  ⏭️ Skipping: DOI already exists in repository');
      continue;
    }

    const title = paper.title || 'Untitled';
    const year = paper.year;
    const slug = deriveSlugFromPaper(title, year);
    const filePath = path.join(outDir, `${slug}.mdx`);
    if (fs.existsSync(filePath)) {
      console.log('  ⏭️ Skipping: slug already exists');
      continue;
    }

    const fm: FrontMatter = {
      title,
      authors: Array.isArray(paper.authors)
        ? paper.authors
            .map((a) => ({ name: a.name }))
            .filter((a) => typeof a.name === 'string' && (a.name as string).trim().length > 0)
        : undefined,
      publicationDate: paper.publicationDate || (year ? `${year}-01-01` : undefined),
      journal: (paper.venue as string) || undefined,
      doi: doiNorm,
      url: paper.url,
      abstract: paper.abstract,
      keywords:
        Array.isArray(paper.fieldsOfStudy) && paper.fieldsOfStudy.length > 0
          ? paper.fieldsOfStudy
          : Array.isArray(paper.s2FieldsOfStudy)
            ? paper.s2FieldsOfStudy.map((f: any) => f?.category).filter(Boolean)
            : undefined,
      slug,
      semanticScholar: pruneUndefined({
        paperId: paper.paperId,
        url: paper.url,
        doi: doiNorm,
        externalIds: paper.externalIds,
        abstract: paper.abstract,
        citationCount: paper.citationCount,
        influentialCitationCount: paper.influentialCitationCount,
        referenceCount: paper.referenceCount,
        isOpenAccess: paper.isOpenAccess,
        openAccessPdfUrl: paper.openAccessPdf?.url,
        fieldsOfStudy: paper.fieldsOfStudy,
        s2FieldsOfStudy: paper.s2FieldsOfStudy,
        publicationTypes: paper.publicationTypes,
        publicationDate: paper.publicationDate,
        tldr:
          (paper as any).tldr && typeof (paper as any).tldr === 'object'
            ? ((paper as any).tldr as { text?: string }).text
            : undefined,
        venue: paper.venue
          ? {
              name: paper.venue as string,
            }
          : undefined,
        enhancedAuthors: Array.isArray(paper.authors)
          ? paper.authors.map((a: any) => ({ name: a.name, semanticScholarId: a.authorId }))
          : undefined,
        lastUpdated: new Date().toISOString(),
        status: 'new',
      }),
      year: typeof year === 'number' ? year : undefined,
    };

    const body = `\n\n`;
    const safeFm = pruneUndefined(fm);
    const fileContent = matter.stringify(body, safeFm);
    if (dryRun) {
      console.log(`  [dry-run] Would create ${path.basename(filePath)}`);
    } else {
      fs.writeFileSync(filePath, fileContent);
      console.log(`  ✅ Created ${path.basename(filePath)}`);
    }

    created++;
    // Gentle pacing
    if (delaySeconds > 0) {
      await new Promise((r) => setTimeout(r, delaySeconds * 1000));
    }
  }

  console.log(`\n🎉 Done. New files ${dryRun ? '(simulated)' : 'created'}: ${created}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Add-new-by-author failed:', err);
    process.exit(1);
  });
}
