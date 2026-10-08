import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { fetchNews, type News } from '@/lib/cms/client';

import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'News Archive',
  description:
    'The complete archive of WAVES Lab announcements, field updates, and research news.',
  path: '/news/archive',
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NewsArchivePage({ searchParams }: { searchParams?: { category?: string } }) {
  let news: News[] = [];
  let unavailable = false;
  const category = typeof searchParams?.category === 'string' ? searchParams.category : '';

  try {
    news = await fetchNews();
  } catch (error) {
    unavailable = true;
    console.error('Error fetching news archive:', error);
  }

  const sorted = news.filter((item) => !category || item.category === category).sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <section className="bg-white dark:bg-slate-950 border-b">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">News Archive</h1>
          <p className="text-lg text-gray-600 dark:text-gray-200">
            Complete archive of lab announcements, field updates, and research news.
          </p>
          {category && <p className="mt-4 text-gray-900 dark:text-white">Category: <span className="capitalize">{category.replace(/-/g, ' ')}</span>.{' '}
            <Link href="/news/archive" className="underline text-blue-700 dark:text-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">All lab news</Link>
          </p>}
        </div>
      </section>

      <section className="py-14">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!unavailable && <p className="mb-6 text-gray-700 dark:text-gray-200">{sorted.length} article{sorted.length === 1 ? '' : 's'}{category ? ' in this category' : ''}</p>}
          {sorted.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-gray-600 dark:text-gray-200">
                {unavailable ? 'We could not load the news archive. Please try again later.' : category ? 'No articles match this category. Choose All lab news to browse the complete archive.' : 'No archived news is available right now.'}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sorted.map((item) => (
                <Card key={item._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <Link
                          href={`/news/${item.slug.current}`}
                          className="text-lg font-semibold text-gray-900 dark:text-white hover:text-wavesBlue"
                        >
                          {item.title}
                        </Link>
                        {item.excerpt ? <p className="text-gray-600 dark:text-gray-200 mt-1">{item.excerpt}</p> : null}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 shrink-0">
                        {new Date(item.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
