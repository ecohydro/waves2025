#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fetchPaperById } from '../../lib/migration/semantic-scholar-utils';
import {
  SemanticScholarAPI,
  enhancePublicationWithSemanticScholar,
} from '../../lib/migration/semantic-scholar-working';

type FrontMatter = Record<string, unknown> & {
  title?: string;
  doi?: string;
  journal?: string;
  publicationDate?: string;
  url?: string;
  abstract?: string;
  keywords?: string[];
  semanticScholar?: Record<string, any>;
  lastUpdated?: string;
  slug?: string;
  year?: number;
  authors?: Array<{ name: string }>;
};

function normalizeDoi(doi?: string): string | undefined {
  if (!doi) return undefined;
  return doi.replace(/^https?:\/\/doi\.org\//i, '').trim();
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

function daysSince(iso?: string): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  const diffMs = Date.now() - t;
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const get = (flag: string): string | undefined => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };

  const sourceDir = get('--sourceDir') || 'content/publications';
  const olderThanDays = get('--olderThanDays') ? parseInt(String(get('--olderThanDays')), 10) : 90;
  const maxCount = get('--max') ? parseInt(String(get('--max')), 10) : undefined;
  const delaySeconds = get('--delay') ? parseInt(String(get('--delay')), 10) : 2;
  const dryRun = args.includes('--dry-run');
  const noAuth = args.includes('--no-auth');

  if (!fs.existsSync(sourceDir)) throw new Error(`Source directory not found: ${sourceDir}`);
  if (noAuth) process.env.SEMANTIC_SCHOLAR_DISABLE_API_KEY = 'true';

  const files = listMdxFiles(sourceDir);
  const api = new SemanticScholarAPI();
  let processed = 0;
  let updated = 0;
  let skipped = 0;

  for (const filePath of files) {
    if (maxCount && processed >= maxCount) break;

    const raw = fs.readFileSync(filePath, 'utf8');
    const { data: fm, content } = matter(raw);
    const front = fm as FrontMatter;

    const ss = (front.semanticScholar || {}) as Record<string, any>;
    const last = ss.lastUpdated || front.lastUpdated;
    const ageDays = daysSince(last) ?? Infinity;
    const hasPaperId = typeof ss.paperId === 'string' && ss.paperId.length > 0;
    const hasDoi = typeof front.doi === 'string' && front.doi.trim().length > 0;

    if (!hasPaperId && !hasDoi && typeof front.title !== 'string') {
      skipped++;
      continue;
    }

    if (ageDays <= olderThanDays) {
      // fresh enough
      skipped++;
      continue;
    }

    console.log(`\n🔄 Updating: ${path.basename(filePath)} (age: ${ageDays}d)`);

    let newSemantic: Record<string, any> | null = null;

    if (hasPaperId) {
      const paper = await fetchPaperById(String(ss.paperId));
      if (paper) {
        const doiNorm = normalizeDoi((paper.externalIds?.DOI as string | undefined) || undefined);
        newSemantic = pruneUndefined({
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
          venue: paper.venue ? { name: paper.venue as string } : undefined,
          enhancedAuthors: Array.isArray(paper.authors)
            ? paper.authors.map((a: any) => ({ name: a.name, semanticScholarId: a.authorId }))
            : undefined,
          lastUpdated: new Date().toISOString(),
          status: 'updated',
        });
      }
    }

    if (!newSemantic) {
      // Fall back to DOI/title enhancement
      const enhancement = await enhancePublicationWithSemanticScholar(front, api);
      if (enhancement.semanticScholar) {
        newSemantic = {
          ...(enhancement.semanticScholar as Record<string, any>),
          status: 'updated',
          lastUpdated: new Date().toISOString(),
        };
      }
    }

    if (!newSemantic) {
      console.log('  ⚠️ No new data found');
      processed++;
      continue;
    }

    // Merge and update frontmatter
    const mergedSemantic = pruneUndefined({ ...(front.semanticScholar || {}), ...newSemantic });

    // Opportunistic fills for root fields
    const updatedFront: FrontMatter = { ...front };
    updatedFront.semanticScholar = mergedSemantic;
    updatedFront.lastUpdated = newSemantic.lastUpdated;

    // Fill missing fields only
    const paperAbstract = newSemantic.abstract as string | undefined;
    if (!updatedFront.abstract && paperAbstract) updatedFront.abstract = paperAbstract;

    const doiFromSemantic = normalizeDoi(newSemantic.doi as string | undefined);
    if (!updatedFront.doi && doiFromSemantic) updatedFront.doi = doiFromSemantic;

    if (!updatedFront.journal && newSemantic.venue?.name)
      updatedFront.journal = newSemantic.venue.name;

    if (!updatedFront.publicationDate && typeof newSemantic.publicationDate === 'string')
      updatedFront.publicationDate = newSemantic.publicationDate;

    if (!updatedFront.url && typeof newSemantic.url === 'string')
      updatedFront.url = newSemantic.url;

    if (!Array.isArray(updatedFront.keywords) || updatedFront.keywords.length === 0) {
      const fs1 = Array.isArray(newSemantic.fieldsOfStudy) ? newSemantic.fieldsOfStudy : [];
      const fs2 = Array.isArray(newSemantic.s2FieldsOfStudy)
        ? (newSemantic.s2FieldsOfStudy as Array<{ category?: string }>)
            .map((f) => f.category)
            .filter(Boolean)
        : [];
      const merged = [...fs1, ...fs2].filter(Boolean);
      if (merged.length > 0) updatedFront.keywords = merged;
    }

    const safeFront = pruneUndefined(updatedFront);
    const newContent = matter.stringify(content, safeFront as Record<string, unknown>);
    if (dryRun) {
      console.log(`  [dry-run] Would update ${path.basename(filePath)}`);
    } else {
      fs.writeFileSync(filePath, newContent);
      console.log(`  ✅ Updated ${path.basename(filePath)}`);
      updated++;
    }

    processed++;
    if (delaySeconds > 0) await new Promise((r) => setTimeout(r, delaySeconds * 1000));
  }

  console.log(
    `\n📊 Update summary: processed=${processed}, updated=${updated}, skipped=${skipped}`,
  );
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Update publications failed:', err);
    process.exit(1);
  });
}
