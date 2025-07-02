import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import Image from 'next/image';
import matter from 'gray-matter';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface PersonData {
  title: string;
  slug: string;
  role?: string;
  status?: string;
  excerpt?: string;
  avatar?: string;
  location?: string;
  tags?: string[];
}

export default function PeoplePage() {
  const peopleDir = path.join(process.cwd(), 'content', 'people');
  const files = fs.readdirSync(peopleDir).filter((f) => f.endsWith('.mdx'));
  
  const people: PersonData[] = files.map((filename) => {
    const filePath = path.join(peopleDir, filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContent);
    
    return {
      title: data.title || filename.replace(/\.mdx$/, ''),
      slug: filename.replace(/\.mdx$/, ''),
      role: data.role,
      status: data.status,
      excerpt: data.excerpt,
      avatar: data.avatar,
      location: data.location,
      tags: data.tags || [],
    };
  });

  // Categorize people based on their status/tags
  const currentMembers = people.filter(person => 
    person.tags?.includes('current member') || 
    person.status === 'faculty' || 
    person.status === 'postdoc' || 
    person.status === 'graduate student'
  );

  const alumni = people.filter(person => 
    person.tags?.includes('former member') || 
    person.tags?.includes('alumni')
  );

  const collaborators = people.filter(person => 
    person.tags?.includes('collaborator') ||
    (!person.tags?.includes('current member') && !person.tags?.includes('former member'))
  );

  const renderPersonCard = (person: PersonData) => (
    <Card key={person.slug} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-0">
        <Link href={`/people/${person.slug}`} className="block">
          <div className="relative">
            {/* Avatar */}
            <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-100">
              {person.avatar ? (
                <Image
                  src={person.avatar}
                  alt={person.title}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-wavesBlue/20 to-wavesDarkBlue/20">
                  <div className="w-16 h-16 rounded-full bg-wavesBlue/30 flex items-center justify-center">
                    <svg className="w-8 h-8 text-wavesBlue" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-wavesBlue transition-colors">
                  {person.title}
                </h3>
                {person.role && (
                  <p className="text-sm text-wavesBlue font-medium mt-1">
                    {person.role}
                  </p>
                )}
                {person.location && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    {person.location}
                  </p>
                )}
              </div>

              {person.excerpt && (
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                  {person.excerpt}
                </p>
              )}

              {/* Tags */}
              {person.tags && person.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1">
                  {person.tags.slice(0, 3).map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-wavesBlue/10 text-wavesBlue rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {person.tags.length > 3 && (
                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      +{person.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
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
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Our Research Team
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet the interdisciplinary team of researchers, students, and collaborators 
              advancing our understanding of water, agriculture, and environmental systems.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-wavesBlue mb-2">{currentMembers.length}</div>
              <div className="text-sm text-gray-600">Current Members</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-wavesBlue mb-2">{alumni.length}</div>
              <div className="text-sm text-gray-600">Alumni</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-wavesBlue mb-2">{collaborators.length}</div>
              <div className="text-sm text-gray-600">Collaborators</div>
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
              <p className="text-lg text-gray-600">
                Our current research team includes faculty, postdocs, graduate students, and research staff.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentMembers.map(renderPersonCard)}
            </div>
          </div>
        </section>
      )}

      {/* Collaborators */}
      {collaborators.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Collaborators</h2>
              <p className="text-lg text-gray-600">
                Research partners and collaborators from institutions around the world.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {collaborators.map(renderPersonCard)}
            </div>
          </div>
        </section>
      )}

      {/* Alumni */}
      {alumni.length > 0 && (
        <section className="py-16">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Alumni</h2>
              <p className="text-lg text-gray-600">
                Former lab members who have gone on to successful careers in academia, industry, and beyond.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {alumni.map(renderPersonCard)}
            </div>
          </div>
        </section>
      )}

      {/* Join Our Team CTA */}
      <section className="py-16 bg-wavesBlue">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Interested in Joining Our Team?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            We welcome applications from motivated researchers at all career stages. 
            Explore opportunities for graduate studies, postdoctoral research, and collaborations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              href="/opportunities" 
              variant="outline"
              size="lg"
              className="bg-white text-wavesBlue border-white hover:bg-blue-50"
            >
              View Opportunities
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
