import { Post } from './types';

// Simple in-memory cache for development
// In production, you might want to use Redis or similar
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
const cache = new SimpleCache();

// Clean up expired items every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 5 * 60 * 1000);
}

export { cache };

// Cache key generators
export const cacheKeys = {
  publishedPosts: (limit?: number, offset?: number) => 
    `published_posts_${limit || 'all'}_${offset || 0}`,
  postBySlug: (slug: string) => `post_${slug}`,
  searchPosts: (query: string, limit?: number) => 
    `search_${query}_${limit || 'all'}`,
  subscriberCount: () => 'subscriber_count',
  recentSubscribers: (limit: number) => `recent_subscribers_${limit}`,
};

// Cache TTL constants (in seconds)
export const cacheTTL = {
  posts: 300, // 5 minutes
  search: 60, // 1 minute
  subscribers: 600, // 10 minutes
  static: 3600, // 1 hour
};

// Cached wrapper functions
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = cacheTTL.posts
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  try {
    const data = await fetcher();
    
    // Store in cache
    cache.set(key, data, ttlSeconds);
    
    return data;
  } catch (error) {
    // If fetch fails, try to return stale cache data
    const stale = cache.get<T>(key);
    if (stale !== null) {
      console.warn(`Using stale cache for key: ${key}`, error);
      return stale;
    }
    
    throw error;
  }
}

// Cache invalidation helpers
export const invalidateCache = {
  posts: () => {
    // Invalidate all post-related cache entries
    const keysToDelete: string[] = [];
    
    // This is a simple approach - in production you might want more sophisticated cache tagging
    cache.clear(); // For now, just clear everything when posts change
  },
  
  subscribers: () => {
    cache.delete(cacheKeys.subscriberCount());
    // Delete recent subscribers cache entries
    for (let i = 1; i <= 50; i++) {
      cache.delete(cacheKeys.recentSubscribers(i));
    }
  },
  
  search: () => {
    // In a real implementation, you'd want to track search cache keys
    // For now, we'll rely on the shorter TTL for search results
  },
  
  all: () => {
    cache.clear();
  }
};

// Retry logic for failed requests
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff
      const delay = delayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Batch loading helper for multiple posts
export async function batchLoadPosts(
  slugs: string[],
  fetcher: (slug: string) => Promise<Post | null>
): Promise<(Post | null)[]> {
  const results = await Promise.allSettled(
    slugs.map(slug => fetcher(slug))
  );

  return results.map(result => 
    result.status === 'fulfilled' ? result.value : null
  );
}