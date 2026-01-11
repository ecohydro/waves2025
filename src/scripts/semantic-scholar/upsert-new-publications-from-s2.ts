#!/usr/bin/env tsx

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@sanity/client';
import { SemanticScholarAPI } from '../../lib/migration/semantic-scholar-working';

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

function normalizeDoi(doi?: string | null): string | null {
  if (!doi) return null;
  return doi
    .replace(/^https?:\/\/doi\.org\//i, '')
    .trim()
    .toLowerCase();
}

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
  } as const;
}

async function fetchExistingKeys(client: ReturnType<typeof createClient>): Promise<{
  byPaperId: Set<string>;
  byDoi: Set<string>;
  byTitle: Set<string>;
}> {
  const rows = (await client.fetch(
    `*[_type == "publication"]{ 'pid': semanticScholar.paperId, 'doi': select(defined(doi)=>lower(doi), null), 'title': select(defined(title)=>lower(title), null) }`,
  )) as Array<{ pid?: string; doi?: string | null; title?: string | null }>;
  const byPaperId = new Set<string>();
  const byDoi = new Set<string>();
  const byTitle = new Set<string>();
  for (const r of rows) {
    if (r?.pid) byPaperId.add(String(r.pid));
    if (r?.doi) byDoi.add(String(r.doi));
    if (r?.title) byTitle.add(String(r.title));
  }
  return { byPaperId, byDoi, byTitle };
}

async function findPublicationId(
  client: ReturnType<typeof createClient>,
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

function buildSanityDocFromS2(p: S2Paper) {
  const doiNorm = normalizeDoi(p?.externalIds?.DOI || null);
  const keywords: string[] = [];
  const fs1 = Array.isArray(p.fieldsOfStudy) ? p.fieldsOfStudy.filter(Boolean) : [];
  const fs2 = Array.isArray(p.s2FieldsOfStudy)
    ? (p.s2FieldsOfStudy.map((f) => f?.category).filter(Boolean) as string[])
    : [];
  for (const k of [...fs1, ...fs2]) if (k && !keywords.includes(k)) keywords.push(k);

  const authors = Array.isArray(p.authors)
    ? p.authors
        .map((a) => ({ name: a?.name }))
        .filter((a) => typeof a?.name === 'string' && (a!.name as string).trim().length > 0)
    : [];

  return {
    _type: 'publication',
    title: p.title || 'Untitled',
    publicationType: mapPublicationType(p),
    authors,
    abstract: p.abstract || undefined,
    keywords: keywords.length > 0 ? keywords : undefined,
    venue: p.venue
      ? {
          name: p.venue,
        }
      : undefined,
    publishedDate: p.publicationDate || (p.year ? `${p.year}-01-01` : undefined),
    doi: doiNorm || undefined,
    links: { publisher: p.url || undefined },
    isOpenAccess: Boolean(p.isOpenAccess),
    semanticScholar: {
      paperId: p.paperId,
      url: p.url || undefined,
      doi: doiNorm || undefined,
      externalIds: p.externalIds || undefined,
      abstract: p.abstract || undefined,
      citationCount: p.citationCount || undefined,
      influentialCitationCount: (p as any).influentialCitationCount || undefined,
      referenceCount: (p as any).referenceCount || undefined,
      isOpenAccess: p.isOpenAccess || undefined,
      openAccessPdfUrl: p.openAccessPdf?.url || undefined,
      fieldsOfStudy: p.fieldsOfStudy || undefined,
      s2FieldsOfStudy: p.s2FieldsOfStudy || undefined,
      publicationTypes: p.publicationTypes || undefined,
      publicationDate: p.publicationDate || undefined,
      tldr: (p as any)?.tldr?.text || undefined,
      venue: p.venue ? { name: p.venue, id: p.publicationVenue?.id } : undefined,
      enhancedAuthors: Array.isArray(p.authors)
        ? p.authors.map((a) => ({ name: a?.name, semanticScholarId: a?.authorId }))
        : undefined,
      lastUpdated: new Date().toISOString(),
      status: 'new',
    },
    status: 'published',
    lastUpdated: new Date().toISOString(),
  } as Record<string, unknown>;
}

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

async function main() {
  const { authorId, sinceYear, limit, apply, verbose, noAuth } = parseArgs();

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
    console.log({ authorId, sinceYear, limit, apply, noAuth });
  }

  const keys = await fetchExistingKeys(readClient);
  if (verbose) {
    console.log(
      `Existing keys → paperIds=${keys.byPaperId.size}, dois=${keys.byDoi.size}, titles=${keys.byTitle.size}`,
    );
  }

  console.log(`🔎 Fetching recent papers for author ${authorId} from Semantic Scholar...`);
  const resp: any = await api.getAuthorPapers(authorId, {
    fields:
      'paperId,title,year,externalIds,venue,publicationVenue,url,abstract,fieldsOfStudy,s2FieldsOfStudy,publicationTypes,publicationDate,isOpenAccess,openAccessPdf,authors',
    limit,
  });
  const papers: S2Paper[] = Array.isArray(resp?.data) ? (resp.data as S2Paper[]) : [];
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

      // Patch missing fields on existing documents (publicationType/status)
      if (apply) {
        const pub = await readClient.fetch(
          `*[_type=='publication' && _id==$id][0]{ _id, publicationType, status }`,
          { id: existingId },
        );
        const desiredType = mapPublicationType(p);
        const patch: Record<string, unknown> = {};
        if (!pub?.publicationType) patch.publicationType = desiredType;
        if (!pub?.status) patch.status = 'published';
        if (Object.keys(patch).length > 0) {
          await writeClient.patch(existingId).set(patch).commit();
          console.log(
            `🔧 Patched existing publication ${existingId} with ${JSON.stringify(patch)}`,
          );
        } else if (verbose) {
          console.log('   No patch needed for existing publication');
        }
      } else if (verbose) {
        console.log('   [dry-run] Would ensure publicationType/status on existing publication');
      }
      continue;
    }

    const doc = buildSanityDocFromS2(p);

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
        },
        null,
        2,
      ),
    );

    if (apply) {
      const createdDoc = await writeClient.create(doc as any);
      created++;
      console.log(`✅ Created publication → ${createdDoc._id}`);
    } else {
      console.log('🧪 [dry-run] Would create new publication in Sanity');
    }
  }

  console.log(
    `\n📊 Summary: missing=${missing.length}, ${apply ? 'created' : 'wouldCreate'}=${missing.length}`,
  );
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Upsert new publications from S2 failed:', err);
    process.exit(1);
  });
}
