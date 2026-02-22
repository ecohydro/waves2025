import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { fetchPublications, type Publication } from '@/lib/cms/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default async function CNHResearch() {
  const publications = (await fetchPublications())
    .filter(
      (p: Publication) =>
        Array.isArray(p.researchAreas) && p.researchAreas.includes('Coupled Natural-Human Systems'),
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
          src="/images/site/wsc-home.png"
          alt="Coupled Natural-Human Systems Research"
          fill
          className="object-cover object-center z-0 brightness-[0.7]"
          priority
        />
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="relative z-20 text-center px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Coupled Natural-Human Systems
          </h1>
          <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto">
            Resolving social-environmental system dynamics in subsistence agriculture and developing
            sustainable water management strategies
          </p>
        </div>
      </section>

      {/* Research Overview */}
      <section className="py-16 lg:py-24">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Coupled Natural-Human Systems Research
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Our CNH research examines the complex interactions between human activities and
              natural systems, with a focus on agricultural sustainability, food security, and
              livelihood resilience. We investigate how social and environmental factors interact to
              shape outcomes for people and ecosystems in dryland regions. This work is conducted
              through <span className="font-semibold">collaborative partnerships with researchers who bring complementary expertise in social science, biophysical systems, and remote sensing</span>.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">Research Focus</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Dryland regions support over 2 billion people, many of whom depend on rain-fed
                  agriculture for their livelihoods. These systems face increasing pressures from
                  climate change, population growth, and economic transformation.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Our research helps understand how human and natural systems interact and
                  co-evolve, informing strategies for sustainable development and climate adaptation
                  in vulnerable regions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">Methodological Approach</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Our research is fundamentally <span className="font-semibold">team-based and collaborative</span>. We work with interdisciplinary teams of collaborators who integrate diverse methodological expertise: social science methods (household surveys, participatory approaches, institutional analysis), biophysical measurements (soil moisture, vegetation monitoring, hydrology), and remote sensing data (satellite imagery, geospatial analysis).
                </p>
                <p className="text-gray-600 leading-relaxed">
                  This collaborative approach brings together researchers with deep knowledge in sociology, economics, environmental science, and engineering. Field sites in Kenya, Zambia, and Ghana provide opportunities for integrated research across diverse agricultural and livelihood contexts in sub-Saharan Africa.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Research Areas */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Key Research Areas
            </h2>
            <p className="text-xl text-gray-600">
              Our CNH research spans multiple interconnected areas of investigation
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Agricultural Adaptation
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  How farmers adapt their practices to climate variability and change, including
                  crop selection, planting dates, water management, and risk mitigation strategies.
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Water Resources Management
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Sustainable management of water resources in smallholder systems, including
                  irrigation efficiency, groundwater use, and community-based water management
                  institutions.
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Food Security</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Drivers of food security and nutrition outcomes in dryland regions, including crop
                  productivity, market access, dietary diversity, and seasonal food availability.
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Livelihood Sustainability
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Resilience and sustainability of rural livelihoods, including income
                  diversification, social networks, and adaptive capacity in the face of
                  environmental and economic shocks.
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Land Use Change</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Drivers and consequences of land use and land cover change, including agricultural
                  expansion, deforestation, and the impacts on ecosystem services and biodiversity.
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Climate Risk Perception
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  How farmers perceive and respond to climate risks, including cognitive biases,
                  traditional knowledge systems, and the role of information in decision-making.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Research Locations */}
      <section className="py-16 lg:py-24">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Research Locations
            </h2>
            <p className="text-xl text-gray-600">
              Our CNH research is conducted across multiple sites in sub-Saharan Africa
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Kenya</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Smallholder farming systems in semi-arid regions, focusing on maize-based
                  agriculture and pastoralism interactions at the Mpala Research Centre.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Zambia</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Climate adaptation and food security in the Southern Province, examining how
                  farmers respond to rainfall variability and seasonal forecasts.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Ghana</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Urban food security and peri-urban agriculture, investigating the connections
                  between rural production and urban consumption systems.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Publications Preview */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Recent CNH Publications
            </h2>
            <p className="text-xl text-gray-600">
              Latest research findings in coupled natural-human systems
            </p>
          </div>

          <div className="space-y-6 mb-12">
            {publications.map((pub) => (
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow" key={pub._id}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{pub.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">
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
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {pub.abstract}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button href="/publications?area=cnh" variant="outline" size="lg">
              View All CNH Publications
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 lg:py-24 bg-wavesBlue">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Explore Our Research</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Learn more about our other research themes and discover how human systems connect with
            ecohydrology and environmental sensing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/research/ecohydrology"
              variant="outline"
              size="lg"
              className="bg-white text-wavesBlue border-white hover:bg-blue-50"
            >
              Ecohydrology
            </Button>
            <Button
              href="/research/sensors"
              variant="ghost"
              size="lg"
              className="text-white border-white hover:bg-white/10"
            >
              Sensors & Measurements
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
