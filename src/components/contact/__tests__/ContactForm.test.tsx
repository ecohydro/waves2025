// @vitest-environment jsdom
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import ContactForm from '../ContactForm';
import { contactFormId } from '@/lib/forms/formspree';
const send = vi.fn();
beforeEach(() => {
  vi.stubGlobal('fetch', send);
  send.mockReset();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function fill() {
  fireEvent.change(screen.getByLabelText('Name *'), { target: { value: ' Test Reader ' } });
  fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'reader@example.org' } });
  fireEvent.change(screen.getByLabelText('Topic *'), {
    target: { value: 'Research collaboration' },
  });
  fireEvent.change(screen.getByLabelText('Message *'), {
    target: { value: 'I would like to discuss a possible research collaboration.' },
  });
}
it('falls back to the existing valid inbox and never accepts arbitrary endpoints', () => {
  expect(contactFormId(undefined, 'existing123')).toBe('existing123');
  expect(contactFormId('dedicated123', 'existing123')).toBe('dedicated123');
  expect(contactFormId('https://other.example', 'existing123')).toBe('existing123');
  expect(contactFormId(undefined, '../invalid')).toBeUndefined();
});
it('offers email rather than an inert form if not configured', () => {
  render(<ContactForm />);
  expect(screen.getByRole('link', { name: 'caylor@ucsb.edu' })).toHaveAttribute(
    'href',
    'mailto:caylor@ucsb.edu',
  );
  expect(screen.queryByRole('button', { name: 'Send message' })).not.toBeInTheDocument();
});
it('announces validation errors and focuses the first field without sending', async () => {
  const { container } = render(<ContactForm formId="testform" />);
  fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Please check');
  expect(screen.getByLabelText('Name *')).toHaveFocus();
  expect(screen.getByLabelText('Name *')).toHaveAttribute('aria-invalid', 'true');
  expect(send).not.toHaveBeenCalled();
  expect(
    (await axe(container, { rules: { 'color-contrast': { enabled: false } } })).violations,
  ).toEqual([]);
});
it('allows a native POST with all fields present and no AJAX request', () => {
  const { container } = render(<ContactForm formId="testform" messageFieldName="interests" />);
  fill();
  const form = container.querySelector('form')!;
  expect(form).toHaveAttribute('action', 'https://formspree.io/f/testform');
  expect(form).toHaveAttribute('method', 'post');
  expect(fireEvent.submit(form)).toBe(true);
  const data = new FormData(form);
  expect(data.get('interests')).toBe('I would like to discuss a possible research collaboration.');
  expect(data.get('email')).toBe('reader@example.org');
  expect(data.get('_subject')).toBe('WAVES general contact');
  expect(data.get('_gotcha')).toBe('');
  expect(screen.getByRole('button', { name: 'Opening Formspree…' })).toBeDisabled();
  expect(screen.getByLabelText('Message *')).toBeEnabled();
  expect(send).not.toHaveBeenCalled();
  expect(fireEvent.submit(form)).toBe(false);
});
it('restores the form after returning from the hosted flow without losing the draft', () => {
  const { container } = render(<ContactForm formId="testform" />);
  fill();
  const form = container.querySelector('form')!;
  fireEvent.submit(form);
  fireEvent(window, new Event('pageshow'));
  expect(screen.getByRole('button', { name: 'Send message' })).toBeEnabled();
  expect(screen.getByLabelText('Message *')).toHaveValue('I would like to discuss a possible research collaboration.');
  expect(fireEvent.submit(form)).toBe(true);
});
it('retains the message field for a dedicated contact endpoint', () => {
  const { container } = render(<ContactForm formId="testform" />);
  fill();
  expect(new FormData(container.querySelector('form')!).get('message')).toBe('I would like to discuss a possible research collaboration.');
});
it('focuses Message when the recruitment-mapped message is too short', () => {
  const { container } = render(<ContactForm formId="testform" messageFieldName="interests" />);
  fill();
  fireEvent.change(screen.getByLabelText('Message *'), { target: { value: 'short' } });
  expect(fireEvent.submit(container.querySelector('form')!)).toBe(false);
  expect(screen.getByLabelText('Message *')).toHaveFocus();
  expect(screen.getByLabelText('Message *')).toHaveAttribute('aria-invalid', 'true');
  expect(send).not.toHaveBeenCalled();
});
