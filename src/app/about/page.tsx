import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function About() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden bg-wavesBlue">
        <div className="absolute inset-0 bg-gradient-to-b from-wavesBlue to-blue-700" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            About WAVES Lab
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Understanding the couplings between surface hydrology, vegetation dynamics, 
            and ecosystem processes in drylands
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 lg:py-24">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-6">Our Mission</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              The Water, Vegetation, and Society (WAVES) Lab conducts interdisciplinary research 
              that spans multiple domains, addressing critical challenges in water resources, 
              agricultural sustainability, and environmental systems. We focus on understanding 
              patterns and processes in dryland landscapes, from leaf-level processes to 
              ecosystem-wide water cycles and their response to environmental change.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Our Approach</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We combine field observations, remote sensing technologies, and mathematical 
                  modeling to understand complex ecohydrological systems. Our work integrates 
                  biophysical processes with human dimensions to address real-world challenges 
                  in sustainable resource management.
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Through collaborations with local communities, international research 
                  institutions, and policy makers, we strive to produce science that informs 
                  sustainable development and climate adaptation strategies.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Global Impact</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Our research focuses on dryland regions, which cover over 40% of Earth's 
                  land surface and support more than 2 billion people. These systems are 
                  particularly vulnerable to climate change and human pressures.
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  We work extensively in sub-Saharan Africa, where we study agricultural 
                  adaptation, water security, and ecosystem resilience in collaboration 
                  with local researchers and communities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Research Areas */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-slate-900">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-6">Research Areas</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our interdisciplinary research spans three core areas, each addressing critical 
              challenges in environmental systems and sustainability.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
                  <Image
                    src="/images/site/ecohydrology-home.png"
                    alt="Dryland Ecohydrology"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Dryland Ecohydrology</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Understanding patterns and processes in dryland landscapes, from leaf-level 
                  processes to ecosystem-wide water cycles and their response to environmental 
                  change. We study water-vegetation interactions, soil-plant-atmosphere 
                  dynamics, and ecosystem resilience.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
                  <Image
                    src="/images/site/environmental-sensing-home.jpeg"
                    alt="Environmental Sensing"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Environmental Sensing</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Developing novel approaches that illuminate ecohydrological patterns and 
                  processes through advanced remote sensing and monitoring technologies. We 
                  use satellites, drones, and ground-based sensors to monitor environmental 
                  change across multiple scales.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
                  <Image
                    src="/images/site/wsc-home.png"
                    alt="Water, Sustainability, and Climate"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                  Water, Sustainability, and Climate
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Resolving coupled social-environmental system dynamics in subsistence 
                  agriculture and developing sustainable water management strategies. We 
                  examine climate adaptation, food security, and livelihood sustainability 
                  in vulnerable communities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Institutional Affiliations */}
      <section className="py-16 lg:py-24">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-6">
              Institutional Affiliations
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              WAVES Lab is based at the University of California, Santa Barbara, with 
              affiliations across multiple departments and research institutes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-4">Primary Affiliations</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-wavesBlue rounded-full mr-3"></div>
                    <a
                      href="http://bren.ucsb.edu/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-wavesBlue hover:underline"
                    >
                      Bren School of Environmental Science & Management
                    </a>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-wavesBlue rounded-full mr-3"></div>
                    <a
                      href="http://geog.ucsb.edu"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-wavesBlue hover:underline"
                    >
                      Department of Geography
                    </a>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-wavesBlue rounded-full mr-3"></div>
                    <a
                      href="http://eri.ucsb.edu"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-wavesBlue hover:underline"
                    >
                      Earth Research Institute
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-4">Collaborations</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  We maintain active collaborations with research institutions across Africa, 
                  including the Mpala Research Centre in Kenya, universities in Zambia and 
                  Ghana, and international organizations focused on sustainable development 
                  and climate adaptation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 lg:py-24 bg-wavesBlue">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Join Our Research Community
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Interested in collaborative research opportunities, postdoctoral positions, or 
            graduate studies? Learn more about joining our interdisciplinary team.
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
              href="/contact"
              variant="ghost"
              size="lg"
              className="text-white border-white hover:bg-white dark:bg-slate-950/10"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}