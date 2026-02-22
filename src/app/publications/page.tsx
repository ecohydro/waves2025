import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { fetchPublications, type Publication } from '@/lib/cms/client';

// Always render this page dynamically so Sanity updates are reflected immediately
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PublicationsPage({
  searchParams,
}: {
  searchParams?: { type?: string; area?: string };
}) {
  // Fetch data from Sanity instead of reading MDX files
  const [allPublications] = await Promise.all([fetchPublications()]);

  // Determine current view from query params
  const view: 'articles' | 'presentations' =
    searchParams?.type === 'presentations' ? 'presentations' : 'articles';

  // Normalize area filter from query params
  const normalizeArea = (input: string): string | null => {
    const v = input.trim().toLowerCase();
    if (!v) return null;
    // Map URL-friendly keys to display names
    const areaMap: Record<string, string> = {
      'ecohydrology': 'Ecohydrology',
      'sensors': 'Sensors',
      'cnh': 'Coupled Natural-Human Systems',
      'coupled-natural-human-systems': 'Coupled Natural-Human Systems',
      'coupled natural-human systems': 'Coupled Natural-Human Systems',
    };
    const mapped = areaMap[v];
    return mapped || null;
  };

  const selectedAreaRaw = typeof searchParams?.area === 'string' ? searchParams?.area : undefined;
  const selectedArea = selectedAreaRaw ? normalizeArea(selectedAreaRaw) : null;

  // Filter based on selected view
  let filteredPublications = allPublications.filter((p) => {
    if (view === 'articles') {
      // Default: peer-reviewed publications (journal articles + conference papers)
      return (
        p.publicationType === 'journal-article' ||
        p.publicationType === 'conference-paper' ||
        p.category === 'journal' ||
        p.category === 'conference-proceedings'
      );
    }
    // Presentations/Abstracts view: include abstracts only (with category fallback)
    return p.publicationType === 'abstract' || p.category === 'conference-abstract';
  });

  if (selectedArea) {
    filteredPublications = filteredPublications.filter((p) => {
      if (Array.isArray(p.researchAreas)) {
        return p.researchAreas.some((a) => a === selectedArea);
      }
      // Fallback to keywords if researchAreas not set
      if (Array.isArray(p.keywords)) {
        return p.keywords.some((k) => k === selectedArea);
      }
      return false;
    });
  }

  // Compute featured publications: most recent up to 4 with > 30 citations
  const featuredPublications = filteredPublications
    .filter((p) => (p.metrics?.citations ?? 0) > 30)
    .sort((a, b) => {
      const aTime = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
      const bTime = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 4);

  // Group by year
  const publicationsByYear = filteredPublications.reduce(
    (acc, pub) => {
      const year = pub.publishedDate ? new Date(pub.publishedDate).getFullYear() : 'Unknown';
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(pub);
      return acc;
    },
    {} as Record<string | number, Publication[]>,
  );

  const years = Object.keys(publicationsByYear).sort((a, b) => {
    if (a === 'Unknown') return 1;
    if (b === 'Unknown') return -1;
    return Number(b) - Number(a);
  });

  // Unique authors across filtered publications
  const uniqueAuthors = new Set<string>();
  for (const publication of filteredPublications) {
    if (!publication.authors) continue;
    for (const author of publication.authors) {
      const name = author?.person?.name || author?.name || 'Unknown Author';
      uniqueAuthors.add(name);
    }
  }

  // Compute co-author count as unique authors minus 1 (primary author), floored at 0
  const coAuthorCount = Math.max(0, uniqueAuthors.size - 1);

  const renderAuthors = (authors: Publication['authors']) => {
    if (!authors || authors.length === 0) return null;

    const parts = authors.map((author, index) => {
      const displayName = author.person?.name || author.name || 'Unknown Author';
      const slug = author.person && (author.person as any).slug?.current;
      const element = slug ? (
        <Link key={`${slug}-${index}`} href={`/people/${slug}`} className="hover:underline">
          {displayName}
        </Link>
      ) : (
        <span key={`${displayName}-${index}`}>{displayName}</span>
      );
      return (
        <span key={`author-${index}`}>
          {element}
          {index < authors.length - 1 ? ', ' : ''}
        </span>
      );
    });

    return <>{parts}</>;
  };

  const formatCitation = (publication: Publication) => {
    const authors = publication.authors;
    const title = publication.title ? `"${publication.title}"` : '';
    const venue = publication.venue?.name || '';
    const year = publication.publishedDate ? new Date(publication.publishedDate).getFullYear() : '';
    const doi = publication.doi ? `doi:${publication.doi}` : '';

    const authorText = (authors || [])
      .map((a) => a.person?.name || a.name || 'Unknown Author')
      .join(', ');
    return `${authorText}. ${title} ${venue} (${year}). ${doi}`.replace(/\s+/g, ' ').trim();
  };

  const renderPublicationCard = (publication: Publication, featured = false) => (
    <Card
      key={publication._id}
      className={`group hover:shadow-lg transition-all duration-300 h-full ${featured ? 'border-wavesBlue/30' : ''}`}
    >
      <CardContent className="p-6 flex flex-col h-full">
        {/* Title */}
        <h3
          className={`font-semibold text-gray-900 dark:text-white group-hover:text-wavesBlue transition-colors leading-snug mb-2 ${featured ? 'text-lg' : 'text-base'}`}
        >
          <Link href={`/publications/${publication.slug.current}`} className="hover:underline">
            {publication.title}
          </Link>
        </h3>

        {/* Authors and Journal */}
        <div className="mb-2">
          {publication.authors && publication.authors.length > 0 && (
            <p className="text-sm text-gray-700 dark:text-gray-100">{renderAuthors(publication.authors)}</p>
          )}
          {publication.venue?.name && (
            <p className="text-sm text-wavesBlue font-medium mt-1.5">{publication.venue.name}</p>
          )}
        </div>

        {/* Spacer to push footer to bottom */}
        <div className="mt-2 flex-1" />

        {/* Badges removed on list page for performance and to avoid third-party overlays */}

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Button href={`/publications/${publication.slug.current}`} variant="outline" size="sm">
            View Details
          </Button>

          {publication.doi && (
            <a
              href={`https://doi.org/${publication.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block max-w-full break-all px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              title={`doi:${publication.doi}`}
            >
              {`doi:${publication.doi}`}
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-white dark:bg-slate-950 border-b">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Publications & Presentations
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-200 max-w-3xl mx-auto">
              Explore our peer-reviewed research outputs and conference presentations.
            </p>
            {/* View Toggle */}
            <div className="mt-6 inline-flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <Link href="/publications" className="no-underline">
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === 'articles'
                      ? 'bg-wavesBlue text-white'
                      : 'bg-transparent text-gray-700 dark:text-gray-100 hover:bg-white dark:bg-slate-950'
                  }`}
                >
                  Publications
                </button>
              </Link>
              <Link href="/publications?type=presentations" className="no-underline">
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === 'presentations'
                      ? 'bg-wavesBlue text-white'
                      : 'bg-transparent text-gray-700 dark:text-gray-100 hover:bg-white dark:bg-slate-950'
                  }`}
                >
                  Conference Presentations & Abstracts
                </button>
              </Link>
            </div>

            {/* Research Area Filter */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {[
                { label: 'All', value: '' },
                { label: 'Ecohydrology', value: 'ecohydrology' },
                { label: 'Coupled Natural-Human Systems', value: 'cnh' },
                { label: 'Sensors', value: 'sensors' },
              ].map((opt) => {
                const href = opt.value
                  ? `/publications?${view === 'presentations' ? 'type=presentations&' : ''}area=${opt.value}`
                  : `/publications${view === 'presentations' ? '?type=presentations' : ''}`;
                const isActive =
                  (opt.value === '' && !selectedAreaRaw) ||
                  (opt.value !== '' && selectedAreaRaw === opt.value);
                return (
                  <Link href={href} key={opt.value || 'all'} className="no-underline">
                    <button
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                        isActive
                          ? 'bg-wavesBlue text-white border-wavesBlue'
                          : 'bg-white dark:bg-slate-950 text-gray-700 dark:text-gray-100 border-gray-300 hover:bg-gray-50 dark:bg-slate-900'
                      }`}
                    >
                      {opt.label}
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-slate-950">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-wavesBlue mb-2">
                {filteredPublications.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-200">Total Publications</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-wavesBlue mb-2">{coAuthorCount}</div>
              <div className="text-sm text-gray-600 dark:text-gray-200">Co-authors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Publications */}
      {featuredPublications.length > 0 && (
        <section className="py-16">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Featured Publications</h2>
              <p className="text-lg text-gray-600 dark:text-gray-200">
                Highlighting our most impactful research contributions and recent breakthroughs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPublications.map((pub) => renderPublicationCard(pub, true))}
            </div>
          </div>
        </section>
      )}

      {/* All Publications by Year */}
      <section className="py-16 bg-white dark:bg-slate-950">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">All Publications</h2>
            <p className="text-lg text-gray-600 dark:text-gray-200">
              {view === 'articles'
                ? 'Peer-reviewed publications (journal articles and conference papers) organized by year.'
                : 'Conference presentations and abstracts organized by year.'}
            </p>
          </div>

          {years.map((year) => (
            <div key={year} className="mb-16">
              <div className="sticky top-20 bg-white dark:bg-slate-950/95 backdrop-blur-sm z-10 py-4 mb-8 border-b">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <span className="bg-wavesBlue text-white px-4 py-2 rounded-lg text-lg mr-4">
                    {year}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm font-normal">
                    {publicationsByYear[year].length} publication
                    {publicationsByYear[year].length !== 1 ? 's' : ''}
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {publicationsByYear[year].map((pub) => renderPublicationCard(pub))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-wavesBlue">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Explore Our Research</h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Interested in learning more about our research methods, collaborations, or latest
            findings? Connect with us to discuss potential research opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/contact"
              variant="outline"
              className="bg-white dark:bg-slate-950 text-wavesBlue border-white hover:bg-gray-50 dark:bg-slate-900"
            >
              Contact Us
            </Button>
            <Button
              href="/people"
              variant="outline"
              className="text-white border-white hover:bg-white dark:bg-slate-950/10"
            >
              Meet Our Team
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
