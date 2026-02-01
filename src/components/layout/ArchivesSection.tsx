'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPublishedPosts } from '@/lib/blog';
import { Post } from '@/lib/types';

export default function ArchivesSection() {
  const [archives, setArchives] = useState<{ month: string; year: number; count: number; posts: Post[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArchives();
  }, []);

  const loadArchives = async () => {
    try {
      const posts = await getPublishedPosts();
      
      // Group posts by month and year
      const archiveMap = new Map<string, { month: string; year: number; count: number; posts: Post[] }>();
      
      posts.forEach(post => {
        const date = new Date(post.published_at || post.created_at);
        const year = date.getFullYear();
        const month = date.toLocaleString('default', { month: 'long' });
        const key = `${year}-${month}`;
        
        if (!archiveMap.has(key)) {
          archiveMap.set(key, { month, year, count: 0, posts: [] });
        }
        
        const archive = archiveMap.get(key)!;
        archive.count++;
        archive.posts.push(post);
      });
      
      // Convert to array and sort by date (newest first)
      const archivesArray = Array.from(archiveMap.values()).sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return new Date(`${b.month} 1`).getMonth() - new Date(`${a.month} 1`).getMonth();
      });
      
      setArchives(archivesArray.slice(0, 12)); // Show last 12 months
    } catch (error) {
      console.error('Error loading archives:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (archives.length === 0) {
    return (
      <p className="text-sm text-gray-500">No archives yet</p>
    );
  }

  return (
    <div className="space-y-2">
      {archives.map((archive, index) => (
        <div key={index} className="flex items-center justify-between text-sm hover:bg-gray-50 px-2 py-1 rounded transition-colors">
          <Link 
            href={`/archive/${archive.year}/${archive.month.toLowerCase()}`}
            className="text-gray-700 hover:text-blue-600 transition-colors flex-1"
          >
            {archive.month} {archive.year}
          </Link>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {archive.count}
          </span>
        </div>
      ))}
    </div>
  );
}
