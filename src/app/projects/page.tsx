import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { fetchProjects, type Project } from '@/lib/cms/client';

import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Research Projects',
  description:
    'Current and past projects across ecohydrology, coupled natural-human systems, and environmental sensing.',
  path: '/projects',
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function formatDate(date?: string) {
  if (!date) return null;
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return null;
  return value.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
}

function statusLabel(status: Project['status']) {
  switch (status) {
    case 'active':
      return 'Active';
    case 'completed':
      return 'Completed';
    case 'on-hold':
      return 'On Hold';
    case 'planning':
      return 'Planning';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Unknown';
  }
}

function statusClass(status: Project['status']) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'planning':
      return 'bg-purple-100 text-purple-800';
    case 'on-hold':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default async function ProjectsPage() {
  let projects: Project[] = [];
  let unavailable = false;

  try {
    projects = await fetchProjects();
  } catch {
    unavailable = true;
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <section className="bg-white dark:bg-slate-950 border-b">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Research Projects
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-200 max-w-3xl mx-auto">
              Explore current and past projects across ecohydrology, coupled natural-human systems,
              and environmental sensing.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {projects.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600 dark:text-gray-200 mb-4">
                  {unavailable
                    ? 'Project details are temporarily unavailable. Please try again later, or explore our research themes and publications.'
                    : 'Explore the questions, methods, and findings behind our work through our research themes and publications.'}
                </p>
                <Button href="/research" variant="outline">
                  Explore research themes
                </Button>
                <div className="mt-4">
                  <Button href="/publications" variant="outline">
                    Browse publications
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const start = formatDate(project.startDate);
                const end = formatDate(project.endDate);

                return (
                  <Card key={project._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusClass(project.status)}`}
                        >
                          {statusLabel(project.status)}
                        </span>
                        {project.isFeatured ? (
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        ) : null}
                      </div>

                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        <Link
                          href={`/projects/${project.slug.current}`}
                          className="underline underline-offset-4"
                        >
                          {project.title}
                        </Link>
                      </h2>
                      <p className="text-gray-600 dark:text-gray-200 mb-4 line-clamp-3">
                        {project.shortDescription || 'No summary available.'}
                      </p>

                      {(start || end) && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          {start || 'Unknown start'}
                          {end ? ` - ${end}` : project.status === 'active' ? ' - Present' : ''}
                        </p>
                      )}

                      {project.researchAreas && project.researchAreas.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.researchAreas.slice(0, 3).map((area) => (
                            <span
                              key={area}
                              className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
