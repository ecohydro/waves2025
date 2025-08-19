import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import {
  validateApiKey,
  validateJwtToken,
  generateJwtToken,
  checkPermission,
  checkRole,
  createApiUser,
  getApiUser,
  updateApiUser,
  deleteApiUser,
  listApiUsers,
  requireAuth,
  requirePermission,
  requireRole,
} from '@/lib/cms/api/auth';
import { apiLogger, securityLogger, logRequest } from '@/lib/cms/api/logging';
import { rateLimit, getRateLimitRules, getClientRateLimitStatus } from '@/lib/cms/api/rate-limit';

// Mock environment variables
beforeEach(() => {
  process.env.CMS_API_KEY = 'test-api-key-123';
  process.env.JWT_SECRET = 'test-jwt-secret-456';
});

describe('Authentication System', () => {
  beforeEach(() => {
    // Clear any existing users
    vi.clearAllMocks();
    // Reset environment variables
    process.env.CMS_API_KEY = 'test-api-key-123';
    process.env.JWT_SECRET = 'test-jwt-secret-456';

    // Ensure admin user exists for tests
    const { createApiUser, getApiUser } = require('@/lib/cms/api/auth');
    if (!getApiUser('admin')) {
      createApiUser({
        id: 'admin',
        name: 'Admin User',
        email: 'admin@waveslab.com',
        roles: ['admin'],
        permissions: {
          read: true,
          write: true,
          delete: true,
          admin: true,
        },
        apiKey: 'test-api-key-123',
      });
    }
  });

  describe('API Key Validation', () => {
    it('should validate correct API key', async () => {
      const request = new NextRequest('http://localhost:3000/api/cms/people', {
        headers: {
          'x-api-key': 'test-api-key-123',
        },
      });

      const result = await validateApiKey(request);

      expect(result.valid).toBe(true);
      expect(result.userId).toBe('admin');
      expect(result.permissions).toContain('read');
      expect(result.permissions).toContain('write');
      expect(result.permissions).toContain('delete');
      expect(result.permissions).toContain('admin');
      expect(result.roles).toContain('admin');
    });

    it('should reject invalid API key', async () => {
      const request = new NextRequest('http://localhost:3000/api/cms/people', {
        headers: {
          'x-api-key': 'invalid-key',
        },
      });

      const result = await validateApiKey(request);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid API key');
    });

    it('should reject missing API key', async () => {
      const request = new NextRequest('http://localhost:3000/api/cms/people');

      const result = await validateApiKey(request);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('API key is required');
    });

    it('should accept API key from Authorization header', async () => {
      const request = new NextRequest('http://localhost:3000/api/cms/people', {
        headers: {
          authorization: 'Bearer test-api-key-123',
        },
      });

      const result = await validateApiKey(request);

      expect(result.valid).toBe(true);
      expect(result.userId).toBe('admin');
    });
  });

  describe('JWT Token Validation', () => {
    it('should validate JWT token', async () => {
      const token = generateJwtToken('admin');

      const result = await validateJwtToken(token);

      expect(result.valid).toBe(true);
      expect(result.userId).toBe('admin');
      expect(result.roles).toContain('admin');
    });

    it('should reject invalid JWT token', async () => {
      const result = await validateJwtToken('invalid.token.here');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid JWT token');
    });

    it('should reject expired JWT token', async () => {
      // Create a token that expires in 1 second
      const token = generateJwtToken('admin', '1s');

      // Wait for it to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const result = await validateJwtToken(token);

      expect(result.valid).toBe(false);
      // The error could be either 'Token expired' or 'Invalid JWT token' depending on the JWT library
      expect(['Token expired', 'Invalid JWT token']).toContain(result.error);
    });
  });

  describe('Permission and Role Checking', () => {
    it('should check permissions correctly', () => {
      const authResult = {
        valid: true,
        userId: 'test-user',
        permissions: ['read', 'write'],
        roles: ['editor'],
      };

      expect(checkPermission(authResult, 'read')).toBe(true);
      expect(checkPermission(authResult, 'write')).toBe(true);
      expect(checkPermission(authResult, 'delete')).toBe(false);
      expect(checkPermission(authResult, 'admin')).toBe(false);
    });

    it('should give admin role all permissions', () => {
      const authResult = {
        valid: true,
        userId: 'admin',
        permissions: ['read'],
        roles: ['admin'],
      };

      expect(checkPermission(authResult, 'read')).toBe(true);
      expect(checkPermission(authResult, 'write')).toBe(true);
      expect(checkPermission(authResult, 'delete')).toBe(true);
      expect(checkPermission(authResult, 'admin')).toBe(true);
    });

    it('should check roles correctly', () => {
      const authResult = {
        valid: true,
        userId: 'test-user',
        permissions: ['read'],
        roles: ['editor', 'reviewer'],
      };

      expect(checkRole(authResult, 'editor')).toBe(true);
      expect(checkRole(authResult, 'reviewer')).toBe(true);
      expect(checkRole(authResult, 'admin')).toBe(false);
    });
  });

  describe('User Management', () => {
    it('should create and manage API users', () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        roles: ['editor'],
        permissions: {
          read: true,
          write: true,
          delete: false,
          admin: false,
        },
        apiKey: 'user-api-key-123',
      };

      const userId = createApiUser(userData);
      expect(userId).toBeDefined();

      const user = getApiUser(userId);
      expect(user).toBeDefined();
      expect(user?.name).toBe('Test User');
      expect(user?.email).toBe('test@example.com');
      expect(user?.roles).toContain('editor');

      // Test update
      const updated = updateApiUser(userId, { name: 'Updated User' });
      expect(updated).toBe(true);

      const updatedUser = getApiUser(userId);
      expect(updatedUser?.name).toBe('Updated User');

      // Test list
      const users = listApiUsers();
      expect(users.length).toBeGreaterThan(1); // admin + our user

      // Test delete
      const deleted = deleteApiUser(userId);
      expect(deleted).toBe(true);

      const deletedUser = getApiUser(userId);
      expect(deletedUser).toBeUndefined();
    });
  });
});

