// @vitest-environment jsdom
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import Archive from '../news/archive/page';
import NewsPage from '../news/page';
const { fetchNews } = vi.hoisted(() => ({ fetchNews: vi.fn() }));
vi.mock('@/lib/cms/client', () => ({ fetchNews, fetchFeaturedNews: async () => [], urlForImage: vi.fn() }));
const articles = [
  { _id: '1', title: 'Water finding', slug: { current: 'water' }, category: 'research', publishedAt: '2026-09-01', author: { name: 'WAVES' } },
  { _id: '2', title: 'Lab award', slug: { current: 'award' }, category: 'award', publishedAt: '2026-09-02', author: { name: 'WAVES' } },
];
beforeEach(() => fetchNews.mockResolvedValue(articles));
afterEach(cleanup);
it('filters the archive by category and provides reset and count', async () => {
  render(await Archive({ searchParams: { category: 'research' } }));
  expect(screen.getByRole('link', { name: 'Water finding' })).toHaveAttribute('href', '/news/water');
  expect(screen.queryByText('Lab award')).toBeNull();
  expect(screen.getByText('1 article in this category')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'All lab news' })).toHaveAttribute('href', '/news/archive');
});
it('handles unknown categories without claiming a request failure', async () => {
  render(await Archive({ searchParams: { category: 'unknown' } }));
  expect(screen.getByText(/No articles match/)).toBeInTheDocument();
});
it('distinguishes a failed request from an empty archive', async () => {
  fetchNews.mockRejectedValueOnce(new Error('offline'));
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  render(await Archive({}));
  expect(screen.getByText(/could not load the news archive/)).toBeInTheDocument();
  expect(screen.queryByText('0 articles')).toBeNull();
  log.mockRestore();
});
it('links category cards to real results and removes the subscription promise', async () => {
  render(await NewsPage({}));
  expect(screen.getByRole('link', { name: 'Research news', exact: true })).toHaveAttribute('href', '/news/archive?category=research');
  expect(screen.getByRole('link', { name: 'Explore Research', exact: true })).toHaveAttribute('href', '/research');
  expect(screen.queryByText(/delivered directly to your inbox/)).toBeNull();
});
