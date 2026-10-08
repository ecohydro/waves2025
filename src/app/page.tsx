import heroStyles from './HomeHero.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { fetchNews, fetchPublications } from '@/lib/cms/client';

import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'WAVES Lab - Water, Vegetation, and Society',
  description:
    'The WAVES Lab at UC Santa Barbara studies the couplings between surface hydrology, vegetation dynamics, and ecosystem processes in drylands, from leaf-level measurements to whole water cycles.',
  path: '/',
});

export const revalidate = 10;

export default async function Home() {
  // These requests are independent: a failed news request must not hide research.
  const [newsResult, publicationsResult] = await Promise.allSettled([
    fetchNews(),
    fetchPublications(),
  ]);
  // getAllNews already selects published records, ordered newest first.
  const newsItems = newsResult.status === 'fulfilled' ? newsResult.value.slice(0, 2) : [];
  const publications = publicationsResult.status === 'fulfilled'
    ? [...publicationsResult.value].sort((a, b) =>
        (Date.parse(b.publishedDate) || 0) - (Date.parse(a.publishedDate) || 0)).slice(0, 2)
    : [];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full min-h-[420px] md:min-h-[520px] lg:min-h-[600px] py-16 flex items-center justify-center overflow-hidden">
        <Image
          src="/images/site/home-banner.jpg"
          alt=""
          fill
          className="object-cover object-center z-0"
          sizes="100vw"
          priority
        />
        <div aria-hidden="true" className={heroStyles.overlay} />
        <div className="relative z-20 flex flex-col items-center justify-center text-center w-full px-4">
          <div className="w-full px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] mb-4">
              Water, Vegetation, & Society
            </h1>
          </div>
          <div
            className="flex flex-col items-center justify-center w-full"
          >
            <p className="text-lg md:text-2xl text-white font-medium drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] mb-4 max-w-2xl">
              Understanding the couplings between surface hydrology, vegetation dynamics, and
              ecosystem processes in drylands.
            </p>
            <p className="text-white text-base md:text-lg mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
              <a
                href="http://bren.ucsb.edu/"
                target="_blank"
                rel="noopener noreferrer"
                className={heroStyles.affiliation}
              >
                Bren School{' '}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-1 w-4 h-4 inline"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m7-1V4a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2z"
                  />
                </svg>
              </a>{' '}
              |
              <a
                href="http://geog.ucsb.edu"
                target="_blank"
                rel="noopener noreferrer"
                className={heroStyles.affiliation}
              >
                Dept. of Geography{' '}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-1 w-4 h-4 inline"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m7-1V4a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2z"
                  />
                </svg>
              </a>{' '}
              |
              <a
                href="http://eri.ucsb.edu"
                target="_blank"
                rel="noopener noreferrer"
                className={heroStyles.affiliation}
              >
                Earth Research Institute{' '}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-1 w-4 h-4 inline"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m7-1V4a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2z"
                  />
                </svg>
              </a>{' '}
              |
              <a
                href="http://www.ucsb.edu"
                target="_blank"
                rel="noopener noreferrer"
                className={heroStyles.affiliation}
              >
                UCSB{' '}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-1 w-4 h-4 inline"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m7-1V4a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2z"
                  />
                </svg>
              </a>
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/research" className={`${heroStyles.cta} ${heroStyles.primary}`}>Explore Research</Link>
              <Link href="/opportunities" className={`${heroStyles.cta} ${heroStyles.secondary}`}>Join the Lab</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Research Areas Section */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-slate-900">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">Research Areas</h2>
            <p className="text-xl text-gray-600 dark:text-gray-200 max-w-3xl mx-auto">
              Our interdisciplinary research spans multiple domains, addressing critical challenges
              in water resources, agricultural sustainability, and environmental systems.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link href="/research/ecohydrology" className="block">
              <Card className="group hover:shadow-lg transition-shadow duration-300 h-full cursor-pointer">
                <CardHeader>
                  <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
                    <Image
                      src="/images/site/ecohydrology-home.png"
                      alt="Dryland Ecohydrology"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-wavesBlue transition-colors">Ecohydrology</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-200 leading-relaxed">
                    Understanding patterns and process in dryland landscapes, from leaf-level
                    processes to ecosystem-wide water cycles and their response to environmental
                    change.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/research/sensors" className="block">
              <Card className="group hover:shadow-lg transition-shadow duration-300 h-full cursor-pointer">
                <CardHeader>
                  <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
                    <Image
                      src="/images/site/environmental-sensing-home.jpeg"
                      alt="Environmental Sensing"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-wavesBlue transition-colors">Environmental Sensing</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-200 leading-relaxed">
                    Developing novel approaches that illuminate ecohydrological patterns and processes
                    through advanced remote sensing and monitoring technologies.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/research/cnh" className="block">
              <Card className="group hover:shadow-lg transition-shadow duration-300 h-full cursor-pointer">
                <CardHeader>
                  <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
                    <Image
                      src="/images/site/wsc-home.png"
                      alt="Water, Sustainability, and Climate"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-wavesBlue transition-colors">
                    Coupled Natural-Human Systems
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-200 leading-relaxed">
                    Resolving coupled social-environmental system dynamics in subsistence agriculture
                    and developing sustainable water management strategies.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest News & Publications */}
      <section className="py-16 lg:py-24">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Latest News */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Latest News</h2>
                <Button href="/news" variant="outline">
                  All lab news
                </Button>
              </div>
              <div className="space-y-6">
                {newsItems.length > 0 ? (
                  newsItems.map((item) => (
                    <div key={item._id}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-2 h-2 bg-wavesBlue rounded-full mt-3"></div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                <Link href={`/news/${item.slug.current}`} className="underline underline-offset-4">{item.title}</Link>
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Recent'}
                              </p>
                              <p className="text-gray-600 dark:text-gray-200 text-sm line-clamp-2">
                                {item.excerpt || 'Read more...'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-200">{newsResult.status === 'rejected' ? 'News updates are temporarily unavailable. Please try the news archive or return later.' : 'No news stories are listed here yet. Explore our research and publications below.'}</p>
                )}
              </div>
            </div>

            {/* Recent Publications */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  Recent Publications
                </h2>
                <Button href="/publications" variant="outline">
                  All publications
                </Button>
              </div>
              <div className="space-y-6">
                {publications.length > 0 ? (
                  publications.map((pub) => (
                    <div key={pub._id}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 leading-snug line-clamp-2">
                            <Link href={`/publications/${pub.slug.current}`} className="underline underline-offset-4">{pub.title}</Link>
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-200 mb-3">
                            {pub.authors && pub.authors.length > 0 && (
                              <>
                                {pub.authors.slice(0, 2).map((a, i) => (
                                  <span key={i}>
                                    {a.person?.name || a.name}
                                    {i === 0 && pub.authors.length > 1 ? ', ' : ''}
                                  </span>
                                ))}
                                {pub.authors.length > 2 && ' et al.'}
                              </>
                            )}
                            {pub.publishedDate && ` (${new Date(pub.publishedDate).getFullYear()})`} •{' '}
                            <span className="text-wavesBlue">{pub.venue?.name || 'Published'}</span>
                          </p>
                          <p className="text-gray-600 dark:text-gray-200 text-sm line-clamp-2">
                            {pub.abstract || 'Recent publication'}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-200">{publicationsResult.status === 'rejected' ? 'Publication updates are temporarily unavailable. Please try the publication archive or return later.' : 'No publications are listed here yet.'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 lg:py-24 bg-blue-900">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Join Our Research Community
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Interested in collaborative research opportunities, postdoctoral positions, or graduate
            studies? Learn more about joining our interdisciplinary team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/people"
              variant="outline"
              size="lg"
              className="bg-white dark:bg-slate-950 text-wavesBlue border-white hover:bg-blue-50"
            >
              Meet Our Team
            </Button>
            <Button
              href="/opportunities"
              variant="ghost"
              size="lg"
              className="text-white border-white hover:bg-white dark:bg-slate-950/10"
            >
              Join the Lab
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
