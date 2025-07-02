/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js' catch-all routes:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 *
 * You can learn more about the next-sanity package here:
 * https://github.com/sanity-io/next-sanity
 */

// Temporarily disabled due to framer-motion compatibility issues with Next.js 14
// import { NextStudio } from 'next-sanity/studio';
// import config from '../../../../sanity.config';

export const dynamic = 'force-static';

// export { metadata, viewport } from 'next-sanity/studio';

export default function StudioPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Sanity Studio Temporarily Disabled</h1>
        <p className="text-gray-600 mb-4">
          The Sanity Studio is temporarily disabled due to framer-motion compatibility issues with
          Next.js 14.
        </p>
        <p className="text-gray-600">
          Please use the Sanity CLI directly:{' '}
          <code className="bg-gray-100 px-2 py-1 rounded">npm run sanity:dev</code>
        </p>
      </div>
    </div>
  );
}
