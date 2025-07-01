import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-wavesBlue to-wavesDarkBlue text-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                  WAVES Research Lab
                </h1>
                <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed">
                  Water, Agriculture, and Environmental Systems
                </p>
              </div>
              
              <p className="text-lg text-blue-50 leading-relaxed max-w-xl">
                Advancing understanding of coupled natural-human systems through interdisciplinary research 
                in ecohydrology, agricultural systems, and environmental sustainability.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  href="/publications" 
                  variant="outline" 
                  size="lg"
                  className="bg-white text-wavesBlue border-white hover:bg-blue-50"
                >
                  View Publications
                </Button>
                <Button 
                  href="/people" 
                  variant="ghost" 
                  size="lg"
                  className="text-white border-white hover:bg-white/10"
                >
                  Meet Our Team
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/WAVES_logo.png"
                  alt="WAVES Research Lab"
                  fill
                  className="object-contain bg-white/10 backdrop-blur-sm p-8"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Areas Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Research Areas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our interdisciplinary research spans multiple domains, addressing critical challenges 
              in water resources, agricultural sustainability, and environmental systems.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-wavesBlue/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-wavesBlue/20 transition-colors">
                  <svg className="w-8 h-8 text-wavesBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Ecohydrology</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Understanding water-vegetation interactions across scales, from leaf-level processes 
                  to ecosystem-wide water cycles and their response to environmental change.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-wavesBlue/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-wavesBlue/20 transition-colors">
                  <svg className="w-8 h-8 text-wavesBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
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
                  <svg className="w-8 h-8 text-wavesBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Environmental Sensing</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Advancing remote sensing technologies and in-situ monitoring systems to 
                  better understand environmental processes and their impacts.
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
                <Button href="/news" variant="outline">View All</Button>
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
                          Our team completed successful field measurements of soil moisture and vegetation response...
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
                          Research findings on agricultural adaptation to climate variability published...
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
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Recent Publications</h2>
                <Button href="/publications" variant="outline">View All</Button>
              </div>
              <div className="space-y-6">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2 leading-snug">
                      Climate resilience of agricultural systems in sub-Saharan Africa
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Caylor, K., et al. (2024) • <span className="text-wavesBlue">Nature Climate Change</span>
                    </p>
                    <p className="text-gray-600 text-sm">
                      Analysis of climate adaptation strategies across multiple agricultural systems...
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2 leading-snug">
                      Remote sensing of crop water stress using thermal imagery
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Wang, L., et al. (2024) • <span className="text-wavesBlue">Remote Sensing of Environment</span>
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
            Interested in collaborative research opportunities, postdoctoral positions, 
            or graduate studies? Learn more about joining our interdisciplinary team.
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
