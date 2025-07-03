// Auto-generated redirects from URL mapping system
// Generated on: 2025-06-27T22:42:05.509Z

const redirects = [
  // Permanent redirects (301)
  {
    source: '/collaboration/where-does-water-go-when-it-doesn8217t-flow/',
    destination: '/news/where-does-water-go-when-it-doesn8217t-flow',
    permanent: true,
  },
  {
    source: '/2015/07/13/where-does-water-go-when-it-doesn8217t-flow/',
    destination: '/news/where-does-water-go-when-it-doesn8217t-flow',
    permanent: true,
  },
  // ... (all other redirect objects from src/lib/redirects.ts) ...
  {
    source: '/wp-content/uploads/:path*',
    destination: '/files/:path*',
    permanent: true,
  },

  // Temporary redirects (302)
];

const nextConfig = {
  images: {
    // Use remotePatterns instead of domains (deprecated)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/**',
      },
      // Add your research image domains here
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return redirects;
  },
  reactStrictMode: true, // Enable React strict mode for performance
  // Add more performance or experimental options as needed
};

export default nextConfig;
