'use client';

import { Post, Subscriber } from '@/lib/types';

interface ActivityItem {
    id: string;
    type: 'subscriber' | 'post' | 'draft';
    title: string;
    timestamp: string;
}

interface ActivityFeedProps {
    recentPosts: Post[];
    recentSubscribers: Subscriber[];
}

export default function ActivityFeed({ recentPosts, recentSubscribers }: ActivityFeedProps) {
    // Combine and sort activities by date
    const activities: ActivityItem[] = [
        ...recentSubscribers.slice(0, 5).map((sub) => ({
            id: `sub-${sub.id}`,
            type: 'subscriber' as const,
            title: `New subscriber: ${sub.email}`,
            timestamp: sub.subscribed_at,
        })),
        ...recentPosts.slice(0, 5).map((post) => ({
            id: `post-${post.id}`,
            type: post.published_at ? 'post' as const : 'draft' as const,
            title: post.published_at
                ? `Published: ${post.title}`
                : `Draft created: ${post.title}`,
            timestamp: post.published_at || post.created_at,
        })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8);

    const getRelativeTime = (timestamp: string) => {
        const now = new Date();
        const date = new Date(timestamp);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const getIcon = (type: ActivityItem['type']) => {
        switch (type) {
            case 'subscriber': return '👤';
            case 'post': return '📢';
            case 'draft': return '📝';
        }
    };

    if (activities.length === 0) {
        return (
            <div className="admin-card p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--admin-text)' }}>
                    Recent Activity
                </h3>
                <div className="text-center py-8" style={{ color: 'var(--admin-text-secondary)' }}>
                    <span className="text-4xl mb-2 block">📋</span>
                    <p>No recent activity</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-card p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--admin-text)' }}>
                Recent Activity
            </h3>

            <div className="space-y-1">
                {activities.map((activity, index) => (
                    <div
                        key={activity.id}
                        className="activity-item animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className={`activity-icon ${activity.type}`}>
                            {getIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p
                                className="text-sm truncate"
                                style={{ color: 'var(--admin-text)' }}
                            >
                                {activity.title}
                            </p>
                            <p
                                className="text-xs"
                                style={{ color: 'var(--admin-text-secondary)' }}
                            >
                                {getRelativeTime(activity.timestamp)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
