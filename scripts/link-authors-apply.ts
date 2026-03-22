#!/usr/bin/env tsx

/**
 * Publication Author Linker - Apply Mode
 * Applies a set of author linkings from JSON input
 */

import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@sanity/client';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface Update {
  publicationId: string;
  authorKey: string;
  personId: string;
}

interface Author {
  person?: { _ref: string; _type: string };
  name?: string;
  affiliation?: string;
  email?: string;
  orcid?: string;
  isCorresponding: boolean;
  _key: string;
}

interface Publication {
  _id: string;
  authors: Author[];
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log('Usage: npx tsx scripts/link-authors-apply.ts <updates.json>');
    console.log('');
    console.log('Example updates.json:');
    console.log(JSON.stringify({
      updates: [
        {
          publicationId: 'pub-123',
          authorKey: 'author-456',
          personId: 'person-789',
        },
      ],
    }, null, 2));
    process.exit(0);
  }

  const inputFile = args[0];
  const fs = await import('fs');
  
  if (!fs.existsSync(inputFile)) {
    console.error(JSON.stringify({ error: `File not found: ${inputFile}` }));
    process.exit(1);
  }

  const input = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  const updates: Update[] = input.updates || [];

  if (updates.length === 0) {
    console.log(JSON.stringify({ message: 'No updates to apply', appliedCount: 0 }));
    return;
  }

  // Create Sanity client
  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2023-12-19',
    useCdn: false,
    token: process.env.SANITY_API_EDITOR_TOKEN!,
  });

  let appliedCount = 0;
  const results: Array<{ publicationId: string; success: boolean; error?: string }> = [];

  for (const update of updates) {
    try {
      const pub: Publication = await client.fetch(
        `*[_id == $id][0] { _id, authors }`,
        { id: update.publicationId }
      );

      if (!pub) {
        results.push({
          publicationId: update.publicationId,
          success: false,
          error: 'Publication not found',
        });
        continue;
      }

      const updatedAuthors = pub.authors.map((a) => {
        if (a._key === update.authorKey) {
          return {
            ...a,
            person: { _type: 'reference', _ref: update.personId },
          };
        }
        return a;
      });

      await client.patch(update.publicationId).set({ authors: updatedAuthors }).commit();
      appliedCount++;
      results.push({ publicationId: update.publicationId, success: true });
    } catch (err: any) {
      results.push({
        publicationId: update.publicationId,
        success: false,
        error: err?.message || String(err),
      });
    }
  }

  console.log(JSON.stringify({
    totalUpdates: updates.length,
    appliedCount,
    results,
  }, null, 2));
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err?.message || String(err) }));
  process.exit(1);
});
