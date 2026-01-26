'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Post } from '@/lib/types';
import { formatDate, calculateReadingTime } from '@/lib/utils';

// Sample posts for search (in production, this would use the searchPosts function)
const samplePosts: Post[] = [
  {
    id: '1',
    title: 'The Power of Minimalism in Digital Design',
    content: `In a world cluttered with notifications, pop-ups, and endless distractions, there's something profoundly powerful about embracing minimalism in digital design. This isn't about being sparse for the sake of it. It's about creating space for what matters most: your ideas, your words, your connection with the reader.`,
    slug: 'power-of-minimalism-digital-design',
    published_at: '2024-01-26T10:00:00Z',
    created_at: '2024-01-26T09:00:00Z',
    updated_at: '2024-01-26T09:00:00Z',
    tags: ['design', 'minimalism', 'digital'],
    reading_time: 5,
  },
  {
    id: '2',
    title: 'Why Full Content Matters',
    content: `"Read more" buttons are a relic of an era when page views mattered more than reader experience. When you force someone to click to continue reading, you're asking them to make a commitment before they know if your content is worth their time.`,
    slug: 'why-full-content-matters',
    published_at: '2024-01-25T14:30:00Z',
    created_at: '2024-01-25T13:30:00Z',
    updated_at: '2024-01-25T13:30:00Z',
    tags: ['content', 'ux', 'writing'],
    reading_time: 4,
  },
  {
    id: '3',
    title: 'Building for Speed and Substance',
    content: `Performance isn't just about technical metrics—it's about respect for your reader's time and attention. When your blog loads instantly, when navigation is intuitive, when the reading experience is seamless, you're sending a message about what you value.`,
    slug: 'building-for-speed-and-substance',
    published_at: '2024-01-24T16:15:00Z',
    created_at: '2024-01-24T15:15:00Z',
    updated_at: '2024-01-24T15:15:00Z',
    tags: ['performance', 'web development', 'user experience'],
    reading_time: 6,
  },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get query from URL params
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
    }
  }, [searchParams]);

  // Perform search (client-side for now, would be server-side in production)
  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    const lowercaseQuery = query.toLowerCase();
    return samplePosts.filter(post => 
      post.title.toLowerCase().includes(lowercaseQuery) ||
      post.content.toLowerCase().includes(lowercaseQuery) ||
      post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you might update the URL or trigger a server search
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300); // Simulate search delay
  };

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Search Posts
        </h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Find articles by title, content, or tags.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for posts..."
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-gray-600 rounded-full" />
            ) : (
              <svg
                className="h-5 w-5 text-gray-400 hover:text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* Search Results */}
      {query && (
        <div className="space-y-6">
          {/* Results Header */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {searchResults.length > 0 
                ? `Found ${searchResults.length} result${searchResults.length === 1 ? '' : 's'} for "${query}"`
                : `No results found for "${query}"`
              }
            </p>
          </div>

          {/* Results List */}
          {searchResults.length > 0 ? (
            <div className="space-y-8">
              {searchResults.map((post) => (
                <SearchResultCard key={post.id} post={post} query={query} />
              ))}
            </div>
          ) : query && (
            <div className="text-center space-y-4 py-12">
              <div className="text-gray-400">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">
                  No posts found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or browse all posts.
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Browse all posts
              </Link>
            </div>
          )}
        </div>
      )}

      {/* No Query State */}
      {!query && (
        <div className="text-center space-y-4 py-12">
          <div className="text-gray-400">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              Start searching
            </h3>
            <p className="text-gray-600">
              Enter a search term above to find relevant posts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-500 rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading search...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

// Search result card component
function SearchResultCard({ post, query }: { post: Post; query: string }) {
  const readingTime = post.reading_time || calculateReadingTime(post.content);
  const publishedDate = post.published_at ? new Date(post.published_at) : new Date(post.created_at);

  // Highlight search terms in title and content
  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <article className="border-b border-gray-200 pb-6 last:border-b-0">
      <div className="space-y-3">
        {/* Post Title */}
        <h2 className="text-xl font-bold text-gray-900 hover:text-gray-700">
          <Link href={`/${post.slug}` as any}>
            {highlightText(post.title, query)}
          </Link>
        </h2>

        {/* Post Metadata */}
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <time dateTime={post.published_at || post.created_at}>
            {formatDate(publishedDate.toISOString())}
          </time>
          <span>•</span>
          <span>{readingTime} min read</span>
          {post.tags && post.tags.length > 0 && (
            <>
              <span>•</span>
              <div className="flex items-center space-x-1">
                {post.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {highlightText(tag, query)}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Post Excerpt */}
        <p className="text-gray-600 leading-relaxed">
          {highlightText(post.content.slice(0, 200) + '...', query)}
        </p>

        {/* Read More Link */}
        <Link
          href={`/${post.slug}` as any}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          Read full post →
        </Link>
      </div>
    </article>
  );
}