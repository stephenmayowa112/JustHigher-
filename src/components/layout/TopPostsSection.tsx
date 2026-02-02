'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPublishedPosts } from '@/lib/blog';
import { Post } from '@/lib/types';

export default function TopPostsSection() {
  const [topPosts, setTopPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadTopPosts() {
      try {
        // Get the 20 most recent published posts
        const posts = await getPublishedPosts(20);
        setTopPosts(posts);
        setError(false);
      } catch (err) {
        console.error('Error loading top posts:', err);
        setError(true);
        // Set empty array on error
        setTopPosts([]);
      } finally {
        setLoading(false);
      }
    }

    loadTopPosts();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || topPosts.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
        {error ? 'Unable to load posts at the moment.' : 'No posts available yet.'}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {topPosts.map((post, index) => (
        <Link
          key={post.id}
          href={`/${post.slug}`}
          className="group block p-3 rounded-lg hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-200 border border-transparent hover:border-amber-200"
        >
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-bold">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 group-hover:text-amber-900 line-clamp-2 leading-snug">
                {post.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {post.reading_time || 5} min read
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
