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
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showDeleteModal, setShowDeleteModal] = useState<{ id: string; title: string } | null>(null);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

    const filteredPosts = useMemo(() => {
        let result = [...posts];

        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(post =>
                post.title.toLowerCase().includes(searchLower) ||
                post.content.toLowerCase().includes(searchLower) ||
                post.tags?.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }

        if (filter === 'published') {
            result = result.filter(post => post.published_at);
        } else if (filter === 'drafts') {
            result = result.filter(post => !post.published_at);
        }

        result.sort((a, b) => {
            if (sort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            if (sort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            return a.title.localeCompare(b.title);
        });

        return result;
    }, [posts, search, filter, sort]);

    const handleTogglePublish = async (post: Post) => {
        setTogglePublish(post.id);
        try {
            if (post.published_at) {
                await updatePost(post.id, { published_at: null });
            } else {
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
        setDeleting(postId);
        setShowDeleteModal(null);
        try {
            await deletePost(postId);
            selectedIds.delete(postId);
            setSelectedIds(new Set(selectedIds));
            onRefresh();
        } catch (error) {
            console.error('Failed to delete post:', error);
        } finally {
            setDeleting(null);
        }
    };

    const handleBulkDelete = async () => {
        setShowBulkDeleteModal(false);
        for (const id of selectedIds) {
            try {
                await deletePost(id);
            } catch (error) {
                console.error(`Failed to delete post ${id}:`, error);
            }
        }
        setSelectedIds(new Set());
        onRefresh();
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredPosts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredPosts.map(p => p.id)));
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
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--admin-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        style={{ backgroundColor: 'var(--admin-bg-secondary)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}
                    />
                </div>

                <div className="flex rounded-lg p-1" style={{ backgroundColor: 'var(--admin-border-light)' }}>
                    {(['all', 'published', 'drafts'] as FilterType[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === f ? 'shadow-sm' : ''}`}
                            style={{
                                backgroundColor: filter === f ? 'var(--admin-bg-secondary)' : 'transparent',
                                color: filter === f ? 'var(--admin-text)' : 'var(--admin-text-secondary)'
                            }}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)} ({stats[f]})
                        </button>
                    ))}
                </div>

                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortType)}
                    className="px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: 'var(--admin-bg-secondary)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">By Title</option>
                </select>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
                <div className="admin-toolbar rounded-lg animate-fade-in">
                    <span className="text-sm font-medium" style={{ color: 'var(--admin-text)' }}>
                        {selectedIds.size} selected
                    </span>
                    <button
                        onClick={() => setShowBulkDeleteModal(true)}
                        className="btn btn-danger btn-sm"
                    >
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Selected
                    </button>
                    <button onClick={() => setSelectedIds(new Set())} className="btn btn-ghost btn-sm">
                        Clear
                    </button>
                </div>
            )}

            {/* Posts Table */}
            {filteredPosts.length === 0 ? (
                <div className="admin-card p-12 text-center">
                    <svg className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--admin-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="font-medium mb-1" style={{ color: 'var(--admin-text)' }}>No posts found</p>
                    <p className="text-sm mb-4" style={{ color: 'var(--admin-text-secondary)' }}>
                        {search ? `No posts matching "${search}"` : 'Create your first post to get started'}
                    </p>
                    <Link href="/admin/posts/new" className="btn btn-primary">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Post
                    </Link>
                </div>
            ) : (
                <div className="admin-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 40 }}>
                                        <input
                                            type="checkbox"
                                            className="admin-checkbox"
                                            checked={selectedIds.size === filteredPosts.length && filteredPosts.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th>Title</th>
                                    <th className="hidden md:table-cell">Slug</th>
                                    <th className="hidden lg:table-cell">Date</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPosts.map((post) => (
                                    <tr key={post.id} className={deleting === post.id ? 'opacity-50' : ''}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                className="admin-checkbox"
                                                checked={selectedIds.has(post.id)}
                                                onChange={() => toggleSelect(post.id)}
                                            />
                                        </td>
                                        <td>
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm truncate max-w-[260px]" style={{ color: 'var(--admin-text)' }}>
                                                    {post.title || 'Untitled'}
                                                </p>
                                                {post.tags && post.tags.length > 0 && (
                                                    <div className="flex gap-1 mt-1">
                                                        {post.tags.slice(0, 3).map(tag => (
                                                            <span key={tag} className="badge badge-tag">{tag}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="hidden md:table-cell">
                                            <span className="text-xs font-mono" style={{ color: 'var(--admin-text-muted)' }}>
                                                /{post.slug}
                                            </span>
                                        </td>
                                        <td className="hidden lg:table-cell">
                                            <span className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                                                {(post.published_at || post.created_at) &&
                                                    new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${post.published_at ? 'badge-published' : 'badge-draft'}`}>
                                                {post.published_at ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {post.published_at && (
                                                    <Link
                                                        href={`/${post.slug}` as Route}
                                                        target="_blank"
                                                        className="btn btn-ghost btn-icon"
                                                        title="View post"
                                                    >
                                                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </Link>
                                                )}
                                                <Link
                                                    href={`/admin/posts/${post.id}/edit` as Route}
                                                    className="btn btn-ghost btn-icon"
                                                    title="Edit post"
                                                >
                                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleTogglePublish(post)}
                                                    disabled={togglePublish === post.id}
                                                    className="btn btn-ghost btn-icon disabled:opacity-50"
                                                    title={post.published_at ? 'Unpublish' : 'Publish'}
                                                    style={{ color: post.published_at ? 'var(--admin-warning)' : 'var(--admin-success)' }}
                                                >
                                                    {togglePublish === post.id ? (
                                                        <span className="text-xs">...</span>
                                                    ) : post.published_at ? (
                                                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                        </svg>
                                                    ) : (
                                                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteModal({ id: post.id, title: post.title })}
                                                    disabled={deleting === post.id}
                                                    className="btn btn-ghost btn-icon disabled:opacity-50"
                                                    style={{ color: 'var(--admin-danger)' }}
                                                    title="Delete post"
                                                >
                                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-4 py-3 border-t text-center" style={{ borderColor: 'var(--admin-border)' }}>
                        <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                            Showing {filteredPosts.length} of {posts.length} posts
                        </p>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--admin-danger-light)' }}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--admin-danger)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold" style={{ color: 'var(--admin-text)' }}>Delete Post</h3>
                                <p className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>This action cannot be undone.</p>
                            </div>
                        </div>
                        <p className="text-sm mb-6" style={{ color: 'var(--admin-text-secondary)' }}>
                            Are you sure you want to delete <strong style={{ color: 'var(--admin-text)' }}>&quot;{showDeleteModal.title}&quot;</strong>?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowDeleteModal(null)} className="btn btn-secondary btn-sm">Cancel</button>
                            <button onClick={() => handleDelete(showDeleteModal.id)} className="btn btn-danger btn-sm">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Delete Confirmation Modal */}
            {showBulkDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowBulkDeleteModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--admin-danger-light)' }}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--admin-danger)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold" style={{ color: 'var(--admin-text)' }}>Delete {selectedIds.size} Posts</h3>
                                <p className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>This action cannot be undone.</p>
                            </div>
                        </div>
                        <p className="text-sm mb-6" style={{ color: 'var(--admin-text-secondary)' }}>
                            Are you sure you want to delete <strong style={{ color: 'var(--admin-text)' }}>{selectedIds.size} posts</strong>? This will permanently remove them.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowBulkDeleteModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                            <button onClick={handleBulkDelete} className="btn btn-danger btn-sm">Delete All</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
