import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import PublicationBadges from '@/components/publications/Badges';
import {
  fetchPublicationBySlug,
  fetchPublications,
  urlForImage,
  type Publication,
} from '@/lib/cms/client';

interface PublicationDetailProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicationDetail({ params }: PublicationDetailProps) {
  const { slug } = await params;

  // Check for preview mode
  const cookieStore = await cookies();
  const isPreview = cookieStore.has('__prerender_bypass') && cookieStore.has('__next_preview_data');

  const publication = await fetchPublicationBySlug(slug, isPreview);

  if (!publication) {
    notFound();
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAuthorsForCitation = () => {
    if (!publication.authors || publication.authors.length === 0) {
      return '';
    }

    return publication.authors
      .map((author, index) => {
        let name = '';
        if (author.person) {
          name = author.person.name;
        } else if (author.name) {
          name = author.name;
        } else {
          name = 'Unknown Author';
        }

        // Mark corresponding authors
        if (author.isCorresponding) {
          name = `${name}*`;
        }

        return name;
      })
      .join(', ');
  };

  const getPublicationTypeLabel = (type: string) => {
    switch (type) {
      case 'journal-article':
        return 'Journal Article';
      case 'conference-paper':
        return 'Conference Paper';
      case 'abstract':
        return 'Abstract';
      case 'book-chapter':
        return 'Book Chapter';
      case 'preprint':
        return 'Preprint';
      case 'thesis':
        return 'Thesis';
      case 'report':
        return 'Report';
      case 'book':
        return 'Book';
      default:
        return 'Publication';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'in-press':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-purple-100 text-purple-800';
      case 'under-review':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-orange-100 text-orange-800';
      case 'in-preparation':
        return 'bg-gray-100 text-gray-800';
      case 'preprint':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/publications"
            className="inline-flex items-center text-wavesBlue hover:text-blue-800 font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Publications
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Publication Metadata */}
            <div className="flex flex-wrap gap-2 items-center mb-6">
              <span
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(publication.status)}`}
              >
                {publication.status.charAt(0).toUpperCase() +
                  publication.status.slice(1).replace('-', ' ')}
              </span>
              <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {getPublicationTypeLabel(publication.publicationType)}
              </span>
              {publication.isFeatured && (
                <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  Featured
                </span>
              )}
              {publication.isOpenAccess && (
                <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Open Access
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {publication.title}
            </h1>

            {/* Authors */}
            {publication.authors && publication.authors.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {publication.authors.map((author, index) => (
                    <span key={index} className="inline-flex items-center">
                      {author.person ? (
                        <Link
                          href={`/people/${author.person.slug.current}`}
                          className="text-wavesBlue hover:text-blue-800 font-medium"
                        >
                          {author.person.name}
                        </Link>
                      ) : (
                        <span className="text-gray-700 font-medium">
                          {author.name || 'Unknown Author'}
                        </span>
                      )}
                      {author.isCorresponding && (
                        <span className="ml-1 text-xs text-blue-600" title="Corresponding author">
                          *
                        </span>
                      )}
                      {index < publication.authors.length - 1 && (
                        <span className="text-gray-500 mr-2">,</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Publication Details */}
            {publication.venue && (
              <div className="flex flex-wrap gap-4 text-lg text-gray-600 mb-8">
                <span className="font-medium text-wavesBlue">{publication.venue.name}</span>
                {publication.venue.volume && <span>Vol. {publication.venue.volume}</span>}
                {publication.venue.issue && <span>Issue {publication.venue.issue}</span>}
                {publication.venue.pages && <span>pp. {publication.venue.pages}</span>}
                {publication.publishedDate && (
                  <span>({new Date(publication.publishedDate).getFullYear()})</span>
                )}
              </div>
            )}

            {/* Badges */}
            <div className="mb-8">
              <PublicationBadges doi={publication.doi} />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4 mb-8">
              {publication.doi && (
                <a
                  href={`https://doi.org/${publication.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7z" />
                  </svg>
                  View on Publisher
                </a>
              )}

              {publication.links?.pdf && (
                <a
                  href={urlForImage(publication.links.pdf).url()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                  Download PDF
                </a>
              )}

              {publication.links?.preprint && (
                <a
                  href={publication.links.preprint}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Preprint
                </a>
              )}

              {publication.links?.code && (
                <a
                  href={publication.links.code}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Code
                </a>
              )}

              {publication.links?.dataset && (
                <a
                  href={publication.links.dataset}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Dataset
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Abstract */}
                {publication.abstract && (
                  <Card>
                    <CardContent className="p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Abstract</h2>
                      <div className="prose prose-lg max-w-none text-gray-700">
                        <p className="leading-relaxed">{publication.abstract}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Keywords */}
                {publication.keywords && publication.keywords.length > 0 && (
                  <Card>
                    <CardContent className="p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Keywords</h2>
                      <div className="flex flex-wrap gap-2">
                        {publication.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="inline-block px-4 py-2 bg-wavesBlue/10 text-wavesBlue rounded-lg font-medium"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Citation */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Citation</h2>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <p className="text-sm text-gray-800 leading-relaxed break-words break-all">
                        {formatAuthorsForCitation()}.
                        {publication.title && ` "${publication.title}".`}
                        {publication.venue?.name && ` ${publication.venue.name}`}
                        {publication.venue?.volume && ` ${publication.venue.volume}`}
                        {publication.venue?.issue && `.${publication.venue.issue}`}
                        {publication.venue?.pages && ` (${publication.venue.pages})`}
                        {publication.publishedDate &&
                          ` (${new Date(publication.publishedDate).getFullYear()})`}
                        {publication.doi && `. doi:${publication.doi}`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Publication Info */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Publication Details
                    </h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Type</dt>
                        <dd className="text-sm text-gray-900">
                          {getPublicationTypeLabel(publication.publicationType)}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="text-sm text-gray-900">
                          {publication.status.charAt(0).toUpperCase() +
                            publication.status.slice(1).replace('-', ' ')}
                        </dd>
                      </div>

                      {publication.publishedDate && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Published</dt>
                          <dd className="text-sm text-gray-900">
                            {formatDate(publication.publishedDate)}
                          </dd>
                        </div>
                      )}

                      {publication.submittedDate && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Submitted</dt>
                          <dd className="text-sm text-gray-900">
                            {formatDate(publication.submittedDate)}
                          </dd>
                        </div>
                      )}

                      {publication.acceptedDate && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Accepted</dt>
                          <dd className="text-sm text-gray-900">
                            {formatDate(publication.acceptedDate)}
                          </dd>
                        </div>
                      )}

                      {publication.doi && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">DOI</dt>
                          <dd className="text-sm text-gray-900 break-all">{publication.doi}</dd>
                        </div>
                      )}

                      {publication.venue?.publisher && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Publisher</dt>
                          <dd className="text-sm text-gray-900">{publication.venue.publisher}</dd>
                        </div>
                      )}
                    </dl>
                  </CardContent>
                </Card>

                {/* Metrics */}
                {publication.metrics &&
                  (publication.metrics.citations || publication.metrics.altmetricScore) && (
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Metrics</h3>
                        <dl className="space-y-3">
                          {publication.metrics.citations && (
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Citations</dt>
                              <dd className="text-2xl font-bold text-wavesBlue">
                                {publication.metrics.citations}
                              </dd>
                            </div>
                          )}
                          {publication.metrics.altmetricScore && (
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Altmetric Score</dt>
                              <dd className="text-2xl font-bold text-wavesBlue">
                                {publication.metrics.altmetricScore}
                              </dd>
                            </div>
                          )}
                          {publication.metrics.impactFactor && (
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Impact Factor</dt>
                              <dd className="text-lg font-semibold text-gray-900">
                                {publication.metrics.impactFactor}
                              </dd>
                            </div>
                          )}
                          {publication.metrics.quartile && (
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Quartile</dt>
                              <dd className="text-lg font-semibold text-gray-900">
                                {publication.metrics.quartile}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </CardContent>
                    </Card>
                  )}

                {/* External Links */}
                {publication.links && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Links</h3>
                      <div className="space-y-3">
                        {publication.links.publisher && (
                          <a
                            href={publication.links.publisher}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                          >
                            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-white"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7z" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">
                              Publisher
                            </span>
                          </a>
                        )}

                        {publication.links.supplementary && (
                          <a
                            href={publication.links.supplementary}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                          >
                            <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-white"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">
                              Supplementary Material
                            </span>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export async function generateStaticParams() {
  // Don't generate static params for preview content
  const publications = await fetchPublications(false);
  return publications.map((publication) => ({
    slug: publication.slug.current,
  }));
}
