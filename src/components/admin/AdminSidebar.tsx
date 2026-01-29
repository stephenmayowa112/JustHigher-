'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

interface AdminSidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Posts', href: '/admin/posts', icon: '📝' },
    { name: 'New Post', href: '/admin/posts/new', icon: '✏️' },
    { name: 'Subscribers', href: '/admin/subscribers', icon: '👥' },
];

export default function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
    const pathname = usePathname();
    const { user } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === '/admin') {
            return pathname === '/admin';
        }
        return pathname?.startsWith(href);
    };

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-slate-800 shadow-lg"
                aria-label="Toggle menu"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
            >
                {/* Logo */}
                <div className="p-6 flex items-center justify-between">
                    <Link href="/admin" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                            JH
                        </div>
                        <span className={`nav-text font-bold text-lg`} style={{ color: 'var(--admin-text)' }}>
                            JustHigher
                        </span>
                    </Link>

                    {/* Collapse toggle (desktop) */}
                    <button
                        onClick={onToggle}
                        className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <svg
                            className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            style={{ color: 'var(--admin-text-secondary)' }}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                            onClick={() => setMobileOpen(false)}
                        >
                            <span className="nav-item-icon">{item.icon}</span>
                            <span className="nav-text">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                {/* Quick Action */}
                <div className="p-4">
                    <Link
                        href="/admin/posts/new"
                        className="quick-action-btn primary w-full"
                        onClick={() => setMobileOpen(false)}
                    >
                        <span>➕</span>
                        <span className="nav-text">New Post</span>
                    </Link>
                </div>

                {/* User section */}
                <div className="p-4 border-t" style={{ borderColor: 'var(--admin-border)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-medium">
                            {user?.email?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="nav-text flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--admin-text)' }}>
                                {user?.email?.split('@')[0] || 'Admin'}
                            </p>
                            <p className="text-xs truncate" style={{ color: 'var(--admin-text-secondary)' }}>
                                Administrator
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
