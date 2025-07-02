import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { fetchNewsBySlug, fetchNews, urlForImage, type News } from '@/lib/cms/client';

interface NewsDetailProps {
  params: Promise<{ slug: string }>
}

export default async function NewsDetail({ params }: NewsDetailProps) {
  const { slug } = await params;
  
  // Check for preview mode
  const cookieStore = await cookies();
  const isPreview = cookieStore.has('__prerender_bypass') && cookieStore.has('__next_preview_data');
  
  const article = await fetchNewsBySlug(slug, isPreview);

  if (!article) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'research': return 'Research';
      case 'publication': return 'Publication';
      case 'lab-news': return 'Lab News';
      case 'conference': return 'Conference';
      case 'award': return 'Award';
      case 'outreach': return 'Outreach';
      case 'collaboration': return 'Collaboration';
      case 'event': return 'Event';
      case 'general': return 'General';
      default: return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'research': return 'bg-blue-100 text-blue-800';
      case 'publication': return 'bg-green-100 text-green-800';
      case 'lab-news': return 'bg-purple-100 text-purple-800';
      case 'conference': return 'bg-orange-100 text-orange-800';
      case 'award': return 'bg-yellow-100 text-yellow-800';
      case 'outreach': return 'bg-pink-100 text-pink-800';
      case 'collaboration': return 'bg-indigo-100 text-indigo-800';
      case 'event': return 'bg-teal-100 text-teal-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/news"
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
            Back to News
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <section className="py-16 bg-white">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Article Metadata */}
          <div className="flex flex-wrap gap-2 items-center mb-6">
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(article.category)}`}>
              {getCategoryLabel(article.category)}
            </span>
            {article.isFeatured && (
              <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                Featured
              </span>
            )}
            {article.isSticky && (
              <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                Pinned
              </span>
            )}
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span>By {article.author.name}</span>
              {article.coAuthors && article.coAuthors.length > 0 && (
                <span>
                  {' & '}
                  {article.coAuthors.map((coAuthor, index) => (
                    <span key={coAuthor._id}>
                      {coAuthor.name}
                      {index < (article.coAuthors?.length || 0) - 1 && ', '}
                    </span>
                  ))}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
              <time dateTime={article.publishedAt}>
                {formatDate(article.publishedAt)}
              </time>
            </div>
          </div>

          {/* Excerpt */}
          {article.excerpt && (
            <div className="text-xl text-gray-700 leading-relaxed mb-8 p-6 bg-gray-50 rounded-lg border-l-4 border-wavesBlue">
              {article.excerpt}
            </div>
          )}
        </div>
      </section>

      {/* Featured Image */}
      {article.featuredImage && (
        <section className="py-8">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
              <Image
                src={urlForImage(article.featuredImage).width(1200).height(675).url()}
                alt={article.featuredImage.alt || article.title}
                width={1200}
                height={675}
                className="w-full h-full object-cover"
              />
              {(article.featuredImage.caption || article.featuredImage.credit) && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4">
                  {article.featuredImage.caption && (
                    <p className="text-sm">{article.featuredImage.caption}</p>
                  )}
                  {article.featuredImage.credit && (
                    <p className="text-xs text-gray-300 mt-1">Credit: {article.featuredImage.credit}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Article Content */}
      <section className="py-16">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-8">
                  <div className="prose prose-lg max-w-none">
                    <div 
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <Card className="mt-8">
                  <CardContent className="p-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Gallery */}
              {article.gallery && article.gallery.length > 0 && (
                <Card className="mt-8">
                  <CardContent className="p-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Gallery</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {article.gallery.map((image, index) => (
                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                          <Image
                            src={urlForImage(image).width(400).height(300).url()}
                            alt={image.alt || `Gallery image ${index + 1}`}
                            width={400}
                            height={300}
                            className="w-full h-full object-cover"
                          />
                          {(image.caption || image.credit) && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2">
                              {image.caption && (
                                <p className="text-xs">{image.caption}</p>
                              )}
                              {image.credit && (
                                <p className="text-xs text-gray-300">Credit: {image.credit}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Author Info */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Author</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {article.author.avatar ? (
                        <Image
                          src={urlForImage(article.author.avatar).width(48).height(48).url()}
                          alt={article.author.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-wavesBlue to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {article.author.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                      )}
                      <div>
                        <Link
                          href={`/people/${article.author.slug.current}`}
                          className="font-medium text-gray-900 hover:text-wavesBlue"
                        >
                          {article.author.name}
                        </Link>
                        {article.author.title && (
                          <p className="text-sm text-gray-600">{article.author.title}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Publications */}
              {article.relatedPublications && article.relatedPublications.length > 0 && (
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Publications</h3>
                    <div className="space-y-3">
                      {article.relatedPublications.map((publication) => (
                        <div key={publication._id}>
                          <Link
                            href={`/publications/${publication.slug.current}`}
                            className="text-sm text-wavesBlue hover:text-blue-800 font-medium line-clamp-2"
                          >
                            {publication.title}
                          </Link>
                          <p className="text-xs text-gray-500 mt-1">
                            {publication.publicationType} • {publication.publishedDate && new Date(publication.publishedDate).getFullYear()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Related Projects */}
              {article.relatedProjects && article.relatedProjects.length > 0 && (
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Projects</h3>
                    <div className="space-y-3">
                      {article.relatedProjects.map((project) => (
                        <div key={project._id}>
                          <Link
                            href={`/projects/${project.slug.current}`}
                            className="text-sm text-wavesBlue hover:text-blue-800 font-medium line-clamp-2"
                          >
                            {project.title}
                          </Link>
                          <p className="text-xs text-gray-500 mt-1">
                            Status: {project.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* External Links */}
              {article.externalLinks && article.externalLinks.length > 0 && (
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">External Links</h3>
                    <div className="space-y-3">
                      {article.externalLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 border border-gray-200 rounded-lg hover:border-wavesBlue hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium text-gray-900 text-sm">{link.title}</div>
                          {link.description && (
                            <p className="text-xs text-gray-600 mt-1">{link.description}</p>
                          )}
                          <div className="flex items-center mt-2 text-wavesBlue text-xs">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7z"/>
                            </svg>
                            External Link
                          </div>
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Social Sharing */}
              {article.socialMedia && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Share This Article</h3>
                    <div className="space-y-3">
                      {article.socialMedia.twitterText && (
                        <a
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.socialMedia.twitterText)}&url=${encodeURIComponent(window.location.href)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                            </svg>
                          </div>
                          <span className="text-sm text-gray-700 group-hover:text-gray-900">Share on Twitter</span>
                        </a>
                      )}

                      {article.socialMedia.linkedinText && (
                        <a
                          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </div>
                          <span className="text-sm text-gray-700 group-hover:text-gray-900">Share on LinkedIn</span>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles CTA */}
      <section className="py-16 bg-wavesBlue">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated with Our Research
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Don't miss our latest research updates, publications, and lab news. 
            Explore more articles and connect with our research team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              href="/news" 
              variant="outline"
              className="bg-white text-wavesBlue border-white hover:bg-gray-50"
            >
              More News Articles
            </Button>
            <Button 
              href="/publications" 
              variant="outline"
              className="text-white border-white hover:bg-white/10"
            >
              View Publications
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

export async function generateStaticParams() {
  // Don't generate static params for preview content
  const news = await fetchNews(false);
  return news.map((article) => ({
    slug: article.slug.current,
  }));
}
