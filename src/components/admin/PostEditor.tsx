'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createPost, updatePost } from '@/lib/blog';
import dynamic from 'next/dynamic';

// Dynamically import React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

interface PostEditorProps {
  postId?: string;
  isEditing?: boolean;
}

export default function PostEditor({ postId, isEditing = false }: PostEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | ''>('');
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    slug: '',
    meta_description: '',
    tags: '',
    published_at: '',
  });

  // Quill toolbar configuration
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      [{ 'align': [] }],
      ['clean'],
    ],
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list',
    'blockquote', 'code-block',
    'link', 'image',
    'align',
  ];

  // Auto-save key for localStorage
  const autoSaveKey = postId ? `post-draft-${postId}` : 'post-draft-new';

  // Load post data or auto-saved draft
  useEffect(() => {
    if (isEditing && postId) {
      loadPost();
    } else {
      const savedDraft = localStorage.getItem(autoSaveKey);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setFormData(draft);
          setAutoSaveStatus('saved');
        } catch (e) {
          console.error('Failed to parse saved draft:', e);
        }
      }
    }
  }, [isEditing, postId, autoSaveKey]);

  // Auto-save effect
  useEffect(() => {
    if (formData.title || formData.content) {
      setAutoSaveStatus('unsaved');

      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        localStorage.setItem(autoSaveKey, JSON.stringify(formData));
        setAutoSaveStatus('saved');
      }, 2000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, autoSaveKey]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSubmit(new Event('submit') as unknown as React.FormEvent, true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit(new Event('submit') as unknown as React.FormEvent, false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formData]);

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

  const handleContentChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, content: value }));
  }, []);

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

      localStorage.removeItem(autoSaveKey);
      router.push('/admin/posts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(autoSaveKey);
    setFormData({
      title: '',
      content: '',
      slug: '',
      meta_description: '',
      tags: '',
      published_at: '',
    });
    setAutoSaveStatus('');
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 rounded w-1/4" style={{ backgroundColor: 'var(--admin-border)' }} />
        <div className="h-12 rounded" style={{ backgroundColor: 'var(--admin-border)' }} />
        <div className="h-96 rounded" style={{ backgroundColor: 'var(--admin-border)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>
            {isEditing ? 'Edit Post' : 'New Post'}
          </h1>
          {autoSaveStatus && (
            <span
              className="badge"
              style={{
                backgroundColor: autoSaveStatus === 'saved' ? 'var(--admin-success-light)' : 'var(--admin-warning-light)',
                color: autoSaveStatus === 'saved' ? 'var(--admin-success)' : 'var(--admin-warning)'
              }}
            >
              {autoSaveStatus === 'saved' ? '✓ Draft saved' : autoSaveStatus === 'saving' ? 'Saving...' : '● Unsaved'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`btn btn-sm ${showPreview ? 'btn-primary' : 'btn-secondary'}`}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            {showPreview ? 'Preview On' : 'Preview Off'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-secondary btn-sm"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back
          </button>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div
        className="text-xs flex gap-4"
        style={{ color: 'var(--admin-text-secondary)' }}
      >
        <span>⌘S Save Draft</span>
        <span>⌘Enter Publish</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
        {/* Title & Slug Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
              Title *
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{
                backgroundColor: 'var(--admin-bg-secondary)',
                borderColor: 'var(--admin-border)',
                color: 'var(--admin-text)'
              }}
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter post title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
              Slug *
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{
                backgroundColor: 'var(--admin-bg-secondary)',
                borderColor: 'var(--admin-border)',
                color: 'var(--admin-text)'
              }}
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="post-url-slug"
            />
          </div>
        </div>

        {/* Rich Text Editor with Optional Preview */}
        <div className={`grid gap-4 ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Editor */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
              Content *
            </label>
            <div
              className="rounded-lg overflow-hidden border"
              style={{ borderColor: 'var(--admin-border)' }}
            >
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={handleContentChange}
                modules={modules}
                formats={formats}
                placeholder="Start writing your post..."
                style={{ minHeight: '400px' }}
              />
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
                Preview
              </label>
              <div
                className="w-full min-h-[400px] px-4 py-3 rounded-lg border overflow-y-auto prose prose-sm max-w-none"
                style={{
                  backgroundColor: 'var(--admin-bg)',
                  borderColor: 'var(--admin-border)',
                  color: 'var(--admin-text)'
                }}
                dangerouslySetInnerHTML={{ __html: formData.content || '<span style="color: var(--admin-text-secondary)">Preview will appear here...</span>' }}
              />
            </div>
          )}
        </div>

        {/* Meta & Tags Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
              Meta Description
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              style={{
                backgroundColor: 'var(--admin-bg-secondary)',
                borderColor: 'var(--admin-border)',
                color: 'var(--admin-text)'
              }}
              value={formData.meta_description}
              onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
              placeholder="Brief description for SEO (150-160 chars)"
            />
            <p className="text-xs mt-1" style={{ color: 'var(--admin-text-secondary)' }}>
              {formData.meta_description.length}/160 characters
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
                Tags
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{
                  backgroundColor: 'var(--admin-bg-secondary)',
                  borderColor: 'var(--admin-border)',
                  color: 'var(--admin-text)'
                }}
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="motivation, growth, success"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
                Publish Date
              </label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{
                  backgroundColor: 'var(--admin-bg-secondary)',
                  borderColor: 'var(--admin-border)',
                  color: 'var(--admin-text)'
                }}
                value={formData.published_at}
                onChange={(e) => setFormData(prev => ({ ...prev, published_at: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--admin-border)' }}>
          <div className="flex gap-2">
            {autoSaveStatus === 'saved' && (
              <button
                type="button"
                onClick={clearDraft}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--admin-danger)' }}
              >
                Clear Draft
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={saving}
              className="btn btn-secondary disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary disabled:opacity-50"
            >
              {saving ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </div>
      </form>

      {/* Quill Theme Overrides */}
      <style jsx global>{`
        .ql-toolbar.ql-snow {
          background-color: var(--admin-bg);
          border-color: var(--admin-border) !important;
          border-radius: 8px 8px 0 0;
        }
        .ql-container.ql-snow {
          border-color: var(--admin-border) !important;
          border-radius: 0 0 8px 8px;
          font-size: 0.9375rem;
          font-family: system-ui, -apple-system, sans-serif;
          min-height: 400px;
        }
        .ql-editor {
          min-height: 400px;
          background-color: var(--admin-bg-secondary);
          color: var(--admin-text);
        }
        .ql-editor.ql-blank::before {
          color: var(--admin-text-muted);
          font-style: normal;
        }
        .ql-snow .ql-stroke {
          stroke: var(--admin-text-secondary);
        }
        .ql-snow .ql-fill,
        .ql-snow .ql-stroke.ql-fill {
          fill: var(--admin-text-secondary);
        }
        .ql-snow .ql-picker-label {
          color: var(--admin-text-secondary);
        }
        .ql-snow .ql-picker-options {
          background-color: var(--admin-bg-secondary);
          border-color: var(--admin-border) !important;
        }
        .ql-snow .ql-picker-item {
          color: var(--admin-text);
        }
        .ql-toolbar.ql-snow .ql-formats button:hover .ql-stroke,
        .ql-toolbar.ql-snow .ql-formats button.ql-active .ql-stroke {
          stroke: var(--admin-accent);
        }
        .ql-toolbar.ql-snow .ql-formats button:hover .ql-fill,
        .ql-toolbar.ql-snow .ql-formats button.ql-active .ql-fill {
          fill: var(--admin-accent);
        }
      `}</style>
    </div>
  );
}