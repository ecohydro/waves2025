import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Privacy Policy',
  description: 'What the WAVES Lab site collects, why, and what happens to it.',
  path: '/privacy',
});
export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <section className="bg-white dark:bg-slate-950 border-b">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Privacy Policy</h1>
          <div className="space-y-4 text-gray-700 dark:text-gray-100 leading-relaxed">
            <p>
              This site is maintained for research communication and educational purposes. We limit
              collection of personal data and only use operational analytics needed to keep the site
              reliable.
            </p>
            <p>
              Contact us through the lab email listed on the Contact page if you need a correction,
              removal, or have privacy-related questions.
            </p>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white pt-4">General contact messages</h2>
            <p>When you send a general contact message, we use your name, email address, topic, and message to respond. These messages are processed and stored by Formspree and delivered to the lab, using the same service described below. Information is sent when you choose “Send message.” Please omit sensitive personal information that is not needed for your inquiry.</p>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white pt-4">
              Recruitment inquiries
            </h2>
            <p>
              When you send a recruitment inquiry, we use your name, email, research interests,
              program preference, intended start date, and any optional information you provide to
              consider research fit and respond to you. This is separate from applying for admission
              to UC Santa Barbara.
            </p>
            <p>
              Submissions are processed and stored by Formspree and delivered to the lab. Formspree
              also processes technical information, such as your IP address and browser details, to
              operate the service and prevent spam. Read{' '}
              <a
                href="https://formspree.io/legal/privacy-policy/"
                className="text-blue-700 dark:text-blue-300 underline underline-offset-4"
              >
                Formspree’s privacy policy
              </a>{' '}
              for details. The form accepts an optional CV or profile link, not file uploads. Please
              omit sensitive personal information unrelated to your research inquiry.
            </p>
            <p>
              Reviewing your inquiry on this site does not send it. Information is sent to Formspree
              only when you choose “Send inquiry.” To request correction or deletion of an inquiry
              held by the lab, contact caylor@ucsb.edu.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
