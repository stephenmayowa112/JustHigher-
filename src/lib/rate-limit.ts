import { NextRequest } from 'next/server';

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

// Rate limit store (in-memory for development, use Redis in production)
class RateLimitStore {
  private store = new Map<string, number[]>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, requests] of this.store.entries()) {
      // Remove requests older than 1 hour
      const filtered = requests.filter(time => now - time < 60 * 60 * 1000);
      if (filtered.length === 0) {
        this.store.delete(key);
      } else {
        this.store.set(key, filtered);
      }
    }
  }

  get(key: string): number[] {
    return this.store.get(key) || [];
  }

  set(key: string, value: number[]): void {
    this.store.set(key, value);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// Global rate limit store
const rateLimitStore = new RateLimitStore();

// Rate limiting function
export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
    error?: string;
  }> => {
    const {
      windowMs,
      maxRequests,
      message = 'Too many requests, please try again later.',
    } = config;

    // Get client identifier (IP address)
    const identifier = getClientIdentifier(request);
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing requests for this identifier
    const requests = rateLimitStore.get(identifier);
    
    // Filter out requests outside the current window
    const recentRequests = requests.filter(time => time > windowStart);

    // Check if limit exceeded
    if (recentRequests.length >= maxRequests) {
      const oldestRequest = Math.min(...recentRequests);
      const resetTime = oldestRequest + windowMs;
      
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        reset: resetTime,
        error: message,
      };
    }

    // Add current request
    recentRequests.push(now);
    rateLimitStore.set(identifier, recentRequests);

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - recentRequests.length,
      reset: now + windowMs,
    };
  };
}

// Get client identifier from request
function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from headers (for production behind proxy)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  let ip = forwardedFor?.split(',')[0] || realIp || cfConnectingIp;
  
  // Fallback to request IP
  if (!ip) {
    // In development, this might be undefined
    ip = '127.0.0.1';
  }

  return ip.trim();
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // Newsletter subscription: 3 requests per hour
  newsletter: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Too many subscription attempts. Please try again in an hour.',
  },

  // Search: 100 requests per 15 minutes
  search: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many search requests. Please try again in a few minutes.',
  },

  // Contact form: 5 requests per hour
  contact: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    message: 'Too many contact form submissions. Please try again in an hour.',
  },

  // API general: 1000 requests per hour
  api: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1000,
    message: 'API rate limit exceeded. Please try again later.',
  },

  // Admin actions: 100 requests per hour
  admin: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100,
    message: 'Too many admin requests. Please try again later.',
  },
};

// Rate limit middleware factory
export function createRateLimitMiddleware(config: RateLimitConfig) {
  const limiter = rateLimit(config);

  return async (request: NextRequest) => {
    const result = await limiter(request);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: result.error,
          limit: result.limit,
          remaining: result.remaining,
          reset: result.reset,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.reset.toString(),
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    return null; // Continue to next middleware/handler
  };
}

// Rate limit headers helper
export function addRateLimitHeaders(
  response: Response,
  limit: number,
  remaining: number,
  reset: number
): Response {
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', reset.toString());
  
  return response;
}

// Check if request should be rate limited
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<{
  allowed: boolean;
  headers: Record<string, string>;
  error?: string;
}> {
  const limiter = rateLimit(config);
  const result = await limiter(request);

  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };

  if (!result.success) {
    headers['Retry-After'] = Math.ceil((result.reset - Date.now()) / 1000).toString();
  }

  return {
    allowed: result.success,
    headers,
    error: result.error,
  };
}

// Sliding window rate limiter (more accurate)
export class SlidingWindowRateLimit {
  private windows = new Map<string, Map<number, number>>();
  private windowSize: number;
  private maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowSize = windowMs;
    this.maxRequests = maxRequests;
  }

  async isAllowed(identifier: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const now = Date.now();
    const currentWindow = Math.floor(now / this.windowSize);
    const previousWindow = currentWindow - 1;

    // Get or create windows for this identifier
    if (!this.windows.has(identifier)) {
      this.windows.set(identifier, new Map());
    }

    const userWindows = this.windows.get(identifier)!;

    // Clean up old windows (keep only current and previous)
    for (const [window] of userWindows) {
      if (window < previousWindow) {
        userWindows.delete(window);
      }
    }

    // Get request counts
    const currentCount = userWindows.get(currentWindow) || 0;
    const previousCount = userWindows.get(previousWindow) || 0;

    // Calculate weighted count based on time within current window
    const timeIntoWindow = now % this.windowSize;
    const weightedPreviousCount = previousCount * (1 - timeIntoWindow / this.windowSize);
    const totalCount = currentCount + weightedPreviousCount;

    if (totalCount >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: (currentWindow + 1) * this.windowSize,
      };
    }

    // Increment current window count
    userWindows.set(currentWindow, currentCount + 1);

    return {
      allowed: true,
      remaining: Math.floor(this.maxRequests - totalCount - 1),
      resetTime: (currentWindow + 1) * this.windowSize,
    };
  }
}

// Export store for testing/cleanup
export { rateLimitStore };