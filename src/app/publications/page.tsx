import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { fetchPublications, fetchFeaturedPublications, urlForImage, type Publication } from '@/lib/cms/client';

export default async function PublicationsPage() {
  // Fetch data from Sanity instead of reading MDX files
  const [allPublications, featuredPublications] = await Promise.all([
    fetchPublications(),
    fetchFeaturedPublications()
  ]);

  // Group by year
  const publicationsByYear = allPublications.reduce((acc, pub) => {
    const year = pub.publishedDate ? new Date(pub.publishedDate).getFullYear() : 'Unknown';
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(pub);
    return acc;
  }, {} as Record<string | number, Publication[]>);

  const years = Object.keys(publicationsByYear).sort((a, b) => {
    if (a === 'Unknown') return 1;
    if (b === 'Unknown') return -1;
    return Number(b) - Number(a);
  });

  const formatAuthors = (authors: Publication['authors']) => {
    if (!authors || authors.length === 0) return '';
    
    return authors
      .map(author => {
        if (author.person) {
          return author.person.name;
        }
        return author.name || 'Unknown Author';
      })
      .join(', ');
  };

  const renderPublicationCard = (publication: Publication, featured = false) => (
    <Card key={publication._id} className={`group hover:shadow-lg transition-all duration-300 ${featured ? 'border-wavesBlue/30' : ''}`}>
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Publication Image - using DOI-based image or placeholder */}
          <div className="flex-shrink-0 w-16 h-16 overflow-hidden rounded-lg bg-gray-100">
            <div className="w-full h-full bg-gradient-to-br from-wavesBlue/10 to-blue-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-wavesBlue" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 3H4a1 1 0 00-1 1v16a1 1 0 001 1h16a1 1 0 001-1V8.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0014.586 2H7a1 1 0 000 1zM5 5h7v2a1 1 0 001 1h2v11H5V5zm10 1.414L16.586 8H15V6.414z"/>
              </svg>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className={`font-semibold text-gray-900 group-hover:text-wavesBlue transition-colors leading-snug mb-3 ${featured ? 'text-lg' : 'text-base'}`}>
              <Link href={`/publications/${publication.slug.current}`} className="hover:underline">
                {publication.title}
              </Link>
            </h3>

            {/* Authors and Journal */}
            <div className="mb-3">
              {publication.authors && publication.authors.length > 0 && (
                <p className="text-sm text-gray-700 mb-1">
                  {formatAuthors(publication.authors)}
                </p>
              )}
              {publication.venue?.name && (
                <p className="text-sm text-wavesBlue font-medium">
                  {publication.venue.name}
                  {publication.publishedDate && (
                    <span className="text-gray-500"> ({new Date(publication.publishedDate).getFullYear()})</span>
                  )}
                </p>
              )}
            </div>

            {/* Abstract */}
            {publication.abstract && (
              <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                {publication.abstract}
              </p>
            )}

            {/* Keywords */}
            {publication.keywords && publication.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {publication.keywords.slice(0, 3).map((keyword, index) => (
                  <span 
                    key={index}
                    className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
                {publication.keywords.length > 3 && (
                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                    +{publication.keywords.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Links */}
            <div className="flex flex-wrap gap-2">
              <Button
                href={`/publications/${publication.slug.current}`}
                variant="outline"
                size="sm"
              >
                View Details
              </Button>
              
              {publication.doi && (
                <a
                  href={`https://doi.org/${publication.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  DOI
                </a>
              )}
              
              {publication.links?.publisher && (
                <a
                  href={publication.links.publisher}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                >
                  Publisher
                </a>
              )}
              
              {publication.links?.pdf && (
                <a
                  href={urlForImage(publication.links.pdf).url()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  PDF
                </a>
              )}

              {publication.isOpenAccess && (
                <span className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                  Open Access
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Publications
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our research contributions to understanding water, agriculture, and environmental systems 
              through peer-reviewed publications, conference papers, and technical reports.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-wavesBlue mb-2">{allPublications.length}</div>
              <div className="text-sm text-gray-600">Total Publications</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-wavesBlue mb-2">{years.filter(y => y !== 'Unknown').length}</div>
              <div className="text-sm text-gray-600">Years of Research</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-wavesBlue mb-2">{featuredPublications.length}</div>
              <div className="text-sm text-gray-600">Featured Articles</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-wavesBlue mb-2">
                {new Set(allPublications.map(p => p.venue?.name).filter(Boolean)).size}
              </div>
              <div className="text-sm text-gray-600">Journals</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Publications */}
      {featuredPublications.length > 0 && (
        <section className="py-16">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Publications</h2>
              <p className="text-lg text-gray-600">
                Highlighting our most impactful research contributions and recent breakthroughs.
              </p>
            </div>
            
            <div className="space-y-6">
              {featuredPublications.map(pub => renderPublicationCard(pub, true))}
            </div>
          </div>
        </section>
      )}

      {/* All Publications by Year */}
      <section className="py-16 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">All Publications</h2>
            <p className="text-lg text-gray-600">
              Complete list of research publications organized by year.
            </p>
          </div>

          {years.map(year => (
            <div key={year} className="mb-16">
              <div className="sticky top-20 bg-white/95 backdrop-blur-sm z-10 py-4 mb-8 border-b">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <span className="bg-wavesBlue text-white px-4 py-2 rounded-lg text-lg mr-4">
                    {year}
                  </span>
                  <span className="text-gray-500 text-sm font-normal">
                    {publicationsByYear[year].length} publication{publicationsByYear[year].length !== 1 ? 's' : ''}
                  </span>
                </h3>
              </div>
              
              <div className="space-y-4">
                {publicationsByYear[year].map(pub => renderPublicationCard(pub))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-wavesBlue">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Explore Our Research
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Interested in learning more about our research methods, collaborations, or latest findings? 
            Connect with us to discuss potential research opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              href="/contact" 
              variant="outline"
              className="bg-white text-wavesBlue border-white hover:bg-gray-50"
            >
              Contact Us
            </Button>
            <Button 
              href="/people" 
              variant="outline"
              className="text-white border-white hover:bg-white/10"
            >
              Meet Our Team
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
