'use client';

import { Post } from '@/lib/types';
import Link from 'next/link';

interface AnalyticsCardProps {
    posts: Post[];
    subscriberCount: number;
}

export default function AnalyticsCard({ posts, subscriberCount }: AnalyticsCardProps) {
    // Calculate some basic stats
    const publishedPosts = posts.filter(p => p.published_at);
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const postsThisMonth = publishedPosts.filter(
        p => new Date(p.published_at!) >= thisMonth
    ).length;

    // Top posts (just show the most recent published for now)
    const topPosts = publishedPosts.slice(0, 3);

    return (
        <div className="admin-card p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--admin-text)' }}>
                    Analytics Overview
                </h3>
                <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: 'var(--admin-primary)'
                    }}
                >
                    This Month
                </span>
            </div>

            {/* Simple Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--admin-border-light)' }}>
                    <div className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>
                        {postsThisMonth}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--admin-text-secondary)' }}>
                        Posts This Month
                    </div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--admin-border-light)' }}>
                    <div className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>
                        {publishedPosts.length}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--admin-text-secondary)' }}>
                        Total Published
                    </div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--admin-border-light)' }}>
                    <div className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>
                        {subscriberCount}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--admin-text-secondary)' }}>
                        Subscribers
                    </div>
                </div>
            </div>

            {/* Simple Bar Chart Visualization */}
            <div className="mb-6">
                <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--admin-text-secondary)' }}>
                    Publishing Activity
                </h4>
                <div className="flex items-end gap-1 h-16">
                    {[...Array(7)].map((_, i) => {
                        // Generate some visual bars (would be real data in production)
                        const height = Math.random() * 80 + 20;
                        return (
                            <div
                                key={i}
                                className="flex-1 rounded-t transition-all hover:opacity-80"
                                style={{
                                    height: `${height}%`,
                                    background: 'var(--gradient-primary)',
                                }}
                            />
                        );
                    })}
                </div>
                <div className="flex justify-between mt-2">
                    <span className="text-xs" style={{ color: 'var(--admin-text-secondary)' }}>Mon</span>
                    <span className="text-xs" style={{ color: 'var(--admin-text-secondary)' }}>Sun</span>
                </div>
            </div>

            {/* Top Posts */}
            <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--admin-text-secondary)' }}>
                    Recent Posts
                </h4>
                <div className="space-y-2">
                    {topPosts.length === 0 ? (
                        <p className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                            No published posts yet
                        </p>
                    ) : (
                        topPosts.map((post, index) => (
                            <div
                                key={post.id}
                                className="flex items-center gap-3"
                            >
                                <span
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                                    style={{
                                        backgroundColor: 'var(--admin-border-light)',
                                        color: 'var(--admin-text-secondary)'
                                    }}
                                >
                                    {index + 1}
                                </span>
                                <Link
                                    href={`/${post.slug}`}
                                    target="_blank"
                                    className="text-sm truncate flex-1 hover:underline"
                                    style={{ color: 'var(--admin-text)' }}
                                >
                                    {post.title}
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
