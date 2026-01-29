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
  const recentPosts = allPosts.filter(post => post.published_at).slice(0, 8);

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
      <div className="space-y-3">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-lg animate-pulse bg-gray-100" />
          ))}
        </div>
        <div className="h-96 rounded-lg animate-pulse bg-gray-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-card p-6 text-center">
        <p className="text-sm mb-3 text-gray-600">{error}</p>
        <button type="button" onClick={loadDashboardData} className="quick-action-btn secondary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Stats - Compact grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Icons.posts} label="Total Posts" value={stats.totalPosts} variant="primary" />
        <StatCard icon={Icons.published} label="Published" value={stats.publishedPosts} variant="success" />
        <StatCard icon={Icons.drafts} label="Drafts" value={stats.draftPosts} variant="warning" />
        <StatCard icon={Icons.subscribers} label="Subscribers" value={stats.totalSubscribers} variant="info" />
      </div>

      {/* Main Content - Full Width Table */}
      <div className="admin-card">
        <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-gray-900">Posts</h2>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{stats.publishedPosts} published</span>
              <span>•</span>
              <span>{stats.draftPosts} drafts</span>
            </div>
          </div>
          <Link href="/admin/posts/new" className="quick-action-btn primary text-xs">
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Post
          </Link>
        </div>

        {/* Posts Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allPosts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                    No posts yet. Create your first post to get started.
                  </td>
                </tr>
              ) : (
                allPosts.slice(0, 10).map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-md">{post.title}</p>
                        {!post.published_at && (
                          <span className="status-badge draft text-xs md:hidden">Draft</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 hidden md:table-cell">
                      {post.published_at ? (
                        <span className="status-badge published">Published</span>
                      ) : (
                        <span className="status-badge draft">Draft</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-500 hidden lg:table-cell">
                      {post.published_at 
                        ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : post.created_at 
                          ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '-'
                      }
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {post.published_at && (
                          <Link 
                            href={`/${post.slug}`} 
                            target="_blank" 
                            className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            View
                          </Link>
                        )}
                        <Link 
                          href={`/admin/posts/${post.id}/edit`} 
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {allPosts.length > 10 && (
          <div className="px-4 py-3 border-t border-gray-200 text-center">
            <Link href="/admin/posts" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              View all {allPosts.length} posts →
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Row - Subscribers & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Recent Subscribers */}
        <div className="admin-card">
          <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Recent Subscribers</h3>
            <Link href="/admin/subscribers" className="text-xs text-blue-600 hover:text-blue-700">View all</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentSubscribers.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No subscribers yet
              </div>
            ) : (
              recentSubscribers.slice(0, 5).map((subscriber) => (
                <div key={subscriber.id} className="px-4 py-2 flex items-center justify-between">
                  <span className="text-sm text-gray-700 truncate">{subscriber.email}</span>
                  <span className="text-xs text-gray-500 shrink-0 ml-2">
                    {formatRelativeTime(subscriber.subscribed_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="admin-card">
          <div className="px-4 py-2.5 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Quick Stats</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Views</span>
              <span className="text-sm font-semibold text-gray-900">-</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg. Read Time</span>
              <span className="text-sm font-semibold text-gray-900">
                {allPosts.length > 0 
                  ? `${Math.round(allPosts.reduce((acc, p) => acc + (p.reading_time || 0), 0) / allPosts.length)} min`
                  : '-'
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Latest Post</span>
              <span className="text-sm font-semibold text-gray-900">
                {recentPosts.length > 0 
                  ? formatRelativeTime(recentPosts[0].published_at!)
                  : '-'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}