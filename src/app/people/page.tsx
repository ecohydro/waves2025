'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  fetchCurrentMembers,
  fetchAlumni,
  fetchPeople,
  urlForImage,
  type Person,
} from '@/lib/cms/client';

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const loadPeople = async () => {
      try {
        const peopleData = await fetchPeople();
        setPeople(peopleData);
      } catch (error) {
        console.error('Error fetching people:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPeople();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-wavesBlue mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading team members...</p>
          </div>
        </div>
      </main>
    );
  }

  // Group people by userGroup and category
  const currentMembers = people.filter((person) => person.userGroup === 'current');
  const alumni = people.filter((person) => person.userGroup === 'alumni');

  const categoryOrder: string[] = [
    'postdoc',
    'graduate-student',
    'research-staff',
    'research-intern',
    'high-school-student',
    'visitor',
  ];

  function sortByCategoryThenName(a: Person, b: Person) {
    const ai = categoryOrder.indexOf(a.category || '');
    const bi = categoryOrder.indexOf(b.category || '');
    const aRank = ai === -1 ? Number.POSITIVE_INFINITY : ai;
    const bRank = bi === -1 ? Number.POSITIVE_INFINITY : bi;
    if (aRank !== bRank) return aRank - bRank;
    return a.name.localeCompare(b.name);
  }

  const alumniSorted = [...alumni].sort(sortByCategoryThenName);

  const renderPersonCard = (person: Person) => (
    <Card
      key={person._id}
      className="group hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      <CardContent className="p-0">
        <Link href={`/people/${person.slug.current}`} className="block">
          {/* Profile Image */}
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            {person.avatar ? (
              <img
                src={urlForImage(person.avatar)
                  .width(400)
                  .height(400)
                  .fit('crop')
                  .crop('center')
                  .url()}
                alt={person.avatar.alt || person.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Name and Title */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-wavesBlue transition-colors">
                {person.name}
              </h3>
              {person.title && <p className="text-sm text-gray-600 mb-2">{person.title}</p>}
              {person.currentPosition && (
                <p className="text-xs text-gray-500">{person.currentPosition}</p>
              )}
            </div>

            {/* Research Interests */}
            {person.researchInterests && person.researchInterests.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1 justify-center">
                  {person.researchInterests.slice(0, 3).map((interest, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                  {person.researchInterests.length > 3 && (
                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      +{person.researchInterests.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Bio Preview */}
            {person.bio && (
              <p className="text-sm text-gray-600 leading-relaxed text-center line-clamp-3">
                {person.bio}
              </p>
            )}

            {/* Social Links */}
            {person.socialMedia && (
              <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-gray-100">
                {person.email && (
                  <a
                    href={`mailto:${person.email}`}
                    className="text-gray-400 hover:text-wavesBlue transition-colors"
                    title="Email"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </a>
                )}
                {person.website && (
                  <a
                    href={person.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-wavesBlue transition-colors"
                    title="Website"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                )}
                {person.socialMedia.orcid && (
                  <a
                    href={`https://orcid.org/${person.socialMedia.orcid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-green-600 transition-colors"
                    title="ORCID"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947 0 .525-.422.947-.947.947-.525 0-.946-.422-.946-.947 0-.525.421-.947.946-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.016-5.325 5.016h-3.919V7.416zm1.444 1.303v7.444h2.297c2.359 0 3.972-1.303 3.972-3.722 0-2.359-1.613-3.722-3.972-3.722h-2.297z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Our Research Team</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet the interdisciplinary team of researchers, students, and staff advancing our
              understanding of water, agriculture, and environmental systems.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-wavesBlue mb-2">{currentMembers.length}</div>
              <div className="text-sm text-gray-600">Current Members</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-wavesBlue mb-2">{alumni.length}</div>
              <div className="text-sm text-gray-600">Alumni</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-wavesBlue mb-2">20+</div>
              <div className="text-sm text-gray-600">Years of Research</div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Members */}
      {currentMembers.length > 0 && (
        <section className="py-16">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Current Members</h2>
              <p className="text-lg text-gray-600"></p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentMembers.map(renderPersonCard)}
            </div>
          </div>
        </section>
      )}

      {/* Alumni (grouped by category) */}
      {alumni.length > 0 && (
        <section className="py-16">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Lab Alumni</h2>
              <p className="text-lg text-gray-600">.</p>
            </div>

            {/* Sections in desired order */}
            {[
              'postdoc',
              'graduate-student',
              'research-staff',
              'research-intern',
              'high-school-student',
              'visitor',
            ].map((cat) => {
              const sectionPeople = alumniSorted.filter((p) => p.category === cat);
              if (sectionPeople.length === 0) return null;
              const headings: Record<string, string> = {
                postdoc: 'Postdocs',
                'graduate-student': 'Graduate Students',
                'research-staff': 'Research Staff',
                'research-intern': 'Undergraduates',
                'high-school-student': 'High School Students',
                visitor: 'Visitors',
              };
              return (
                <div key={cat} className="mb-12">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">{headings[cat]}</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sectionPeople.map(renderPersonCard)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Join Our Team CTA */}
      <section className="py-16 bg-wavesBlue">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Interested in Joining Our Research?
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            We're always looking for passionate researchers to join our interdisciplinary team.
            Explore opportunities for undergraduate research, graduate studies, and postdoctoral
            positions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/contact"
              variant="outline"
              className="bg-white text-wavesBlue border-white hover:bg-gray-50"
            >
              Contact Us
            </Button>
            <Button
              href="/research"
              variant="outline"
              className="text-white border-white hover:bg-white/10"
            >
              Learn About Our Research
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
