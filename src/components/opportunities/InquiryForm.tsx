'use client';

import React, { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';

const areas = [
  'Ecohydrology & vegetation water use',
  'Remote sensing & environmental data science',
  'Agriculture, climate & food security',
  'Coupled human–environment systems',
  'Environmental sensing & field research',
  'Other / interdisciplinary',
];

const fieldClass =
  'mt-2 block w-full rounded-md border border-gray-500 dark:border-slate-400 bg-white dark:bg-slate-950 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';

export default function InquiryForm({ formId }: { formId?: string }) {
  const endpoint =
    formId && /^[a-zA-Z0-9]+$/.test(formId) ? `https://formspree.io/f/${formId}` : undefined;
  const [submission, setSubmission] = useState<[string, string][]>([]);
  const [sending, setSending] = useState(false);
  const [ready, setReady] = useState(false);
  const [areaError, setAreaError] = useState('');
  const [review, setReview] = useState<{ label: string; value: string }[] | null>(null);
  const firstArea = useRef<HTMLInputElement>(null);
  const reviewHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setReady(true);
    // A failed delivery or canceled spam check may return via the browser's back cache.
    const restore = () => setSending(false);
    window.addEventListener('pageshow', restore);
    return () => window.removeEventListener('pageshow', restore);
  }, []);

  function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const selected = data.getAll('areas').map(String);
    if (!selected.length) {
      setAreaError('Choose at least one research area.');
      firstArea.current?.focus();
      return;
    }
    const fields = [
      ['Name', 'name'],
      ['Email', 'email'],
      ['Program / position', 'program'],
      ['Intended start', 'start'],
      ['Current institution or role', 'institution'],
      ['Research interests', 'interests'],
      ['Fellowships under consideration', 'funding'],
      ['CV or website', 'cv'],
    ];
    setAreaError('');
    setSubmission(Array.from(data.entries()).map(([key, value]) => [key, String(value).trim()]));
    setReview([
      ...fields.map(([label, key]) => ({
        label,
        value: String(data.get(key) || '').trim() || 'Not provided',
      })),
      { label: 'Research areas', value: selected.join('; ') },
    ]);
    // Focus the review after React has rendered it.
    requestAnimationFrame(() => reviewHeading.current?.focus());
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-6 sm:p-8">
      <p
        id="inquiry-preview-note"
        className="mb-6 rounded-md bg-blue-50 dark:bg-slate-800 p-4 text-sm text-slate-700 dark:text-slate-200"
      >
        {endpoint
          ? 'Your inquiry will be sent to the WAVES Lab through Formspree. Please share only information relevant to your research inquiry.'
          : 'Form preview: you can try the fields and review your inquiry. Nothing is sent or saved. Submission will be enabled when the inquiry inbox is connected.'}
      </p>
      <p className="mb-6 text-sm">
        If the form or spam check presents an accessibility barrier, you can{' '}
        <Link
          href="/accessibility#feedback"
          className="text-blue-700 dark:text-blue-300 underline underline-offset-4"
        >
          request assistance or an alternative way to submit your inquiry
        </Link>
        .
      </p>
      <noscript>Please use the assistance link above if JavaScript is unavailable.</noscript>
      <form
        onSubmit={handleReview}
        onChange={() => setReview(null)}
        aria-describedby="inquiry-preview-note"
        className="space-y-6"
      >
        <div hidden aria-hidden="true">
          <label htmlFor="inquiry-gotcha">Leave this blank</label>
          <input id="inquiry-gotcha" name="_gotcha" tabIndex={-1} autoComplete="off" />
        </div>
        <p className="text-sm">
          Fields marked * are required. This is a research inquiry, not an admissions application.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <label htmlFor="inquiry-name" className="block font-medium">
            Name *
            <input
              id="inquiry-name"
              name="name"
              autoComplete="name"
              required
              maxLength={100}
              pattern=".*\S.*"
              className={fieldClass}
            />
          </label>
          <label htmlFor="inquiry-email" className="block font-medium">
            Email *
            <input
              id="inquiry-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              className={fieldClass}
            />
          </label>
          <label htmlFor="inquiry-program" className="block font-medium">
            Program or position *
            <select
              id="inquiry-program"
              name="program"
              required
              defaultValue=""
              className={fieldClass}
            >
              <option value="" disabled>
                Select a path
              </option>
              <option>Bren — PhD</option>
              <option>Geography — PhD / MA–PhD</option>
              <option>PhD — deciding between Bren and Geography</option>
              <option>Postdoctoral research</option>
            </select>
          </label>
          <label htmlFor="inquiry-start" className="block font-medium">
            Intended start *
            <input id="inquiry-start" name="start" type="month" required className={fieldClass} />
          </label>
        </div>
        <label htmlFor="inquiry-institution" className="block font-medium">
          Current institution or role (optional)
          <input
            id="inquiry-institution"
            name="institution"
            maxLength={160}
            className={fieldClass}
          />
        </label>
        <fieldset aria-describedby={areaError ? 'inquiry-area-error' : 'inquiry-area-help'}>
          <legend className="font-medium">Research areas *</legend>
          <p id="inquiry-area-help" className="text-sm mt-1 mb-3">
            Select one or more areas you would like to explore.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {areas.map((area, index) => (
              <label key={area} className="flex items-start gap-3">
                <input
                  ref={index === 0 ? firstArea : undefined}
                  type="checkbox"
                  name="areas"
                  value={area}
                  onChange={() => setAreaError('')}
                  aria-invalid={!!areaError}
                  aria-describedby={
                    areaError ? 'inquiry-area-help inquiry-area-error' : 'inquiry-area-help'
                  }
                  className="mt-1 h-4 w-4 shrink-0 accent-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
                />
                <span>{area}</span>
              </label>
            ))}
          </div>
          {areaError && (
            <p id="inquiry-area-error" role="alert" className="mt-3 text-red-700 dark:text-red-300">
              {areaError}
            </p>
          )}
        </fieldset>
        <label htmlFor="inquiry-interests" className="block font-medium">
          What would you like to study with WAVES? *
          <span id="inquiry-interests-help" className="block text-sm font-normal mt-1">
            A short paragraph about your research question, relevant experience, and connection to
            the lab (50–1,500 characters).
          </span>
          <textarea
            id="inquiry-interests"
            name="interests"
            required
            minLength={50}
            maxLength={1500}
            rows={5}
            aria-describedby="inquiry-interests-help"
            className={fieldClass}
            onChange={(event) =>
              event.currentTarget.setCustomValidity(
                event.currentTarget.value.trim().length < 50
                  ? 'Please write at least 50 characters about your research interests.'
                  : '',
              )
            }
          />
        </label>
        <label htmlFor="inquiry-funding" className="block font-medium">
          Fellowships you are considering (optional)
          <span className="block text-sm font-normal mt-1">
            It is fine if you have not identified funding yet.
          </span>
          <textarea
            id="inquiry-funding"
            name="funding"
            maxLength={600}
            rows={2}
            className={fieldClass}
          />
        </label>
        <label htmlFor="inquiry-cv" className="block font-medium">
          CV, research profile, or personal website link (optional)
          <span id="inquiry-cv-help" className="block text-sm font-normal mt-1">
            Use an https:// link that the lab can open. A CV is optional for this first inquiry.
          </span>
          <input
            id="inquiry-cv"
            name="cv"
            type="url"
            pattern="https://.*"
            maxLength={1000}
            aria-describedby="inquiry-cv-help"
            className={fieldClass}
          />
        </label>
        <button
          type="submit"
          disabled={!ready}
          className="rounded-md bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
        >
          {endpoint ? 'Review inquiry' : 'Review inquiry (preview)'}
        </button>
      </form>
      {review && (
        <section
          className="mt-8 border-t border-gray-200 dark:border-slate-700 pt-6"
          aria-labelledby="inquiry-review-heading"
        >
          <h3
            id="inquiry-review-heading"
            ref={reviewHeading}
            tabIndex={-1}
            className="text-xl font-semibold mb-3"
          >
            Review your inquiry
          </h3>
          <p role="status" className="mb-4">
            {endpoint
              ? 'Check your details below, then send your inquiry. You can edit the fields above before sending.'
              : 'Your draft is ready to review. Nothing has been submitted; this form is a preview.'}
          </p>
          <dl className="space-y-3">
            {review.map(({ label, value }) => (
              <div key={label}>
                <dt className="font-semibold">{label}</dt>
                <dd className="whitespace-pre-wrap break-words">{value}</dd>
              </div>
            ))}
          </dl>
          {endpoint && (
            <form
              action={endpoint}
              method="POST"
              className="mt-6"
              onSubmit={() => setSending(true)}
            >
              {submission.map(([name, value], index) => (
                <input key={`${name}-${index}`} type="hidden" name={name} value={value} />
              ))}
              <input type="hidden" name="_subject" value="WAVES research inquiry" />
              <p className="text-sm mb-4">
                Formspree may ask you to complete a spam check before confirming delivery.{' '}
                <Link
                  href="/privacy"
                  className="text-blue-700 dark:text-blue-300 underline underline-offset-4"
                >
                  How we use your information
                </Link>
              </p>
              <button
                type="submit"
                disabled={sending}
                className="rounded-md bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
              >
                {sending ? 'Sending…' : 'Send inquiry'}
              </button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
