import { supabase, supabaseAdmin } from './supabase';
import { Post, Subscriber } from './types';
import { withCache, withRetry, cacheKeys, cacheTTL, invalidateCache } from './cache';

/**
 * Clean post content by removing embedded newlines that cause word wrapping issues
 * This ensures words wrap at spaces only, never breaking mid-word
 */
function cleanPostContent(content: string): string {
  // Replace non-breaking spaces (both Unicode and HTML entities) with regular spaces
  let cleaned = content.replace(/\u00A0/g, ' ');
  cleaned = cleaned.replace(/&nbsp;/g, ' ');
  
  // Remove <br> and <br/> tags that might be causing breaks
  cleaned = cleaned.replace(/<br\s*\/?>/gi, ' ');
  
  // Remove unwanted line breaks within HTML paragraphs
  // This preserves attributes like class="ql-align-justify"
  cleaned = cleaned.replace(/<p([^>]*)>([^<]*?)<\/p>/g, (match, attrs, innerText) => {
    // Remove newlines and collapse multiple spaces within paragraph text
    const cleanedText = innerText
      .replace(/\s*\n\s*/g, ' ')  // Remove newlines
      .replace(/\s+/g, ' ')        // Collapse multiple spaces
      .trim();
    
    return cleanedText ? `<p${attrs}>${cleanedText}</p>` : '';
  });
  
  // Remove any remaining empty paragraphs
  cleaned = cleaned.replace(/<p[^>]*>\s*<\/p>/g, '');
  
  // Remove standalone newlines between tags
  cleaned = cleaned.replace(/>\s*\n\s*</g, '><');
  
  return cleaned;
}

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
        console.error('Error fetching published posts:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
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
      const { count, error } = await supabaseAdmin
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
      const { data, error } = await supabaseAdmin
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
 * Get all subscribers (including inactive) - Admin only
 */
export async function getAllSubscribers(limit: number = 1000): Promise<Subscriber[]> {
  return withRetry(async () => {
    const { data, error } = await supabaseAdmin
      .from('subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching all subscribers:', error);
      throw new Error(`Failed to fetch subscribers: ${error.message}`);
    }

    return data || [];
  });
}

/**
 * Add a subscriber manually - Admin only
 */
export async function addSubscriber(email: string, source: string = 'admin'): Promise<Subscriber> {
  return withRetry(async () => {
    const { data, error } = await supabaseAdmin
      .from('subscribers')
      .insert({
        email: email.toLowerCase().trim(),
        source,
        active: true
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('This email is already subscribed');
      }
      console.error('Error adding subscriber:', error);
      throw new Error(`Failed to add subscriber: ${error.message}`);
    }

    invalidateCache.subscribers();
    return data;
  });
}

/**
 * Toggle subscriber active status - Admin only
 */
export async function toggleSubscriberStatus(id: string, active: boolean): Promise<void> {
  return withRetry(async () => {
    const { error } = await supabaseAdmin
      .from('subscribers')
      .update({ active })
      .eq('id', id);

    if (error) {
      console.error('Error toggling subscriber status:', error);
      throw new Error(`Failed to update subscriber: ${error.message}`);
    }

    invalidateCache.subscribers();
  });
}

/**
 * Delete a subscriber - Admin only
 */
export async function deleteSubscriber(id: string): Promise<void> {
  return withRetry(async () => {
    const { error } = await supabaseAdmin
      .from('subscribers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting subscriber:', error);
      throw new Error(`Failed to delete subscriber: ${error.message}`);
    }

    invalidateCache.subscribers();
  });
}

/**
 * Create a new blog post - Admin only
 */
export async function createPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<Post> {
  return withRetry(async () => {
    // Clean content before saving to prevent word wrapping issues
    const cleanedPost = {
      ...post,
      content: cleanPostContent(post.content),
    };

    const { data, error } = await supabase
      .from('posts')
      .insert(cleanedPost)
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
    // Clean content before saving if content is being updated
    const cleanedUpdates = {
      ...updates,
      ...(updates.content ? { content: cleanPostContent(updates.content) } : {}),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('posts')
      .update(cleanedUpdates)
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