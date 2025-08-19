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

describe('Enhanced Authentication and Security System', () => {
  beforeEach(() => {
    // Set up environment variables
    process.env.CMS_API_KEY = 'test-api-key-123';
    process.env.JWT_SECRET = 'test-jwt-secret-456';

    // Clear logs
    apiLogger.clearLogs();
    securityLogger.clearSecurityEvents();
  });

  describe('Core Authentication Features', () => {
    it('should create and validate API users', () => {
      // Create a test user
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

      // Verify user was created
      const user = getApiUser(userId);
      expect(user).toBeDefined();
      expect(user?.name).toBe('Test User');
      expect(user?.email).toBe('test@example.com');
      expect(user?.roles).toContain('editor');

      // Test user update
      const updated = updateApiUser(userId, { name: 'Updated User' });
      expect(updated).toBe(true);

      const updatedUser = getApiUser(userId);
      expect(updatedUser?.name).toBe('Updated User');

      // Test user deletion
      const deleted = deleteApiUser(userId);
      expect(deleted).toBe(true);

      const deletedUser = getApiUser(userId);
      expect(deletedUser).toBeUndefined();
    });

    it('should validate JWT tokens', async () => {
      // Create a user first
      const userId = createApiUser({
        name: 'JWT Test User',
        email: 'jwt@example.com',
        roles: ['admin'],
        permissions: {
          read: true,
          write: true,
          delete: true,
          admin: true,
        },
      });

      // Generate a JWT token
      const token = generateJwtToken(userId);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Validate the token
      const result = await validateJwtToken(token);
      expect(result.valid).toBe(true);
      expect(result.userId).toBe(userId);
      expect(result.roles).toContain('admin');

      // Clean up
      deleteApiUser(userId);
    });

    it('should check permissions and roles correctly', () => {
      const authResult = {
        valid: true,
        userId: 'test-user',
        permissions: ['read', 'write'],
        roles: ['editor', 'reviewer'],
      };

      // Test permission checking
      expect(checkPermission(authResult, 'read')).toBe(true);
      expect(checkPermission(authResult, 'write')).toBe(true);
      expect(checkPermission(authResult, 'delete')).toBe(false);
      expect(checkPermission(authResult, 'admin')).toBe(false);

      // Test role checking
      expect(checkRole(authResult, 'editor')).toBe(true);
      expect(checkRole(authResult, 'reviewer')).toBe(true);
      expect(checkRole(authResult, 'admin')).toBe(false);

      // Test admin role has all permissions
      const adminAuthResult = {
        valid: true,
        userId: 'admin',
        permissions: ['read'],
        roles: ['admin'],
      };

      expect(checkPermission(adminAuthResult, 'read')).toBe(true);
      expect(checkPermission(adminAuthResult, 'write')).toBe(true);
      expect(checkPermission(adminAuthResult, 'delete')).toBe(true);
      expect(checkPermission(adminAuthResult, 'admin')).toBe(true);
    });
  });

  describe('Rate Limiting System', () => {
    it('should apply rate limiting with different rules', async () => {
      const limiter = rateLimit({
        interval: 1000, // 1 second
        uniqueTokenPerInterval: 10,
      });

      const request = new NextRequest('http://localhost:3000/api/cms/people', {
        headers: {
          'x-api-key': 'test-api-key-123',
        },
      });

      // Test basic rate limiting
      const result1 = await limiter.check(request, 'TEST_ENDPOINT');
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBeGreaterThan(0);

      // Test with different roles
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

      const adminResult = await limiter.check(request, 'TEST_ENDPOINT', adminAuth);
      const regularResult = await limiter.check(request, 'TEST_ENDPOINT', regularAuth);

      // Admin should have higher limits
      expect(adminResult.limit).toBeGreaterThan(regularResult.limit);
    });

    it('should provide rate limit rules and status', () => {
      const rules = getRateLimitRules();
      expect(rules.length).toBeGreaterThan(0);

      // Check for specific rules
      const getRule = rules.find((r) => r.method === 'GET' && r.endpoint === '*');
      expect(getRule).toBeDefined();
      expect(getRule?.limit).toBe(100);

      const status = getClientRateLimitStatus('test-client');
      expect(status).toBeDefined();
    });
  });

  describe('Logging and Monitoring', () => {
    it('should log API requests and calculate metrics', () => {
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

      // Test metrics calculation
      const metrics = apiLogger.getMetrics(60);
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(1);
      expect(metrics.failedRequests).toBe(0);
      expect(metrics.uniqueUsers).toBe(1);
      expect(metrics.errorRate).toBe(0);
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
    it('should protect routes with authentication', async () => {
      // Create a test user
      const userId = createApiUser({
        name: 'Middleware Test User',
        email: 'middleware@example.com',
        roles: ['editor'],
        permissions: {
          read: true,
          write: true,
          delete: false,
          admin: false,
        },
        apiKey: 'middleware-key-123',
      });

      const mockHandler = vi.fn().mockResolvedValue(new Response('OK'));
      const protectedHandler = requireAuth(mockHandler);

      // Test with valid API key
      const request = new NextRequest('http://localhost:3000/api/cms/people', {
        headers: { 'x-api-key': 'middleware-key-123' },
      });

      const response = await protectedHandler(request);
      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();

      // Test without API key
      const request2 = new NextRequest('http://localhost:3000/api/cms/people');
      const response2 = await protectedHandler(request2);
      expect(response2.status).toBe(401);

      // Clean up
      deleteApiUser(userId);
    });

    it('should require specific permissions', async () => {
      // Create a user with limited permissions
      const userId = createApiUser({
        name: 'Limited User',
        email: 'limited@example.com',
        roles: ['user'],
        permissions: {
          read: true,
          write: false,
          delete: false,
          admin: false,
        },
        apiKey: 'limited-key-123',
      });

      const mockHandler = vi.fn();
      const protectedHandler = requirePermission('write')(mockHandler);

      const request = new NextRequest('http://localhost:3000/api/cms/people', {
        headers: { 'x-api-key': 'limited-key-123' },
      });

      const response = await protectedHandler(request);
      expect(response.status).toBe(403);
      expect(mockHandler).not.toHaveBeenCalled();

      // Clean up
      deleteApiUser(userId);
    });

    it('should require specific roles', async () => {
      // Create a user with editor role
      const userId = createApiUser({
        name: 'Editor User',
        email: 'editor@example.com',
        roles: ['editor'],
        permissions: {
          read: true,
          write: true,
          delete: false,
          admin: false,
        },
        apiKey: 'editor-key-123',
      });

      const mockHandler = vi.fn().mockResolvedValue(new Response('OK'));
      const protectedHandler = requireRole('editor')(mockHandler);

      const request = new NextRequest('http://localhost:3000/api/cms/people', {
        headers: { 'x-api-key': 'editor-key-123' },
      });

      const response = await protectedHandler(request);
      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();

      // Clean up
      deleteApiUser(userId);
    });
  });
});
