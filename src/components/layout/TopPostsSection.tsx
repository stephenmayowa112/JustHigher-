'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPublishedPosts } from '@/lib/blog';
import { Post } from '@/lib/types';

export default function TopPostsSection() {
  const [topPosts, setTopPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopPosts();
  }, []);

  const loadTopPosts = async () => {
    try {
      const posts = await getPublishedPosts();
      
      // For now, sort by date (newest