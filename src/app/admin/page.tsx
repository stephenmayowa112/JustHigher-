'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllPosts, getSubscriberCount, getRecentSubscribers } from '@/lib/blog';
import { Post, Subscriber } from '@/lib/types';
import StatCard, { Icons } from '@/components/admin/StatCard';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalSubscribers: 0,
  });
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [recentSubscribers, setRecentSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [postsResult, subscriberCountResult, subscribersResult] = await Promise.allSettled([
        getAllPosts(50),
        getSubscriberCount(),
        getRecentSubscribers(10),
      ]);

      const posts = postsResult.status === 'fulfilled' ? postsResult.value : [];
      const subscriberCount = subscriberCountResult.status === 'fulfilled' ? subscriberCountResult.value : 0;
      const subscribers = subscribersResult.status === 'fulfilled' ? subscribersResult.value : [];

      const publishedPosts = posts.filter(post => post.published_at);
      const draftPosts = posts.filter(post => !post.published_at);

      setStats({
        totalPosts: posts.length,
        publishedPosts: publishedPosts.length,
        draftPosts: draftPosts.length,
        totalSubscribers: subscriberCount,
      });

      setAllPosts(posts);
      setRecentSubscribers(subscribers);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const drafts = allPosts.filter(post => !post.published_at).slice(0, 5);
  const recentPosts = allPosts.filter(post => post.published_at).slice(0, 5);

  // Combined recent activity
  const recentActivity = [
    ...recentSubscribers.slice(0, 3).map(s => ({
      type: 'subscriber' as const,
      text: `New subscriber: ${s.email}`,
      time: s.subscribed_at
    })),
    ...recentPosts.slice(0, 3).map(p => ({
      type: 'post' as const,
      text: `Published: ${p.title}`,
      time: p.published_at!
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--admin-border)' }} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-48 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--admin-border)' }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-card p-6 text-center">
        <p className="text-sm mb-3" style={{ color: 'var(--admin-text-secondary)' }}>{error}</p>
        <button onClick={loadDashboardData} className="quick-action-btn secondary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--admin-text)' }}>Dashboard</h1>
          <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>Overview of your blog</p>
        </div>
        <Link href="/admin/posts/new" className="quick-action-btn primary">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Post
        </Link>
      </div>

      {/* Stats - Compact grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Icons.posts} label="Total Posts" value={stats.totalPosts} variant="primary" />
        <StatCard icon={Icons.published} label="Published" value={stats.publishedPosts} variant="success" />
        <StatCard icon={Icons.drafts} label="Drafts" value={stats.draftPosts} variant="warning" />
        <StatCard icon={Icons.subscribers} label="Subscribers" value={stats.totalSubscribers} variant="info" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Posts */}
        <div className="lg:col-span-2 admin-card">
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--admin-border)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--admin-text)' }}>Recent Posts</span>
            <Link href="/admin/posts" className="text-xs" style={{ color: 'var(--admin-accent)' }}>View all</Link>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--admin-border-light)' }}>
            {recentPosts.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                No posts yet
              </div>
            ) : (
              recentPosts.map((post) => (
                <div key={post.id} className="px-4 py-2.5 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--admin-text)' }}>{post.title}</p>
                    <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                      {new Date(post.published_at!).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/${post.slug}`} target="_blank" className="text-xs px-2 py-1 rounded" style={{ color: 'var(--admin-text-secondary)' }}>
                      View
                    </Link>
                    <Link href={`/admin/posts/${post.id}/edit`} className="text-xs px-2 py-1 rounded" style={{ color: 'var(--admin-accent)' }}>
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Drafts */}
          <div className="admin-card">
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--admin-border)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--admin-text)' }}>Drafts</span>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--admin-border-light)' }}>
              {drafts.length === 0 ? (
                <div className="px-4 py-4 text-center text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                  No drafts
                </div>
              ) : (
                drafts.map((draft) => (
                  <div key={draft.id} className="px-4 py-2 flex items-center justify-between">
                    <span className="text-sm truncate flex-1" style={{ color: 'var(--admin-text)' }}>
                      {draft.title || 'Untitled'}
                    </span>
                    <Link href={`/admin/posts/${draft.id}/edit`} className="text-xs ml-2" style={{ color: 'var(--admin-accent)' }}>
                      Edit
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity */}
          <div className="admin-card">
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--admin-border)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--admin-text)' }}>Activity</span>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--admin-border-light)' }}>
              {recentActivity.length === 0 ? (
                <div className="px-4 py-4 text-center text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                  No recent activity
                </div>
              ) : (
                recentActivity.map((item, i) => (
                  <div key={i} className="px-4 py-2 flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.type === 'subscriber' ? 'var(--admin-success)' : 'var(--admin-accent)' }}
                    />
                    <span className="text-xs flex-1 truncate" style={{ color: 'var(--admin-text-secondary)' }}>
                      {item.text}
                    </span>
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--admin-text-muted)' }}>
                      {formatRelativeTime(item.time)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}