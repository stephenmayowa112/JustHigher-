'use client';

import Link from 'next/link';

export default function QuickActions() {
    return (
        <div className="admin-card p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--admin-text)' }}>
                Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/admin/posts/new" className="quick-action-btn primary">
                    <span>✏️</span>
                    <span>New Post</span>
                    <span className="ml-auto text-xs opacity-70 hidden sm:inline">Ctrl+N</span>
                </Link>

                <Link href="/admin/posts" className="quick-action-btn secondary">
                    <span>📝</span>
                    <span>Manage Posts</span>
                </Link>

                <Link href="/admin/subscribers" className="quick-action-btn secondary">
                    <span>👥</span>
                    <span>Subscribers</span>
                </Link>
            </div>
        </div>
    );
}
