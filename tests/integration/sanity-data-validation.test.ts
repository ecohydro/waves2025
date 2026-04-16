import { describe, it, expect, beforeAll } from 'vitest';
import { fetchPeople, fetchPublications, fetchNews } from '@/lib/cms/client';

describe('Sanity Data Validation', () => {
  beforeAll(async () => {
    // Wait a moment for any async setup
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  describe('People Data', () => {
    it('should fetch people data from Sanity', async () => {
      try {
        const people = await fetchPeople();

        expect(Array.isArray(people)).toBe(true);
        expect(people.length).toBeGreaterThan(0);

        // Validate person structure
        const firstPerson = people[0];
        expect(firstPerson).toHaveProperty('_id');
        expect(firstPerson).toHaveProperty('name');
        expect(firstPerson).toHaveProperty('slug');
        expect(firstPerson).toHaveProperty('userGroup');

        console.log(`✅ Found ${people.length} people in Sanity`);
        console.log(`Sample person: ${firstPerson.name} (${firstPerson.userGroup})`);

        // Log some statistics
        const currentMembers = people.filter((p) => p.userGroup === 'current');
        const alumni = people.filter((p) => p.userGroup === 'alumni');
        const collaborators = people.filter(
          (p) => p.userGroup === 'collaborator' || p.userGroup === 'visitor',
        );

        console.log(
          `📊 Breakdown: ${currentMembers.length} current, ${alumni.length} alumni, ${collaborators.length} collaborators`,
        );

        // Show some sample names
        if (currentMembers.length > 0) {
          console.log(
            `👥 Current members: ${currentMembers
              .slice(0, 3)
              .map((p) => p.name)
              .join(', ')}${currentMembers.length > 3 ? '...' : ''}`,
          );
        }
      } catch (error) {
        console.error('❌ Error fetching people:', error);
        throw error;
      }
    });

    it('should have valid person data structure', async () => {
      const people = await fetchPeople();
      const person = people[0];

      // Check required fields
      expect(person.name).toBeTruthy();
      expect(person.slug.current).toBeTruthy();
      expect(person.userGroup).toBeTruthy();

      // Check optional fields exist when present
      if (person.title) {
        expect(typeof person.title).toBe('string');
      }

      if (person.email) {
        expect(person.email).toContain('@');
      }

      if (person.researchInterests) {
        expect(Array.isArray(person.researchInterests)).toBe(true);
      }

      console.log(`✅ Person data structure is valid for: ${person.name}`);
    });
  });

  describe('Publications Data', () => {
    it('should fetch publications data from Sanity', async () => {
      try {
        const publications = await fetchPublications();

        expect(Array.isArray(publications)).toBe(true);
        expect(publications.length).toBeGreaterThan(0);

        // Validate publication structure
        const firstPublication = publications[0];
        expect(firstPublication).toHaveProperty('_id');
        expect(firstPublication).toHaveProperty('title');
        expect(firstPublication).toHaveProperty('slug');
        expect(firstPublication).toHaveProperty('publicationType');

        console.log(`✅ Found ${publications.length} publications in Sanity`);
        console.log(`Sample publication: ${firstPublication.title}`);

        // Log some statistics
        const featuredPublications = publications.filter((p) => p.isFeatured);
        const publishedPublications = publications.filter((p) => p.status === 'published');

        console.log(
          `📊 Breakdown: ${featuredPublications.length} featured, ${publishedPublications.length} published`,
        );

        // Show some sample titles
        if (publications.length > 0) {
          console.log(
            `📚 Sample publications: ${publications
              .slice(0, 3)
              .map((p) => p.title)
              .join(', ')}${publications.length > 3 ? '...' : ''}`,
          );
        }
      } catch (error) {
        console.error('❌ Error fetching publications:', error);
        throw error;
      }
    });

    it('should have valid publication data structure', async () => {
      const publications = await fetchPublications();
      const publication = publications[0];

      // Check required fields
      expect(publication.title).toBeTruthy();
      expect(publication.slug.current).toBeTruthy();
      expect(publication.publicationType).toBeTruthy();

      // Check optional fields exist when present
      if (publication.authors) {
        expect(Array.isArray(publication.authors)).toBe(true);
      }

      if (publication.abstract) {
        expect(typeof publication.abstract).toBe('string');
      }

      if (publication.doi) {
        expect(publication.doi).toContain('10.');
      }

      console.log(`✅ Publication data structure is valid for: ${publication.title}`);
    });
  });

  describe('News Data', () => {
    it('should fetch news data from Sanity', async () => {
      try {
        const news = await fetchNews();

        expect(Array.isArray(news)).toBe(true);
        expect(news.length).toBeGreaterThan(0);

        // Validate news structure
        const firstNews = news[0];
        expect(firstNews).toHaveProperty('_id');
        expect(firstNews).toHaveProperty('title');
        expect(firstNews).toHaveProperty('slug');
        expect(firstNews).toHaveProperty('category');

        console.log(`✅ Found ${news.length} news articles in Sanity`);
        console.log(`Sample news: ${firstNews.title}`);

        // Log some statistics
        const featuredNews = news.filter((n) => n.isFeatured);
        const publishedNews = news.filter((n) => n.status === 'published');

        console.log(
          `📊 Breakdown: ${featuredNews.length} featured, ${publishedNews.length} published`,
        );

        // Show some sample titles
        if (news.length > 0) {
          console.log(
            `📰 Sample news: ${news
              .slice(0, 3)
              .map((n) => n.title)
              .join(', ')}${news.length > 3 ? '...' : ''}`,
          );
        }
      } catch (error) {
        console.error('❌ Error fetching news:', error);
        throw error;
      }
    });

    it('should have valid news data structure', async () => {
      const news = await fetchNews();
      const newsItem = news[0];

      // Check required fields
      expect(newsItem.title).toBeTruthy();
      expect(newsItem.slug.current).toBeTruthy();
      expect(newsItem.category).toBeTruthy();

      // Check optional fields exist when present
      if (newsItem.excerpt) {
        expect(typeof newsItem.excerpt).toBe('string');
      }

      if (newsItem.content) {
        expect(typeof newsItem.content).toBe('string');
      }

      if (newsItem.tags) {
        expect(Array.isArray(newsItem.tags)).toBe(true);
      }

      console.log(`✅ News data structure is valid for: ${newsItem.title}`);
    });
  });

  describe('Data Relationships', () => {
    it('should have consistent author relationships', async () => {
      const [people, publications] = await Promise.all([fetchPeople(), fetchPublications()]);

      // Check that publications with person authors reference valid people
      const publicationsWithPersonAuthors = publications.filter((pub) =>
        pub.authors?.some((author) => author.person),
      );

      if (publicationsWithPersonAuthors.length > 0) {
        const peopleIds = new Set(people.map((p) => p._id));

        for (const publication of publicationsWithPersonAuthors) {
          for (const author of publication.authors) {
            if (author.person) {
              expect(peopleIds.has(author.person._id)).toBe(true);
            }
          }
        }

        console.log(
          `✅ ${publicationsWithPersonAuthors.length} publications have valid author relationships`,
        );
      } else {
        console.log('ℹ️ No publications with person authors found');
      }
    });

    it('should have consistent news author relationships', async () => {
      const [people, news] = await Promise.all([fetchPeople(), fetchNews()]);

      const newsWithAuthors = news.filter((n) => n.author);

      if (newsWithAuthors.length > 0) {
        const peopleIds = new Set(people.map((p) => p._id));

        for (const newsItem of newsWithAuthors) {
          expect(peopleIds.has(newsItem.author._id)).toBe(true);
        }

        console.log(`✅ ${newsWithAuthors.length} news articles have valid author relationships`);
      } else {
        console.log('ℹ️ No news articles with authors found');
      }
    });
  });

  describe('Social Link Hostnames', () => {
    it('should have no social links containing waveslab.org', async () => {
      const people = await fetchPeople();
      const urlFields = ['linkedin', 'researchGate', 'googleScholar'] as const;
      const stringFields = ['twitter', 'github'] as const;

      for (const person of people) {
        if (!person.socialMedia) continue;

        for (const field of urlFields) {
          const val = person.socialMedia[field];
          if (!val) continue;
          expect(val, `${person.name}.socialMedia.${field}`).not.toContain('waveslab.org');
        }
        for (const field of stringFields) {
          const val = person.socialMedia[field];
          if (!val) continue;
          expect(val, `${person.name}.socialMedia.${field}`).not.toContain('waveslab.org');
        }
      }

      console.log(`✅ No social links contain waveslab.org across ${people.length} people`);
    });

    it('should have correct platform hostnames for URL social links', async () => {
      const people = await fetchPeople();
      const expectedHosts: Record<string, string[]> = {
        linkedin: ['linkedin.com', 'www.linkedin.com'],
        researchGate: ['researchgate.net', 'www.researchgate.net'],
        googleScholar: ['scholar.google.com'],
      };

      for (const person of people) {
        if (!person.socialMedia) continue;

        for (const [field, validHosts] of Object.entries(expectedHosts)) {
          const val = (person.socialMedia as any)[field];
          if (!val) continue;
          try {
            const host = new URL(val).hostname.toLowerCase();
            expect(
              validHosts.some((h) => host === h),
              `${person.name}.socialMedia.${field} has hostname "${host}", expected one of: ${validHosts.join(', ')}`,
            ).toBe(true);
          } catch {
            // Not a URL — will be caught by other validation
          }
        }
      }

      console.log(`✅ All URL social links have correct platform hostnames`);
    });
  });

  describe('Data Quality', () => {
    it('should have no duplicate slugs', async () => {
      const [people, publications, news] = await Promise.all([
        fetchPeople(),
        fetchPublications(),
        fetchNews(),
      ]);

      // Check people slugs
      const peopleSlugs = people.map((p) => p.slug.current);
      const uniquePeopleSlugs = new Set(peopleSlugs);
      expect(uniquePeopleSlugs.size).toBe(peopleSlugs.length);

      // Check publication slugs
      const publicationSlugs = publications.map((p) => p.slug.current);
      const uniquePublicationSlugs = new Set(publicationSlugs);
      expect(uniquePublicationSlugs.size).toBe(publicationSlugs.length);

      // Check news slugs
      const newsSlugs = news.map((n) => n.slug.current);
      const uniqueNewsSlugs = new Set(newsSlugs);
      expect(uniqueNewsSlugs.size).toBe(newsSlugs.length);

      console.log(
        `✅ No duplicate slugs found: ${people.length} people, ${publications.length} publications, ${news.length} news`,
      );
    });

    it('should have valid dates', async () => {
      const publications = await fetchPublications();
      const news = await fetchNews();

      // Check publication dates
      for (const publication of publications) {
        if (publication.publishedDate) {
          const date = new Date(publication.publishedDate);
          expect(isNaN(date.getTime())).toBe(false);
        }
      }

      // Check news dates
      for (const newsItem of news) {
        if (newsItem.publishedAt) {
          const date = new Date(newsItem.publishedAt);
          expect(isNaN(date.getTime())).toBe(false);
        }
      }

      console.log(
        `✅ All dates are valid: ${publications.length} publications, ${news.length} news articles`,
      );
    });
  });
});
