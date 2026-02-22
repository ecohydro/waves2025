import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { fetchPersonBySlug, fetchPeople, urlForImage, type Person } from '@/lib/cms/client';

interface PersonDetailProps {
  params: Promise<{ slug: string }>;
}

export default async function PersonDetail({ params }: PersonDetailProps) {
  const { slug } = await params;
  
  // Initialize markdown parser
  const MarkdownIt = (await import('markdown-it')).default;
  const md = new MarkdownIt({
    linkify: false,
    html: false,
  });

  // Check for preview mode
  const cookieStore = await cookies();
  const isPreview = cookieStore.has('__prerender_bypass') && cookieStore.has('__next_preview_data');

  const person = await fetchPersonBySlug(slug, isPreview);

  if (!person) {
    notFound();
  }

  // Pre-render markdown to HTML
  const bioHtml = person.bio ? md.render(person.bio) : '';
  const bioLongHtml = person.bioLong ? md.render(person.bioLong) : '';

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  const getUserGroupLabel = (userGroup: string) => {
    switch (userGroup) {
      case 'current':
        return 'Current Member';
      case 'alumni':
        return 'Alumni';
      case 'collaborator':
        return 'Collaborator';
      case 'visitor':
        return 'Visiting Researcher';
      default:
        return userGroup;
    }
  };

  const getUserGroupColor = (userGroup: string) => {
    switch (userGroup) {
      case 'current':
        return 'bg-green-100 text-green-800';
      case 'alumni':
        return 'bg-blue-100 text-blue-800';
      case 'collaborator':
        return 'bg-purple-100 text-purple-800';
      case 'visitor':
        return 'bg-orange-100 text-orange-800';
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
            href="/people"
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
            Back to People
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="relative w-48 h-48 rounded-2xl overflow-hidden bg-gray-200 shadow-xl">
                  {person.avatar ? (
                    <Image
                      src={urlForImage(person.avatar).width(192).height(192).url()}
                      alt={person.avatar.alt || person.name}
                      width={192}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-wavesBlue to-blue-600 flex items-center justify-center">
                      <span className="text-white font-bold text-4xl">
                        {person.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 items-center mb-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getUserGroupColor(person.userGroup)}`}
                  >
                    {getUserGroupLabel(person.userGroup)}
                  </span>
                  {!person.isActive && (
                    <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                      Inactive
                    </span>
                  )}
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-2">{person.name}</h1>

                {person.title && <p className="text-xl text-gray-600 mb-4">{person.title}</p>}

                {person.bio && (
                  <div
                    className="text-lg text-gray-700 leading-relaxed mb-6 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: bioHtml }}
                  />
                )}

                {/* Contact & Social Links */}
                <div className="flex flex-wrap gap-4">
                  {person.email && (
                    <Button
                      onClick={() => {
                        window.location.href = `mailto:${person.email}`;
                      }}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      type="button"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      Email
                    </Button>
                  )}

                  {person.website && (
                    <a
                      href={person.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Website
                    </a>
                  )}

                  {person.socialMedia?.orcid && (
                    <a
                      href={`https://orcid.org/${person.socialMedia.orcid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947 0 .525-.422.947-.947.947-.525 0-.946-.422-.946-.947 0-.525.421-.947.946-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.016-5.325 5.016h-3.919V7.416zm1.444 1.303v7.444h2.297c2.359 0 3.972-1.303 3.972-3.722 0-2.359-1.613-3.722-3.972-3.722h-2.297z" />
                      </svg>
                      ORCID
                    </a>
                  )}

                  {person.socialMedia?.googleScholar && (
                    <a
                      href={person.socialMedia.googleScholar}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                    >
                      Google Scholar
                    </a>
                  )}
                </div>
              </div>
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
                {/* Long Bio */}
                {person.bioLong && (
                  <Card>
                    <CardContent className="p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Biography</h2>
                      <div className="prose prose-lg max-w-none text-gray-700">
                        <div dangerouslySetInnerHTML={{ __html: bioLongHtml }} />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Research Interests */}
                {person.researchInterests && person.researchInterests.length > 0 && (
                  <Card>
                    <CardContent className="p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Research Interests</h2>
                      <div className="flex flex-wrap gap-2">
                        {person.researchInterests.map((interest, index) => (
                          <span
                            key={index}
                            className="inline-block px-4 py-2 bg-wavesBlue/10 text-wavesBlue rounded-lg font-medium"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Education */}
                {person.education && person.education.length > 0 && (
                  <Card>
                    <CardContent className="p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Education</h2>
                      <div className="space-y-4">
                        {person.education.map((edu, index) => (
                          <div key={index} className="border-l-4 border-wavesBlue pl-4">
                            <h3 className="font-semibold text-gray-900">
                              {edu.degree} in {edu.field}
                            </h3>
                            <p className="text-gray-600">{edu.institution}</p>
                            <p className="text-sm text-gray-500">{edu.year}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Info */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="text-sm text-gray-900">
                          {getUserGroupLabel(person.userGroup)}
                        </dd>
                      </div>

                      {person.joinDate && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            {person.userGroup === 'alumni' ? 'Joined' : 'Member Since'}
                          </dt>
                          <dd className="text-sm text-gray-900">{formatDate(person.joinDate)}</dd>
                        </div>
                      )}

                      {person.leaveDate && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Left</dt>
                          <dd className="text-sm text-gray-900">{formatDate(person.leaveDate)}</dd>
                        </div>
                      )}

                      {person.currentPosition && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Current Position</dt>
                          <dd className="text-sm text-gray-900">{person.currentPosition}</dd>
                        </div>
                      )}
                    </dl>
                  </CardContent>
                </Card>

                {/* Social Media Links */}
                {person.socialMedia && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect</h3>
                      <div className="space-y-3">
                        {person.socialMedia.linkedin && (
                          <a
                            href={person.socialMedia.linkedin}
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
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">
                              LinkedIn
                            </span>
                          </a>
                        )}

                        {person.socialMedia.twitter && (
                          <a
                            href={person.socialMedia.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                          >
                            <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-white"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">
                              Twitter
                            </span>
                          </a>
                        )}

                        {person.socialMedia.github && (
                          <a
                            href={person.socialMedia.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                          >
                            <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-white"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">
                              GitHub
                            </span>
                          </a>
                        )}

                        {person.socialMedia.researchGate && (
                          <a
                            href={person.socialMedia.researchGate}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                          >
                            <div className="w-8 h-8 bg-teal-600 rounded flex items-center justify-center">
                              <span className="text-white font-bold text-xs">RG</span>
                            </div>
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">
                              ResearchGate
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
  const people = await fetchPeople(false);
  return people.map((person) => ({
    slug: person.slug.current,
  }));
}
