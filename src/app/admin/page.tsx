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

      {/* All Posts Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">All Posts</h2>
            <p className="text-sm text-gray-500 mt-0.5">Manage your blog content</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search posts..."
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Post Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allPosts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg width="32" height="32" fill="none" stroke="currentColor" className="text-gray-400" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-900 font-medium mb-1">No posts yet</p>
                      <p className="text-sm text-gray-500 mb-4">Create your first post to get started</p>
                      <Link 
                        href="/admin/posts/new"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Create Post
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                allPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {post.title}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">
                      {post.published_at 
                        ? new Date(post.published_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })
                        : post.created_at 
                          ? new Date(post.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })
                          : '-'
                      }
                    </td>
                    <td className="px-6 py-4">
                      {post.published_at ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {post.published_at && (
                          <Link 
                            href={`/${post.slug}`} 
                            target="_blank" 
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
                          >
                            View
                          </Link>
                        )}
                        <Link 
                          href={`/admin/posts/${post.id}/edit`} 
                          className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
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

        {allPosts.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Showing all {allPosts.length} {allPosts.length === 1 ? 'post' : 'posts'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}