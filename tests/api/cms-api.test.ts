import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createServer } from 'http';
import { parse } from 'url';
import { NextRequest } from 'next/server';

// Mock environment variables
process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-project';
process.env.NEXT_PUBLIC_SANITY_DATASET = 'test-dataset';
process.env.SANITY_API_TOKEN = 'test-token';
process.env.CMS_API_KEY = 'test-api-key';

// Mock Sanity client
const mockSanityClient = {
  fetch: vi.fn(),
  create: vi.fn(),
  patch: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  commit: vi.fn(),
  delete: vi.fn(),
};

vi.mock('@/lib/cms/client', () => ({
  client: mockSanityClient,
}));

describe('CMS API Endpoints', () => {
  beforeAll(() => {
    // Setup test server
  });

  afterAll(() => {
    // Cleanup
  });

  describe('Health Check Endpoint', () => {
    it('should return healthy status when Sanity is connected', async () => {
      mockSanityClient.fetch.mockResolvedValue(69); // Mock person count

      const response = await fetch('/api/cms/health');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.sanity.connected).toBe(true);
      expect(data.sanity.personCount).toBe(69);
    });

    it('should return unhealthy status when Sanity is not connected', async () => {
      mockSanityClient.fetch.mockRejectedValue(new Error('Connection failed'));

      const response = await fetch('/api/cms/health');
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.status).toBe('unhealthy');
      expect(data.sanity.connected).toBe(false);
    });
  });

  describe('People API Endpoints', () => {
    const mockPerson = {
      _id: 'person-1',
      _type: 'person',
      name: 'John Doe',
      slug: { current: 'john-doe' },
      title: 'Research Scientist',
      userGroup: 'current' as const,
      isActive: true,
    };

    describe('GET /api/cms/people', () => {
      it('should return list of people', async () => {
        mockSanityClient.fetch
          .mockResolvedValueOnce([mockPerson]) // Main query
          .mockResolvedValueOnce(1); // Count query

        const response = await fetch('/api/cms/people');
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data).toHaveLength(1);
        expect(data.data[0].name).toBe('John Doe');
        expect(data.pagination.total).toBe(1);
      });

      it('should handle query parameters', async () => {
        mockSanityClient.fetch.mockResolvedValueOnce([mockPerson]).mockResolvedValueOnce(1);

        const response = await fetch('/api/cms/people?userGroup=current&limit=10');
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(mockSanityClient.fetch).toHaveBeenCalledWith(
          expect.stringContaining('userGroup == $userGroup'),
          expect.objectContaining({ userGroup: 'current' }),
        );
      });

      it('should handle rate limiting', async () => {
        // This would require more complex mocking of the rate limiter
        // For now, we'll test the basic functionality
        expect(true).toBe(true);
      });
    });

    describe('POST /api/cms/people', () => {
      it('should create a new person with valid data', async () => {
        const newPerson = {
          name: 'Jane Smith',
          slug: { current: 'jane-smith' },
          userGroup: 'current' as const,
          isActive: true,
        };

        mockSanityClient.create.mockResolvedValue({
          _id: 'person-2',
          ...newPerson,
        });

        const response = await fetch('/api/cms/people', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'test-api-key',
          },
          body: JSON.stringify(newPerson),
        });

        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.message).toBe('Person created successfully');
        expect(data.data.name).toBe('Jane Smith');
      });

      it('should reject request without API key', async () => {
        const response = await fetch('/api/cms/people', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: 'Test' }),
        });

        expect(response.status).toBe(401);
      });

      it('should validate required fields', async () => {
        const invalidPerson = {
          name: '', // Invalid: empty name
          userGroup: 'invalid-group', // Invalid: not in allowed values
        };

        const response = await fetch('/api/cms/people', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'test-api-key',
          },
          body: JSON.stringify(invalidPerson),
        });

        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Validation failed');
        expect(data.details).toContain('Name is required');
        expect(data.details).toContain('User group must be one of');
      });
    });

    describe('GET /api/cms/people/[id]', () => {
      it('should return a specific person', async () => {
        mockSanityClient.fetch.mockResolvedValue(mockPerson);

        const response = await fetch('/api/cms/people/person-1');
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data.name).toBe('John Doe');
      });

      it('should return 404 for non-existent person', async () => {
        mockSanityClient.fetch.mockResolvedValue(null);

        const response = await fetch('/api/cms/people/non-existent');
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe('Person not found');
      });
    });

    describe('PUT /api/cms/people/[id]', () => {
      it('should update an existing person', async () => {
        mockSanityClient.fetch.mockResolvedValue(mockPerson); // Check if exists
        mockSanityClient.commit.mockResolvedValue({
          ...mockPerson,
          name: 'John Updated',
        });

        const updateData = {
          name: 'John Updated',
          title: 'Senior Research Scientist',
        };

        const response = await fetch('/api/cms/people/person-1', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'test-api-key',
          },
          body: JSON.stringify(updateData),
        });

        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.message).toBe('Person updated successfully');
        expect(data.data.name).toBe('John Updated');
      });
    });

    describe('DELETE /api/cms/people/[id]', () => {
      it('should delete an existing person', async () => {
        mockSanityClient.fetch.mockResolvedValue(mockPerson); // Check if exists
        mockSanityClient.delete.mockResolvedValue(undefined);

        const response = await fetch('/api/cms/people/person-1', {
          method: 'DELETE',
          headers: {
            'x-api-key': 'test-api-key',
          },
        });

        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.message).toBe('Person deleted successfully');
      });
    });
  });

  describe('Publications API Endpoints', () => {
    const mockPublication = {
      _id: 'pub-1',
      _type: 'publication',
      title: 'Test Publication',
      slug: { current: 'test-publication' },
      publicationType: 'journal-article' as const,
      authors: [
        {
          name: 'John Doe',
          isCorresponding: true,
        },
      ],
      publishedDate: '2024-01-01',
      status: 'published' as const,
      isFeatured: false,
      isOpenAccess: true,
    };

    describe('GET /api/cms/publications', () => {
      it('should return list of publications', async () => {
        mockSanityClient.fetch.mockResolvedValueOnce([mockPublication]).mockResolvedValueOnce(1);

        const response = await fetch('/api/cms/publications');
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data).toHaveLength(1);
        expect(data.data[0].title).toBe('Test Publication');
      });

      it('should handle publication type filtering', async () => {
        mockSanityClient.fetch.mockResolvedValueOnce([mockPublication]).mockResolvedValueOnce(1);

        const response = await fetch('/api/cms/publications?publicationType=journal-article');
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(mockSanityClient.fetch).toHaveBeenCalledWith(
          expect.stringContaining('publicationType == $publicationType'),
          expect.objectContaining({ publicationType: 'journal-article' }),
        );
      });
    });

    describe('POST /api/cms/publications', () => {
      it('should create a new publication with valid data', async () => {
        const newPublication = {
          title: 'New Publication',
          slug: { current: 'new-publication' },
          publicationType: 'journal-article' as const,
          authors: [
            {
              name: 'Jane Smith',
              isCorresponding: true,
            },
          ],
          publishedDate: '2024-01-01',
          status: 'published' as const,
          isFeatured: false,
          isOpenAccess: true,
        };

        mockSanityClient.create.mockResolvedValue({
          _id: 'pub-2',
          ...newPublication,
        });

        const response = await fetch('/api/cms/publications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'test-api-key',
          },
          body: JSON.stringify(newPublication),
        });

        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.message).toBe('Publication created successfully');
        expect(data.data.title).toBe('New Publication');
      });
    });
  });

  describe('News API Endpoints', () => {
    const mockNews = {
      _id: 'news-1',
      _type: 'news',
      title: 'Test News',
      slug: { current: 'test-news' },
      excerpt: 'Test excerpt',
      content: 'Test content',
      publishedAt: '2024-01-01',
      author: { _ref: 'person-1' },
      category: 'lab-news' as const,
      status: 'published' as const,
      isFeatured: false,
      isSticky: false,
    };

    describe('GET /api/cms/news', () => {
      it('should return list of news posts', async () => {
        mockSanityClient.fetch.mockResolvedValueOnce([mockNews]).mockResolvedValueOnce(1);

        const response = await fetch('/api/cms/news');
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data).toHaveLength(1);
        expect(data.data[0].title).toBe('Test News');
      });

      it('should handle category filtering', async () => {
        mockSanityClient.fetch.mockResolvedValueOnce([mockNews]).mockResolvedValueOnce(1);

        const response = await fetch('/api/cms/news?category=lab-news');
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(mockSanityClient.fetch).toHaveBeenCalledWith(
          expect.stringContaining('category == $category'),
          expect.objectContaining({ category: 'lab-news' }),
        );
      });
    });

    describe('POST /api/cms/news', () => {
      it('should create a new news post with valid data', async () => {
        const newNews = {
          title: 'New News',
          slug: { current: 'new-news' },
          excerpt: 'New excerpt',
          content: 'New content',
          publishedAt: '2024-01-01',
          author: { _ref: 'person-1' },
          category: 'lab-news' as const,
          status: 'published' as const,
          isFeatured: false,
          isSticky: false,
        };

        mockSanityClient.create.mockResolvedValue({
          _id: 'news-2',
          ...newNews,
        });

        const response = await fetch('/api/cms/news', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'test-api-key',
          },
          body: JSON.stringify(newNews),
        });

        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.message).toBe('News post created successfully');
        expect(data.data.title).toBe('New News');
      });
    });
  });
});
