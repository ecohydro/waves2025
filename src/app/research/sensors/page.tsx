import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { fetchPublications, type Publication } from '@/lib/cms/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default async function SensorsResearch() {
  const publications = (await fetchPublications())
    .filter(
      (p: Publication) => Array.isArray(p.researchAreas) && p.researchAreas.includes('Sensors'),
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
            Developing novel approaches that illuminate ecohydrological patterns and processes
            through advanced remote sensing and monitoring technologies
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
              Our sensors research focuses on creating innovative measurement techniques, developing
              open-source software tools, and advancing environmental monitoring capabilities. We
              design and deploy sensor networks, develop remote sensing applications, and create
              analytical tools that enable new scientific discoveries.
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
                  innovative technological solutions. We develop cost-effective, robust sensor
                  systems that can operate reliably in challenging field conditions.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Our work bridges the gap between technological innovation and scientific
                  application, creating tools that enable new research questions and improve our
                  understanding of environmental processes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">Methodological Approach</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We combine hardware development, software engineering, and data science to create
                  integrated monitoring solutions. Our approach emphasizes open-source development
                  and community-driven innovation.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  From satellite-based remote sensing to ground-based sensor networks, we work
                  across scales to develop comprehensive monitoring systems for environmental
                  research and management.
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Remote Sensing</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Satellite and airborne remote sensing of vegetation dynamics, water cycles, and
                  land cover change, including hyperspectral and thermal infrared applications.
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Sensor Networks</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Wireless sensor networks for environmental monitoring, including soil moisture,
                  weather stations, and plant physiological measurements in remote locations.
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">IoT Systems</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Internet of Things (IoT) applications for agricultural monitoring, including crop
                  sensing, irrigation management, and real-time data transmission from field sites.
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Open-Source Software</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Development of open-source software tools for environmental data analysis,
                  including R packages, Python libraries, and web-based applications for the
                  research community.
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Machine Learning</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Machine learning applications for environmental monitoring, including image
                  classification, time series analysis, and predictive modeling for agricultural and
                  ecological systems.
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Integration</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Methods for integrating multi-source environmental data, including sensor fusion,
                  data quality assessment, and creating comprehensive datasets from diverse
                  monitoring systems.
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
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Arable Crop Intelligence Systems</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Integrated crop monitoring platforms (Arable Mark 3) that capture weather, plant, soil, and irrigation data along with daily crop imagery. These systems provide comprehensive environmental sensing at the field scale, combining multiple measurement modalities in a single integrated device.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Used across our field research sites to monitor soil moisture, temperature, weather conditions, and vegetation status. The integrated camera enables visual crop phenology monitoring alongside precise environmental measurements.
                </p>
              </div>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-wavesBlue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-wavesBlue" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Multi-Modal Sensing</h4>
                  <p className="text-gray-600 text-sm">
                    Combines soil, weather, plant, and imagery data in integrated platforms
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
                  <h4 className="font-semibold text-gray-900 mb-2">Autonomous Robotics</h4>
                  <p className="text-gray-600 text-sm">
                    Robotic systems for automated, high-frequency spatial measurements
                  </p>
                </CardContent>
              </Card>
              <div className="md:order-1">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Fluxbot: Automated Soil Carbon Flux Measurement</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Autonomous robotic soil carbon flux chambers that enable high-frequency, spatially distributed measurement of soil respiration and carbon cycling. Fluxbots can be deployed as arrays to capture soil process heterogeneity at centimeter to meter scales.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Our fluxbot arrays deployed in East African savanna ecosystems enable novel insights into ecosystem carbon dynamics and heterogeneity. The open-source, wireless design makes this technology accessible for collaborative research globally.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Unmanned Aerial Vehicle (UAV) Remote Sensing</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Drone-based platforms for high-resolution aerial surveys, including thermal imaging, multispectral photography, and structure-from-motion photogrammetry. UAVs enable spatial resolution and revisit frequency that bridge ground sensors and satellite platforms.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  We use UAVs for vegetation mapping, water stress assessment, thermal remote sensing of riparian systems, and landscape-scale environmental monitoring. UAV data is integrated with ground-based measurements to provide multi-scale understanding of ecohydrological processes.
                </p>
              </div>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-wavesBlue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-wavesBlue" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Multi-Scale Integration</h4>
                  <p className="text-gray-600 text-sm">
                    UAV data bridges ground sensors and satellite observations for comprehensive monitoring
                  </p>
                </CardContent>
              </Card>
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
            <Button href="/publications?area=sensors" variant="outline" size="lg">
              View All Sensors Publications
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 lg:py-24 bg-wavesBlue">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Explore Our Research</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Learn more about our other research themes and discover how sensors and measurements
            connect with ecohydrology and human systems research.
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
