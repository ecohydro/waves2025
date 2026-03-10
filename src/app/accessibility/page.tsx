export default function AccessibilityPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <section className="bg-white dark:bg-slate-950 border-b">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Accessibility</h1>

          <div className="space-y-8 text-gray-700 dark:text-gray-100 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Our Commitment</h2>
              <p>
                The WAVES Research Lab at UC Santa Barbara is committed to ensuring digital
                accessibility for people with disabilities. We continually improve the user
                experience for everyone and apply the relevant accessibility standards to
                meet or exceed requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Conformance Status</h2>
              <p>
                This website aims to conform to the{' '}
                <a
                  href="https://www.w3.org/TR/WCAG21/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-wavesBlue hover:text-blue-800 underline"
                >
                  Web Content Accessibility Guidelines (WCAG) 2.1 Level AA
                </a>
                . These guidelines explain how to make web content more accessible for people
                with disabilities and more user-friendly for everyone.
              </p>
              <p className="mt-2">
                This commitment aligns with the{' '}
                <a
                  href="https://www.ucop.edu/electronic-accessibility/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-wavesBlue hover:text-blue-800 underline"
                >
                  University of California Electronic Accessibility policy
                </a>
                , which requires digital content to be accessible to people with disabilities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Scope</h2>
              <p>
                This accessibility statement applies to all web pages hosted on this website.
                Accessibility efforts cover page structure, navigation, images, forms,
                color contrast, keyboard interaction, and screen reader compatibility.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Known Limitations</h2>
              <p>
                Despite our efforts to ensure accessibility, some content may not yet be
                fully accessible. The following known limitations exist:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  <strong>Downloadable documents:</strong> Some PDF publications and
                  downloadable files may not be fully accessible. We are working to
                  improve the accessibility of these documents. If you need an accessible
                  version of a specific document, please contact us.
                </li>
                <li>
                  <strong>Third-party content:</strong> Some content provided by external
                  services may not meet the same accessibility standards. We work with
                  our vendors to address accessibility concerns as they arise.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Feedback</h2>
              <p>
                We welcome your feedback on the accessibility of this website. If you
                encounter accessibility barriers or have suggestions for improvement, please
                contact us:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  <strong>Email:</strong>{' '}
                  <a
                    href="mailto:caylor@ucsb.edu"
                    className="text-wavesBlue hover:text-blue-800 underline"
                  >
                    caylor@ucsb.edu
                  </a>
                </li>
                <li>
                  <strong>Subject line:</strong> Accessibility Feedback — WAVES Lab Website
                </li>
              </ul>
              <p className="mt-3">
                When reporting an accessibility issue, please include:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>The page URL where you encountered the issue</li>
                <li>A description of the problem</li>
                <li>The assistive technology you were using (if applicable)</li>
                <li>Your contact information so we can follow up</li>
              </ul>
              <p className="mt-3">
                We aim to respond to accessibility feedback within 5 business days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Technical Specifications</h2>
              <p>
                This website relies on the following technologies for conformance with
                WCAG 2.1 Level AA:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-1">
                <li>HTML</li>
                <li>WAI-ARIA</li>
                <li>CSS</li>
                <li>JavaScript</li>
              </ul>
            </section>

            <section className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                This accessibility statement was last reviewed on March 10, 2026.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
