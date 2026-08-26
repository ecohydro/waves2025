import { buildMetadata } from '@/lib/seo/metadata';

// The search page itself is a client component and cannot export metadata,
// so it lives here instead.
export const metadata = buildMetadata({
  title: 'Search',
  description: 'Search across people, publications, projects, and news on the WAVES Lab site.',
  path: '/search',
});

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
