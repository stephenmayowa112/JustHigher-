import { supabase } from './supabase';
import { Post, Subscriber } from './types';
import { withCache, withRetry, cacheKeys, cacheTTL, invalidateCache } from './cache';

/**
 * Get published blog posts with optional pagination
 */
export async function getPublishedPosts(limit?: number, offset?: number): Promise<Post[]> {
  const cacheKey = cacheKeys.publishedPosts(limit, offset);

  return withCache(cacheKey, async () => {
    return withRetry(async () => {
      let query = supabase
        .from('posts')
        .select('id, title, slug, content, published_at, created_at, updated_at, tags, meta_description, reading_time')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.range(offset, offset + (limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching published posts:', error);
        throw new Error(`Failed to fetch posts: ${error.message}`);
      }

      return data || [];
    });
  }, cacheTTL.posts);
}

/**
 * Get a single post by its slug
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const cacheKey = cacheKeys.postBySlug(slug);

  return withCache(cacheKey, async () => {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .not('published_at', 'is', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error fetching post by slug:', error);
        throw new Error(`Failed to fetch post: ${error.message}`);
      }

      return data;
    });
  }, cacheTTL.posts);
}

/**
 * Search posts by title and content
 */
export async function searchPosts(query: string, limit?: number): Promise<Post[]> {
  if (!query.trim()) {
    return [];
  }

  const cacheKey = cacheKeys.searchPosts(query, limit);

  return withCache(cacheKey, async () => {
    return withRetry(async () => {
      // Use PostgreSQL full-text search
      let searchQuery = supabase
        .from('posts')
        .select('*')
        .not('published_at', 'is', null)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('published_at', { ascending: false });

      if (limit) {
        searchQuery = searchQuery.limit(limit);
      }

      const { data, error } = await searchQuery;

      if (error) {
        console.error('Error searching posts:', error);
        throw new Error(`Failed to search posts: ${error.message}`);
      }

      return data || [];
    });
  }, cacheTTL.search);
}

/**
 * Get a single post by its ID - Admin only
 */
export async function getPostById(id: string): Promise<Post | null> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching post by ID:', error);
      throw new Error(`Failed to fetch post: ${error.message}`);
    }

    return data;
  });
}

/**
 * Get all posts (including unpublished) - Admin only
 */
export async function getAllPosts(limit?: number): Promise<Post[]> {
  return withRetry(async () => {
    let query = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching all posts:', error);
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }

    return data || [];
  });
}

/**
 * Subscribe to newsletter
 */
export async function subscribeToNewsletter(email: string, source: string = 'website'): Promise<void> {
  return withRetry(async () => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    const { error } = await supabase
      .from('subscribers')
      .insert({
        email: email.toLowerCase().trim(),
        source,
        active: true
      });

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation - email already exists
        throw new Error('This email is already subscribed');
      }
      console.error('Error subscribing to newsletter:', error);
      throw new Error(`Failed to subscribe: ${error.message}`);
    }

    // Invalidate subscriber cache
    invalidateCache.subscribers();
  });
}

/**
 * Get subscriber count - Admin only
 */
export async function getSubscriberCount(): Promise<number> {
  const cacheKey = cacheKeys.subscriberCount();

  return withCache(cacheKey, async () => {
    return withRetry(async () => {
      const { count, error } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      if (error) {
        console.error('Error getting subscriber count:', error);
        throw new Error(`Failed to get subscriber count: ${error.message}`);
      }

      return count || 0;
    });
  }, cacheTTL.subscribers);
}

/**
 * Get recent subscribers - Admin only
 */
export async function getRecentSubscribers(limit: number = 10): Promise<Subscriber[]> {
  const cacheKey = cacheKeys.recentSubscribers(limit);

  return withCache(cacheKey, async () => {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('active', true)
        .order('subscribed_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent subscribers:', error);
        throw new Error(`Failed to fetch subscribers: ${error.message}`);
      }

      return data || [];
    });
  }, cacheTTL.subscribers);
}

/**
 * Create a new blog post - Admin only
 */
export async function createPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<Post> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('posts')
      .insert(post)
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      throw new Error(`Failed to create post: ${error.message}`);
    }

    // Invalidate post cache
    invalidateCache.posts();

    return data;
  });
}

/**
 * Update an existing blog post - Admin only
 */
export async function updatePost(id: string, updates: Partial<Post>): Promise<Post> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating post:', error);
      throw new Error(`Failed to update post: ${error.message}`);
    }

    // Invalidate post cache
    invalidateCache.posts();

    return data;
  });
}

/**
 * Delete a blog post - Admin only
 */
export async function deletePost(id: string): Promise<void> {
  return withRetry(async () => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting post:', error);
      throw new Error(`Failed to delete post: ${error.message}`);
    }

    // Invalidate post cache
    invalidateCache.posts();
  });
}