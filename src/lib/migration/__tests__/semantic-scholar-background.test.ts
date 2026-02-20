import fs from 'fs';
import path from 'path';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';
import { SemanticScholarBackgroundProcessor } from '../semantic-scholar-background';

class MockAPI {
  // minimal API compatible with SemanticScholarAPI for tests
  async searchByDOI(_doi: string) {
    return {
      paperId: 'mock-paper-id',
      url: 'https://www.semanticscholar.org/paper/mock',
      title: 'Mock Paper',
      externalIds: { DOI: '10.1234/mock' },
      abstract: 'Mock abstract',
      venue: 'Mock Journal',
      year: 2024,
      citationCount: 10,
      influentialCitationCount: 2,
      isOpenAccess: false,
      openAccessPdf: undefined,
      fieldsOfStudy: ['Environmental Science'],
      s2FieldsOfStudy: [{ category: 'Environmental Science', source: 'external' }],
      authors: [{ authorId: 'a1', name: 'Author One' }],
      tldr: { model: 'tldr@v2', text: 'Short summary' },
      publicationDate: '2024-05-01',
      publicationTypes: ['JournalArticle'],
      journal: { name: 'Mock Journal', pages: '1-10', volume: '1' },
    };
  }

  async searchByTitle(title: string) {
    // return same structure for title
    return this.searchByDOI(title);
  }
}

describe('SemanticScholarBackgroundProcessor (dry-run)', () => {
  const tempDir = path.join(process.cwd(), 'tmp-ss-test');

  beforeEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    fs.mkdirSync(tempDir, { recursive: true });
    const mdx =
      `---\n` +
      `title: Test Pub\n` +
      `doi: 10.1234/mock\n` +
      `abstract: None\n` +
      `---\n` +
      `\nContent\n`;
    fs.writeFileSync(path.join(tempDir, 'test.mdx'), mdx);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('simulates enhancement without writing changes when dryRun is enabled', async () => {
    const processor = new SemanticScholarBackgroundProcessor({
      sourceDir: tempDir,
      targetDir: tempDir,
      delayBetweenRequests: 1,
      batchSize: 1,
      dryRun: true,
      api: new MockAPI() as any,
    });

    const before = fs.readFileSync(path.join(tempDir, 'test.mdx'), 'utf8');
    await processor.start();
    const after = fs.readFileSync(path.join(tempDir, 'test.mdx'), 'utf8');

    expect(after).toEqual(before);
  });
});
