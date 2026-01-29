'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllPosts, getSubscriberCount, getRecentSubscribers } from '@/lib/blog';
import { Post, Subscriber } from '@/lib/types';
import StatCard from '@/components/admin/StatCard';
import QuickActions from '@/components/admin/QuickActions';
import RecentDrafts from '@/components/admin/RecentDrafts';
import ActivityFeed from '@/components/admin/ActivityFeed';
import AnalyticsCard from '@/components/admin/AnalyticsCard';
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
      // Fetch all data in parallel
      const [postsResult, subscriberCountResult, subscribersResult] = await Promise.allSettled([
        getAllPosts(50),
        getSubscriberCount(),
        getRecentSubscribers(10),
      ]);

      // Handle posts
      const posts = postsResult.status === 'fulfilled' ? postsResult.value : [];
      if (postsResult.status === 'rejected') {
        console.error('Failed to fetch posts:', postsResult.reason);
      }

      // Handle subscriber count
      const subscriberCount = subscriberCountResult.status === 'fulfilled' ? subscriberCountResult.value : 0;
      if (subscriberCountResult.status === 'rejected') {
        console.error('Failed to fetch subscriber count:', subscriberCountResult.reason);
      }

      // Handle recent subscribers
      const subscribers = subscribersResult.status === 'fulfilled' ? subscribersResult.value : [];
      if (subscribersResult.status === 'rejected') {
        console.error('Failed to fetch recent subscribers:', subscribersResult.reason);
      }

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
      setError('Failed to load dashboard data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const drafts = allPosts.filter(post => !post.published_at);
  const recentPosts = allPosts.filter(post => post.published_at).slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="h-8 rounded w-48 animate-pulse" style={{ backgroundColor: 'var(--admin-border)' }} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl animate-pulse"
              style={{ backgroundColor: 'var(--admin-border)' }}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-xl animate-pulse"
              style={{ backgroundColor: 'var(--admin-border)' }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="admin-card p-8 text-center">
          <span className="text-5xl mb-4 block">⚠️</span>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--admin-text)' }}>
            Error Loading Dashboard
          </h2>
          <p className="mb-4" style={{ color: 'var(--admin-text-secondary)' }}>
            {error}
          </p>
          <button
            onClick={loadDashboardData}
            className="quick-action-btn primary"
          >
            <span>🔄</span>
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>
            Dashboard
          </h1>
          <p style={{ color: 'var(--admin-text-secondary)' }}>
            Welcome back! Here's what's happening with your blog.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="quick-action-btn primary hidden sm:flex"
        >
          <span>✏️</span>
          <span>New Post</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          icon="📝"
          label="Total Posts"
          value={stats.totalPosts}
          gradient="primary"
        />
        <StatCard
          icon="✅"
          label="Published"
          value={stats.publishedPosts}
          gradient="success"
        />
        <StatCard
          icon="📄"
          label="Drafts"
          value={stats.draftPosts}
          gradient="warning"
        />
        <StatCard
          icon="👥"
          label="Subscribers"
          value={stats.totalSubscribers}
          gradient="info"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Drafts & Recent Posts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Drafts */}
          <RecentDrafts drafts={drafts} onPostUpdate={loadDashboardData} />

          {/* Recent Published Posts */}
          <div className="admin-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--admin-text)' }}>
                Recent Posts
              </h3>
              <Link
                href="/admin/posts"
                className="text-sm hover:underline"
                style={{ color: 'var(--admin-primary)' }}
              >
                View all →
              </Link>
            </div>

            {recentPosts.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'var(--admin-text-secondary)' }}>
                <span className="text-4xl mb-2 block">📢</span>
                <p>No published posts yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-opacity-80"
                    style={{ backgroundColor: 'var(--admin-border-light)' }}
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <h4
                        className="font-medium truncate"
                        style={{ color: 'var(--admin-text)' }}
                      >
                        {post.title}
                      </h4>
                      <p
                        className="text-sm"
                        style={{ color: 'var(--admin-text-secondary)' }}
                      >
                        Published {new Date(post.published_at!).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg"
                        style={{ color: 'var(--admin-primary)' }}
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/${post.slug}`}
                        target="_blank"
                        className="px-3 py-1.5 text-sm font-medium rounded-lg"
                        style={{ color: 'var(--admin-success)' }}
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Activity & Analytics */}
        <div className="space-y-6">
          <ActivityFeed
            recentPosts={allPosts}
            recentSubscribers={recentSubscribers}
          />
          <AnalyticsCard
            posts={allPosts}
            subscriberCount={stats.totalSubscribers}
          />
        </div>
      </div>
    </div>
  );
}