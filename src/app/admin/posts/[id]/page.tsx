'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminSidebar from '@/components/admin/AdminSidebar';
import PostEditor from '@/components/admin/PostEditor';
import { supabase } from '@/lib/supabase';
import { Post } from '@/lib/types';

export default function EditPost() {
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPost() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) {
          setError('Post not found');
          return;
        }

        setPost(data);
      } catch (err) {
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadPost();
    }
  }, [params.id]);

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="flex h-screen bg-gray-50">
          <AdminSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !post) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="flex h-screen bg-gray-50">
          <AdminSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {error || 'Post not found'}
              </h2>
              <p className="text-gray-600">
                The post you're looking for doesn't exist or you don't have permission to edit it.
              </p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
              <p className="text-gray-600">Make changes to your blog post</p>
            </div>

            <PostEditor post={post} isEditing />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}