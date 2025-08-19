import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from '@/app/api/cms/auth/route';

// Mock the authentication functions
vi.mock('@/lib/cms/api/auth', () => ({
  validateApiKey: vi.fn(),
  generateJwtToken: vi.fn(),
  createApiUser: vi.fn(),
  getApiUser: vi.fn(),
  updateApiUser: vi.fn(),
  listApiUsers: vi.fn(),
  requireRole: vi.fn((role) => (handler: any) => handler),
  requirePermission: vi.fn(),
  deleteApiUser: vi.fn(),
}));

// Mock the rate limiting
vi.mock('@/lib/cms/api/rate-limit', () => ({
  rateLimit: vi.fn(() => ({
    check: vi.fn(() => ({ success: true })),
  })),
}));

// Mock the logging
vi.mock('@/lib/cms/api/logging', () => ({
  logRequest: vi.fn(),
  securityLogger: {
    logSecurityEvent: vi.fn(),
  },
}));

describe('Authentication API', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create a mock request
    mockRequest = new NextRequest('http://localhost:3000/api/cms/auth', {
      method: 'GET',
      headers: {
        'x-api-key': 'test-api-key',
      },
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/cms/auth', () => {
    it('should create a new user when action is create_user', async () => {
      const { createApiUser, getApiUser } = await import('@/lib/cms/api/auth');

      // Mock the createApiUser function
      vi.mocked(createApiUser).mockReturnValue('user_123');
      vi.mocked(getApiUser).mockReturnValue({
        id: 'user_123',
        name: 'Test User',
        email: 'test@example.com',
        roles: ['user'],
        permissions: {
          read: true,
          write: false,
          delete: false,
          admin: false,
        },
        apiKey: 'waves_test123',
      });

      const request = new NextRequest('http://localhost:3000/api/cms/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_user',
          name: 'Test User',
          email: 'test@example.com',
          roles: ['user'],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe('User created successfully');
      expect(data.data.name).toBe('Test User');
      expect(data.data.apiKey).toBe('waves_test123');
    });

    it('should generate a JWT token when action is generate_token', async () => {
      const { generateJwtToken, getApiUser } = await import('@/lib/cms/api/auth');

      // Mock the functions
      vi.mocked(generateJwtToken).mockReturnValue('test.jwt.token');
      vi.mocked(getApiUser).mockReturnValue({
        id: 'user_123',
        name: 'Test User',
        email: 'test@example.com',
        roles: ['user'],
        permissions: {
          read: true,
          write: false,
          delete: false,
          admin: false,
        },
      });

      const request = new NextRequest('http://localhost:3000/api/cms/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_token',
          userId: 'user_123',
          expiresIn: '24h',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Token generated successfully');
      expect(data.data.token).toBe('test.jwt.token');
      expect(data.data.expiresIn).toBe('24h');
    });

    it('should handle API key requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/cms/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'request_api_key',
          name: 'Test User',
          email: 'test@example.com',
          reason: 'Testing purposes',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('API key request has been submitted');
      expect(data.data.status).toBe('pending');
      expect(data.data.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
    });

    it('should return error for invalid action', async () => {
      const request = new NextRequest('http://localhost:3000/api/cms/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'invalid_action',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid action');
    });

    it('should validate required fields for create_user', async () => {
      const request = new NextRequest('http://localhost:3000/api/cms/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_user',
          // Missing required fields
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
    });

    it('should validate required fields for generate_token', async () => {
      const request = new NextRequest('http://localhost:3000/api/cms/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_token',
          // Missing userId
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should validate required fields for request_api_key', async () => {
      const request = new NextRequest('http://localhost:3000/api/cms/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'request_api_key',
          name: 'Test User',
          // Missing email and reason
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Name, email, and reason are required');
    });
  });

  describe('GET /api/cms/auth', () => {
    it('should list all users when no userId provided', async () => {
      const { listApiUsers } = await import('@/lib/cms/api/auth');

      // Mock the listApiUsers function
      vi.mocked(listApiUsers).mockReturnValue([
        {
          id: 'user_1',
          name: 'User 1',
          email: 'user1@example.com',
          roles: ['user'],
          permissions: {
            read: true,
            write: false,
            delete: false,
            admin: false,
          },
          apiKey: 'waves_key1',
        },
        {
          id: 'user_2',
          name: 'User 2',
          email: 'user2@example.com',
          roles: ['editor'],
          permissions: {
            read: true,
            write: true,
            delete: false,
            admin: false,
          },
          apiKey: 'waves_key2',
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/cms/auth', {
        method: 'GET',
        headers: {
          'x-api-key': 'admin-api-key',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].name).toBe('User 1');
      expect(data.data[1].name).toBe('User 2');
      expect(data.data[0].hasApiKey).toBe(true);
      expect(data.data[1].hasApiKey).toBe(true);
    });

    it('should get specific user when userId provided', async () => {
      const { getApiUser } = await import('@/lib/cms/api/auth');

      // Mock the getApiUser function
      vi.mocked(getApiUser).mockReturnValue({
        id: 'user_123',
        name: 'Test User',
        email: 'test@example.com',
        roles: ['user'],
        permissions: {
          read: true,
          write: false,
          delete: false,
          admin: false,
        },
        apiKey: 'waves_test123',
      });

      const request = new NextRequest('http://localhost:3000/api/cms/auth?userId=user_123', {
        method: 'GET',
        headers: {
          'x-api-key': 'admin-api-key',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.name).toBe('Test User');
      expect(data.data.email).toBe('test@example.com');
      expect(data.data.hasApiKey).toBe(true);
    });

    it('should return 404 when user not found', async () => {
      const { getApiUser } = await import('@/lib/cms/api/auth');

      // Mock the getApiUser function to return undefined
      vi.mocked(getApiUser).mockReturnValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/cms/auth?userId=nonexistent', {
        method: 'GET',
        headers: {
          'x-api-key': 'admin-api-key',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });
  });

  describe('PUT /api/cms/auth', () => {
    it('should update user successfully', async () => {
      const { updateApiUser, getApiUser } = await import('@/lib/cms/api/auth');

      // Mock the functions
      vi.mocked(updateApiUser).mockReturnValue(true);
      vi.mocked(getApiUser).mockReturnValue({
        id: 'user_123',
        name: 'Updated User',
        email: 'updated@example.com',
        roles: ['editor'],
        permissions: {
          read: true,
          write: true,
          delete: false,
          admin: false,
        },
        apiKey: 'waves_test123',
      });

      const request = new NextRequest('http://localhost:3000/api/cms/auth', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'admin-api-key',
        },
        body: JSON.stringify({
          userId: 'user_123',
          permissions: {
            read: true,
            write: true,
            delete: false,
            admin: false,
          },
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('User updated successfully');
      expect(data.data.name).toBe('Updated User');
    });

    it('should return 400 when userId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/cms/auth', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'admin-api-key',
        },
        body: JSON.stringify({
          // Missing userId
          permissions: {
            read: true,
            write: true,
          },
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('User ID is required');
    });

    it('should return 404 when user not found', async () => {
      const { updateApiUser } = await import('@/lib/cms/api/auth');

      // Mock the updateApiUser function to return false
      vi.mocked(updateApiUser).mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/cms/auth', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'admin-api-key',
        },
        body: JSON.stringify({
          userId: 'nonexistent',
          permissions: {
            read: true,
            write: true,
            delete: false,
            admin: false,
          },
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });
  });

  describe('DELETE /api/cms/auth', () => {
    it('should delete user successfully', async () => {
      const { deleteApiUser } = await import('@/lib/cms/api/auth');

      // Mock the deleteApiUser function
      vi.mocked(deleteApiUser).mockReturnValue(true);

      const request = new NextRequest('http://localhost:3000/api/cms/auth?userId=user_123', {
        method: 'DELETE',
        headers: {
          'x-api-key': 'admin-api-key',
        },
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('User deleted successfully');
    });

    it('should return 400 when userId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/cms/auth', {
        method: 'DELETE',
        headers: {
          'x-api-key': 'admin-api-key',
        },
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('User ID is required');
    });

    it('should prevent deletion of admin user', async () => {
      const request = new NextRequest('http://localhost:3000/api/cms/auth?userId=admin', {
        method: 'DELETE',
        headers: {
          'x-api-key': 'admin-api-key',
        },
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Cannot delete admin user');
    });

    it('should return 404 when user not found', async () => {
      const { deleteApiUser } = await import('@/lib/cms/api/auth');

      // Mock the deleteApiUser function to return false
      vi.mocked(deleteApiUser).mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/cms/auth?userId=nonexistent', {
        method: 'DELETE',
        headers: {
          'x-api-key': 'admin-api-key',
        },
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });
  });
});
