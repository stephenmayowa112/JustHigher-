'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminNav from '@/components/admin/AdminNav';
import { getAllPosts, deletePost } from '@/lib/blog';
import { Post } from '@/lib/types';

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const allPosts = await getAllPosts();
      setPosts(allPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string, postTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${postTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deletePost(postId);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'published') return post.published_at;
    if (filter === 'draft') return !post.published_at;
    return true;
  });

  if (loading) {
    return (
      <div>
        <AdminNav />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminNav />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
            <Link
              href="/admin/posts/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              New Post
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Posts', count: posts.length },
                { key: 'published', label: 'Published', count: posts.filter(p => p.published_at).length },
                { key: 'draft', label: 'Drafts', count: posts.filter(p => !p.published_at).length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Posts List */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'No posts yet' : `No ${filter} posts`}
              </h3>
              <p className="text-gray-500 mb-4">
                {filter === 'all' 
                  ? 'Get started by creating your first blog post.'
                  : `You don't have any ${filter} posts yet.`
                }
              </p>
              <Link
                href="/admin/posts/new"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Create New Post
              </Link>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredPosts.map((post) => (
                  <li key={post.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {post.title}
                          </h3>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <span className="flex items-center">
                              {post.published_at ? (
                                <>
                                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                  Published {new Date(post.published_at).toLocaleDateString()}
                                </>
                              ) : (
                                <>
                                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                                  Draft
                                </>
                              )}
                            </span>
                            <span className="mx-2">•</span>
                            <span>{post.reading_time} min read</span>
                            {post.tags && post.tags.length > 0 && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{post.tags.join(', ')}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/posts/${post.id}/edit`}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            Edit
                          </Link>
                          {post.published_at && (
                            <Link
                              href={`/${post.slug}`}
                              target="_blank"
                              className="text-green-600 hover:text-green-900 text-sm font-medium"
                            >
                              View
                            </Link>
                          )}
                          <button
                            onClick={() => handleDeletePost(post.id, post.title)}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}