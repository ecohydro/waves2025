#!/usr/bin/env tsx

import { config } from 'dotenv';
config({ path: '.env.local' });

import fs from 'fs';
import path from 'path';
import { SemanticScholarAPI } from './semantic-scholar-working';

function printHelp() {
  // eslint-disable-next-line no-console
  console.log(
    `Usage: tsx src/lib/migration/author-info-cli.ts [--authorId <id>] [--fields <csv>] [--papers [--limit N --offset N --paperFields <csv>]]\n\n` +
      `Defaults:\n` +
      `  --authorId from env SEMANTIC_SCHOLAR_AUTHOR_ID if not provided\n` +
      `  --fields "name,url,affiliations,homepage,paperCount,citationCount,hIndex"\n` +
      `  --paperFields "paperId,title,year,authors"`,
  );
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const get = (flag: string): string | undefined => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };

  const authorId = get('--authorId') || process.env.SEMANTIC_SCHOLAR_AUTHOR_ID;
  if (!authorId) {
    // eslint-disable-next-line no-console
    console.error(
      'Missing authorId. Provide --authorId or set SEMANTIC_SCHOLAR_AUTHOR_ID in .env.local',
    );
    process.exit(1);
  }

  const fields =
    get('--fields') || 'name,url,affiliations,homepage,paperCount,citationCount,hIndex';
  const wantPapers = args.includes('--papers');
  const limit = get('--limit') ? parseInt(get('--limit') as string, 10) : undefined;
  const offset = get('--offset') ? parseInt(get('--offset') as string, 10) : undefined;
  const paperFields = get('--paperFields') || 'paperId,title,year,authors';

  // Allow no-auth mode
  if (args.includes('--no-auth')) {
    process.env.SEMANTIC_SCHOLAR_DISABLE_API_KEY = 'true';
  }

  const api = new SemanticScholarAPI();

  // eslint-disable-next-line no-console
  console.log(`🔎 Fetching author ${authorId} ...`);
  const author = await api.getAuthorById(authorId, fields);
  if (!author) {
    // eslint-disable-next-line no-console
    console.error('Author not found or request failed.');
    process.exit(2);
  }

  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ author }, null, 2));

  if (wantPapers) {
    // eslint-disable-next-line no-console
    console.log(`\n📝 Fetching papers for ${authorId} ...`);
    const papers = await api.getAuthorPapers(authorId, {
      fields: paperFields,
      limit,
      offset,
    });
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ papers }, null, 2));
  }
}

if (require.main === module) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Author CLI failed:', err);
    process.exit(1);
  });
}
