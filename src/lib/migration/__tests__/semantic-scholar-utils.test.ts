import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchAuthorInfoById, fetchPaperById } from '../semantic-scholar-utils';

declare const global: any;

describe('semantic-scholar-utils', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetchAuthorInfoById returns first author from batch', async () => {
    const mockJson = vi
      .fn()
      .mockResolvedValue([
        { authorId: '2277507', name: 'Kelly K. Caylor', paperCount: 258, hIndex: 53, papers: [] },
      ]);
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: mockJson });
    // @ts-expect-error inject global fetch
    global.fetch = mockFetch;

    const result = await fetchAuthorInfoById('2277507');
    expect(result?.authorId).toBe('2277507');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('fetchAuthorInfoById retries without API key on 403', async () => {
    const retryJson = vi
      .fn()
      .mockResolvedValue([
        { authorId: 'x', name: 'Retry Author', paperCount: 1, hIndex: 1, papers: [] },
      ]);
    const first = { ok: false, status: 403 } as any;
    const second = { ok: true, status: 200, json: retryJson } as any;
    const mockFetch = vi.fn().mockResolvedValueOnce(first).mockResolvedValueOnce(second);
    // @ts-expect-error inject global fetch
    global.fetch = mockFetch;

    const result = await fetchAuthorInfoById('x');
    expect(result?.name).toBe('Retry Author');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('fetchPaperById returns paper on 200', async () => {
    const mockJson = vi.fn().mockResolvedValue({ paperId: 'p1', title: 'Title', url: 'u' });
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: mockJson });
    // @ts-expect-error inject global fetch
    global.fetch = mockFetch;

    const result = await fetchPaperById('p1');
    expect(result?.paperId).toBe('p1');
  });

  it('fetchPaperById returns null on 404', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    // @ts-expect-error inject global fetch
    global.fetch = mockFetch;

    const result = await fetchPaperById('missing');
    expect(result).toBeNull();
  });
});
