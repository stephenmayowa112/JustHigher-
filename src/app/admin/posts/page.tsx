'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { Post } from '@/lib/types';
import PostsList from '@/components/admin/PostsList';

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    try {
      const allPosts = await getAllPosts();
      setPosts(allPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 rounded w-48 animate-pulse" style={{ backgroundColor: 'var(--admin-border)' }} />
        <div className="h-12 rounded animate-pulse" style={{ backgroundColor: 'var(--admin-border)' }} />
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl animate-pulse"
            style={{ backgroundColor: 'var(--admin-border)' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>
            Posts
          </h1>
          <p style={{ color: 'var(--admin-text-secondary)' }}>
            Manage your blog posts
          </p>
        </div>
        <Link href="/admin/posts/new" className="quick-action-btn primary">
          <span>✏️</span>
          <span>New Post</span>
        </Link>
      </div>

      {/* Posts List with Search & Filter */}
      <PostsList posts={posts} onRefresh={loadPosts} />
    </div>
  );
}