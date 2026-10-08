// @vitest-environment jsdom
import React from 'react';
import { axe } from 'vitest-axe';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import Projects from '../projects/page';
import { fetchProjects } from '@/lib/cms/client';
vi.mock('@/lib/cms/client', () => ({ fetchProjects: vi.fn() }));
beforeEach(() => {
  vi.stubGlobal('React', React);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it('replaces an empty inventory with useful research routes, without activity counts', async () => {
  vi.mocked(fetchProjects).mockResolvedValue([]);
  render(await Projects());
  expect(screen.queryByText('Total Projects')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Explore research themes' })).toHaveAttribute(
    'href',
    '/research',
  );
  expect(screen.getByRole('link', { name: 'Browse publications' })).toHaveAttribute(
    'href',
    '/publications',
  );
});
it('distinguishes a failed load from an empty catalogue', async () => {
  vi.mocked(fetchProjects).mockRejectedValue(new Error('offline'));
  render(await Projects());
  expect(screen.getByText(/Project details are temporarily unavailable/)).toBeInTheDocument();
  expect(screen.queryByText(/No public projects/)).not.toBeInTheDocument();
});
it('keeps populated project links and status', async () => {
  vi.mocked(fetchProjects).mockResolvedValue([
    {
      _id: 'one',
      title: 'Water research',
      slug: { current: 'water' },
      status: 'active',
      shortDescription: 'Field measurements',
    },
  ] as never);
  render(await Projects());
  expect(screen.getByRole('link', { name: 'Water research' })).toHaveAttribute(
    'href',
    '/projects/water',
  );
  expect(screen.getByText('Active')).toBeInTheDocument();
});

it('has no automated structural accessibility violations in the fallback', async () => {
  vi.mocked(fetchProjects).mockResolvedValue([]);
  const { container } = render(await Projects());
  expect(
    (await axe(container, { rules: { 'color-contrast': { enabled: false } } })).violations,
  ).toEqual([]);
});
