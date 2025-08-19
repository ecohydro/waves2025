'use client';

/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js' catch-all routes:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 *
 * You can learn more about the next-sanity package here:
 * https://github.com/sanity-io/next-sanity
 */

import { useEffect, useState } from 'react';

export default function StudioPage() {
  const [Studio, setStudio] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStudio = async () => {
      try {
        const { NextStudio } = await import('next-sanity/studio');
        const config = await import('../../../../sanity.config');
        setStudio(() => () => <NextStudio config={config.default} />);
      } catch (err) {
        console.error('Failed to load Sanity Studio:', err);
        setError(
          'Failed to load Sanity Studio. Please use the standalone Studio at localhost:3333',
        );
      }
    };

    loadStudio();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sanity Studio Unavailable</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-gray-600">
            Please use the standalone Studio:{' '}
            <a
              href="http://localhost:3333"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              http://localhost:3333
            </a>
          </p>
        </div>
      </div>
    );
  }

  if (!Studio) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Sanity Studio...</h1>
          <p className="text-gray-600">Please wait while the studio loads.</p>
        </div>
      </div>
    );
  }

  return <Studio />;
}
