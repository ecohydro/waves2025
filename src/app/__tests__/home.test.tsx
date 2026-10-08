// @vitest-environment jsdom
import React from 'react';
import { axe } from 'vitest-axe';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import Home from '../page';
import { fetchNews, fetchPublications } from '@/lib/cms/client';
vi.mock('@/lib/cms/client', () => ({ fetchNews: vi.fn(), fetchPublications: vi.fn() }));
beforeEach(() => {
  vi.stubGlobal('React', React);
  vi.mocked(fetchPublications).mockResolvedValue([]);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it('renders published query results even without a redundant status projection', async () => {
  vi.mocked(fetchNews).mockResolvedValue([
    {
      _id: 'story',
      title: 'A real finding',
      slug: { current: 'finding' },
      publishedAt: '2026-08-01',
      excerpt: 'Evidence from field observations.',
    },
  ] as never);
  render(await Home());
  expect(screen.getByRole('link', { name: 'A real finding', exact: true })).toHaveAttribute(
    'href',
    '/news/finding',
  );
  expect(screen.queryByText('No recent news available.')).not.toBeInTheDocument();
});
it('contains a news failure without claiming the collection is empty', async () => {
  vi.mocked(fetchNews).mockRejectedValue(new Error('offline'));
  render(await Home());
  expect(screen.getByText(/News updates are temporarily unavailable/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'All lab news' })).toHaveAttribute('href', '/news');
  expect(screen.getByRole('heading', { name: 'Research Areas' })).toBeInTheDocument();
});

it('has no automated structural accessibility violations with populated content', async () => {
  vi.mocked(fetchNews).mockResolvedValue([
    {
      _id: 'story',
      title: 'Research update',
      slug: { current: 'research' },
      publishedAt: '2026-08-01',
    },
  ] as never);
  const { container } = render(await Home());
  expect(
    (await axe(container, { rules: { 'color-contrast': { enabled: false } } })).violations,
  ).toEqual([]);
});
