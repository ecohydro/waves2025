import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { fetchNews, fetchFeaturedNews, urlForImage, type News } from '@/lib/cms/client';

export const revalidate = 10; // Revalidate every 10 seconds to pick up new images from Sanity

export default async function NewsPage() {
  // Fetch data from Sanity instead of reading MDX files
  const [allNews, featuredNews] = await Promise.all([fetchNews(), fetchFeaturedNews()]);

  // Sort by published date (most recent first)
  const sortedNews = allNews.sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const recentNews = sortedNews.slice(0, 6);

  // Get unique categories
  const allCategories = Array.from(
    new Set(allNews.map((article) => article.category).filter(Boolean)),
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'research':
        return 'Research';
      case 'publication':
        return 'Publication';
      case 'lab-news':
        return 'Lab News';
      case 'conference':
        return 'Conference';
      case 'award':
        return 'Award';
      case 'outreach':
        return 'Outreach';
      case 'collaboration':
        return 'Collaboration';
      case 'event':
        return 'Event';
      case 'general':
        return 'General';
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'research':
        return 'bg-blue-100 text-blue-800';
      case 'publication':
        return 'bg-green-100 text-green-800';
      case 'lab-news':
        return 'bg-purple-100 text-purple-800';
      case 'conference':
        return 'bg-orange-100 text-orange-800';
      case 'award':
        return 'bg-yellow-100 text-yellow-800';
      case 'outreach':
        return 'bg-pink-100 text-pink-800';
      case 'collaboration':
        return 'bg-indigo-100 text-indigo-800';
      case 'event':
        return 'bg-teal-100 text-teal-800';
      case 'general':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderNewsCard = (article: News, featured = false) => (
    <Card
      key={article._id}
      className={`group hover:shadow-lg transition-all duration-300 ${featured ? 'md:col-span-2' : ''}`}
    >
      <CardContent className="p-0">
        <Link href={`/news/${article.slug.current}`} className="block">
          <div className={`${featured ? 'md:flex md:gap-6' : ''}`}>
            {/* Featured Image */}
            <div
              className={`${featured ? 'md:w-1/2' : ''} aspect-video overflow-hidden ${featured ? 'md:rounded-l-lg' : 'rounded-t-lg'} bg-gray-100`}
            >
              {article.featuredImage ? (
                <Image
                  src={urlForImage(article.featuredImage).width(600).height(400).url()}
                  alt={article.featuredImage.alt || article.title}
                  width={600}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-wavesBlue/10 to-blue-100 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-wavesBlue/30"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Content */}
            <div
              className={`p-6 ${featured ? 'md:w-1/2 md:flex md:flex-col md:justify-between' : ''}`}
            >
              <div>
                {/* Category and Date */}
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}
                  >
                    {getCategoryLabel(article.category)}
                  </span>
                  {article.isFeatured && (
                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Featured
                    </span>
                  )}
                  {article.isSticky && (
                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Pinned
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3
                  className={`font-semibold text-gray-900 group-hover:text-wavesBlue transition-colors mb-3 leading-snug ${featured ? 'text-xl' : 'text-lg'}`}
                >
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p
                  className={`text-gray-600 leading-relaxed mb-4 ${featured ? 'text-base line-clamp-4' : 'text-sm line-clamp-3'}`}
                >
                  {article.excerpt}
                </p>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {article.tags.slice(0, featured ? 4 : 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {article.tags.length > (featured ? 4 : 3) && (
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        +{article.tags.length - (featured ? 4 : 3)} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  {article.author.name && <span>By {article.author.name}</span>}
                </div>
                <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">News & Updates</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay up to date with the latest research findings, field work updates, publications,
              and lab announcements from the WAVES Research Team.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      {featuredNews.length > 0 && (
        <section className="py-16">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Stories</h2>
              <p className="text-lg text-gray-600">
                Highlighting our most important research updates and major announcements.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredNews.slice(0, 3).map((article) => renderNewsCard(article, true))}
            </div>
          </div>
        </section>
      )}

      {/* Recent News */}
      <section className="py-16 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recent Updates</h2>
            <p className="text-lg text-gray-600">
              Latest news from our research activities, publications, and lab developments.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentNews.map((article) => renderNewsCard(article))}
          </div>

          {/* Load More Button */}
          {allNews.length > 6 && (
            <div className="text-center mt-12">
              <Button href="/news/archive" variant="outline" size="lg">
                View All News Articles
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      {allCategories.length > 0 && (
        <section className="py-16">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
              <p className="text-lg text-gray-600">
                Explore news articles organized by research area and content type.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {allCategories.map((category) => {
                const categoryCount = allNews.filter(
                  (article) => article.category === category,
                ).length;

                return (
                  <Card key={category} className="group hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <div
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mb-3 ${getCategoryColor(category)}`}
                      >
                        {getCategoryLabel(category)}
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-wavesBlue transition-colors mb-2">
                        {getCategoryLabel(category)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {categoryCount} article{categoryCount !== 1 ? 's' : ''}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Signup CTA */}
      <section className="py-16 bg-wavesBlue">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stay Updated with Our Research</h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Get the latest news and updates from our research lab delivered directly to your inbox.
            Be the first to know about new publications, field work, and research breakthroughs.
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
