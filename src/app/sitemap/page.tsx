import Link from 'next/link';

const sections: Array<{ title: string; links: Array<{ href: string; label: string }> }> = [
  {
    title: 'Main',
    links: [
      { href: '/', label: 'Home' },
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
      { href: '/search', label: 'Search' },
    ],
  },
  {
    title: 'People and Research',
    links: [
      { href: '/people', label: 'People' },
      { href: '/projects', label: 'Projects' },
      { href: '/research', label: 'Research' },
      { href: '/research/ecohydrology', label: 'Ecohydrology' },
      { href: '/research/cnh', label: 'Coupled Natural-Human Systems' },
      { href: '/research/sensors', label: 'Sensors and Measurements' },
    ],
  },
  {
    title: 'Outputs and Updates',
    links: [
      { href: '/publications', label: 'Publications' },
      { href: '/news', label: 'News' },
      { href: '/news/archive', label: 'News Archive' },
      { href: '/opportunities', label: 'Opportunities' },
    ],
  },
  {
    title: 'Policies',
    links: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Use' },
      { href: '/accessibility', label: 'Accessibility' },
    ],
  },
];

export default function SitemapPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <section className="bg-white dark:bg-slate-950 border-b">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-4">Sitemap</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Browse all major sections of the WAVES Lab site.</p>
        </div>
      </section>

      <section className="py-14">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {sections.map((section) => (
              <div key={section.title} className="bg-white dark:bg-slate-950 border rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-4">{section.title}</h2>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-wavesBlue hover:text-blue-800">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
