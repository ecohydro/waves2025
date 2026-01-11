#!/usr/bin/env tsx

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@sanity/client';
import { v4 as uuidv4 } from 'uuid';
import { fetchPaperById, PaperFields } from '../../lib/migration/semantic-scholar-utils';

type SanityPerson = { _id: string; name: string; slug?: { current?: string } };
type SanityAuthor = {
  _key: string;
  name?: string;
  person?: { _type: 'reference'; _ref: string };
  isCorresponding?: boolean;
};

const editorToken = process.env.SANITY_API_EDITOR_TOKEN || process.env.SANITY_API_TOKEN;
const viewerToken =
  process.env.SANITY_API_VIEWER_TOKEN || editorToken || process.env.SANITY_API_TOKEN;

const readClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2023-12-19',
  useCdn: false,
  token: viewerToken,
});

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2023-12-19',
  useCdn: false,
  token: editorToken,
});

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

async function findPublicationByS2PaperId(paperId: string) {
  const doc = await readClient.fetch(
    `*[_type == "publication" && semanticScholar.paperId == $pid][0]{
      _id, title, slug, doi, publishedDate,
      authors[]{ _key, name, person->{ _id, name, slug }, isCorresponding },
      semanticScholar
    }`,
    { pid: paperId },
  );
  return doc || null;
}

async function findPublicationByDOI(doi?: string) {
  if (!doi) return null;
  const d = doi.replace(/^https?:\/\/doi\.org\//i, '').toLowerCase();
  const doc = await readClient.fetch(
    `*[_type == "publication" && lower(doi) == $doi][0]{ _id, title, slug, doi, publishedDate, authors[]{ _key, name, person->{ _id, name, slug }, isCorresponding }, semanticScholar }`,
    { doi: d },
  );
  return doc || null;
}

async function findPublicationByTitle(title?: string) {
  if (!title) return null;
  const t = String(title).toLowerCase();
  const doc = await readClient.fetch(
    `*[_type == "publication" && lower(title) == $t][0]{ _id, title, slug, doi, publishedDate, authors[]{ _key, name, person->{ _id, name, slug }, isCorresponding }, semanticScholar }`,
    { t },
  );
  return doc || null;
}

async function findPersonBySemanticScholarId(authorId: string): Promise<SanityPerson | null> {
  const person = await readClient.fetch(
    `*[_type == "person" && socialMedia.semanticScholarId == $sid][0]{ _id, name, slug }`,
    { sid: String(authorId) },
  );
  return person || null;
}

async function findPersonByName(name: string): Promise<SanityPerson | null> {
  const person = await readClient.fetch(
    `*[_type == "person" && name match $q][0]{ _id, name, slug }`,
    { q: `*${name}*` },
  );
  return person || null;
}

function logHeader(title: string) {
  const line = '='.repeat(Math.max(10, title.length + 8));
  console.log(`\n${line}\n>>> ${title} <<<\n${line}`);
}

function summarizeAuthors(authors?: Array<{ name?: string; authorId?: string }>) {
  if (!Array.isArray(authors)) return 'none';
  return authors
    .map((a) => `${a.name || 'Unknown'}${a.authorId ? ` [${a.authorId}]` : ''}`)
    .join(', ');
}

async function main() {
  const paperId = getArg('--paperId') || getArg('-p');
  const dryRun = hasFlag('--dry-run');
  if (!paperId) {
    console.error(
      'Usage: tsx src/scripts/semantic-scholar/debug-link-publication.ts --paperId <S2_PAPER_ID> [--dry-run]',
    );
    process.exit(1);
  }

  logHeader(`Fetch S2 paper: ${paperId}`);
  const paper: PaperFields | null = await fetchPaperById(paperId);
  if (!paper) {
    console.error('✗ Paper not found on Semantic Scholar');
    process.exit(1);
  }
  console.log('Title:', paper.title);
  console.log('URL:', paper.url);
  console.log('DOI:', paper.externalIds?.DOI || '—');
  console.log('Publication Types:', (paper.publicationTypes || []).join(', ') || '—');
  console.log('Authors (S2):', summarizeAuthors(paper.authors as any));

  logHeader('Locate target publication in Sanity');
  let pub = await findPublicationByS2PaperId(paper.paperId);
  if (pub) {
    console.log('✓ Found by semanticScholar.paperId:', pub._id, '|', pub.title);
  } else {
    console.log('… Not found by paperId. Trying DOI…');
    pub = await findPublicationByDOI((paper.externalIds as any)?.DOI as string | undefined);
    if (pub) {
      console.log('✓ Found by DOI:', pub._id, '|', pub.title);
    } else {
      console.log('… Not found by DOI. Trying title…');
      pub = await findPublicationByTitle(paper.title);
      if (pub) console.log('✓ Found by title:', pub._id, '|', pub.title);
    }
  }
  if (!pub) {
    console.error('✗ Could not locate a corresponding publication in Sanity. Aborting.');
    process.exit(1);
  }

  console.log('\nCurrent authors in Sanity:');
  for (const a of pub.authors || []) {
    const display = a.person?.name || a.name || 'Unknown Author';
    const linked = a.person?._id ? ` → person:${a.person._id}` : '';
    console.log(` - ${display}${linked}`);
  }

  logHeader('Match S2 authors to people in CMS');
  const s2Authors = Array.isArray(paper.authors) ? paper.authors : [];
  const newAuthors: SanityAuthor[] = [];
  let linkedCount = 0;
  for (const s2 of s2Authors) {
    const display = `${s2.name || 'Unknown'} [${s2.authorId || '—'}]`;
    console.log(`\nAuthor: ${display}`);

    let person: SanityPerson | null = null;
    if (s2.authorId) {
      person = await findPersonBySemanticScholarId(s2.authorId);
      console.log('  • by S2 ID →', person ? `MATCH ${person._id} (${person.name})` : 'no match');
    }
    if (!person && s2.name) {
      person = await findPersonByName(s2.name);
      console.log('  • by name →', person ? `MATCH ${person._id} (${person.name})` : 'no match');
    }

    const authorEntry: SanityAuthor = {
      _key: uuidv4(),
      name: s2.name || 'Unknown Author',
      ...(person ? { person: { _type: 'reference', _ref: person._id } } : {}),
      isCorresponding: false,
    };
    if (person) linkedCount++;
    newAuthors.push(authorEntry);
  }

  logHeader('Planned update');
  console.log(
    `Will set authors[] to ${newAuthors.length} entries; linked=${linkedCount}, unlinked=${newAuthors.length - linkedCount}`,
  );
  if (dryRun) {
    console.log('🧪 Dry-run only. No changes will be written.');
  } else {
    await writeClient
      .patch(pub._id)
      .set({
        authors: newAuthors,
        semanticScholar: {
          ...(pub.semanticScholar || {}),
          paperId: paper.paperId,
          url: paper.url,
          publicationTypes: paper.publicationTypes,
          venue: { name: paper.venue },
          isOpenAccess: paper.isOpenAccess,
          authors: s2Authors.map((a) => ({ name: a.name, authorId: a.authorId })),
          lastUpdated: new Date().toISOString(),
        },
      })
      .commit();
    console.log('✅ Updated publication authors and semanticScholar block in Sanity');
  }

  logHeader('Summary');
  console.log(
    JSON.stringify(
      {
        publicationId: pub._id,
        title: pub.title,
        totalAuthors: newAuthors.length,
        linked: linkedCount,
        unlinked: newAuthors.length - linkedCount,
      },
      null,
      2,
    ),
  );
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Debug link script failed:', err);
    process.exit(1);
  });
}
