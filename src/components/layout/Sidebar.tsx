'use client';

import { useState, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { SidebarProps } from '@/lib/types';
import { SidebarErrorBoundary, SearchErrorBoundary, NewsletterErrorBoundary } from '@/components/ErrorBoundary';

// Lazy load components that aren't immediately visible
const SearchBox = dynamic(() => import('@/components/ui/SearchBox'), {
  loading: () => (
    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 animate-pulse">
      <div className="h-4 bg-gray-200 rounded"></div>
    </div>
  ),
  ssr: false,
});

const NewsletterForm = dynamic(() => import('@/components/layout/NewsletterForm'), {
  loading: () => (
    <div className="space-y-2">
      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 animate-pulse">
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
      <div className="w-full px-4 py-2 bg-gray-200 rounded-md animate-pulse">
        <div className="h-4 bg-gray-300 rounded"></div>
      </div>
    </div>
  ),
  ssr: false,
});

const TopPostsSection = dynamic(() => import('@/components/layout/TopPostsSection'), {
  loading: () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
      ))}
    </div>
  ),
  ssr: false,
});

const ArchivesSection = dynamic(() => import('@/components/layout/ArchivesSection'), {
  loading: () => (
    <div className="space-y-2">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />
      ))}
    </div>
  ),
  ssr: false,
});

export default function Sidebar({ className = '' }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Hide sidebar on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSearch = (query: string) => {
    // Handle search functionality
    console.log('Search query:', query);
  };

  const handleNewsletterSubscribe = async (email: string) => {
    // This is now handled by the NewsletterForm component
    // Just for analytics tracking if needed
    console.log('Newsletter subscription analytics:', email);
  };

  return (
    <SidebarErrorBoundary>
      {/* Mobile menu button - sticky at top */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">JustHigher Blog</h1>
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle mobile menu"
          >
            <span className="sr-only">Open main menu</span>
            {/* Hamburger icon */}
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex flex-col max-w-xs w-full h-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close mobile menu"
              >
                <span className="sr-only">Close sidebar</span>
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SidebarContent onSearch={handleSearch} onNewsletterSubscribe={handleNewsletterSubscribe} />
          </div>
        </div>
      )}

      {/* Desktop sidebar - fixed position */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:w-88 lg:flex-col ${className}`}>
        <SidebarContent onSearch={handleSearch} onNewsletterSubscribe={handleNewsletterSubscribe} />
      </div>
    </SidebarErrorBoundary>
  );
}

function SidebarContent({
  onSearch,
  onNewsletterSubscribe
}: {
  onSearch: (query: string) => void;
  onNewsletterSubscribe: (email: string) => Promise<void>;
}) {
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gradient-to-b from-white to-blue-50 border-r border-gray-200">
      <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
        {/* Logo/Brand */}
        <div className="flex items-center shrink-0 px-6 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">JH</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              JustHigher
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 space-y-6">
          {/* About Section */}
          <div className="space-y-3 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-blue-900 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              About
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-3">
              <p>
                Ideas that elevate, inspire, and push you toward your potential.
                This is a place for the dreamers who do, the thinkers who act.
              </p>
              <p>
                Every day, you have a choice: stay where you are or climb a little higher.
                Welcome to the journey up.
              </p>
            </div>
          </div>

          {/* Search Section */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </h2>
            <SearchErrorBoundary>
              <Suspense fallback={
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              }>
                <SearchBox onSearch={onSearch} />
              </Suspense>
            </SearchErrorBoundary>
          </div>

          {/* Top Posts Section */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Top 20 Posts
            </h2>
            <Suspense fallback={
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            }>
              <TopPostsSection />
            </Suspense>
          </div>

          {/* Archives Section */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Archives
            </h2>
            <Suspense fallback={
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            }>
              <ArchivesSection />
            </Suspense>
          </div>

          {/* Newsletter Section */}
          <div className="space-y-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <h2 className="text-sm font-semibold text-blue-900 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Newsletter
            </h2>
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                Get inspiring ideas delivered directly to your inbox.
              </p>
              <NewsletterErrorBoundary>
                <Suspense fallback={
                  <div className="space-y-2">
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="w-full px-4 py-2 bg-gray-200 rounded-md animate-pulse">
                      <div className="h-4 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                }>
                  <NewsletterForm onSubscribe={onNewsletterSubscribe} />
                </Suspense>
              </NewsletterErrorBoundary>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-200 bg-white">
          <p className="text-xs text-gray-500">
            © 2024 JustHigher Blog. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
