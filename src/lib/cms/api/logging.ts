import { NextRequest } from 'next/server';

export interface ApiLogEntry {
  timestamp: string;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  userId?: string;
  userAgent?: string;
  ip?: string;
  requestSize?: number;
  responseSize?: number;
  error?: string;
  endpoint: string;
  operation: string;
}

export interface ApiMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  requestsPerMinute: number;
  uniqueUsers: number;
  topEndpoints: Array<{ endpoint: string; count: number }>;
  errorRate: number;
}

class ApiLogger {
  private logs: ApiLogEntry[] = [];
  private readonly maxLogs = 10000; // Keep last 10k requests in memory
  private readonly cleanupInterval = 60000; // Clean up every minute

  constructor() {
    // Start cleanup interval
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  log(entry: Omit<ApiLogEntry, 'timestamp'>) {
    const logEntry: ApiLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    this.logs.push(logEntry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const level = entry.statusCode >= 400 ? 'ERROR' : 'INFO';
      console.log(
        `[${level}] ${entry.method} ${entry.url} - ${entry.statusCode} (${entry.responseTime}ms)`,
      );
    }

    // In production, you might want to send to a logging service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to external logging service
      // this.sendToLoggingService(logEntry);
    }
  }

  getMetrics(timeWindowMinutes: number = 60): ApiMetrics {
    const cutoff = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    const recentLogs = this.logs.filter((log) => new Date(log.timestamp) > cutoff);

    const totalRequests = recentLogs.length;
    const successfulRequests = recentLogs.filter((log) => log.statusCode < 400).length;
    const failedRequests = totalRequests - successfulRequests;
    const averageResponseTime =
      recentLogs.length > 0
        ? recentLogs.reduce((sum, log) => sum + log.responseTime, 0) / recentLogs.length
        : 0;
    const requestsPerMinute = totalRequests / timeWindowMinutes;
    const uniqueUsers = new Set(recentLogs.map((log) => log.userId).filter(Boolean)).size;

    // Calculate top endpoints
    const endpointCounts = new Map<string, number>();
    recentLogs.forEach((log) => {
      const count = endpointCounts.get(log.endpoint) || 0;
      endpointCounts.set(log.endpoint, count + 1);
    });

    const topEndpoints = Array.from(endpointCounts.entries())
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const errorRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      requestsPerMinute,
      uniqueUsers,
      topEndpoints,
      errorRate,
    };
  }

  getLogs(filters?: {
    userId?: string;
    endpoint?: string;
    statusCode?: number;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }): ApiLogEntry[] {
    let filteredLogs = [...this.logs];

    if (filters?.userId) {
      filteredLogs = filteredLogs.filter((log) => log.userId === filters.userId);
    }

    if (filters?.endpoint) {
      filteredLogs = filteredLogs.filter((log) => log.endpoint === filters.endpoint);
    }

    if (filters?.statusCode) {
      filteredLogs = filteredLogs.filter((log) => log.statusCode === filters.statusCode);
    }

    if (filters?.startTime) {
      filteredLogs = filteredLogs.filter((log) => new Date(log.timestamp) >= filters.startTime!);
    }

    if (filters?.endTime) {
      filteredLogs = filteredLogs.filter((log) => new Date(log.timestamp) <= filters.endTime!);
    }

    if (filters?.limit) {
      filteredLogs = filteredLogs.slice(-filters.limit);
    }

    return filteredLogs;
  }

  getErrorLogs(limit: number = 100): ApiLogEntry[] {
    return this.logs.filter((log) => log.statusCode >= 400).slice(-limit);
  }

  getSlowRequests(threshold: number = 1000, limit: number = 50): ApiLogEntry[] {
    return this.logs
      .filter((log) => log.responseTime > threshold)
      .sort((a, b) => b.responseTime - a.responseTime)
      .slice(0, limit);
  }

  private cleanup() {
    // Remove logs older than 24 hours
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.logs = this.logs.filter((log) => new Date(log.timestamp) > cutoff);
  }

  // Method to export logs for external analysis
  exportLogs(): ApiLogEntry[] {
    return [...this.logs];
  }

  // Method to clear logs (useful for testing)
  clearLogs() {
    this.logs = [];
  }
}

// Global logger instance
export const apiLogger = new ApiLogger();

// Middleware function to log requests
export function logRequest(
  request: NextRequest,
  response: Response,
  startTime: number,
  userId?: string,
) {
  const endTime = Date.now();
  const responseTime = endTime - startTime;
  const url = new URL(request.url);

  // Extract endpoint and operation from URL
  const pathParts = url.pathname.split('/');
  const endpoint = pathParts.slice(2).join('/'); // Remove /api/cms prefix
  const operation = request.method;

  const logEntry: Omit<ApiLogEntry, 'timestamp'> = {
    method: request.method,
    url: url.pathname + url.search,
    statusCode: response.status,
    responseTime,
    userId,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.ip || request.headers.get('x-forwarded-for') || undefined,
    requestSize: parseInt(request.headers.get('content-length') || '0'),
    responseSize: parseInt(response.headers.get('content-length') || '0'),
    endpoint,
    operation,
  };

  // Add error information if status code indicates error
  if (response.status >= 400) {
    logEntry.error = `HTTP ${response.status}`;
  }

  apiLogger.log(logEntry);
}

// Security event logging
export interface SecurityEvent {
  timestamp: string;
  type:
    | 'authentication_failure'
    | 'rate_limit_exceeded'
    | 'invalid_token'
    | 'permission_denied'
    | 'suspicious_activity';
  userId?: string;
  ip?: string;
  userAgent?: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private readonly maxEvents = 1000;

  logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    this.events.push(securityEvent);

    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log security events with appropriate level
    const level = event.severity.toUpperCase();
    console.warn(`[SECURITY ${level}] ${event.type}: ${event.details}`);

    // In production, you might want to send critical events to an alerting system
    if (event.severity === 'critical' && process.env.NODE_ENV === 'production') {
      // this.sendSecurityAlert(securityEvent);
    }
  }

  getSecurityEvents(filters?: {
    type?: string;
    severity?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }): SecurityEvent[] {
    let filteredEvents = [...this.events];

    if (filters?.type) {
      filteredEvents = filteredEvents.filter((event) => event.type === filters.type);
    }

    if (filters?.severity) {
      filteredEvents = filteredEvents.filter((event) => event.severity === filters.severity);
    }

    if (filters?.startTime) {
      filteredEvents = filteredEvents.filter(
        (event) => new Date(event.timestamp) >= filters.startTime!,
      );
    }

    if (filters?.endTime) {
      filteredEvents = filteredEvents.filter(
        (event) => new Date(event.timestamp) <= filters.endTime!,
      );
    }

    if (filters?.limit) {
      filteredEvents = filteredEvents.slice(-filters.limit);
    }

    return filteredEvents;
  }

  getRecentSecurityEvents(hours: number = 24): SecurityEvent[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.events.filter((event) => new Date(event.timestamp) > cutoff);
  }

  // Method to clear security events (useful for testing)
  clearSecurityEvents() {
    this.events = [];
  }
}

export const securityLogger = new SecurityLogger();
