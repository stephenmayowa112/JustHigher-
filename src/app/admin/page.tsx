'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllPosts, getSubscriberCount, getRecentSubscribers } from '@/lib/blog';
import { Post, Subscriber } from '@/lib/types';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalSubscribers: 0,
  });
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [draftPosts, setDraftPosts] = useState<Post[]>([]);
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
        getRecentSubscribers(5),
      ]);

      const posts = postsResult.status === 'fulfilled' ? postsResult.value : [];
      const subscriberCount = subscriberCountResult.status === 'fulfilled' ? subscriberCountResult.value : 0;
      const subscribers = subscribersResult.status === 'fulfilled' ? subscribersResult.value : [];

      const published = posts.filter(post => post.published_at);
      const drafts = posts.filter(post => !post.published_at);

      setStats({
        totalPosts: posts.length,
        publishedPosts: published.length,
        draftPosts: drafts.length,
        totalSubscribers: subscriberCount,
      });

      setRecentPosts(published.slice(0, 5));
      setDraftPosts(drafts.slice(0, 5));
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getUserName = () => {
    if (!user?.email) return 'Admin';
    return user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded animate-pulse" style={{ backgroundColor: 'var(--admin-border)' }} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--admin-border)' }} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--admin-border)' }} />
          <div className="h-72 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--admin-border)' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-card p-8 text-center">
        <p style={{ color: 'var(--admin-text-secondary)' }} className="mb-4">{error}</p>
        <button type="button" onClick={loadDashboardData} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--admin-text)' }}>
            {getGreeting()}, {getUserName()}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--admin-text-secondary)' }}>
            Here&apos;s what&apos;s happening with your blog
          </p>
        </div>
        <Link href="/admin/posts/new" className="btn btn-primary">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Post</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Posts"
          value={stats.totalPosts}
          icon={<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          iconClass="primary"
          href="/admin/posts"
        />
        <StatCard
          label="Published"
          value={stats.publishedPosts}
          icon={<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>}
          iconClass="success"
          href="/admin/posts"
        />
        <StatCard
          label="Drafts"
          value={stats.draftPosts}
          icon={<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
          iconClass="warning"
          href="/admin/posts"
        />
        <StatCard
          label="Subscribers"
          value={stats.totalSubscribers}
          icon={<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          iconClass="primary"
          href="/admin/subscribers"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/posts/new" className="btn btn-accent btn-sm">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Write Post
        </Link>
        <Link href="/" target="_blank" className="btn btn-secondary btn-sm">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          View Blog
        </Link>
        <Link href="/admin/subscribers" className="btn btn-secondary btn-sm">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Subscribers
        </Link>
      </div>

      {/* Two-column: Drafts + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drafts */}
        <div className="admin-card">
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--admin-border)' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>
                Drafts
              </h2>
              <Link href="/admin/posts" className="text-xs font-medium" style={{ color: 'var(--admin-accent)' }}>
                View all →
              </Link>
            </div>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--admin-border-light)' }}>
            {draftPosts.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>No drafts</p>
                <Link href="/admin/posts/new" className="text-sm font-medium mt-2 inline-block" style={{ color: 'var(--admin-accent)' }}>
                  Start writing →
                </Link>
              </div>
            ) : (
              draftPosts.map((post) => (
                <div key={post.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--admin-text)' }}>
                      {post.title || 'Untitled'}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--admin-text-muted)' }}>
                      {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="btn btn-ghost btn-sm flex-shrink-0"
                  >
                    Edit
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="admin-card">
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--admin-border)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>
              Recent Activity
            </h2>
          </div>
          <div className="px-4 py-2">
            {recentPosts.length === 0 && recentSubscribers.length === 0 ? (
              <p className="text-sm py-6 text-center" style={{ color: 'var(--admin-text-muted)' }}>
                No recent activity
              </p>
            ) : (
              <div className="space-y-0">
                {/* Recent published posts */}
                {recentPosts.map((post) => (
                  <div key={`post-${post.id}`} className="activity-item">
                    <div className="activity-icon post">
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color: 'var(--admin-text)' }}>
                        Published <strong className="font-medium">{post.title}</strong>
                      </p>
                      <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                        {post.published_at && new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Recent subscribers */}
                {recentSubscribers.map((sub) => (
                  <div key={`sub-${sub.id}`} className="activity-item">
                    <div className="activity-icon subscriber">
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color: 'var(--admin-text)' }}>
                        New subscriber: <strong className="font-medium">{sub.email}</strong>
                      </p>
                      <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                        {new Date(sub.subscribed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Posts Table */}
      <div className="admin-card">
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--admin-border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>
            Recent Posts
          </h2>
          <Link href="/admin/posts" className="text-xs font-medium" style={{ color: 'var(--admin-accent)' }}>
            Manage all posts →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th className="hidden md:table-cell">Date</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentPosts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8">
                    <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>No published posts yet</p>
                  </td>
                </tr>
              ) : (
                recentPosts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <p className="font-medium text-sm truncate max-w-[240px]" style={{ color: 'var(--admin-text)' }}>
                        {post.title}
                      </p>
                    </td>
                    <td className="hidden md:table-cell">
                      <span className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                        {post.published_at && new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-published">Published</span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/${post.slug}`} target="_blank" className="btn btn-ghost btn-sm" title="View">
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </Link>
                        <Link href={`/admin/posts/${post.id}/edit`} className="btn btn-ghost btn-sm" title="Edit">
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* Stat Card Component */
function StatCard({ label, value, icon, iconClass, href }: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
  href: string;
}) {
  return (
    <Link href={href} className="stat-card flex items-center justify-between hover:shadow-sm transition-shadow">
      <div>
        <p className="stat-card-value">{value}</p>
        <p className="stat-card-label">{label}</p>
      </div>
      <div className={`stat-card-icon ${iconClass}`}>
        {icon}
      </div>
    </Link>
  );
}