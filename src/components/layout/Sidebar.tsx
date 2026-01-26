'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { SidebarProps } from '@/lib/types';

// Lazy load components that aren't immediately visible
const SearchBox = dynamic(() => import('@/components/ui/SearchBox'), {
  loading: () => (
    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 animate-pulse">
      <div className="h-4 bg-gray-200 rounded"></div>
    </div>
  ),
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
});

export default function Sidebar({ className = '' }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (query: string) => {
    // Handle search functionality
    console.log('Search query:', query);
  };

  const handleNewsletterSubscribe = async (email: string) => {
    // Handle newsletter subscription
    // In production, this would call the subscribeToNewsletter function
    console.log('Newsletter subscription:', email);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, just log success
    console.log('Subscription successful');
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">Blog</h1>
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            {/* Hamburger icon */}
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
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
        <div className="lg:hidden">
          <div className="fixed inset-0 flex z-40">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <svg
                    className="h-6 w-6 text-white"
                    xmlns="http://www.w3.org/2000/svg"
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
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex lg:flex-shrink-0 ${className}`}>
        <div className="flex flex-col w-88">
          <SidebarContent onSearch={handleSearch} onNewsletterSubscribe={handleNewsletterSubscribe} />
        </div>
      </div>
    </>
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
    <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
      <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
        {/* Logo/Brand */}
        <div className="flex items-center flex-shrink-0 px-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Minimalist Blog
          </h1>
        </div>

        {/* Navigation */}
        <nav className="mt-8 flex-1 px-6 space-y-8">
          {/* About Section */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              About
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-3">
              <p>
                Welcome to this minimalist blog, inspired by the clean and focused design philosophy 
                of great writers who prioritize content over clutter.
              </p>
              <p>
                Here you'll find thoughtful posts delivered in their entirety, 
                without the distraction of "read more" buttons or excessive navigation.
              </p>
            </div>
          </div>

          {/* Search Section */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Search
            </h2>
            <Suspense fallback={
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 animate-pulse">
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            }>
              <SearchBox onSearch={onSearch} />
            </Suspense>
          </div>

          {/* Newsletter Section */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Newsletter
            </h2>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Get new posts delivered directly to your inbox.
              </p>
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
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            © 2024 Minimalist Blog. Built with Next.js & Supabase.
          </p>
        </div>
      </div>
    </div>
  );
}