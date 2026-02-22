'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Route } from 'next';

interface AdminSidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

const navigation: { name: string; href: Route; icon: React.ReactNode }[] = [
    {
        name: 'Dashboard',
        href: '/admin' as Route,
        icon: (
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
            </svg>
        )
    },
    {
        name: 'Posts',
        href: '/admin/posts' as Route,
        icon: (
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        )
    },
    {
        name: 'New Post',
        href: '/admin/posts/new' as Route,
        icon: (
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
        )
    },
    {
        name: 'Subscribers',
        href: '/admin/subscribers' as Route,
        icon: (
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        )
    },
];

export default function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
    const pathname = usePathname();
    const { user } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname?.startsWith(href);
    };

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-md"
                style={{ backgroundColor: 'var(--admin-bg-secondary)', border: '1px solid var(--admin-border)' }}
                aria-label="Toggle menu"
            >
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--admin-text)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/30 z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
            >
                {/* Logo */}
                <div className="p-4 flex items-center justify-between">
                    <Link href="/admin" className="flex items-center gap-2">
                        <div
                            className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold"
                            style={{ backgroundColor: 'var(--admin-text)', color: 'var(--admin-bg)' }}
                        >
                            JH
                        </div>
                        <span className="nav-text font-medium text-sm" style={{ color: 'var(--admin-text)' }}>
                            Admin
                        </span>
                    </Link>

                    <button
                        onClick={onToggle}
                        className="hidden lg:flex p-1.5 rounded-md transition-colors"
                        style={{ color: 'var(--admin-text-muted)' }}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <svg
                            width="14" height="14"
                            className={`transition-transform ${collapsed ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 space-y-0.5">
                    <div className="section-header px-2 mb-2">Menu</div>
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`nav-item ${isActive(item.href as string) ? 'active' : ''}`}
                            onClick={() => setMobileOpen(false)}
                        >
                            <span className="nav-item-icon">{item.icon}</span>
                            <span className="nav-text">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                {/* Bottom section */}
                <div className="px-3 pb-2">
                    {/* View Blog link */}
                    <Link
                        href="/"
                        target="_blank"
                        className="nav-item mb-1"
                        style={{ color: 'var(--admin-text-muted)' }}
                    >
                        <span className="nav-item-icon">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </span>
                        <span className="nav-text">View Blog</span>
                    </Link>
                </div>

                {/* User section */}
                <div className="p-4 border-t" style={{ borderColor: 'var(--admin-border)' }}>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
                            style={{ backgroundColor: 'var(--admin-border)', color: 'var(--admin-text)' }}
                        >
                            {user?.email?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="nav-text flex-1 min-w-0">
                            <p className="text-xs font-medium truncate" style={{ color: 'var(--admin-text)' }}>
                                {user?.email?.split('@')[0] || 'Admin'}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
