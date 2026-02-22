import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card as CardBase } from '@/components/ui/Card';
import { fetchPublications, type Publication } from '@/lib/cms/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default async function EcohydrologyResearch() {
  const publications = (await fetchPublications())
    .filter(
      (p: Publication) =>
        Array.isArray(p.researchAreas) && p.researchAreas.includes('Ecohydrology'),
    )
    .sort((a, b) => {
      const aTime = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
      const bTime = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 3);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/site/ecohydrology-home.png"
          alt="Dryland Ecohydrology Research"
          fill
          className="object-cover object-center z-0 brightness-[0.7]"
          priority
        />
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="relative z-20 text-center px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Ecohydrology
          </h1>
          <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto">
            Understanding patterns and processes in dryland landscapes, from leaf-level processes to
            ecosystem-wide water cycles
          </p>
        </div>
      </section>

      {/* Research Overview */}
      <section className="py-16 lg:py-24">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-6">
              Dryland Ecohydrology Research
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Our ecohydrology research examines the complex interactions between water, vegetation,
              and climate in dryland ecosystems. We investigate how plants access, use, and respond
              to water across multiple scales, from individual leaves to entire landscapes, and how
              these processes are affected by environmental change.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Research Focus</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Dryland ecosystems cover over 40% of Earth's land surface and support more than 2
                  billion people. These systems are characterized by water limitation and high
                  climate variability, making them particularly vulnerable to environmental change.
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Our research helps understand how these critical ecosystems function and respond
                  to changing environmental conditions, informing conservation and management
                  strategies.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Methodological Approach</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We integrate field observations, remote sensing data, and mathematical modeling to
                  understand ecohydrological processes across scales. Our work combines detailed
                  physiological measurements with landscape-scale analysis.
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Field sites span from the Kalahari Desert to East African savannas, providing
                  insights into how dryland ecosystems function across different climatic and
                  ecological contexts.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Research Areas */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-slate-900">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-6">
              Key Research Areas
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Our ecohydrology research spans multiple interconnected areas of investigation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-wavesBlue/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-wavesBlue" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-3">Water Stress Dynamics</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Plant physiological responses to water limitation, including stomatal regulation,
                  osmotic adjustment, and hydraulic failure mechanisms in dryland species.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-wavesBlue/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-wavesBlue" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-3">Vegetation Patterns</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Spatial organization of vegetation in response to water availability, including
                  self-organized patterns, patch dynamics, and landscape-scale heterogeneity.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-wavesBlue/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-wavesBlue" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-3">Tree-Grass Dynamics</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Competitive and facilitative interactions between woody and herbaceous vegetation,
                  including savanna stability, encroachment processes, and coexistence mechanisms.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-wavesBlue/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-wavesBlue" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-3">Climate Variability</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Ecosystem responses to rainfall variability, drought events, and long-term climate
                  change, including thresholds, resilience, and adaptation mechanisms.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-wavesBlue/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-wavesBlue" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-3">
                  Soil-Plant Interactions
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Feedbacks between vegetation and soil properties, including nutrient cycling, soil
                  moisture dynamics, and rhizosphere processes in water-limited environments.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-wavesBlue/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-wavesBlue" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-3">Ecosystem Services</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Quantification of ecosystem services provided by dryland systems, including carbon
                  sequestration, biodiversity support, and hydrological regulation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Publications Preview */}
      <section className="py-16 lg:py-24">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-6">
              Recent Ecohydrology Publications
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Latest research findings in dryland ecohydrology
            </p>
          </div>

          <div className="space-y-6 mb-12">
            {publications.map((pub) => (
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow" key={pub._id}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">{pub.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {(pub.authors || []).map((a, i) => (
                      <span key={i}>
                        {a.person?.name || a.name}
                        {i < (pub.authors?.length || 0) - 1 ? ', ' : ''}
                      </span>
                    ))}
                    {pub.publishedDate && ` (${new Date(pub.publishedDate).getFullYear()})`} •{' '}
                    <span className="text-wavesBlue">{pub.venue?.name || ''}</span>
                  </p>
                  {pub.abstract && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
                      {pub.abstract}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button href="/publications?area=ecohydrology" variant="outline" size="lg">
              View All Ecohydrology Publications
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 lg:py-24 bg-wavesBlue">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Explore Our Research</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Learn more about our other research themes and discover how ecohydrology connects with
            human systems and environmental sensing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/research/cnh"
              variant="outline"
              size="lg"
              className="bg-white dark:bg-slate-950 text-wavesBlue border-white hover:bg-blue-50"
            >
              Coupled Natural-Human Systems
            </Button>
            <Button
              href="/research/sensors"
              variant="ghost"
              size="lg"
              className="text-white border-white hover:bg-white dark:bg-slate-950/10"
            >
              Sensors & Measurements
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
