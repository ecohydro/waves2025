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
          </div>
        </div>
      </section>
    </main>
  );
}
