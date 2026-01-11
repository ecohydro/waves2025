'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { fetchData } from '@/lib/cms/client';

interface SearchResult {
  _id: string;
  _type: 'person' | 'publication' | 'news' | 'project';
  title?: string;
  name?: string;
  slug: { current: string };
  excerpt?: string;
  abstract?: string;
  bio?: string;
  publishedDate?: string;
  publishedAt?: string;
  userGroup?: string;
  category?: string;
  shortDescription?: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Search across multiple content types
      interface SearchResponse {
        people: SearchResult[];
        publications: SearchResult[];
        news: SearchResult[];
        projects: SearchResult[];
      }

      const searchResults = await fetchData<SearchResponse>(
        `
        {
          "people": *[_type == "person" && (
            name match $query + "*" ||
            bio match $query + "*" ||
            title match $query + "*" ||
            researchInterests[] match $query + "*"
          )] | order(name asc) [0...10] {
            _id,
            _type,
            name,
            slug,
            bio,
            title,
            userGroup,
            researchInterests
          },
          "publications": *[_type == "publication" && (
            title match $query + "*" ||
            abstract match $query + "*" ||
            keywords[] match $query + "*"
          )] | order(publishedDate desc) [0...20] {
            _id,
            _type,
            title,
            slug,
            abstract,
            publishedDate,
            publicationType,
            venue,
            authors[] {
              name,
              person-> {
                name
              }
            }
          },
          "news": *[_type == "news" && status == "published" && (
            title match $query + "*" ||
            excerpt match $query + "*" ||
            content match $query + "*"
          )] | order(publishedAt desc) [0...10] {
            _id,
            _type,
            title,
            slug,
            excerpt,
            publishedAt,
            category
          },
          "projects": *[_type == "project" && isPublic == true && (
            title match $query + "*" ||
            shortDescription match $query + "*" ||
            description match $query + "*" ||
            tags[] match $query + "*"
          )] | order(startDate desc) [0...10] {
            _id,
            _type,
            title,
            slug,
            shortDescription,
            status,
            startDate
          }
        }
      `,
        { query: searchQuery },
      );

      // Flatten results and add type information
      const allResults: SearchResult[] = [
        ...searchResults.people,
        ...searchResults.publications,
        ...searchResults.news,
        ...searchResults.projects,
      ];

      setResults(allResults);
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle search submission
  const handleSearch = useCallback(
    (searchQuery: string) => {
      const trimmedQuery = searchQuery.trim();
      setQuery(trimmedQuery);

      // Update URL
      const params = new URLSearchParams();
      if (trimmedQuery) {
        params.set('q', trimmedQuery);
      }
      router.push(`/search?${params.toString()}`);

      // Perform search
      performSearch(trimmedQuery);
    },
    [router, performSearch],
  );

  // Search on initial load if query parameter exists
  useEffect(() => {
    const initialQuery = searchParams.get('q');
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [searchParams, performSearch]);

  // Get display text for result
  const getResultDisplayText = (result: SearchResult): string => {
    switch (result._type) {
      case 'person':
        return result.bio || result.title || '';
      case 'publication':
        // For publications, show citation format instead of abstract
        if (result._type === 'publication') {
          const venue = (result as any).venue?.name || '';
          const year = result.publishedDate ? new Date(result.publishedDate).getFullYear() : '';
          const authors =
            (result as any).authors?.map((a: any) => a.name || a.person?.name).join(', ') || '';
          return `${authors}. ${venue} (${year})`.replace(/\s+/g, ' ').trim();
        }
        return result.abstract || '';
      case 'news':
        return result.excerpt || '';
      case 'project':
        return result.shortDescription || '';
      default:
        return '';
    }
  };

  // Get result URL
  const getResultUrl = (result: SearchResult): string => {
    switch (result._type) {
      case 'person':
        return `/people/${result.slug.current}`;
      case 'publication':
        return `/publications/${result.slug.current}`;
      case 'news':
        return `/news/${result.slug.current}`;
      case 'project':
        return `/projects/${result.slug.current}`;
      default:
        return '#';
    }
  };

  // Get result type badge
  const getTypeBadge = (result: SearchResult) => {
    const badges = {
      person: { text: 'Person', color: 'bg-blue-100 text-blue-800' },
      publication: { text: 'Publication', color: 'bg-green-100 text-green-800' },
      news: { text: 'News', color: 'bg-yellow-100 text-yellow-800' },
      project: { text: 'Project', color: 'bg-purple-100 text-purple-800' },
    };

    const badge = badges[result._type];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
      >
        {badge.text}
      </span>
    );
  };

  // Get result title
  const getResultTitle = (result: SearchResult): string => {
    return result.title || result.name || 'Untitled';
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Search</h1>

            {/* Search Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch(query);
              }}
              className="mb-6"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search people, publications, news, and projects..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <Button type="submit" disabled={loading || !query.trim()} className="px-6">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Searching...</span>
                    </div>
                  ) : (
                    'Search'
                  )}
                </Button>
              </div>
            </form>

            {/* Search Stats */}
            {hasSearched && !loading && (
              <p className="text-sm text-gray-600 mb-6">
                {results.length === 0
                  ? `No results found for "${query}"`
                  : `Found ${results.length} result${results.length === 1 ? '' : 's'} for "${query}"`}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-8">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="max-w-2xl mx-auto mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!hasSearched && !loading && (
            <div className="max-w-2xl mx-auto text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Search our content</h3>
              <p className="mt-1 text-sm text-gray-500">
                Enter a search term to find people, publications, news articles, and projects.
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="max-w-4xl mx-auto space-y-4">
              {results.map((result) => (
                <Card key={result._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeBadge(result)}
                          {result._type === 'person' && result.userGroup && (
                            <span className="text-xs text-gray-500 capitalize">
                              {result.userGroup}
                            </span>
                          )}
                          {result._type === 'publication' && result.publishedDate && (
                            <span className="text-xs text-gray-500">
                              {new Date(result.publishedDate).getFullYear()}
                            </span>
                          )}
                          {result._type === 'news' && result.publishedAt && (
                            <span className="text-xs text-gray-500">
                              {new Date(result.publishedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <Link
                          href={getResultUrl(result)}
                          className="block hover:text-blue-600 transition-colors"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {getResultTitle(result)}
                          </h3>
                        </Link>

                        {getResultDisplayText(result) && (
                          <p className="text-gray-600 line-clamp-3">
                            {getResultDisplayText(result)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {hasSearched && results.length === 0 && !loading && !error && (
            <div className="max-w-2xl mx-auto text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8c0 2.152-.852 4.103-2.235 5.535L21 21l-1.414-1.414-2.351-2.351z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try different keywords or check your spelling.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
