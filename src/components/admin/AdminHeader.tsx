'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/lib/auth';
import DarkModeToggle from './DarkModeToggle';
import { Route } from 'next';

interface AdminHeaderProps {
    sidebarCollapsed: boolean;
}

export default function AdminHeader({ sidebarCollapsed }: AdminHeaderProps) {
    const pathname = usePathname();

    // Generate breadcrumbs from pathname
    const getBreadcrumbs = () => {
        const paths = pathname?.split('/').filter(Boolean) || [];
        const breadcrumbs: { name: string; href: string }[] = [];

        let currentPath = '';
        paths.forEach((path, index) => {
            currentPath += `/${path}`;

            // Format the name nicely
            let name = path.charAt(0).toUpperCase() + path.slice(1);
            if (path === 'admin') name = 'Dashboard';
            if (path === 'posts') name = 'Posts';
            if (path === 'new') name = 'New Post';
            if (path === 'edit') name = 'Edit';
            if (path === 'subscribers') name = 'Subscribers';

            breadcrumbs.push({
                name,
                href: currentPath,
            });
        });

        return breadcrumbs;
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            window.location.href = '/admin/login';
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <header
            className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between"
            style={{
                backgroundColor: 'var(--admin-bg-secondary)',
                borderBottom: '1px solid var(--admin-border)'
            }}
        >
            {/* Breadcrumbs */}
            <nav className="breadcrumbs">
                <Link href="/" className="breadcrumb-link flex items-center gap-1" target="_blank">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Blog</span>
                </Link>

                {breadcrumbs.map((crumb, index) => (
                    <span key={crumb.href} className="breadcrumb-item">
                        <svg className="w-4 h-4" style={{ color: 'var(--admin-text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {index === breadcrumbs.length - 1 ? (
                            <span className="breadcrumb-current">{crumb.name}</span>
                        ) : (
                            <Link href={crumb.href as Route} className="breadcrumb-link">
                                {crumb.name}
                            </Link>
                        )}
                    </span>
                ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
                {/* View Blog Link */}
                <Link
                    href="/"
                    target="_blank"
                    className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{ color: 'var(--admin-text-secondary)' }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Blog
                </Link>

                {/* Dark Mode Toggle */}
                <DarkModeToggle />

                {/* Sign Out */}
                <button
                    onClick={handleSignOut}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                        backgroundColor: 'var(--admin-border-light)',
                        color: 'var(--admin-text)'
                    }}
                >
                    Sign Out
                </button>
            </div>
        </header>
    );
}
