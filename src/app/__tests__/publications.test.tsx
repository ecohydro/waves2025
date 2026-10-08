// @vitest-environment jsdom
import React from 'react';
import { axe } from 'vitest-axe';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import Publications from '../publications/page';
import { fetchPublications } from '@/lib/cms/client';
vi.mock('@/lib/cms/client', () => ({ fetchPublications: vi.fn() }));
const paper = {
  _id: 'one',
  title: 'New student research',
  slug: { current: 'new' },
  publicationType: 'journal-article',
  researchAreas: ['Ecohydrology'],
  publishedDate: '2026-01-01',
  isFeatured: true,
  metrics: { citations: 0 },
  authors: [{ person: { name: 'Student', slug: { current: 'student' } } }],
};
beforeEach(() => {
  vi.stubGlobal('React', React);
  vi.mocked(fetchPublications).mockResolvedValue([paper] as never);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it('uses single links and preserves author and theme when switching view', async () => {
  const { container } = render(
    await Publications({ searchParams: { author: 'student', area: 'ecohydrology' } }),
  );
  expect(container.querySelector('a button')).toBeNull();
  const link = screen.getByRole('link', { name: 'Conference Presentations & Abstracts' });
  const params = new URL(link.getAttribute('href')!, 'https://example.org').searchParams;
  expect(params.get('author')).toBe('student');
  expect(params.get('area')).toBe('ecohydrology');
  expect(params.get('type')).toBe('presentations');
  expect(screen.getByRole('link', { name: 'Ecohydrology', exact: true })).toHaveAttribute(
    'aria-current',
    'true',
  );
  expect(screen.getByRole('link', { name: 'Clear all filters' })).toHaveAttribute(
    'href',
    '/publications',
  );
});
it('features editorial selections with zero citations and uses nested title headings', async () => {
  render(await Publications({}));
  const highlights = screen.getByRole('region', { name: 'Featured Publications' });
  expect(
    within(highlights).getByRole('heading', { level: 3, name: paper.title }),
  ).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 4, name: paper.title })).toBeInTheDocument();
});
it('removes the preprint tab and lets old preprint URLs use Publications without losing filters', async () => {
  vi.mocked(fetchPublications).mockResolvedValue([paper, { ...paper, _id: 'preprint', title: 'Old preprint', publicationType: 'preprint' }] as never);
  render(await Publications({ searchParams: { type: 'preprints', area: 'ecohydrology', author: 'student' } }));
  expect(screen.queryByRole('link', { name: 'Preprints', exact: true })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Publications', exact: true })).toHaveAttribute('aria-current', 'true');
  expect(screen.getByRole('heading', { level: 4, name: paper.title })).toBeInTheDocument();
  expect(screen.queryByText('Old preprint')).not.toBeInTheDocument();
  const params = new URL(screen.getByRole('link', { name: 'Conference Presentations & Abstracts' }).getAttribute('href')!, 'https://example.org').searchParams;
  expect(params.get('author')).toBe('student');
  expect(params.get('area')).toBe('ecohydrology');
});

it('has no automated structural accessibility violations with featured and chronological results', async () => {
  const { container } = render(await Publications({}));
  expect(
    (await axe(container, { rules: { 'color-contrast': { enabled: false } } })).violations,
  ).toEqual([]);
});
