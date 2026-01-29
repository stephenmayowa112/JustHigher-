'use client';

import { Post } from '@/lib/types';
import Link from 'next/link';

interface AnalyticsCardProps {
    posts: Post[];
    subscriberCount: number;
}

export default function AnalyticsCard({ posts, subscriberCount }: AnalyticsCardProps) {
    // Calculate real stats from posts data
    const publishedPosts = posts.filter(p => p.published_at);

    // Get posts from this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const postsThisMonth = publishedPosts.filter(
        p => new Date(p.published_at!) >= thisMonth
    ).length;

    // Get posts by day of week (last 7 days)
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);

        const postsOnDay = publishedPosts.filter(p => {
            const postDate = new Date(p.published_at!);
            return postDate >= date && postDate < nextDate;
        }).length;

        last7Days.push({
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            posts: postsOnDay
        });
    }

    // Calculate max for bar heights
    const maxPosts = Math.max(...last7Days.map(d => d.posts), 1);

    // Recent published posts for the list
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
                    Last 7 Days
                </span>
            </div>

            {/* Stats Row - All real data */}
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

            {/* Bar Chart - Real data based on posts in last 7 days */}
            <div className="mb-6">
                <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--admin-text-secondary)' }}>
                    Posts Published (Last 7 Days)
                </h4>
                <div className="flex items-end gap-1 h-16">
                    {last7Days.map((day, i) => {
                        const height = day.posts > 0 ? (day.posts / maxPosts) * 100 : 5;
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center">
                                <div
                                    className="w-full rounded-t transition-all hover:opacity-80"
                                    style={{
                                        height: `${height}%`,
                                        minHeight: '4px',
                                        background: day.posts > 0 ? 'var(--gradient-primary)' : 'var(--admin-border)',
                                    }}
                                    title={`${day.posts} post${day.posts !== 1 ? 's' : ''} on ${day.day}`}
                                />
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between mt-2">
                    {last7Days.map((day, i) => (
                        <span key={i} className="text-xs flex-1 text-center" style={{ color: 'var(--admin-text-secondary)' }}>
                            {day.day}
                        </span>
                    ))}
                </div>
            </div>

            {/* Top Posts - Real data */}
            <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--admin-text-secondary)' }}>
                    Recent Published Posts
                </h4>
                <div className="space-y-2">
                    {topPosts.length === 0 ? (
                        <p className="text-sm text-center py-4" style={{ color: 'var(--admin-text-secondary)' }}>
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
                                <span
                                    className="text-xs"
                                    style={{ color: 'var(--admin-text-secondary)' }}
                                >
                                    {new Date(post.published_at!).toLocaleDateString()}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
