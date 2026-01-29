'use client';

import Link from 'next/link';
import { Post } from '@/lib/types';
import { updatePost } from '@/lib/blog';
import { useState } from 'react';

interface RecentDraftsProps {
    drafts: Post[];
    onPostUpdate?: () => void;
}

export default function RecentDrafts({ drafts, onPostUpdate }: RecentDraftsProps) {
    const [publishing, setPublishing] = useState<string | null>(null);

    const handleQuickPublish = async (post: Post) => {
        if (publishing) return;

        setPublishing(post.id);
        try {
            await updatePost(post.id, {
                published_at: new Date().toISOString(),
            });
            onPostUpdate?.();
        } catch (error) {
            console.error('Failed to publish:', error);
        } finally {
            setPublishing(null);
        }
    };

    if (drafts.length === 0) {
        return (
            <div className="admin-card p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--admin-text)' }}>
                    Recent Drafts
                </h3>
                <div className="text-center py-8" style={{ color: 'var(--admin-text-secondary)' }}>
                    <span className="text-4xl mb-2 block">📝</span>
                    <p>No drafts yet</p>
                    <Link
                        href="/admin/posts/new"
                        className="text-blue-500 hover:underline text-sm mt-2 inline-block"
                    >
                        Create your first post →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-card p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--admin-text)' }}>
                    Recent Drafts
                </h3>
                <Link
                    href="/admin/posts?filter=drafts"
                    className="text-sm hover:underline"
                    style={{ color: 'var(--admin-primary)' }}
                >
                    View all →
                </Link>
            </div>

            <div className="space-y-3">
                {drafts.slice(0, 5).map((draft) => (
                    <div
                        key={draft.id}
                        className="flex items-center justify-between p-3 rounded-lg transition-colors"
                        style={{ backgroundColor: 'var(--admin-border-light)' }}
                    >
                        <div className="flex-1 min-w-0 mr-4">
                            <h4
                                className="font-medium truncate"
                                style={{ color: 'var(--admin-text)' }}
                            >
                                {draft.title || 'Untitled Draft'}
                            </h4>
                            <p
                                className="text-sm truncate"
                                style={{ color: 'var(--admin-text-secondary)' }}
                            >
                                Last edited {new Date(draft.updated_at || draft.created_at).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                href={`/admin/posts/${draft.id}/edit`}
                                className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
                                style={{
                                    color: 'var(--admin-primary)',
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)'
                                }}
                            >
                                Edit
                            </Link>
                            <button
                                onClick={() => handleQuickPublish(draft)}
                                disabled={publishing === draft.id}
                                className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                                style={{
                                    color: 'white',
                                    backgroundColor: 'var(--admin-success)'
                                }}
                            >
                                {publishing === draft.id ? '...' : 'Publish'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