describe('Rate Limiting System', () => {
  beforeEach(() => {
    // Clear rate limit store between tests
    vi.clearAllMocks();
  });

  it('should apply rate limiting correctly', async () => {
    const limiter = rateLimit({
      interval: 1000, // 1 second
      uniqueTokenPerInterval: 10,
    });

    const request = new NextRequest('http://localhost:3000/api/cms/people', {
      headers: {
        'x-api-key': 'test-api-key-123',
      },
    });

    // First request should succeed
    const result1 = await limiter.check(request, 'TEST_ENDPOINT');
    expect(result1.success).toBe(true);
    expect(result1.remaining).toBeGreaterThan(0);

    // Multiple requests should eventually hit the limit
    let hitLimit = false;
    for (let i = 0; i < 200; i++) {
      // Try many requests
      const result = await limiter.check(request, 'TEST_ENDPOINT');
      if (!result.success) {
        hitLimit = true;
        expect(result.retryAfter).toBeDefined();
        break;
      }
    }
    expect(hitLimit).toBe(true);
  });

  it('should apply different limits for different roles', async () => {
    const limiter = rateLimit({
      interval: 1000,
      uniqueTokenPerInterval: 10,
    });

    const request = new NextRequest('http://localhost:3000/api/cms/people', {
      headers: {
        'x-api-key': 'test-api-key-123',
      },
    });

    const adminAuth = {
      valid: true,
      userId: 'admin',
      roles: ['admin'],
      permissions: ['read', 'write', 'delete', 'admin'],
    };

    const regularAuth = {
      valid: true,
      userId: 'user',
      roles: ['user'],
      permissions: ['read'],
    };

    // Admin should have higher limits
    const adminResult = await limiter.check(request, 'TEST_ENDPOINT', adminAuth);
    const regularResult = await limiter.check(request, 'TEST_ENDPOINT', regularAuth);

    expect(adminResult.limit).toBeGreaterThan(regularResult.limit);
  });

  it('should get rate limit rules', () => {
    const rules = getRateLimitRules();
    expect(rules.length).toBeGreaterThan(0);

    // Check for specific rules
    const getRule = rules.find((r) => r.method === 'GET' && r.endpoint === '*');
    expect(getRule).toBeDefined();
    expect(getRule?.limit).toBe(100);
  });

  it('should get client rate limit status', () => {
    const status = getClientRateLimitStatus('test-client');
    expect(status).toBeDefined();
  });
});

