import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn, type ChildProcess } from 'child_process';
import { fetchPeople, fetchPublications, fetchNews } from '@/lib/cms/client';

describe('Full CMS Integration - Real Data & Frontend', () => {
  let devServer: ChildProcess | null = null;
  const baseUrl = 'http://localhost:3001';

  beforeAll(async () => {
    console.log('🚀 Starting development server for integration tests...');

    // Start the development server
    devServer = spawn('npm', ['run', 'dev'], {
      cwd: process.cwd(),
      stdio: 'pipe',
      env: { ...process.env, PORT: '3001' },
    });

    // Wait for server to be ready
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Development server failed to start within 30 seconds'));
      }, 30000);

      devServer!.stdout?.on('data', (data: Buffer) => {
        const output = data.toString();
        console.log(`📝 Dev server: ${output.trim()}`);

        if (output.includes('Ready in') || output.includes('Local:')) {
          clearTimeout(timeout);
          // Give it a moment to fully initialize
          setTimeout(() => resolve(), 2000);
        }
      });

      devServer!.stderr?.on('data', (data: Buffer) => {
        const output = data.toString();
        if (!output.includes('Warning') && !output.includes('Deprecation')) {
          console.error(`❌ Dev server error: ${output.trim()}`);
        }
      });

      devServer!.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    console.log('✅ Development server is ready');
  });

  afterAll(async () => {
    if (devServer) {
      console.log('🛑 Stopping development server...');
      devServer.kill('SIGTERM');
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
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

      // Log some statistics
      const featuredPublications = publications.filter((p) => p.isFeatured);
      const publishedPublications = publications.filter((p) => p.status === 'published');

      console.log(
        `📊 Breakdown: ${featuredPublications.length} featured, ${publishedPublications.length} published`,
      );
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

      // Log some statistics
      const featuredNews = news.filter((n) => n.isFeatured);
      const publishedNews = news.filter((n) => n.status === 'published');

      console.log(
        `📊 Breakdown: ${featuredNews.length} featured, ${publishedNews.length} published`,
      );
    });
  });

  describe('Frontend Page Content Validation', () => {
    it('should render people page with actual team members from Sanity', async () => {
      // For client-side rendered pages, we need to wait for the content to load
      // The page initially shows a loading state, then renders the actual content
      let html = '';
      let attempts = 0;
      const maxAttempts = 15;

      while (attempts < maxAttempts) {
        try {
          const response = await fetch(`${baseUrl}/people`);
          expect(response.status).toBe(200);

          html = await response.text();

          // Check if the page is still loading
          if (html.includes('Loading team members...')) {
            console.log(`⏳ Page still loading, attempt ${attempts + 1}/${maxAttempts}`);
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
            attempts++;
            continue;
          }

          // If we get here, the page has loaded
          break;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.log(
            `⚠️ Connection error, attempt ${attempts + 1}/${maxAttempts}: ${errorMessage}`,
          );
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
          attempts++;
          continue;
        }
      }

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
    }, 20000); // 20 second timeout for client-side rendering

    it('should render publications page with actual publications from Sanity', async () => {
      let response;
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        try {
          response = await fetch(`${baseUrl}/publications`);
          expect(response.status).toBe(200);
          break;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.log(
            `⚠️ Connection error, attempt ${attempts + 1}/${maxAttempts}: ${errorMessage}`,
          );
          await new Promise((resolve) => setTimeout(resolve, 2000));
          attempts++;
          continue;
        }
      }

      if (!response) {
        throw new Error('Failed to fetch publications page after multiple attempts');
      }

      const html = await response.text();

      // Get actual publications data to compare
      const publications = await fetchPublications();
      const featuredPublications = publications.filter((p) => p.isFeatured);

      console.log(
        `📊 Publications data: ${publications.length} total, ${featuredPublications.length} featured`,
      );

      // Check that the page contains expected sections
      expect(html).toContain('Publications');
      expect(html).toContain('All Publications');

      // Check that actual publication titles appear in the HTML
      if (publications.length > 0) {
        const firstPublication = publications[0];
        expect(html).toContain(firstPublication.title);
        console.log(`✅ Found publication "${firstPublication.title}" on page`);
      }

      // Check for featured publications section (only if there are featured publications)
      if (featuredPublications.length > 0) {
        expect(html).toContain('Featured Publications');
        console.log(
          `✅ Featured publications section found with ${featuredPublications.length} items`,
        );
      } else {
        console.log(`ℹ️ No featured publications found (${featuredPublications.length} featured)`);
      }

      // Check for proper HTML structure
      expect(html).toContain('<main');
      expect(html).toContain('</main>');
      expect(html).toContain('<title>');
    });

    it('should render news page with actual news articles from Sanity', async () => {
      let response;
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        try {
          response = await fetch(`${baseUrl}/news`);
          expect(response.status).toBe(200);
          break;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.log(
            `⚠️ Connection error, attempt ${attempts + 1}/${maxAttempts}: ${errorMessage}`,
          );
          await new Promise((resolve) => setTimeout(resolve, 2000));
          attempts++;
          continue;
        }
      }

      if (!response) {
        throw new Error('Failed to fetch news page after multiple attempts');
      }

      const html = await response.text();

      // Get actual news data to compare
      const news = await fetchNews();
      const featuredNews = news.filter((n) => n.isFeatured);

      console.log(`📊 News data: ${news.length} total, ${featuredNews.length} featured`);

      // Check that the page contains expected sections
      expect(html).toContain('News');
      expect(html).toContain('Recent Updates');

      // Check that actual news titles appear in the HTML
      if (news.length > 0) {
        const firstNews = news[0];
        expect(html).toContain(firstNews.title);
        console.log(`✅ Found news article "${firstNews.title}" on page`);
      }

      // Check for featured news section (only if there are featured news)
      if (featuredNews.length > 0) {
        expect(html).toContain('Featured Stories');
        console.log(`✅ Featured news section found with ${featuredNews.length} items`);
      } else {
        console.log(`ℹ️ No featured news found (${featuredNews.length} featured)`);
      }

      // Check for proper HTML structure
      expect(html).toContain('<main');
      expect(html).toContain('</main>');
      expect(html).toContain('<title>');
    });
  });
});
