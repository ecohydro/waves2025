// @vitest-environment jsdom
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import InquiryForm from '../InquiryForm';
import { axe } from 'vitest-axe';

afterEach(cleanup);

function fillRequired() {
  fireEvent.change(screen.getByLabelText('Name *'), { target: { value: 'Test Researcher' } });
  fireEvent.change(screen.getByLabelText('Email *'), {
    target: { value: 'researcher@example.org' },
  });
  fireEvent.change(screen.getByLabelText('Program or position *'), {
    target: { value: 'Bren — PhD' },
  });
  fireEvent.change(screen.getByLabelText('Intended start *'), { target: { value: '2027-09' } });
  fireEvent.change(screen.getByLabelText(/What would you like to study/), {
    target: {
      value:
        'I would like to study how vegetation water use responds to drought using remote sensing.',
    },
  });
}

describe('Recruitment inquiry', () => {
  it('requires valid email and substantive research text before review', () => {
    render(<InquiryForm />);
    fillRequired();
    const email = screen.getByLabelText('Email *') as HTMLInputElement;
    fireEvent.change(email, { target: { value: 'invalid' } });
    expect(email.checkValidity()).toBe(false);
    const interests = screen.getByLabelText(/What would you like to study/) as HTMLTextAreaElement;
    fireEvent.change(interests, { target: { value: ' '.repeat(60) } });
    expect(interests.checkValidity()).toBe(false);
  });

  it('requires an area and focuses the selection when missing', () => {
    render(<InquiryForm />);
    fillRequired();
    fireEvent.click(screen.getByRole('button', { name: 'Review inquiry (preview)' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Choose at least one research area.');
    expect(screen.getByLabelText('Ecohydrology & vegetation water use')).toHaveFocus();
  });

  it('allows preview without a CV or funding and never offers submission', () => {
    const { container } = render(<InquiryForm />);
    fillRequired();
    fireEvent.click(screen.getByLabelText('Ecohydrology & vegetation water use'));
    fireEvent.click(screen.getByRole('button', { name: 'Review inquiry (preview)' }));
    expect(screen.getByRole('status')).toHaveTextContent('Nothing has been submitted');
    expect(screen.getByText('Test Researcher')).toBeInTheDocument();
    expect(container.querySelector('form[action]')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Send inquiry' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Name *'), { target: { value: 'Changed Name' } });
    expect(screen.queryByRole('heading', { name: 'Review your inquiry' })).not.toBeInTheDocument();
  });

  it('requires an https CV URL when one is provided', () => {
    render(<InquiryForm />);
    const cv = screen.getByLabelText(/CV, research profile/) as HTMLInputElement;
    expect(cv.checkValidity()).toBe(true);
    fireEvent.change(cv, { target: { value: 'javascript:alert(1)' } });
    expect(cv.checkValidity()).toBe(false);
    fireEvent.change(cv, { target: { value: 'https://example.org/cv.pdf' } });
    expect(cv.checkValidity()).toBe(true);
  });

  it('prepares a POST to the configured service only after review', () => {
    const { container } = render(<InquiryForm formId="testform" />);
    expect(container.querySelector('form[action]')).toBeNull();
    fillRequired();
    fireEvent.click(screen.getByLabelText('Ecohydrology & vegetation water use'));
    fireEvent.click(screen.getByRole('button', { name: 'Review inquiry' }));
    const sendForm = container.querySelector('form[action]') as HTMLFormElement;
    expect(sendForm.action).toBe('https://formspree.io/f/testform');
    expect(sendForm.method).toBe('post');
    expect(new FormData(sendForm).get('email')).toBe('researcher@example.org');
    expect(new FormData(sendForm).get('_gotcha')).toBe('');
    // Do not submit: this test never transmits data to a third party.
  });
});

it('has no automated accessibility violations in entry, error, and review states', async () => {
  const { container } = render(<InquiryForm formId="mqpazrqo" />);
  const audit = async () => {
    const results = await axe(container, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
      // JSDOM has no layout or canvas; check palette contrast separately.
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  };
  await audit();
  fillRequired();
  fireEvent.click(screen.getByRole('button', { name: 'Review inquiry' }));
  await audit();
  fireEvent.click(screen.getByLabelText('Ecohydrology & vegetation water use'));
  fireEvent.click(screen.getByRole('button', { name: 'Review inquiry' }));
  await audit();
});
