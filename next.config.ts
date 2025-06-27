import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Add domains as needed for external images
    domains: [
      'images.unsplash.com', // Example: Unsplash
      // Add your research image domains here
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Placeholder for future redirects
  async redirects() {
    return [
      // Example:
      // { source: '/old-url', destination: '/new-url', permanent: true },
    ];
  },
  reactStrictMode: true, // Enable React strict mode for performance
  // Add more performance or experimental options as needed
};

export default nextConfig;
