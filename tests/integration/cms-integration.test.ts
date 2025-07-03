import { describe, it, expect, beforeAll } from 'vitest';
import { fetchPeople, fetchPublications, fetchNews } from '@/lib/cms/client';

describe('CMS Integration - Real Sanity Data', () => {
  const baseUrl = 'http://localhost:3001';

  beforeAll(async () => {
    // Wait for dev server to be ready
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });

  describe('Sanity Data Validation', () => {
    it('should fetch real people data from Sanity', async () => {
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
    });

    it('should fetch real publications data from Sanity', async () => {
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
    });

    it('should fetch real news data from Sanity', async () => {
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
    });
  });

  describe('Frontend Page Content Validation', () => {
    it('should render people page with actual team members from Sanity', async () => {
      const response = await fetch(`${baseUrl}/people`);
      expect(response.status).toBe(200);

      const html = await response.text();

      // Get actual people data to compare
      const people = await fetchPeople();
      const currentMembers = people.filter((p) => p.userGroup === 'current');
      const alumni = people.filter((p) => p.userGroup === 'alumni');
      const collaborators = people.filter(
        (p) => p.userGroup === 'collaborator' || p.userGroup === 'visitor',
      );

      console.log(
        `📊 People data: ${currentMembers.length} current, ${alumni.length} alumni, ${collaborators.length} collaborators`,
      );

      // Check that the page contains expected sections
      expect(html).toContain('Our Research Team');
      expect(html).toContain('Current Members');

      // Check that actual people names appear in the HTML
      if (currentMembers.length > 0) {
        const firstMember = currentMembers[0];
        expect(html).toContain(firstMember.name);
        console.log(`✅ Found team member "${firstMember.name}" on page`);
      }

      if (alumni.length > 0) {
        const firstAlumni = alumni[0];
        expect(html).toContain(firstAlumni.name);
        console.log(`✅ Found alumni "${firstAlumni.name}" on page`);
      }

      // Check for proper HTML structure
      expect(html).toContain('<main');
      expect(html).toContain('</main>');
      expect(html).toContain('<title>');
    });

    it('should render publications page with actual publications from Sanity', async () => {
      const response = await fetch(`${baseUrl}/publications`);
      expect(response.status).toBe(200);

      const html = await response.text();

      // Get actual publications data to compare
      const publications = await fetchPublications();
      const featuredPublications = publications.filter((p) => p.isFeatured);

      console.log(
        `📊 Publications data: ${publications.length} total, ${featuredPublications.length} featured`,
      );

      // Check that the page contains expected sections
      expect(html).toContain('Publications');
      expect(html).toContain('Featured Publications');

      // Check that actual publication titles appear in the HTML
      if (publications.length > 0) {
        const firstPublication = publications[0];
        expect(html).toContain(firstPublication.title);
        console.log(`✅ Found publication "${firstPublication.title}" on page`);
      }

      // Check for proper HTML structure
      expect(html).toContain('<main');
      expect(html).toContain('</main>');
      expect(html).toContain('<title>');
    });

    it('should render news page with actual news articles from Sanity', async () => {
      const response = await fetch(`${baseUrl}/news`);
      expect(response.status).toBe(200);

      const html = await response.text();

      // Get actual news data to compare
      const news = await fetchNews();
      const featuredNews = news.filter((n) => n.isFeatured);

      console.log(`📊 News data: ${news.length} total, ${featuredNews.length} featured`);

      // Check that the page contains expected sections
      expect(html).toContain('News');
      expect(html).toContain('Featured News');

      // Check that actual news titles appear in the HTML
      if (news.length > 0) {
        const firstNews = news[0];
        expect(html).toContain(firstNews.title);
        console.log(`✅ Found news article "${firstNews.title}" on page`);
      }

      // Check for proper HTML structure
      expect(html).toContain('<main');
      expect(html).toContain('</main>');
      expect(html).toContain('<title>');
    });
  });

  describe('Individual Page Content Validation', () => {
    it('should render individual person detail pages with real data', async () => {
      const people = await fetchPeople();
      expect(people.length).toBeGreaterThan(0);

      const testPerson = people[0];
      const response = await fetch(`${baseUrl}/people/${testPerson.slug.current}`);
      expect(response.status).toBe(200);

      const html = await response.text();

      // Check that the person's name appears
      expect(html).toContain(testPerson.name);

      // Check for person-specific content
      if (testPerson.title) {
        expect(html).toContain(testPerson.title);
      }

      if (testPerson.bio) {
        expect(html).toContain(testPerson.bio);
      }

      console.log(`✅ Person detail page for "${testPerson.name}" renders correctly`);
    });

    it('should render individual publication detail pages with real data', async () => {
      const publications = await fetchPublications();
      expect(publications.length).toBeGreaterThan(0);

      const testPublication = publications[0];
      const response = await fetch(`${baseUrl}/publications/${testPublication.slug.current}`);
      expect(response.status).toBe(200);

      const html = await response.text();

      // Check that the publication title appears
      expect(html).toContain(testPublication.title);

      // Check for publication-specific content
      if (testPublication.abstract) {
        expect(html).toContain(testPublication.abstract);
      }

      if (testPublication.doi) {
        expect(html).toContain(testPublication.doi);
      }

      console.log(`✅ Publication detail page for "${testPublication.title}" renders correctly`);
    });

    it('should render individual news detail pages with real data', async () => {
      const news = await fetchNews();
      expect(news.length).toBeGreaterThan(0);

      const testNews = news[0];
      const response = await fetch(`${baseUrl}/news/${testNews.slug.current}`);
      expect(response.status).toBe(200);

      const html = await response.text();

      // Check that the news title appears
      expect(html).toContain(testNews.title);

      // Check for news-specific content
      if (testNews.excerpt) {
        expect(html).toContain(testNews.excerpt);
      }

      if (testNews.content) {
        expect(html).toContain(testNews.content);
      }

      console.log(`✅ News detail page for "${testNews.title}" renders correctly`);
    });
  });

  describe('Static Generation Validation', () => {
    it('should generate static params for people pages', async () => {
      const people = await fetchPeople();
      expect(people.length).toBeGreaterThan(0);

      // Import the generateStaticParams function
      const { generateStaticParams } = await import('@/app/people/[slug]/page');
      const params = await generateStaticParams();

      expect(Array.isArray(params)).toBe(true);
      expect(params.length).toBeGreaterThan(0);
      expect(params[0]).toHaveProperty('slug');

      // Check that the generated params match our people data
      const generatedSlugs = params.map((p) => p.slug);
      const peopleSlugs = people.map((p) => p.slug.current);

      // At least some slugs should match
      const matchingSlugs = generatedSlugs.filter((slug) => peopleSlugs.includes(slug));
      expect(matchingSlugs.length).toBeGreaterThan(0);

      console.log(`✅ Generated ${params.length} static params for people pages`);
    });

    it('should generate static params for publications pages', async () => {
      const publications = await fetchPublications();
      expect(publications.length).toBeGreaterThan(0);

      const { generateStaticParams } = await import('@/app/publications/[slug]/page');
      const params = await generateStaticParams();

      expect(Array.isArray(params)).toBe(true);
      expect(params.length).toBeGreaterThan(0);
      expect(params[0]).toHaveProperty('slug');

      console.log(`✅ Generated ${params.length} static params for publications pages`);
    });

    it('should generate static params for news pages', async () => {
      const news = await fetchNews();
      expect(news.length).toBeGreaterThan(0);

      const { generateStaticParams } = await import('@/app/news/[slug]/page');
      const params = await generateStaticParams();

      expect(Array.isArray(params)).toBe(true);
      expect(params.length).toBeGreaterThan(0);
      expect(params[0]).toHaveProperty('slug');

      console.log(`✅ Generated ${params.length} static params for news pages`);
    });
  });

  describe('Performance and Error Handling', () => {
    it('should load pages within reasonable time', async () => {
      const startTime = Date.now();
      const response = await fetch(`${baseUrl}/people`);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(10000); // 10 seconds max

      console.log(`⏱️ People page loaded in ${endTime - startTime}ms`);
    });

    it('should handle missing content gracefully', async () => {
      const response = await fetch(`${baseUrl}/people/non-existent-person`);
      expect([404, 500]).toContain(response.status);

      if (response.status === 404) {
        console.log('✅ 404 page handled correctly for missing person');
      }
    });

    it('should have proper meta tags and SEO structure', async () => {
      const response = await fetch(`${baseUrl}/people`);
      const html = await response.text();

      expect(html).toContain('<title>');
      expect(html).toContain('<meta');
      expect(html).toContain('viewport');

      console.log('✅ SEO meta tags present');
    });
  });
});
