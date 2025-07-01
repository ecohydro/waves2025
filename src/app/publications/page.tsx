import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import Image from 'next/image';
import matter from 'gray-matter';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface PublicationData {
  title: string;
  slug: string;
  authors?: string[];
  journal?: string;
  year?: number;
  doi?: string;
  abstract?: string;
  publicationType?: string;
  tags?: string[];
  featured?: boolean;
  image?: string;
  url?: string;
  pdfUrl?: string;
}

export default function PublicationsPage() {
  const publicationsDir = path.join(process.cwd(), 'content', 'publications');
  const files = fs.readdirSync(publicationsDir).filter((f) => f.endsWith('.mdx'));
  
  const publications: PublicationData[] = files.map((filename) => {
    const filePath = path.join(publicationsDir, filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContent);
    
    return {
      title: data.title || filename.replace(/\.mdx$/, ''),
      slug: filename.replace(/\.mdx$/, ''),
      authors: Array.isArray(data.authors) 
        ? data.authors.map(author => typeof author === 'string' ? author : (author?.name || String(author)))
        : typeof data.authors === 'string' ? [data.authors] : [],
      journal: typeof (data.journal || data.publication) === 'string' 
        ? (data.journal || data.publication) 
        : String(data.journal || data.publication || ''),
      year: data.year || data.date ? new Date(data.date).getFullYear() : undefined,
      doi: data.doi,
      abstract: data.abstract || data.excerpt,
      publicationType: data.publication_type || data.type,
      tags: Array.isArray(data.tags) 
        ? data.tags.filter(tag => typeof tag === 'string') 
        : [],
      featured: data.featured || false,
      image: data.image,
      url: data.url,
      pdfUrl: data.pdf,
    };
  });

  // Sort by year (most recent first)
  const sortedPublications = publications.sort((a, b) => (b.year || 0) - (a.year || 0));

  // Group by year
  const publicationsByYear = sortedPublications.reduce((acc, pub) => {
    const year = pub.year || 'Unknown';
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(pub);
    return acc;
  }, {} as Record<string | number, PublicationData[]>);

  const years = Object.keys(publicationsByYear).sort((a, b) => {
    if (a === 'Unknown') return 1;
    if (b === 'Unknown') return -1;
    return Number(b) - Number(a);
  });

  // Featured publications
  const featuredPublications = publications.filter(pub => pub.featured).slice(0, 3);

  const renderPublicationCard = (publication: PublicationData, featured = false) => (
    <Card key={publication.slug} className={`group hover:shadow-lg transition-all duration-300 ${featured ? 'border-wavesBlue/30' : ''}`}>
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Publication Image */}
          {publication.image && (
            <div className="flex-shrink-0 w-16 h-16 overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={publication.image}
                alt={publication.title}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className={`font-semibold text-gray-900 group-hover:text-wavesBlue transition-colors leading-snug mb-3 ${featured ? 'text-lg' : 'text-base'}`}>
              <Link href={`/publications/${publication.slug}`} className="hover:underline">
                {publication.title}
              </Link>
            </h3>

            {/* Authors and Journal */}
            <div className="mb-3">
              {publication.authors && (
                <p className="text-sm text-gray-700 mb-1">
                  {publication.authors.join(', ')}
                </p>
              )}
              {publication.journal && (
                                 <p className="text-sm text-wavesBlue font-medium">
                   {String(publication.journal || '')} 
                   {publication.year && <span className="text-gray-500"> ({publication.year})</span>}
                 </p>
              )}
            </div>

            {/* Abstract */}
            {publication.abstract && (
              <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                {publication.abstract}
              </p>
            )}

            {/* Tags */}
            {publication.tags && publication.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {publication.tags.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Links */}
            <div className="flex flex-wrap gap-3 text-sm">
              {publication.doi && (
                <a 
                  href={`https://doi.org/${publication.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-wavesBlue hover:underline flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7z"/>
                  </svg>
                  DOI
                </a>
              )}
              {publication.pdfUrl && (
                <a 
                  href={publication.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-wavesBlue hover:underline flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                  PDF
                </a>
              )}
              {publication.url && (
                <a 
                  href={publication.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-wavesBlue hover:underline flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                  </svg>
                  Link
                </a>
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
              <div className="text-3xl font-bold text-wavesBlue mb-2">{publications.length}</div>
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
                {new Set(publications.map(p => p.journal).filter(Boolean)).size}
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

      {/* Search and Filter CTA */}
      <section className="py-16 bg-wavesBlue">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Explore Our Research Impact
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Looking for specific research topics or collaboration opportunities? 
            Browse our full publication database or contact us directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              href="/search" 
              variant="outline"
              size="lg"
              className="bg-white text-wavesBlue border-white hover:bg-blue-50"
            >
              Search Publications
            </Button>
            <Button 
              href="/contact" 
              variant="ghost"
              size="lg"
              className="text-white border-white hover:bg-white/10"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
