// @vitest-environment jsdom
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import PeoplePage from '../people/page';
import { fetchPeople } from '@/lib/cms/client';

vi.mock('@/lib/cms/client', () => ({ fetchPeople: vi.fn(), urlForImage: vi.fn() }));

const person = {
  _id: 'ada', name: 'Ada Example', slug: { current: 'ada-example' },
  userGroup: 'current', category: 'graduate-student',
  email: 'ada@example.org', website: 'https://example.org/ada',
};

beforeEach(() => vi.stubGlobal('React', React));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('keeps profile and social destinations independent and keyboard reachable', async () => {
  vi.mocked(fetchPeople).mockResolvedValue([
    { ...person, socialMedia: { orcid: '0000-0001-2345-6789' } },
  ] as never);
  const user = userEvent.setup();
  const { container } = render(await PeoplePage());
  const profile = screen.getByRole('link', { name: 'Ada Example', exact: true });
  const email = screen.getByRole('link', { name: 'Email Ada Example' });
  const website = screen.getByRole('link', { name: "Ada Example’s website" });
  const orcid = screen.getByRole('link', { name: "Ada Example’s ORCID profile" });
  expect(profile).toHaveAttribute('href', '/people/ada-example');
  expect(email).toHaveAttribute('href', 'mailto:ada@example.org');
  expect(website).toHaveAttribute('href', 'https://example.org/ada');
  expect(orcid).toHaveAttribute('href', 'https://orcid.org/0000-0001-2345-6789');
  expect(container.querySelector('a a')).toBeNull();
  for (const link of [profile, email, website, orcid]) {
    await user.tab();
    expect(link).toHaveFocus();
  }
  for (const external of [website, orcid]) {
    expect(external).toHaveAttribute('target', '_blank');
    expect(external.getAttribute('rel')).toContain('noopener');
  }
});

it('shows email and website when the CMS omits socialMedia', async () => {
  vi.mocked(fetchPeople).mockResolvedValue([person] as never);
  render(await PeoplePage());
  expect(screen.getByRole('link', { name: 'Email Ada Example' })).toHaveAttribute('href', 'mailto:ada@example.org');
  expect(screen.getByRole('link', { name: "Ada Example’s website" })).toHaveAttribute('href', person.website);
  expect(screen.queryByRole('link', { name: /ORCID/ })).not.toBeInTheDocument();
});
