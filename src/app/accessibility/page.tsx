export default function AccessibilityPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-white border-b">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Accessibility</h1>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              We aim to make this site usable across devices and assistive technologies. If you
              encounter accessibility issues, please contact the lab and include the page URL plus a
              brief description of the issue.
            </p>
            <p>
              Accessibility feedback helps us prioritize improvements in navigation, semantic
              structure, color contrast, and keyboard interaction.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
