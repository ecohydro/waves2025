#!/usr/bin/env tsx

/**
 * Publication Author Linker
 * 
 * Run from waves2025 directory:
 *   cd /root/waves-bot/waves2025
 *   npx tsx ../skills/link-authors/link-authors.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@sanity/client';
import * as readline from 'readline';

// Assume we're running from waves2025 directory
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface Person {
  _id: string;
  name: string;
  slug: { current: string };
  userGroup: string;
}

interface Author {
  person?: { _ref: string };
  name?: string;
  affiliation?: string;
  email?: string;
  orcid?: string;
  isCorresponding: boolean;
  _key: string;
}

interface Publication {
  _id: string;
  title: string;
  slug: { current: string };
  authors: Author[];
  publishedDate: string;
}

interface MatchResult {
  person: Person;
  confidence: number;
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

// Normalize name for comparison
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract last name and first initial
function getLastNameFirstInitial(name: string): { last: string; firstInitial: string } {
  const parts = name.trim().split(/\s+/);
  const lastName = parts[parts.length - 1].toLowerCase();
  const firstInitial = parts[0]?.[0]?.toLowerCase() || '';
  return { last: lastName, firstInitial };
}

// Simple Levenshtein distance for fuzzy matching
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Match author name to people
function findMatches(authorName: string, people: Person[]): MatchResult[] {
  const matches: MatchResult[] = [];
  const normalizedAuthor = normalizeName(authorName);
  const authorParts = getLastNameFirstInitial(authorName);

  for (const person of people) {
    const normalizedPerson = normalizeName(person.name);
    const personParts = getLastNameFirstInitial(person.name);

    let confidence = 0;

    // Exact match
    if (normalizedAuthor === normalizedPerson) {
      confidence = 1.0;
    }
    // Last name + first initial match
    else if (
      authorParts.last === personParts.last &&
      authorParts.firstInitial === personParts.firstInitial
    ) {
      confidence = 0.9;
    }
    // Fuzzy match
    else {
      const distance = levenshtein(normalizedAuthor, normalizedPerson);
      const maxLen = Math.max(normalizedAuthor.length, normalizedPerson.length);
      const similarity = 1 - distance / maxLen;
      if (similarity >= 0.7) {
        confidence = similarity;
      }
    }

    if (confidence > 0) {
      matches.push({ person, confidence });
    }
  }

  // Sort by confidence descending
  return matches.sort((a, b) => b.confidence - a.confidence);
}

async function main() {
  const args = process.argv.slice(2);
  const slugFilter = args.includes('--slug') ? args[args.indexOf('--slug') + 1] : null;
  const autoApprove =
    args.includes('--auto-approve') || args.includes('--auto') || args.includes('-y');
  const threshold = args.includes('--threshold')
    ? parseFloat(args[args.indexOf('--threshold') + 1])
    : 0.85;

  console.log('🔗 Publication Author Linker\n');

  // Create Sanity client
  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2023-12-19',
    useCdn: false,
    token: process.env.SANITY_API_EDITOR_TOKEN!,
  });

  // Fetch all people
  console.log('📥 Fetching lab members...');
  const people: Person[] = await client.fetch(
    `*[_type == "person" && (userGroup == "current" || userGroup == "alumni")] {
      _id,
      name,
      slug,
      userGroup
    }`
  );
  console.log(`   Found ${people.length} lab members\n`);

  // Fetch publications
  console.log('📥 Fetching publications...');
  const pubQuery = slugFilter
    ? `*[_type == "publication" && slug.current == $slug] {
        _id, title, slug, authors, publishedDate
      }`
    : `*[_type == "publication"] | order(publishedDate desc) {
        _id, title, slug, authors, publishedDate
      }`;

  const publications: Publication[] = await client.fetch(
    pubQuery,
    slugFilter ? { slug: slugFilter } : {}
  );
  console.log(`   Found ${publications.length} publications\n`);

  let totalUnlinked = 0;
  let totalLinked = 0;
  const updates: Array<{ pubId: string; authorKey: string; personRef: string }> = [];

  for (const pub of publications) {
    const unlinkedAuthors = pub.authors.filter((a) => !a.person && a.name);
    if (unlinkedAuthors.length === 0) continue;

    totalUnlinked += unlinkedAuthors.length;

    console.log(`\n${'='.repeat(80)}`);
    console.log(`📄 ${pub.title}`);
    console.log(`   Published: ${pub.publishedDate}`);
    console.log(`   Slug: ${pub.slug.current}`);
    console.log(`\n   Unlinked authors (${unlinkedAuthors.length}):\n`);

    for (const author of unlinkedAuthors) {
      console.log(`   👤 ${author.name}`);
      if (author.affiliation) console.log(`      Affiliation: ${author.affiliation}`);

      const matches = findMatches(author.name!, people);

      if (matches.length === 0) {
        console.log(`      ❌ No matches found\n`);
        continue;
      }

      console.log(`\n      Suggested matches:`);
      matches.slice(0, 3).forEach((m, i) => {
        const confidencePct = (m.confidence * 100).toFixed(0);
        const emoji = m.confidence >= 0.9 ? '✅' : m.confidence >= 0.75 ? '⚠️' : '❓';
        console.log(
          `      ${i + 1}. ${emoji} ${m.person.name} (${m.person.userGroup}) — ${confidencePct}% confidence`
        );
      });

      const topMatch = matches[0];
      let shouldLink = false;

      if (autoApprove && topMatch.confidence >= threshold) {
        shouldLink = true;
        console.log(`\n      ✅ Auto-linking to ${topMatch.person.name} (${(topMatch.confidence * 100).toFixed(0)}%)\n`);
      } else {
        const answer = await question(
          `\n      Link to ${topMatch.person.name}? (y/n/skip): `
        );

        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          shouldLink = true;
        } else if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'skip') {
          console.log(`      ⏭️  Skipped\n`);
          continue;
        } else {
          console.log(`      ❌ Skipped\n`);
          continue;
        }
      }

      if (shouldLink) {
        updates.push({
          pubId: pub._id,
          authorKey: author._key,
          personRef: topMatch.person._id,
        });
        totalLinked++;
      }
    }
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`\n📊 Summary:`);
  console.log(`   Total unlinked authors: ${totalUnlinked}`);
  console.log(`   Authors to link: ${totalLinked}\n`);

  if (updates.length === 0) {
    console.log('✅ No updates to apply.');
    rl.close();
    return;
  }

  const confirmApply = autoApprove
    ? 'y'
    : await question(`Apply ${updates.length} updates to Sanity? (y/n): `);

  if (confirmApply.toLowerCase() !== 'y' && confirmApply.toLowerCase() !== 'yes') {
    console.log('❌ Updates cancelled.');
    rl.close();
    return;
  }

  console.log('\n📝 Applying updates...');

  for (const update of updates) {
    const pub: Publication = await client.fetch(
      `*[_id == $id][0] { _id, authors }`,
      { id: update.pubId }
    );

    const updatedAuthors = pub.authors.map((a) => {
      if (a._key === update.authorKey) {
        return {
          ...a,
          person: { _type: 'reference', _ref: update.personRef },
        };
      }
      return a;
    });

    await client.patch(update.pubId).set({ authors: updatedAuthors }).commit();
    console.log(`   ✅ Updated ${update.pubId}`);
  }

  console.log(`\n✅ Done! Linked ${totalLinked} authors.\n`);
  rl.close();
}

main().catch((err) => {
  console.error('❌ Error:', err?.message || err);
  rl.close();
  process.exit(1);
});
