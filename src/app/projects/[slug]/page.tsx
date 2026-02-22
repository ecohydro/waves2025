import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { fetchProjectBySlug } from '@/lib/cms/client';

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(date?: string) {
  if (!date) return null;
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return null;
  return value.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = await fetchProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const start = formatDate(project.startDate);
  const end = formatDate(project.endDate);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-950 border-b">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/projects" className="text-wavesBlue hover:text-blue-800 font-medium">
            ← Back to Projects
          </Link>
        </div>
      </div>

      <section className="py-14 bg-white dark:bg-slate-950 border-b">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{project.title}</h1>
          {project.shortDescription ? (
            <p className="text-xl text-gray-600 dark:text-gray-200 mb-4">{project.shortDescription}</p>
          ) : null}
          {(start || end) && (
            <p className="text-gray-500 dark:text-gray-400">
              {start || 'Unknown start'}
              {end ? ` - ${end}` : project.status === 'active' ? ' - Present' : ''}
            </p>
          )}
        </div>
      </section>

      <section className="py-14">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Overview</h2>
              <p className="text-gray-700 dark:text-gray-100 leading-relaxed whitespace-pre-line">
                {project.description || project.shortDescription || 'No overview available.'}
              </p>
            </CardContent>
          </Card>

          {project.researchAreas && project.researchAreas.length > 0 && (
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Research Areas</h2>
                <div className="flex flex-wrap gap-2">
                  {project.researchAreas.map((area) => (
                    <span
                      key={area}
                      className="inline-block px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {project.participants && project.participants.length > 0 && (
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Team</h2>
                <ul className="space-y-2 text-gray-700 dark:text-gray-100">
                  {project.participants.map((participant, index) => (
                    <li key={`${participant.person?._id || participant.externalName || index}`}>
                      {participant.person?.name || participant.externalName || 'Unknown'}
                      {participant.role ? ` · ${participant.role}` : ''}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {project.links && (
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Resources</h2>
                <div className="flex flex-wrap gap-3">
                  {project.links.website && (
                    <Button href={project.links.website} variant="outline">
                      Project Website
                    </Button>
                  )}
                  {project.links.repository && (
                    <Button href={project.links.repository} variant="outline">
                      Repository
                    </Button>
                  )}
                  {project.links.dataset && (
                    <Button href={project.links.dataset} variant="outline">
                      Dataset
                    </Button>
                  )}
                  {project.links.documentation && (
                    <Button href={project.links.documentation} variant="outline">
                      Documentation
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
