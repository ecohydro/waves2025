#!/usr/bin/env tsx

/**
 * Publication Author Linker - Report Mode
 * Outputs JSON for programmatic processing
 */

import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@sanity/client';

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

interface Proposal {
  publicationId: string;
  publicationTitle: string;
  publicationSlug: string;
  publishedDate: string;
  authorKey: string;
  authorName: string;
  authorAffiliation?: string;
  matches: Array<{
    personId: string;
    personName: string;
    personSlug: string;
    userGroup: string;
    confidence: number;
  }>;
}

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
  const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : null;

  // Create Sanity client
  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2023-12-19',
    useCdn: false,
    token: process.env.SANITY_API_EDITOR_TOKEN!,
  });

  // Fetch all people
  const people: Person[] = await client.fetch(
    `*[_type == "person" && (userGroup == "current" || userGroup == "alumni")] {
      _id,
      name,
      slug,
      userGroup
    }`
  );

  // Fetch publications
  const pubQuery = slugFilter
    ? `*[_type == "publication" && slug.current == $slug] {
        _id, title, slug, authors, publishedDate
      }`
    : `*[_type == "publication"] | order(publishedDate desc) {
        _id, title, slug, authors, publishedDate
      }`;

  let publications: Publication[] = await client.fetch(
    pubQuery,
    slugFilter ? { slug: slugFilter } : {}
  );

  // Apply limit if specified
  if (limit) {
    publications = publications.slice(0, limit);
  }

  const proposals: Proposal[] = [];

  for (const pub of publications) {
    const unlinkedAuthors = pub.authors.filter((a) => !a.person && a.name);
    if (unlinkedAuthors.length === 0) continue;

    for (const author of unlinkedAuthors) {
      const matches = findMatches(author.name!, people);

      if (matches.length === 0) continue;

      proposals.push({
        publicationId: pub._id,
        publicationTitle: pub.title,
        publicationSlug: pub.slug.current,
        publishedDate: pub.publishedDate,
        authorKey: author._key,
        authorName: author.name!,
        authorAffiliation: author.affiliation,
        matches: matches.slice(0, 3).map((m) => ({
          personId: m.person._id,
          personName: m.person.name,
          personSlug: m.person.slug.current,
          userGroup: m.person.userGroup,
          confidence: m.confidence,
        })),
      });
    }
  }

  // Output JSON
  console.log(JSON.stringify({
    totalPublications: publications.length,
    totalPeople: people.length,
    totalProposals: proposals.length,
    proposals,
  }, null, 2));
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err?.message || String(err) }));
  process.exit(1);
});
