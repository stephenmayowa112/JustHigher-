'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPublishedPosts } from '@/lib/blog';
import { Post } from '@/lib/types';

interface ArchiveMonth {
  year: number;
  month: number;
  monthName: string;
  count: number;
  posts: Post[];
}

export default function ArchivesSection() {
  const [archives, setArchives] = useState<ArchiveMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  useEffect(() => {
    async function loadArchives() {
      try {
        const posts = await getPublishedPosts(100);
        
        // Group posts by month
        const archiveMap = new Map<string, ArchiveMonth>();
        
        posts.forEach(post => {
          const date = new Date(post.published_at || post.created_at);
          const year = date.getFullYear();
          const month = date.getMonth();
          const key = `${year}-${month}`;
          
          if (!archiveMap.has(key)) {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'];
            
            archiveMap.set(key, {
              year,
              month,
              monthName: monthNames[month],
              count: 0,
              posts: []
            });
          }
          
          const archive = archiveMap.get(key)!;
          archive.count++;
          archive.posts.push(post);
        });
        
        // Convert to array and sort by date (newest first)
        const archiveArray = Array.from(archiveMap.values())
          .sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
          });
        
        setArchives(archiveArray);
        setError(false);
      } catch (err) {
        console.error('Error loading archives:', err);
        setError(true);
        setArchives([]);
      } finally {
        setLoading(false);
      }
    }

    loadArchives();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || archives.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
        {error ? 'Unable to load archives at the moment.' : 'No archives available yet.'}
      </div>
    );
  }

  const toggleMonth = (key: string) => {
    setExpandedMonth(expandedMonth === key ? null : key);
  };

  return (
    <div className="space-y-1">
      {archives.map(archive => {
        const key = `${archive.year}-${archive.month}`;
        const isExpanded = expandedMonth === key;
        
        return (
          <div key={key} className="rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleMonth(key)}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-2">
                <svg 
                  className={`w-4 h-4 text-green-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-sm font-medium text-gray-900 group-hover:text-green-900">
                  {archive.monthName} {archive.year}
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 group-hover:bg-green-100 group-hover:text-green-700 px-2 py-1 rounded-full">
                {archive.count}
              </span>
            </button>
            
            {isExpanded && (
              <div className="pl-6 pr-2 py-2 space-y-1 bg-gradient-to-r from-green-50/50 to-emerald-50/50">
                {archive.posts.map(post => (
                  <Link
                    key={post.id}
                    href={`/${post.slug}`}
                    className="block p-2 rounded text-sm text-gray-700 hover:text-green-900 hover:bg-white transition-colors"
                  >
                    <div className="line-clamp-2">{post.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
