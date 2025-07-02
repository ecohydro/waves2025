import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import Image from 'next/image';
import matter from 'gray-matter';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface NewsData {
  title: string;
  slug: string;
  date?: string;
  author?: string;
  excerpt?: string;
  headerImage?: string;
  categories?: string[];
  tags?: string[];
  featured?: boolean;
}

export default function NewsPage() {
  const newsDir = path.join(process.cwd(), 'content', 'news');
  const files = fs.readdirSync(newsDir).filter((f) => f.endsWith('.mdx'));
  
  const newsArticles: NewsData[] = files.map((filename) => {
    const filePath = path.join(newsDir, filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContent);
    
    return {
      title: data.title || filename.replace(/\.mdx$/, '').replace(/-/g, ' '),
      slug: filename.replace(/\.mdx$/, ''),
      date: data.date,
      author: data.author,
      excerpt: data.excerpt || data.description,
      headerImage: data.headerImage || data.image,
      categories: data.categories || [],
      tags: data.tags || [],
      featured: data.featured || false,
    };
  });

  // Sort by date (most recent first)
  const sortedNews = newsArticles.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Featured articles
  const featuredNews = sortedNews.filter(article => article.featured).slice(0, 3);
  const recentNews = sortedNews.slice(0, 6);

  // Get unique categories
  const allCategories = Array.from(new Set(newsArticles.flatMap(article => article.categories || [])));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderNewsCard = (article: NewsData, featured = false) => (
    <Card key={article.slug} className={`group hover:shadow-lg transition-all duration-300 overflow-hidden ${featured ? 'border-wavesBlue/30' : ''}`}>
      <CardContent className="p-0">
        <Link href={`/news/${article.slug}`} className="block">
          {/* Header Image */}
          <div className={`relative overflow-hidden bg-gray-100 ${featured ? 'h-48' : 'h-40'}`}>
            {article.headerImage ? (
              <Image
                src={article.headerImage}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-wavesBlue/20 to-wavesDarkBlue/20">
                <div className="w-16 h-16 rounded-full bg-wavesBlue/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-wavesBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
              </div>
            )}
            
            {/* Featured Badge */}
            {featured && (
              <div className="absolute top-4 left-4">
                <span className="bg-wavesBlue text-white px-3 py-1 rounded-full text-sm font-medium">
                  Featured
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Date and Category */}
            <div className="flex items-center justify-between mb-3">
              {article.date && (
                <time className="text-sm text-gray-500">
                  {formatDate(article.date)}
                </time>
              )}
              {article.categories && article.categories.length > 0 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {article.categories[0]}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className={`font-semibold text-gray-900 group-hover:text-wavesBlue transition-colors leading-snug mb-3 ${featured ? 'text-xl' : 'text-lg'}`}>
              {article.title}
            </h3>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                {article.excerpt}
              </p>
            )}

            {/* Author and Tags */}
            <div className="flex items-center justify-between">
              {article.author && (
                <p className="text-xs text-gray-500">
                  By {article.author}
                </p>
              )}
              
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {article.tags.slice(0, 2).map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-wavesBlue/10 text-wavesBlue rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
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
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              News & Updates
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay up to date with the latest research findings, field work updates, publications, 
              and lab announcements from the WAVES Research Team.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-wavesBlue mb-2">{newsArticles.length}</div>
              <div className="text-sm text-gray-600">Total Articles</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-wavesBlue mb-2">{featuredNews.length}</div>
              <div className="text-sm text-gray-600">Featured Stories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-wavesBlue mb-2">{allCategories.length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-wavesBlue mb-2">
                {new Date().getFullYear() - 2007}+
              </div>
              <div className="text-sm text-gray-600">Years of Updates</div>
            </div>
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
              {featuredNews.map(article => renderNewsCard(article, true))}
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
            {recentNews.map(article => renderNewsCard(article))}
          </div>

          {/* Load More Button */}
          {newsArticles.length > 6 && (
            <div className="text-center mt-12">
              <Button 
                href="/news/archive" 
                variant="outline"
                size="lg"
              >
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
              {allCategories.map(category => {
                const categoryCount = newsArticles.filter(article => 
                  article.categories?.includes(category)
                ).length;
                
                return (
                  <Card key={category} className="group hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <h3 className="font-semibold text-gray-900 group-hover:text-wavesBlue transition-colors mb-2">
                        {category}
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
          <h2 className="text-3xl font-bold text-white mb-6">
            Stay Updated with Our Research
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Get notified about our latest publications, field work updates, and research breakthroughs. 
            Join our community of researchers and collaborators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              href="/subscribe" 
              variant="outline"
              size="lg"
              className="bg-white text-wavesBlue border-white hover:bg-blue-50"
            >
              Subscribe to Updates
            </Button>
            <Button 
              href="/rss" 
              variant="ghost"
              size="lg"
              className="text-white border-white hover:bg-white/10"
            >
              RSS Feed
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
