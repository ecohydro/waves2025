'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { contactFormId } from '@/lib/forms/formspree';

const fields = ['name', 'email', 'topic', 'message'] as const;
type Field = (typeof fields)[number];
const topics = [
  'Research collaboration',
  'Media inquiry',
  'Visiting researcher',
  'Accessibility or alternative format',
  'General question',
];
const inputClass =
  'mt-2 block w-full rounded-md border border-gray-500 dark:border-slate-400 bg-white dark:bg-slate-950 px-3 py-2 text-gray-900 dark:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:focus-visible:outline-blue-300';
const linkClass = 'text-blue-700 dark:text-blue-300 underline underline-offset-4';

export default function ContactForm({ formId, messageFieldName = 'message' }: {
  formId?: string;
  messageFieldName?: 'message' | 'interests';
}) {
  const validId = contactFormId(formId);
  const endpoint = validId ? `https://formspree.io/f/${validId}` : undefined;
  const [enhanced, setEnhanced] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [sending, setSending] = useState(false);
  const submitting = useRef(false);

  useEffect(() => {
    setEnhanced(true);
    const restore = () => {
      submitting.current = false;
      setSending(false);
    };
    window.addEventListener('pageshow', restore);
    return () => window.removeEventListener('pageshow', restore);
  }, []);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    if (!endpoint || submitting.current) {
      event.preventDefault();
      return;
    }
    const form = event.currentTarget;
    const data = new FormData(form);
    fields.forEach((field) => {
      const name = field === 'message' ? messageFieldName : field;
      data.set(name, String(data.get(name) || '').trim());
    });
    const invalid: Partial<Record<Field, string>> = {};
    if (!data.get('name')) invalid.name = 'Enter your name.';
    const email = form.elements.namedItem('email') as HTMLInputElement;
    if (!data.get('email') || !email.validity.valid) invalid.email = 'Enter a valid email address.';
    if (!topics.includes(String(data.get('topic')))) invalid.topic = 'Choose a topic.';
    const message = String(data.get(messageFieldName));
    if (message.length < 20 || message.length > 5000)
      invalid.message = 'Write a message between 20 and 5,000 characters.';
    setErrors(invalid);
    const first = fields.find((field) => invalid[field]);
    if (first) {
      event.preventDefault();
      (form.elements.namedItem(first === 'message' ? messageFieldName : first) as HTMLElement).focus();
      return;
    }
    // Let the browser POST to Formspree so its hosted spam check can run.
    // Keep successful form controls enabled until the browser serializes them.
    submitting.current = true;
    setSending(true);
  }

  const emailFallback = (
    <p className="mt-4 text-gray-700 dark:text-gray-100">
      You can also email{' '}
      <a href="mailto:caylor@ucsb.edu" className={linkClass}>
        caylor@ucsb.edu
      </a>
      .
    </p>
  );
  if (!endpoint)
    return (
      <div>
        <p>The contact form is currently unavailable. Please contact the lab by email.</p>
        {emailFallback}
      </div>
    );

  return (
    <div>
      <p id="contact-privacy" className="mb-6 text-sm text-gray-700 dark:text-gray-100">
        Your message is processed by Formspree and sent to the lab. Please share only information
        relevant to your inquiry.{' '}
        <Link href="/privacy" className={linkClass}>
          How we use your information
        </Link>
        .
      </p>
        <form
          action={endpoint}
          method="post"
          onSubmit={submit}
          noValidate={enhanced}
          aria-describedby="contact-privacy"
          aria-busy={sending}
          className="space-y-5"
        >
          <input type="hidden" name="_subject" value="WAVES general contact" />
          <div hidden aria-hidden="true">
            <label htmlFor="contact-gotcha">Leave this blank</label>
            <input id="contact-gotcha" name="_gotcha" tabIndex={-1} autoComplete="off" />
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-100">Fields marked * are required.</p>
          {Object.keys(errors).length > 0 && (
            <p role="alert" className="text-red-700 dark:text-red-300">
              Please check the highlighted fields below.
            </p>
          )}
          <fieldset className="space-y-5">
            <legend className="sr-only">Your contact details and message</legend>
            {fields.map((field) => {
              const id = `contact-${field}`;
              const common = {
                id,
                name: field === 'message' ? messageFieldName : field,
                required: true,
                className: inputClass,
                'aria-invalid': !!errors[field],
                'aria-describedby':
                  [
                    field === 'message' ? 'contact-message-help' : '',
                    errors[field] ? `${id}-error` : '',
                  ]
                    .filter(Boolean)
                    .join(' ') || undefined,
              };
              return (
                <div key={field}>
                  <label htmlFor={id} className="block font-medium text-gray-900 dark:text-white">
                    {field[0].toUpperCase() + field.slice(1)} *
                  </label>
                  {field === 'message' && (
                    <p
                      id="contact-message-help"
                      className="mt-1 text-sm text-gray-600 dark:text-gray-200"
                    >
                      20–5,000 characters. For accessibility requests, describe the barrier or
                      format you need; medical information is not necessary.
                    </p>
                  )}
                  {field === 'topic' ? (
                    <select {...common} defaultValue="">
                      <option value="" disabled>
                        Select a topic
                      </option>
                      {topics.map((topic) => (
                        <option key={topic}>{topic}</option>
                      ))}
                    </select>
                  ) : field === 'message' ? (
                    <textarea {...common} rows={6} minLength={20} maxLength={5000} />
                  ) : (
                    <input
                      {...common}
                      type={field === 'email' ? 'email' : 'text'}
                      autoComplete={field}
                      maxLength={field === 'email' ? 254 : 100}
                      pattern={field === 'name' ? '.*\\S.*' : undefined}
                    />
                  )}
                  {errors[field] && (
                    <p id={`${id}-error`} className="mt-2 text-sm text-red-700 dark:text-red-300">
                      {errors[field]}
                    </p>
                  )}
                </div>
              );
            })}
          </fieldset>
          <p role="status" className="text-sm text-gray-700 dark:text-gray-100">
            {sending ? 'Opening Formspree to complete your submission…' : ''}
          </p>
          <button
            type="submit"
            disabled={sending}
            className="rounded-md bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700 dark:focus-visible:outline-blue-300"
          >
            {sending ? 'Opening Formspree…' : 'Send message'}
          </button>
          <p className="text-sm text-gray-700 dark:text-gray-100">
            Submitting opens Formspree for any required spam check and confirmation. If you cannot
            complete that step, use the email alternative below. If you return here after a
            connection problem, check for confirmation before retrying to avoid a duplicate message.
          </p>
        </form>
      {emailFallback}
    </div>
  );
}
