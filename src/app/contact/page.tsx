import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function Contact() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden bg-wavesBlue">
        <div className="absolute inset-0 bg-gradient-to-b from-wavesBlue to-blue-700" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Get in touch with the WAVES Lab for research collaborations, 
            academic opportunities, or general inquiries
          </p>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="py-16 lg:py-24">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-8">Get in Touch</h2>
              
              <div className="space-y-8">
                {/* Office Location */}
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-wavesBlue/10 rounded-lg flex items-center justify-center mr-4">
                        <svg
                          className="w-6 h-6 text-wavesBlue"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">Office Location</h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          University of California, Santa Barbara<br />
                          Earth Research Institute<br />
                          Santa Barbara, CA 93106
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Email Contact */}
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-wavesBlue/10 rounded-lg flex items-center justify-center mr-4">
                        <svg
                          className="w-6 h-6 text-wavesBlue"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">Email</h3>
                        <a
                          href="mailto:caylor@ucsb.edu"
                          className="text-wavesBlue hover:underline text-lg"
                        >
                          caylor@ucsb.edu
                        </a>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                          For research inquiries, collaborations, and general questions
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Phone Contact */}
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-wavesBlue/10 rounded-lg flex items-center justify-center mr-4">
                        <svg
                          className="w-6 h-6 text-wavesBlue"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">Phone</h3>
                        <p className="text-gray-900 dark:text-gray-50 text-lg">(805) 893-2115</p>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                          Office hours: Monday-Friday, 9:00 AM - 5:00 PM (PST)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Social & Academic Links */}
              <div className="mt-12">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-6">Connect With Us</h3>
                <div className="flex flex-wrap gap-4">
                  <Button
                    href="https://twitter.com/WavesLab"
                    variant="outline"
                    size="sm"
                    className="inline-flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                    Twitter
                  </Button>
                  
                  <Button
                    href="https://linkedin.com/company/waves-research-lab"
                    variant="outline"
                    size="sm"
                    className="inline-flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </Button>
                  
                  <Button
                    href="https://github.com/waves-lab"
                    variant="outline"
                    size="sm"
                    className="inline-flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                  </Button>
                  
                  <Button
                    href="https://orcid.org/0000-0002-2887-3890"
                    variant="outline"
                    size="sm"
                    className="inline-flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 01-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.016-5.325 5.016h-3.919V7.416zm1.444 1.303v7.444h2.297c2.359 0 3.719-1.168 3.719-3.722 0-2.556-1.378-3.722-3.719-3.722h-2.297z" />
                    </svg>
                    ORCID
                  </Button>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Send us a Message</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Have a question about our research or interested in collaboration? 
                    Fill out the form below and we'll get back to you.
                  </p>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          First Name *
                        </label>
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          required
                          placeholder="Your first name"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Last Name *
                        </label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          required
                          placeholder="Your last name"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="organization" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Organization/Institution
                      </label>
                      <Input
                        id="organization"
                        name="organization"
                        type="text"
                        placeholder="Your organization or institution"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Subject *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wavesBlue focus:border-wavesBlue"
                      >
                        <option value="">Select a subject</option>
                        <option value="research-collaboration">Research Collaboration</option>
                        <option value="graduate-opportunities">Graduate Student Opportunities</option>
                        <option value="postdoc-opportunities">Postdoctoral Opportunities</option>
                        <option value="visiting-researcher">Visiting Researcher</option>
                        <option value="media-inquiry">Media Inquiry</option>
                        <option value="general-question">General Question</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        required
                        placeholder="Please provide details about your inquiry..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wavesBlue focus:border-wavesBlue resize-vertical"
                      />
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-wavesBlue hover:bg-blue-700"
                      >
                        Send Message
                      </Button>
                      
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
                        * Required fields. We typically respond within 2-3 business days.
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Opportunities */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-slate-900">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-6">
              Academic Opportunities
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Interested in joining our research team? We welcome inquiries from 
              prospective students, postdocs, and visiting researchers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Graduate Students</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We accept graduate students through UCSB's Bren School and Geography Department. 
                  Applications are typically due in December for fall admission.
                </p>
                <Button
                  href="https://bren.ucsb.edu/academics/phd-program"
                  variant="outline"
                  size="sm"
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Postdoctoral Researchers</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We regularly host postdoctoral researchers working on ecohydrology, 
                  remote sensing, and agricultural systems. Multiple funding opportunities available.
                </p>
                <Button
                  href="mailto:caylor@ucsb.edu?subject=Postdoctoral Opportunities"
                  variant="outline"
                  size="sm"
                >
                  Inquire
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Visiting Researchers</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We welcome visiting researchers and sabbatical scholars. Our lab provides 
                  excellent computational resources and field research opportunities.
                </p>
                <Button
                  href="mailto:caylor@ucsb.edu?subject=Visiting Researcher"
                  variant="outline"
                  size="sm"
                >
                  Contact Us
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}