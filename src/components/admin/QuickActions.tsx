'use client';

import Link from 'next/link';

export default function QuickActions() {
    return (
        <div className="flex items-center gap-2">
            <Link href="/admin/posts/new" className="quick-action-btn primary">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Post
            </Link>
            <Link href="/admin/posts" className="quick-action-btn secondary">
                Manage Posts
            </Link>
            <Link href="/admin/subscribers" className="quick-action-btn secondary">
                Subscribers
            </Link>
        </div>
    );
}
