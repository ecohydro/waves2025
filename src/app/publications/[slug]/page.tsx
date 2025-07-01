import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import Image from 'next/image';

interface Author {
  name: string;
  affiliation: string;
  corresponding?: boolean;
}

interface AuthorRelationship {
  authorName: string;
  relationshipType: string;
  authorPosition: string;
}

interface PublicationData {
  title: string;
  authors: Author[];
  publicationDate: string;
  journal: string;
  doi: string;
  url: string;
  abstract: string;
  keywords: string[];
  researchAreas: string[];
  tags: string[];
  teaserImage: string;
  figureImage: string;
  citationCount: number;
  altmetricScore: number;
  researchArea: string;
  collaborators: Author[];
  authorRelationships: AuthorRelationship[];
  pages: number;
  pdfFile: string;
  year: number;
  associatedGrants?: string[];
}

export default async function PublicationDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), 'content', 'publications', `${slug}.mdx`);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);

  const publication = data as PublicationData;

  // Format authors with relationships for citation
  const formatAuthorsForCitation = () => {
    if (!publication.authors || !publication.authorRelationships) {
      return publication.authors?.map((author) => author.name).join(', ') || '';
    }

    return publication.authors
      .map((author) => {
        const relationship = publication.authorRelationships.find(
          (rel) =>
            rel.authorName.toLowerCase().includes(author.name.toLowerCase()) ||
            author.name.toLowerCase().includes(rel.authorName.toLowerCase()),
        );

        // Check if this is Kelly Caylor (PI) - make bold
        const isCaylorPI =
          relationship?.relationshipType === 'pi' &&
          (author.name.toLowerCase().includes('caylor') ||
            relationship.authorName.toLowerCase().includes('caylor'));

        // Mark first authors and corresponding authors with asterisks
        const isFirstAuthor = publication.authors.indexOf(author) === 0;
        const isCorresponding = author.corresponding;

        let formattedName = author.name;
        if (isCaylorPI) {
          formattedName = `**${author.name}**`;
        }
        if (isFirstAuthor || isCorresponding) {
          formattedName = `*${formattedName}`;
        }

        return formattedName;
      })
      .join(', ');
  };

  // Format publication date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Extract abstract from content if not in frontmatter
  const getAbstract = () => {
    if (publication.abstract && publication.abstract !== 'None') {
      return publication.abstract;
    }

    // Look for abstract in markdown content - using compatible regex
    const abstractMatch = content.match(/\*\*Abstract\*\*[:\s]*([\s\S]*?)(?=\n\n|\[|$)/);
    if (abstractMatch) {
      return abstractMatch[1].trim();
    }

    return null;
  };

  const abstract = getAbstract();

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/publications"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
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

        <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{publication.title}</h1>

        {/* Publication Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
          {publication.journal && <span className="font-medium">{publication.journal}</span>}
          {publication.year && <span>({publication.year})</span>}
          {publication.pages && <span>{publication.pages} pages</span>}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Image and Actions */}
        <div className="lg:col-span-1">
          {/* Publication Image */}
          {(publication.figureImage || publication.teaserImage) && (
            <div className="mb-6">
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <Image
                  src={publication.figureImage || publication.teaserImage}
                  alt="Publication figure"
                  width={400}
                  height={500}
                  className="w-full h-auto"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {publication.figureImage ? 'Figure' : 'First page'}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {publication.url && (
              <a
                href={publication.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <svg
                  className="w-4 h-4 inline mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Go to Article
              </a>
            )}

            {publication.pdfFile && (
              <a
                href={`/${publication.pdfFile}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gray-600 text-white text-center py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                <svg
                  className="w-4 h-4 inline mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download PDF
              </a>
            )}
          </div>

          {/* Metrics */}
          {(publication.citationCount > 0 || publication.altmetricScore > 0) && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Metrics</h3>
              <div className="space-y-1 text-sm">
                {publication.citationCount > 0 && (
                  <div className="flex justify-between">
                    <span>Citations:</span>
                    <span className="font-medium">{publication.citationCount}</span>
                  </div>
                )}
                {publication.altmetricScore > 0 && (
                  <div className="flex justify-between">
                    <span>Altmetric Score:</span>
                    <span className="font-medium">{publication.altmetricScore}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-2">
          {/* Citation */}
          <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Citation</h2>
            <p className="text-gray-800 leading-relaxed">
              {formatAuthorsForCitation()} ({publication.year}) &ldquo;{publication.title},&rdquo;{' '}
              <em>{publication.journal}</em>
              {publication.doi && <>, doi:{publication.doi}</>}.
            </p>
          </div>

          {/* Abstract */}
          {abstract && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Abstract</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed">{abstract}</div>
            </div>
          )}

          {/* Authors Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Authors</h3>
              <div className="space-y-2">
                {publication.authors.map((author, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium text-gray-900">{author.name}</div>
                    {/* Only show affiliation for non-first authors and only if we have reliable data */}
                    {index > 0 && author.affiliation && author.affiliation.trim() !== '' && (
                      <div className="text-gray-600">{author.affiliation}</div>
                    )}
                    {author.corresponding && (
                      <div className="text-blue-600 text-xs">Corresponding author</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Publication Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Publication Details</h3>
              <div className="space-y-2 text-sm">
                {publication.publicationDate && (
                  <div>
                    <span className="font-medium text-gray-700">Published:</span>{' '}
                    <span className="text-gray-600">{formatDate(publication.publicationDate)}</span>
                  </div>
                )}
                {publication.doi && (
                  <div>
                    <span className="font-medium text-gray-700">DOI:</span>{' '}
                    <a
                      href={`https://doi.org/${publication.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {publication.doi}
                    </a>
                  </div>
                )}
                {publication.researchAreas && publication.researchAreas.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Research Areas:</span>{' '}
                    <span className="text-gray-600">{publication.researchAreas.join(', ')}</span>
                  </div>
                )}
                {publication.associatedGrants && publication.associatedGrants.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Grants:</span>{' '}
                    <span className="text-gray-600">{publication.associatedGrants.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Keywords */}
          {publication.keywords && publication.keywords.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {publication.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Raw Content (if any additional markdown content) */}
          {content.trim() && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
              <div className="prose max-w-none text-gray-700">
                <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                  {content.slice(0, 1000)}
                  {content.length > 1000 ? '...' : ''}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export async function generateStaticParams() {
  const pubsDir = path.join(process.cwd(), 'content', 'publications');
  const files = fs.readdirSync(pubsDir).filter((f) => f.endsWith('.mdx'));
  return files.map((filename) => ({ slug: filename.replace(/\.mdx$/, '') }));
}
