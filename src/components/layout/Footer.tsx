import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <Image
                src="/WAVES_logo.png"
                alt="WAVES Lab Logo"
                width={40}
                height={40}
                className="mr-3"
              />
              <span className="text-2xl font-bold">WAVES Research Lab</span>
            </div>

            <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
              Advancing understanding of coupled natural-human systems through interdisciplinary
              research in ecohydrology, agricultural systems, and environmental sustainability.
            </p>

            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-3 text-wavesLightBlue"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <div>
                  <div>University of California, Santa Barbara</div>
                  <div className="text-gray-400">Earth Research Institute</div>
                </div>
              </div>

              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-3 text-wavesLightBlue"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <a
                  href="mailto:caylor@ucsb.edu"
                  className="hover:text-wavesLightBlue transition-colors"
                >
                  caylor@ucsb.edu
                </a>
              </div>

              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-3 text-wavesLightBlue"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
                <span>(805) 893-2115</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/people"
                  className="text-gray-300 hover:text-wavesLightBlue transition-colors"
                >
                  Our Team
                </Link>
              </li>
              <li>
                <Link
                  href="/publications"
                  className="text-gray-300 hover:text-wavesLightBlue transition-colors"
                >
                  Publications
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-gray-300 hover:text-wavesLightBlue transition-colors"
                >
                  Research Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="text-gray-300 hover:text-wavesLightBlue transition-colors"
                >
                  News & Updates
                </Link>
              </li>
              <li>
                <Link
                  href="/opportunities"
                  className="text-gray-300 hover:text-wavesLightBlue transition-colors"
                >
                  Opportunities
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-wavesLightBlue transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Research Areas */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Research Themes</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/research/ecohydrology"
                  className="text-gray-300 hover:text-wavesLightBlue transition-colors"
                >
                  Ecohydrology
                </Link>
              </li>
              <li>
                <Link
                  href="/research/cnh"
                  className="text-gray-300 hover:text-wavesLightBlue transition-colors"
                >
                  Coupled Natural-Human Systems
                </Link>
              </li>
              <li>
                <Link
                  href="/research/sensors"
                  className="text-gray-300 hover:text-wavesLightBlue transition-colors"
                >
                  Sensors & Measurements
                </Link>
              </li>
              <li>
                <Link
                  href="/research"
                  className="text-gray-300 hover:text-wavesLightBlue transition-colors"
                >
                  All Research Themes
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media and External Links */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-6 md:mb-0">
              {/* Twitter */}
              <a
                href="https://twitter.com/WavesLab"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-wavesLightBlue transition-colors"
                aria-label="Follow us on Twitter"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com/company/waves-research-lab"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-wavesLightBlue transition-colors"
                aria-label="Connect on LinkedIn"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/waves-lab"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-wavesLightBlue transition-colors"
                aria-label="View our code on GitHub"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>

              {/* ORCID */}
              <a
                href="https://orcid.org/0000-0002-2887-3890"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-wavesLightBlue transition-colors"
                aria-label="View ORCID profile"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 01-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.016-5.325 5.016h-3.919V7.416zm1.444 1.303v7.444h2.297c2.359 0 3.719-1.168 3.719-3.722 0-2.556-1.378-3.722-3.719-3.722h-2.297z" />
                </svg>
              </a>
            </div>

            {/* University and Partner Links */}
            <div className="flex items-center space-x-8">
              <a
                href="https://www.ucsb.edu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-wavesLightBlue transition-colors text-sm"
              >
                UC Santa Barbara
              </a>
              <a
                href="https://www.eri.ucsb.edu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-wavesLightBlue transition-colors text-sm"
              >
                Earth Research Institute
              </a>
              <a
                href="https://www.mpala.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-wavesLightBlue transition-colors text-sm"
              >
                Mpala Research Centre
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <div className="mb-4 md:mb-0">
              <p>© {currentYear} WAVES Research Lab. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="hover:text-wavesLightBlue transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-wavesLightBlue transition-colors">
                Terms of Use
              </Link>
              <Link href="/accessibility" className="hover:text-wavesLightBlue transition-colors">
                Accessibility
              </Link>
              <Link href="/sitemap" className="hover:text-wavesLightBlue transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
