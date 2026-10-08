// @vitest-environment jsdom
import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import Navigation from '../Navigation';
vi.mock('next/navigation', () => ({ usePathname: () => '/research/ecohydrology' }));
beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it('does not steal initial focus and exposes primary research/recruiting routes', () => {
  render(<Navigation />);
  expect(document.activeElement).toBe(document.body);
  const desktop = within(screen.getByTestId('desktop-navigation'));
  expect(desktop.getByRole('link', { name: 'Research', exact: true })).toHaveAttribute(
    'href',
    '/research',
  );
  expect(desktop.getByRole('link', { name: 'Join the Lab' })).toHaveAttribute(
    'href',
    '/opportunities',
  );
});
it('opens an ordinary disclosure, reaches Search, and closes with Escape restoring focus', async () => {
  const user = userEvent.setup();
  const { container } = render(<Navigation />);
  const trigger = screen.getByRole('button', { name: 'Open menu' });
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await user.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  const mobile = screen.getByRole('navigation', { name: 'Mobile navigation' });
  expect(mobile.closest('[aria-hidden="true"]')).toBeNull();
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
  expect(
    (await axe(container, { rules: { 'color-contrast': { enabled: false } } })).violations,
  ).toEqual([]);
  for (const link of within(mobile).getAllByRole('link')) {
    await user.tab();
    expect(link).toHaveFocus();
  }
  expect(within(mobile).getByRole('link', { name: 'Search' })).toHaveFocus();
  await user.keyboard('{Escape}');
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(mobile).not.toBeVisible();
  expect(
    (await axe(container, { rules: { 'color-contrast': { enabled: false } } })).violations,
  ).toEqual([]);
});
it('closes when a mobile destination is selected', async () => {
  const user = userEvent.setup();
  render(<Navigation />);
  const trigger = screen.getByRole('button', { name: 'Open menu' });
  await user.click(trigger);
  const destination = within(
    screen.getByRole('navigation', { name: 'Mobile navigation' }),
  ).getByRole('link', { name: 'Research', exact: true });
  destination.addEventListener('click', (event) => event.preventDefault());
  await user.click(destination);
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
});
