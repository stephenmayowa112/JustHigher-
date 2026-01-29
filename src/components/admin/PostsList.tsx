'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Post } from '@/lib/types';
import { updatePost, deletePost } from '@/lib/blog';
import { Route } from 'next';

interface PostsListProps {
    posts: Post[];
    onRefresh: () => void;
}

type FilterType = 'all' | 'published' | 'drafts';
type SortType = 'newest' | 'oldest' | 'title';

export default function PostsList({ posts, onRefresh }: PostsListProps) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<FilterType>('all');
    const [sort, setSort] = useState<SortType>('newest');
    const [deleting, setDeleting] = useState<string | null>(null);
    const [togglePublish, setTogglePublish] = useState<string | null>(null);

    // Filtered and sorted posts
    const filteredPosts = useMemo(() => {
        let result = [...posts];

        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(post =>
                post.title.toLowerCase().includes(searchLower) ||
                post.content.toLowerCase().includes(searchLower) ||
                post.tags?.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }

        // Status filter
        if (filter === 'published') {
            result = result.filter(post => post.published_at);
        } else if (filter === 'drafts') {
            result = result.filter(post => !post.published_at);
        }

        // Sort
        result.sort((a, b) => {
            if (sort === 'newest') {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            } else if (sort === 'oldest') {
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            } else {
                return a.title.localeCompare(b.title);
            }
        });

        return result;
    }, [posts, search, filter, sort]);

    const handleTogglePublish = async (post: Post) => {
        setTogglePublish(post.id);
        try {
            if (post.published_at) {
                // Unpublish
                await updatePost(post.id, { published_at: null });
            } else {
                // Publish
                await updatePost(post.id, { published_at: new Date().toISOString() });
            }
            onRefresh();
        } catch (error) {
            console.error('Failed to toggle publish:', error);
        } finally {
            setTogglePublish(null);
        }
    };

    const handleDelete = async (postId: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        setDeleting(postId);
        try {
            await deletePost(postId);
            onRefresh();
        } catch (error) {
            console.error('Failed to delete post:', error);
        } finally {
            setDeleting(null);
        }
    };

    const stats = {
        all: posts.length,
        published: posts.filter(p => p.published_at).length,
        drafts: posts.filter(p => !p.published_at).length,
    };

    return (
        <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">🔍</span>
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        style={{
                            backgroundColor: 'var(--admin-bg-secondary)',
                            borderColor: 'var(--admin-border)',
                            color: 'var(--admin-text)'
                        }}
                    />
                </div>

                {/* Filter Tabs */}
                <div
                    className="flex rounded-lg p-1"
                    style={{ backgroundColor: 'var(--admin-border-light)' }}
                >
                    {(['all', 'published', 'drafts'] as FilterType[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === f ? 'shadow-sm' : ''
                                }`}
                            style={{
                                backgroundColor: filter === f ? 'var(--admin-bg-secondary)' : 'transparent',
                                color: filter === f ? 'var(--admin-text)' : 'var(--admin-text-secondary)'
                            }}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)} ({stats[f]})
                        </button>
                    ))}
                </div>

                {/* Sort */}
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortType)}
                    className="px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{
                        backgroundColor: 'var(--admin-bg-secondary)',
                        borderColor: 'var(--admin-border)',
                        color: 'var(--admin-text)'
                    }}
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">By Title</option>
                </select>
            </div>

            {/* Posts List */}
            {filteredPosts.length === 0 ? (
                <div
                    className="admin-card p-12 text-center"
                    style={{ color: 'var(--admin-text-secondary)' }}
                >
                    <span className="text-5xl mb-4 block">📝</span>
                    <p className="text-lg mb-2">No posts found</p>
                    <p className="text-sm mb-4">
                        {search ? `No posts matching "${search}"` : 'Create your first post to get started'}
                    </p>
                    <Link href="/admin/posts/new" className="quick-action-btn primary inline-flex">
                        <span>✏️</span>
                        <span>Create Post</span>
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredPosts.map((post, index) => (
                        <div
                            key={post.id}
                            className="admin-card p-4 animate-fade-in"
                            style={{ animationDelay: `${index * 30}ms` }}
                        >
                            <div className="flex items-start justify-between gap-4">
                                {/* Post Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3
                                            className="font-semibold truncate"
                                            style={{ color: 'var(--admin-text)' }}
                                        >
                                            {post.title || 'Untitled'}
                                        </h3>
                                        <span
                                            className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                                            style={{
                                                backgroundColor: post.published_at ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                color: post.published_at ? 'var(--admin-success)' : 'var(--admin-warning)'
                                            }}
                                        >
                                            {post.published_at ? 'Published' : 'Draft'}
                                        </span>
                                    </div>

                                    <p
                                        className="text-sm mb-2 line-clamp-2"
                                        style={{ color: 'var(--admin-text-secondary)' }}
                                    >
                                        {post.meta_description || post.content.slice(0, 150)}...
                                    </p>

                                    <div
                                        className="flex items-center gap-4 text-xs"
                                        style={{ color: 'var(--admin-text-secondary)' }}
                                    >
                                        <span>/{post.slug}</span>
                                        <span>
                                            {post.published_at
                                                ? `Published ${new Date(post.published_at).toLocaleDateString()}`
                                                : `Created ${new Date(post.created_at).toLocaleDateString()}`
                                            }
                                        </span>
                                        {post.tags && post.tags.length > 0 && (
                                            <span className="flex gap-1">
                                                {post.tags.slice(0, 3).map(tag => (
                                                    <span
                                                        key={tag}
                                                        className="px-1.5 py-0.5 rounded"
                                                        style={{ backgroundColor: 'var(--admin-border-light)' }}
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {post.published_at && (
                                        <Link
                                            href={`/${post.slug}` as Route}
                                            target="_blank"
                                            className="p-2 rounded-lg transition-colors"
                                            style={{ color: 'var(--admin-text-secondary)' }}
                                            title="View post"
                                        >
                                            👁
                                        </Link>
                                    )}

                                    <Link
                                        href={`/admin/posts/${post.id}/edit` as Route}
                                        className="p-2 rounded-lg transition-colors"
                                        style={{ color: 'var(--admin-primary)' }}
                                        title="Edit post"
                                    >
                                        ✏️
                                    </Link>

                                    <button
                                        onClick={() => handleTogglePublish(post)}
                                        disabled={togglePublish === post.id}
                                        className="p-2 rounded-lg transition-colors disabled:opacity-50"
                                        style={{ color: post.published_at ? 'var(--admin-warning)' : 'var(--admin-success)' }}
                                        title={post.published_at ? 'Unpublish' : 'Publish'}
                                    >
                                        {togglePublish === post.id ? '...' : (post.published_at ? '📥' : '📤')}
                                    </button>

                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        disabled={deleting === post.id}
                                        className="p-2 rounded-lg transition-colors disabled:opacity-50"
                                        style={{ color: 'var(--admin-danger)' }}
                                        title="Delete post"
                                    >
                                        {deleting === post.id ? '...' : '🗑️'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Results count */}
            {filteredPosts.length > 0 && (
                <p
                    className="text-sm text-center"
                    style={{ color: 'var(--admin-text-secondary)' }}
                >
                    Showing {filteredPosts.length} of {posts.length} posts
                </p>
            )}
        </div>
    );
}
