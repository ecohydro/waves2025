import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function Research() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden bg-wavesBlue">
        <div className="absolute inset-0 bg-gradient-to-b from-wavesBlue to-blue-700" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Research Themes
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Interdisciplinary research addressing critical challenges in 
            water resources, agricultural sustainability, and environmental systems
          </p>
        </div>
      </section>

      {/* Research Overview */}
      <section className="py-16 lg:py-24">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-6">Our Research</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              The WAVES Lab conducts research across three interconnected themes that span 
              from fundamental ecohydrological processes to applied solutions for sustainable 
              development. Our work integrates field observations, remote sensing technologies, 
              and mathematical modeling to understand complex environmental systems.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-wavesBlue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-wavesBlue" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">Field-Based</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Extensive field campaigns in dryland regions, particularly sub-Saharan Africa
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-wavesBlue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-wavesBlue" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">Technology-Driven</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Advanced remote sensing, environmental sensors, and data analysis methods
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-wavesBlue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-wavesBlue" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">Impact-Oriented</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Research that informs sustainable development and climate adaptation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Research Themes */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-slate-900">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-6">Research Themes</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our research is organized around three core themes, each addressing different 
              aspects of coupled natural-human systems in dryland environments.
            </p>
          </div>

          <div className="space-y-16">
            {/* Ecohydrology Theme */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="relative w-full h-64 lg:h-80 overflow-hidden rounded-lg shadow-lg">
                  <Image
                    src="/images/site/ecohydrology-home.png"
                    alt="Dryland Ecohydrology Research"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">
                  Ecohydrology
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  Understanding patterns and processes in dryland landscapes, from leaf-level 
                  processes to ecosystem-wide water cycles and their response to environmental 
                  change. Our ecohydrology research examines water-vegetation interactions, 
                  soil-plant-atmosphere dynamics, and ecosystem resilience across multiple 
                  spatial and temporal scales.
                </p>
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">Key Research Areas:</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-wavesBlue rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Water stress dynamics and plant physiological responses
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-wavesBlue rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Vegetation patterns and ecosystem organization
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-wavesBlue rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Savanna-grassland dynamics and tree-grass interactions
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-wavesBlue rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Climate variability impacts on dryland ecosystems
                    </li>
                  </ul>
                </div>
                <Button href="/research/ecohydrology" variant="outline">
                  Explore Ecohydrology Research
                </Button>
              </div>
            </div>

            {/* CNH Theme */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="lg:order-2">
                <div className="relative w-full h-64 lg:h-80 overflow-hidden rounded-lg shadow-lg">
                  <Image
                    src="/images/site/wsc-home.png"
                    alt="Coupled Natural-Human Systems Research"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="lg:order-1">
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">
                  Coupled Natural-Human Systems
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  Resolving coupled social-environmental system dynamics in subsistence 
                  agriculture and developing sustainable water management strategies. Our CNH 
                  research examines the complex interactions between human activities and 
                  natural systems, with a focus on agricultural sustainability, food security, 
                  and livelihood resilience.
                </p>
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">Key Research Areas:</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-wavesBlue rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Agricultural adaptation to climate variability
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-wavesBlue rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Water resources management in smallholder systems
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-wavesBlue rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Food security and livelihood sustainability
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-wavesBlue rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Land use change and ecosystem services
                    </li>
                  </ul>
                </div>
                <Button href="/research/cnh" variant="outline">
                  Explore CNH Research
                </Button>
              </div>
            </div>

            {/* Sensors Theme */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="relative w-full h-64 lg:h-80 overflow-hidden rounded-lg shadow-lg">
                  <Image
                    src="/images/site/environmental-sensing-home.jpeg"
                    alt="Environmental Sensing Research"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">
                  Sensors, Measurements, and Software
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  Developing novel approaches that illuminate ecohydrological patterns and 
                  processes through advanced remote sensing and monitoring technologies. Our 
                  sensors research focuses on creating innovative measurement techniques, 
                  developing open-source software tools, and advancing environmental 
                  monitoring capabilities.
                </p>
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">Key Research Areas:</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-wavesBlue rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Remote sensing of vegetation and water cycles
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-wavesBlue rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Environmental sensor networks and IoT systems
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-wavesBlue rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Open-source software and data analysis tools
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-wavesBlue rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Machine learning for environmental applications
                    </li>
                  </ul>
                </div>
                <Button href="/research/sensors" variant="outline">
                  Explore Sensors Research
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Impact */}
      <section className="py-16 lg:py-24">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-6">Research Impact</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Our research contributes to global understanding of dryland systems and informs 
              sustainable development practices worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-wavesBlue mb-2">200+</div>
                  <div className="text-gray-600 dark:text-gray-300">Publications</div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Peer-reviewed articles in leading journals across multiple disciplines
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-wavesBlue mb-2">15+</div>
                  <div className="text-gray-600 dark:text-gray-300">Countries</div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Research collaborations spanning Africa, North America, and beyond
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
            Collaborate With Us
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Interested in research collaboration, joining our team, or learning more 
            about our work? We welcome partnerships and inquiries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/publications"
              variant="outline"
              size="lg"
              className="bg-white dark:bg-slate-950 text-wavesBlue border-white hover:bg-blue-50"
            >
              View Publications
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