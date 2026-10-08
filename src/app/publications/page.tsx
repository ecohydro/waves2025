import filterStyles from './PublicationFilters.module.css';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { fetchPublications, type Publication } from '@/lib/cms/client';

import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Publications',
  description:
    'Peer-reviewed articles, preprints, conference papers, and abstracts from the WAVES Lab at UC Santa Barbara.',
  path: '/publications',
});

// Always render this page dynamically so Sanity updates are reflected immediately
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PublicationsPage({
  searchParams,
}: {
  searchParams?: { type?: string; area?: string; author?: string };
}) {
  // Fetch data from Sanity instead of reading MDX files
  const [allPublications] = await Promise.all([fetchPublications()]);

  // Determine current view from query params
  const view =
    searchParams?.type === 'presentations'
      ? 'presentations'
      : 'articles';

  // Normalize area filter from query params
  const normalizeArea = (input: string): string | null => {
    const v = input.trim().toLowerCase();
    if (!v) return null;
    // Map URL-friendly keys to display names
    const areaMap: Record<string, string> = {
      ecohydrology: 'Ecohydrology',
      sensors: 'Sensors',
      cnh: 'Coupled Natural-Human Systems',
      'coupled-natural-human-systems': 'Coupled Natural-Human Systems',
      'coupled natural-human systems': 'Coupled Natural-Human Systems',
      misc: 'Misc',
    };
    const mapped = areaMap[v];
    return mapped || null;
  };

  const selectedAreaRaw = typeof searchParams?.area === 'string' ? searchParams?.area : undefined;
  const selectedArea = selectedAreaRaw ? normalizeArea(selectedAreaRaw) : null;

  // Filter based on selected view
  let filteredPublications = allPublications.filter((p) => {
    if (view === 'articles') {
      if (p.publicationType === 'preprint' || p.publicationType === 'abstract') return false;
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

  // Filter by author if query param is present
  const selectedAuthor = typeof searchParams?.author === 'string' ? searchParams.author : null;
  if (selectedAuthor) {
    filteredPublications = filteredPublications.filter((p) =>
      p.authors?.some((a) => a.person?.slug?.current === selectedAuthor),
    );
  }

  // Editorial selections may include recent work before citations accumulate.
  const featuredPublications = filteredPublications
    .filter((p) => p.isFeatured)
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

  function filterHref(change: { type?: string; area?: string }) {
    const params = new URLSearchParams();
    const type = change.type ?? view;
    const area = change.area ?? selectedAreaRaw;
    if (type !== 'articles') params.set('type', type);
    if (area) params.set('area', area);
    if (selectedAuthor) params.set('author', selectedAuthor);
    const query = params.toString();
    return `/publications${query ? `?${query}` : ''}`;
  }
  const authorName =
    allPublications
      .flatMap((p) => p.authors || [])
      .find((a) => a.person?.slug?.current === selectedAuthor)?.person?.name || selectedAuthor;
  const areaLabel = selectedArea === 'Sensors' ? 'Environmental Sensing' : selectedArea;
  const viewLabel =
    view === 'presentations'
        ? 'Conference presentations and abstracts'
        : 'Journal articles and conference papers';

  const renderAuthors = (authors: Publication['authors']) => {
    if (!authors || authors.length === 0) return null;

    const parts = authors.map((author, index) => {
      const displayName = author.person?.name || author.name || 'Unknown Author';
      const slug = author.person?.slug?.current;
      const element = slug ? (
        <Link key={`${slug}-${index}`} href={`/people/${slug}`} className="underline underline-offset-2">
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

  const renderPublicationCard = (publication: Publication, featured = false) => {
    const Heading = featured ? 'h3' : 'h4';
    return (
      <Card
        key={publication._id}
        className={`group hover:shadow-lg transition-all duration-300 h-full ${featured ? 'border-wavesBlue/30' : ''}`}
      >
        <CardContent className="p-6 flex flex-col h-full">
          {/* Title */}
          <Heading
            className={`font-semibold text-gray-900 dark:text-white group-hover:text-wavesBlue transition-colors leading-snug mb-2 ${featured ? 'text-lg' : 'text-base'}`}
          >
            <Link href={`/publications/${publication.slug.current}`} className="hover:underline">
              {publication.title}
            </Link>
          </Heading>

          {/* Authors and Journal */}
          <div className="mb-2">
            {publication.authors && publication.authors.length > 0 && (
              <p className="text-sm text-gray-700 dark:text-gray-100">
                {renderAuthors(publication.authors)}
              </p>
            )}
            {publication.venue?.name && (
              <p className="text-sm text-wavesBlue font-medium mt-1.5">{publication.venue.name}</p>
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-200 mb-3">
            {publication.publicationType === 'preprint'
              ? 'Preprint · not peer reviewed'
              : publication.publicationType === 'abstract' ||
                  publication.category === 'conference-abstract'
                ? 'Conference abstract'
                : publication.publicationType === 'conference-paper' ||
                    publication.category === 'conference-proceedings'
                  ? 'Conference paper'
                  : 'Journal article'}
          </p>
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
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-white dark:bg-slate-950 border-b">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Publications & Presentations
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-200 max-w-3xl mx-auto">
              Explore journal articles, conference papers, and conference abstracts from
              WAVES.
            </p>
            <nav aria-label="Publication type" className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                { value: 'articles', label: 'Publications' },
                { value: 'presentations', label: 'Conference Presentations & Abstracts' },
              ].map((option) => (
                <Link
                  key={option.value}
                  href={filterHref({ type: option.value })}
                  aria-current={view === option.value ? 'true' : undefined}
                  className={filterStyles.filter}
                >
                  {option.label}
                </Link>
              ))}
            </nav>
            <nav aria-label="Research area" className="mt-6 flex flex-wrap gap-2 justify-center">
              {[
                { label: 'All research areas', value: '', area: null },
                { label: 'Ecohydrology', value: 'ecohydrology', area: 'Ecohydrology' },
                {
                  label: 'Coupled Natural-Human Systems',
                  value: 'cnh',
                  area: 'Coupled Natural-Human Systems',
                },
                { label: 'Environmental Sensing', value: 'sensors', area: 'Sensors' },
                { label: 'Other research', value: 'misc', area: 'Misc' },
              ].map((option) => (
                <Link
                  key={option.value}
                  href={filterHref({ area: option.value })}
                  aria-current={selectedArea === option.area ? 'true' : undefined}
                  className={`${filterStyles.filter} ${filterStyles.area}`}
                >
                  {option.label}
                </Link>
              ))}
            </nav>
            <p className="mt-6 text-gray-700 dark:text-gray-100">
              Showing: {viewLabel}
              {areaLabel ? ` · ${areaLabel}` : ''}
              {authorName ? ` · Author: ${authorName}` : ''}.
            </p>
            {(selectedAreaRaw || selectedAuthor || view !== 'articles') && (
              <Link
                href="/publications"
                className="mt-3 inline-block text-blue-700 dark:text-blue-300 underline underline-offset-4"
              >
                Clear all filters
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured Publications */}
      {featuredPublications.length > 0 && (
        <section aria-labelledby="featured-publications-heading" className="py-16">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2
                id="featured-publications-heading"
                className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
              >
                Featured Publications
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-200">
                Selected research from the lab. Read each record for authors, publication details,
                and available resources.
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
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              All Publications
            </h2>
            <p
              role="status"
              aria-atomic="true"
              className="text-lg text-gray-600 dark:text-gray-200"
            >
              {viewLabel} organized by year. {filteredPublications.length} matching record
              {filteredPublications.length === 1 ? '' : 's'}.
            </p>
          </div>

          {years.length === 0 && (
            <p className="text-gray-700 dark:text-gray-100">
              No publications match these filters. Try another research area or clear all filters
              above.
            </p>
          )}
          {years.map((year) => (
            <div key={year} className="mb-16">
              <div className="py-4 mb-8 border-b">
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
      <section className="py-16 bg-blue-900">
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