describe('Logging System', () => {
  beforeEach(() => {
    apiLogger.clearLogs();
    securityLogger.clearSecurityEvents();
  });

  it('should log API requests', () => {
    const request = new NextRequest('http://localhost:3000/api/cms/people');
    const response = new Response(JSON.stringify({ data: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    logRequest(request, response, Date.now(), 'test-user');

    const logs = apiLogger.getLogs();
    expect(logs.length).toBe(1);
    expect(logs[0].method).toBe('GET');
    expect(logs[0].url).toBe('/api/cms/people');
    expect(logs[0].statusCode).toBe(200);
    expect(logs[0].userId).toBe('test-user');
  });

  it('should calculate metrics correctly', () => {
    // Create some test logs
    const request1 = new NextRequest('http://localhost:3000/api/cms/people');
    const response1 = new Response('{}', { status: 200 });
    logRequest(request1, response1, Date.now(), 'user1');

    const request2 = new NextRequest('http://localhost:3000/api/cms/people');
    const response2 = new Response('{}', { status: 400 });
    logRequest(request2, response2, Date.now(), 'user2');

    const metrics = apiLogger.getMetrics(60);
    expect(metrics.totalRequests).toBe(2);
    expect(metrics.successfulRequests).toBe(1);
    expect(metrics.failedRequests).toBe(1);
    expect(metrics.uniqueUsers).toBe(2);
    expect(metrics.errorRate).toBe(50);
  });

  it('should log security events', () => {
    securityLogger.logSecurityEvent({
      type: 'authentication_failure',
      ip: '192.168.1.1',
      userAgent: 'test-agent',
      details: 'Invalid API key',
      severity: 'medium',
    });

    const events = securityLogger.getSecurityEvents();
    expect(events.length).toBe(1);
    expect(events[0].type).toBe('authentication_failure');
    expect(events[0].severity).toBe('medium');
    expect(events[0].ip).toBe('192.168.1.1');
  });

  it('should filter logs correctly', () => {
    // Create logs with different status codes
    const request1 = new NextRequest('http://localhost:3000/api/cms/people');
    const response1 = new Response('{}', { status: 200 });
    logRequest(request1, response1, Date.now(), 'user1');

    const request2 = new NextRequest('http://localhost:3000/api/cms/people');
    const response2 = new Response('{}', { status: 400 });
    logRequest(request2, response2, Date.now(), 'user2');

    const errorLogs = apiLogger.getErrorLogs();
    expect(errorLogs.length).toBe(1);
    expect(errorLogs[0].statusCode).toBe(400);

    const userLogs = apiLogger.getLogs({ userId: 'user1' });
    expect(userLogs.length).toBe(1);
    expect(userLogs[0].userId).toBe('user1');
  });
});

describe('Middleware Functions', () => {
  it('should require authentication', async () => {
    const mockHandler = vi.fn().mockResolvedValue(new Response('OK'));
    const protectedHandler = requireAuth(mockHandler);

    const request = new NextRequest('http://localhost:3000/api/cms/people', {
      headers: { 'x-api-key': 'test-api-key-123' },
    });

    const response = await protectedHandler(request);
    expect(response.status).toBe(200);
    expect(mockHandler).toHaveBeenCalled();
  });

  it('should reject unauthenticated requests', async () => {
    const mockHandler = vi.fn();
    const protectedHandler = requireAuth(mockHandler);

    const request = new NextRequest('http://localhost:3000/api/cms/people');

    const response = await protectedHandler(request);
    expect(response.status).toBe(401);
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('should require specific permissions', async () => {
    const mockHandler = vi.fn().mockResolvedValue(new Response('OK'));
    const protectedHandler = requirePermission('write')(mockHandler);

    const request = new NextRequest('http://localhost:3000/api/cms/people', {
      headers: { 'x-api-key': 'test-api-key-123' },
    });

    const response = await protectedHandler(request);
    expect(response.status).toBe(200);
    expect(mockHandler).toHaveBeenCalled();
  });

  it('should reject requests without required permissions', async () => {
    const mockHandler = vi.fn();
    const protectedHandler = requirePermission('admin')(mockHandler);

    // Create a user with limited permissions
    const userId = createApiUser({
      name: 'Limited User',
      email: 'limited@example.com',
      roles: ['user'],
      permissions: { read: true, write: false, delete: false, admin: false },
      apiKey: 'limited-key',
    });

    const request = new NextRequest('http://localhost:3000/api/cms/people', {
      headers: { 'x-api-key': 'limited-key' },
    });

    const response = await protectedHandler(request);
    expect(response.status).toBe(403);
    expect(mockHandler).not.toHaveBeenCalled();

    // Clean up
    deleteApiUser(userId);
  });

  it('should require specific roles', async () => {
    const mockHandler = vi.fn().mockResolvedValue(new Response('OK'));
    const protectedHandler = requireRole('admin')(mockHandler);

    const request = new NextRequest('http://localhost:3000/api/cms/people', {
      headers: { 'x-api-key': 'test-api-key-123' },
    });

    const response = await protectedHandler(request);
    expect(response.status).toBe(200);
    expect(mockHandler).toHaveBeenCalled();
  });
});
