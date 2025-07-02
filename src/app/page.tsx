import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[420px] md:h-[520px] lg:h-[600px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/site/home-banner.jpg"
          alt="WAVES Banner"
          fill
          className="object-cover object-center z-0 brightness-[1.25]"
          priority
        />
        <div className="absolute inset-0 bg-black/30 z-10" />
        <div className="relative z-20 flex flex-col items-center justify-center text-center w-full px-4 hero-banner">
          <div className="absolute left-1/2 -translate-x-1/2 w-full px-4" style={{ top: '20%' }}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] mb-4">
              Water, Vegetation, & Society
            </h1>
          </div>
          <div
            className="flex flex-col items-center justify-center w-full"
            style={{ marginTop: 'calc(20% + 3.5rem)' }}
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
                className="text-white no-underline hover:opacity-80 transition inline-flex items-center"
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
                className="text-white no-underline hover:opacity-80 transition inline-flex items-center"
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
                className="text-white no-underline hover:opacity-80 transition inline-flex items-center"
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
                className="text-white no-underline hover:opacity-80 transition inline-flex items-center"
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
            <Link
              href="/news"
              className="cta-btn inline-flex items-center px-6 py-3 border-2 border-wavesBlue bg-white text-wavesBlue font-semibold rounded-lg hover:bg-blue-50 hover:scale-105 transition shadow-lg text-lg group drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] outline-none focus:ring-4 focus:ring-wavesBlue"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.10)' }}
            >
              <span className="mr-2">
                <svg
                  className="inline w-5 h-5 align-text-bottom"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h7l2 2h5a2 2 0 012 2v10a2 2 0 01-2 2z"
                  />
                </svg>
              </span>
              Latest News
            </Link>
          </div>
        </div>
      </section>

      {/* Research Areas Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Research Areas</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our interdisciplinary research spans multiple domains, addressing critical challenges
              in water resources, agricultural sustainability, and environmental systems.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-wavesBlue/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-wavesBlue/20 transition-colors">
                  <svg
                    className="w-8 h-8 text-wavesBlue"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Ecohydrology</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Understanding water-vegetation interactions across scales, from leaf-level
                  processes to ecosystem-wide water cycles and their response to environmental
                  change.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-wavesBlue/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-wavesBlue/20 transition-colors">
                  <svg
                    className="w-8 h-8 text-wavesBlue"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Agricultural Systems</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Developing sustainable agricultural practices through precision agriculture,
                  water-efficient irrigation, and climate-smart farming technologies.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-wavesBlue/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-wavesBlue/20 transition-colors">
                  <svg
                    className="w-8 h-8 text-wavesBlue"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Environmental Sensing</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Advancing remote sensing technologies and in-situ monitoring systems to better
                  understand environmental processes and their impacts.
                </p>
              </CardContent>
            </Card>
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
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Latest News</h2>
                <Button href="/news" variant="outline">
                  View All
                </Button>
              </div>
              <div className="space-y-6">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-2 h-2 bg-wavesBlue rounded-full mt-3"></div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Recent field work at Mpala Research Center
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">December 2024</p>
                        <p className="text-gray-600 text-sm">
                          Our team completed successful field measurements of soil moisture and
                          vegetation response...
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-2 h-2 bg-wavesBlue rounded-full mt-3"></div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          New publication in Nature Climate Change
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">November 2024</p>
                        <p className="text-gray-600 text-sm">
                          Research findings on agricultural adaptation to climate variability
                          published...
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Publications */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Recent Publications
                </h2>
                <Button href="/publications" variant="outline">
                  View All
                </Button>
              </div>
              <div className="space-y-6">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2 leading-snug">
                      Climate resilience of agricultural systems in sub-Saharan Africa
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Caylor, K., et al. (2024) •{' '}
                      <span className="text-wavesBlue">Nature Climate Change</span>
                    </p>
                    <p className="text-gray-600 text-sm">
                      Analysis of climate adaptation strategies across multiple agricultural
                      systems...
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2 leading-snug">
                      Remote sensing of crop water stress using thermal imagery
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Wang, L., et al. (2024) •{' '}
                      <span className="text-wavesBlue">Remote Sensing of Environment</span>
                    </p>
                    <p className="text-gray-600 text-sm">
                      Novel approach for early detection of water stress in agricultural crops...
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 lg:py-24 bg-wavesBlue">
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
              className="bg-white text-wavesBlue border-white hover:bg-blue-50"
            >
              Meet Our Team
            </Button>
            <Button
              href="/contact"
              variant="ghost"
              size="lg"
              className="text-white border-white hover:bg-white/10"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
