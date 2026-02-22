import { Button } from '@/components/ui/Button';

export default function OpportunitiesPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <section className="bg-white dark:bg-slate-950 border-b">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-6">Opportunities</h1>
          <p className="text-lg text-gray-700 dark:text-gray-200 mb-6">
            We regularly welcome undergraduate researchers, graduate students, postdoctoral scholars,
            and collaborators working at the intersection of water, vegetation, and society.
          </p>
          <p className="text-gray-700 dark:text-gray-200 mb-8">
            For openings, research fit, and application guidance, contact the lab directly.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button href="/contact" variant="outline">
              Contact the Lab
            </Button>
            <Button href="/people" variant="outline">
              Meet the Team
            </Button>
            <Button href="/research" variant="outline">
              Explore Research Areas
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
