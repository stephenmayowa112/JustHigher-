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
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          type="button" 
          onClick={loadDashboardData} 
          className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          {getGreeting()}, {getUserName()} 👋
        </h1>
        <Link 
          href="/admin/posts/new" 
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          + New Post
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Posts */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium mb-1">Total Posts</p>
              <p className="text-3xl font-bold text-blue-900">{stats.totalPosts}</p>
              <p className="text-xs text-blue-600 mt-2">
                ↑ {stats.publishedPosts} published
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
              <svg width="24" height="24" fill="none" stroke="currentColor" className="text-blue-700" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Subscribers */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium mb-1">Subscribers</p>
              <p className="text-3xl font-bold text-green-900">{stats.totalSubscribers}</p>
              <p className="text-xs text-green-600 mt-2">
                ↑ Growing audience
              </p>
            </div>
            <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
              <svg width="24" height="24" fill="none" stroke="currentColor" className="text-green-700" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Drafts */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-amber-700 font-medium mb-1">Drafts</p>
              <p className="text-3xl font-bold text-amber-900">{stats.draftPosts}</p>
              <p className="text-xs text-amber-600 mt-2">
                {stats.draftPosts > 0 ? '→ Finish writing' : '✓ All published'}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-200 rounded-xl flex items-center justify-center">
              <svg width="24" height="24" fill="none" stroke="currentColor" className="text-amber-700" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
        </div>
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