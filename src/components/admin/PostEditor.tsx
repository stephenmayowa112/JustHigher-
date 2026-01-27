'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPost, updatePost, getPostBySlug } from '@/lib/blog';
import { Post } from '@/lib/types';

interface PostEditorProps {
  postId?: string;
  isEditing?: boolean;
}

export default function PostEditor({ postId, isEditing = false }: PostEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    slug: '',
    meta_description: '',
    tags: '',
    published_at: '',
  });

  useEffect(() => {
    if (isEditing && postId) {
      loadPost();
    }
  }, [isEditing, postId]);

  const loadPost = async () => {
    if (!postId) return;
    
    setLoading(true);
    try {
      const { getPostById } = await import('@/lib/blog');
      const post = await getPostById(postId);
      
      if (post) {
        setFormData({
          title: post.title,
          content: post.content,
          slug: post.slug,
          meta_description: post.meta_description || '',
          tags: post.tags?.join(', ') || '',
          published_at: post.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : '',
        });
      } else {
        setError('Post not found');
      }
    } catch (err) {
      setError('Failed to load post');
      console.error('Error loading post:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const postData = {
        title: formData.title,
        content: formData.content,
        slug: formData.slug,
        meta_description: formData.meta_description,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        published_at: isDraft ? null : (formData.published_at || new Date().toISOString()),
      };

      if (isEditing && postId) {
        await updatePost(postId, postData);
      } else {
        await createPost(postData);
      }

      router.push('/admin/posts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Post' : 'New Post'}
          </h1>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            ← Back
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              id="title"
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter post title"
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
              Slug *
            </label>
            <input
              type="text"
              id="slug"
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="post-url-slug"
            />
            <p className="mt-1 text-sm text-gray-500">
              URL-friendly version of the title. Will be used in the post URL.
            </p>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content *
            </label>
            <textarea
              id="content"
              required
              rows={20}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your post content here... You can use Markdown formatting."
            />
            <p className="mt-1 text-sm text-gray-500">
              Supports Markdown formatting. Line breaks will be preserved.
            </p>
          </div>

          {/* Meta Description */}
          <div>
            <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700">
              Meta Description
            </label>
            <textarea
              id="meta_description"
              rows={3}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.meta_description}
              onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
              placeholder="Brief description for SEO and social sharing"
            />
            <p className="mt-1 text-sm text-gray-500">
              Recommended: 150-160 characters. Used for SEO and social media previews.
            </p>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="motivation, growth, success"
            />
            <p className="mt-1 text-sm text-gray-500">
              Separate tags with commas. Used for categorization and search.
            </p>
          </div>

          {/* Publish Date */}
          <div>
            <label htmlFor="published_at" className="block text-sm font-medium text-gray-700">
              Publish Date
            </label>
            <input
              type="datetime-local"
              id="published_at"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.published_at}
              onChange={(e) => setFormData(prev => ({ ...prev, published_at: e.target.value }))}
            />
            <p className="mt-1 text-sm text-gray-500">
              Leave empty to save as draft. Set a future date to schedule publication.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={saving}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}