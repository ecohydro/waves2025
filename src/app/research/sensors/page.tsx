import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function SensorsResearch() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/site/environmental-sensing-home.jpeg"
          alt="Environmental Sensing Research"
          fill
          className="object-cover object-center z-0 brightness-[0.7]"
          priority
        />
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="relative z-20 text-center px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Sensors, Measurements, and Software
          </h1>
          <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto">
            Developing novel approaches that illuminate ecohydrological patterns and 
            processes through advanced remote sensing and monitoring technologies
          </p>
        </div>
      </section>

      {/* Research Overview */}
      <section className="py-16 lg:py-24">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Environmental Sensing Research
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Our sensors research focuses on creating innovative measurement techniques, 
              developing open-source software tools, and advancing environmental monitoring 
              capabilities. We design and deploy sensor networks, develop remote sensing 
              applications, and create analytical tools that enable new scientific discoveries.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">Research Focus</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Environmental monitoring in remote and resource-limited settings requires 
                  innovative technological solutions. We develop cost-effective, robust 
                  sensor systems that can operate reliably in challenging field conditions.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Our work bridges the gap between technological innovation and scientific 
                  application, creating tools that enable new research questions and 
                  improve our understanding of environmental processes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">Methodological Approach</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We combine hardware development, software engineering, and data science 
                  to create integrated monitoring solutions. Our approach emphasizes 
                  open-source development and community-driven innovation.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  From satellite-based remote sensing to ground-based sensor networks, 
                  we work across scales to develop comprehensive monitoring systems 
                  for environmental research and management.
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
              Our sensors research spans multiple interconnected areas of technology development
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
                  Remote Sensing
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Satellite and airborne remote sensing of vegetation dynamics, water 
                  cycles, and land cover change, including hyperspectral and thermal 
                  infrared applications.
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
                  Sensor Networks
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Wireless sensor networks for environmental monitoring, including 
                  soil moisture, weather stations, and plant physiological measurements 
                  in remote locations.
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
                  IoT Systems
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Internet of Things (IoT) applications for agricultural monitoring, 
                  including crop sensing, irrigation management, and real-time data 
                  transmission from field sites.
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
                  Open-Source Software
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Development of open-source software tools for environmental data 
                  analysis, including R packages, Python libraries, and web-based 
                  applications for the research community.
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
                  Machine Learning
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Machine learning applications for environmental monitoring, including 
                  image classification, time series analysis, and predictive modeling 
                  for agricultural and ecological systems.
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
                  Data Integration
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Methods for integrating multi-source environmental data, including 
                  sensor fusion, data quality assessment, and creating comprehensive 
                  datasets from diverse monitoring systems.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Highlights */}
      <section className="py-16 lg:py-24">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Technology Highlights
            </h2>
            <p className="text-xl text-gray-600">
              Examples of innovative sensing technologies developed by our lab
            </p>
          </div>

          <div className="space-y-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">PulsePod</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Low-cost, wireless sensor platform for environmental monitoring 
                  in remote locations. Features solar power, cellular connectivity, 
                  and modular sensor interfaces for customized deployments.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Used extensively in our field sites across Africa for monitoring 
                  soil moisture, weather conditions, and plant physiological responses.
                </p>
              </div>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-wavesBlue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-wavesBlue" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Award Winner</h4>
                  <p className="text-gray-600 text-sm">
                    Third place winner at Princeton's Keller Center Innovation Forum
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <Card className="border-0 shadow-lg md:order-2">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-wavesBlue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-wavesBlue" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Open Source</h4>
                  <p className="text-gray-600 text-sm">
                    All software tools available on GitHub for community use and development
                  </p>
                </CardContent>
              </Card>
              <div className="md:order-1">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">COSMOS Probes</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Cosmic-ray soil moisture sensing technology for large-scale, 
                  non-invasive monitoring of soil water content across multiple 
                  hectares with a single sensor.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Deployed at the Mpala Research Centre in Kenya, providing continuous 
                  landscape-scale soil moisture measurements for ecohydrological research.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Publications Preview */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Recent Sensors Publications
            </h2>
            <p className="text-xl text-gray-600">
              Latest research in environmental sensing and measurement technologies
            </p>
          </div>

          <div className="space-y-6 mb-12">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  On the use of unmanned aerial systems for environmental monitoring
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Recent Research • <span className="text-wavesBlue">Remote Sensing Applications</span>
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Comprehensive review of unmanned aerial systems (UAS) applications for 
                  environmental monitoring, including best practices and future directions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Validation of SMAP surface soil moisture products with core validation sites
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Recent Research • <span className="text-wavesBlue">Remote Sensing of Environment</span>
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Validation of NASA's Soil Moisture Active Passive (SMAP) satellite products 
                  using ground-based measurements from multiple validation sites.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  A platform for crowdsourcing the creation of representative, accurate landcover maps
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Recent Research • <span className="text-wavesBlue">Scientific Reports</span>
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Development of a crowdsourcing platform for creating high-quality land cover 
                  maps using citizen science and machine learning approaches.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button
              href="/publications?area=sensors"
              variant="outline"
              size="lg"
            >
              View All Sensors Publications
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 lg:py-24 bg-wavesBlue">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Explore Our Research
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Learn more about our other research themes and discover how sensors and 
            measurements connect with ecohydrology and human systems research.
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
              href="/research/cnh"
              variant="ghost"
              size="lg"
              className="text-white border-white hover:bg-white/10"
            >
              Coupled Natural-Human Systems
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}