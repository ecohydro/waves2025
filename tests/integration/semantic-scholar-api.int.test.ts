import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';
import {
  fetchAuthorInfoById,
  fetchPaperById,
} from '../../src/lib/migration/semantic-scholar-utils';

// This integration test performs real requests to the Semantic Scholar API.
// It validates the response shape using a stable authorId from a local fixture,
// without asserting on the full dynamic payload (e.g., papers list changes over time).

function readFixtureAuthorId(): string {
  const fixturePath = path.resolve(process.cwd(), 'author_information.json');
  const raw = fs.readFileSync(fixturePath, 'utf8');
  const parsed = JSON.parse(raw) as Array<{ authorId: string }>;
  if (!Array.isArray(parsed) || !parsed[0] || !parsed[0].authorId) {
    throw new Error('Invalid author_information.json fixture');
  }
  return String(parsed[0].authorId);
}

describe('Semantic Scholar API (integration)', () => {
  it('fetches author info and validates response shape', async () => {
    const authorId = readFixtureAuthorId();
    const author = await fetchAuthorInfoById(authorId);

    expect(author).toBeTruthy();
    if (!author) return; // type narrowing

    expect(String(author.authorId)).toBe(authorId);
    expect(typeof author.name === 'string' && author.name.length > 0).toBe(true);
    if (author.url) {
      expect(author.url.includes('semanticscholar.org')).toBe(true);
    }
    if (typeof author.paperCount !== 'undefined') {
      expect(typeof author.paperCount).toBe('number');
      expect(author.paperCount).toBeGreaterThanOrEqual(0);
    }
    if (typeof author.hIndex !== 'undefined') {
      expect(typeof author.hIndex).toBe('number');
      expect(author.hIndex).toBeGreaterThanOrEqual(0);
    }
    if (Array.isArray(author.papers)) {
      // Validate at least shape of paper entries
      if (author.papers.length > 0) {
        expect(typeof author.papers[0].paperId).toBe('string');
      }
    }
  }, 30000);

  it('fetches an individual paper by id from live author response (if available)', async () => {
    const authorId = readFixtureAuthorId();
    const author = await fetchAuthorInfoById(authorId);
    if (!author || !Array.isArray(author.papers) || author.papers.length === 0) {
      // Nothing to validate further; author may not include papers in current fields
      return;
    }

    const firstPaperId = author.papers[0].paperId;
    const paper = await fetchPaperById(firstPaperId);
    expect(paper).toBeTruthy();
    if (!paper) return;

    expect(paper.paperId).toBe(firstPaperId);
    expect(typeof paper.title === 'string' || typeof paper.title === 'undefined').toBe(true);
    expect(typeof paper.url === 'string' && paper.url.length > 0).toBe(true);
    if (paper.citationCount !== undefined) {
      expect(typeof paper.citationCount).toBe('number');
    }
    if (paper.influentialCitationCount !== undefined) {
      expect(typeof paper.influentialCitationCount).toBe('number');
    }
    if (paper.fieldsOfStudy !== undefined) {
      expect(Array.isArray(paper.fieldsOfStudy)).toBe(true);
    }
  }, 30000);
});
