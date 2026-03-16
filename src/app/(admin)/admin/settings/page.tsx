'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

export default function AdminSettings() {
  const { user, loading: authLoading } = useAuth();
  const [autoSendNewsletter, setAutoSendNewsletter] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('autoSendNewsletter');
    if (saved !== null) {
      setAutoSendNewsletter(saved === 'true');
    }
  }, []);

  const handleSave = () => {
    setSaving(true);
    try {
      localStorage.setItem('autoSendNewsletter', String(autoSendNewsletter));
      setToast({ type: 'success', message: 'Settings saved successfully!' });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to save settings' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in"
          style={{
            backgroundColor: toast.type === 'success' ? 'var(--admin-success)' : 'var(--admin-danger)',
            color: 'white',
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--admin-text)' }}>
          Settings
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--admin-text-secondary)' }}>
          Configure your blog settings
        </p>
      </div>

      {/* Newsletter Settings */}
      <div className="admin-card p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--admin-text)' }}>
            Newsletter Settings
          </h2>
          <p className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
            Configure how newsletters are sent to your subscribers
          </p>
        </div>

        <div className="space-y-4">
          {/* Auto-send toggle */}
          <div className="flex items-start justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--admin-bg)' }}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5" style={{ color: 'var(--admin-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="font-medium" style={{ color: 'var(--admin-text)' }}>
                  Auto-send Newsletter on Publish
                </h3>
              </div>
              <p className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                Automatically send the full blog post as a newsletter to all active subscribers when you publish a new post.
              </p>
              <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--admin-accent-light)' }}>
                <p className="text-xs" style={{ color: 'var(--admin-text-secondary)' }}>
                  <strong>Note:</strong> When enabled, clicking "Publish" will immediately send the post to all subscribers. 
                  Make sure your post is ready before publishing!
                </p>
              </div>
            </div>
            <div className="ml-4">
              <button
                type="button"
                onClick={() => setAutoSendNewsletter(!autoSendNewsletter)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoSendNewsletter ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoSendNewsletter ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Email preview info */}
          <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-bg-secondary)' }}>
            <h4 className="font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--admin-text)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              What subscribers receive:
            </h4>
            <ul className="text-sm space-y-1.5" style={{ color: 'var(--admin-text-secondary)' }}>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--admin-success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Email subject: "New Post: [Your Post Title]"</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--admin-success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Full blog post content with formatting</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--admin-success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>"Read on website" link to your blog</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--admin-success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Unsubscribe link (required by law)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-4 border-t" style={{ borderColor: 'var(--admin-border)' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Email Configuration Info */}
      <div className="admin-card p-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--admin-text)' }}>
          Email Configuration
        </h2>
        <div className="space-y-3 text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: process.env.NEXT_PUBLIC_RESEND_API_KEY ? 'var(--admin-success)' : 'var(--admin-danger)' }} />
            <div>
              <p className="font-medium" style={{ color: 'var(--admin-text)' }}>Email Service</p>
              <p>Using Resend for email delivery</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: 'var(--admin-success)' }} />
            <div>
              <p className="font-medium" style={{ color: 'var(--admin-text)' }}>Batch Sending</p>
              <p>Emails sent in batches of 50 to comply with rate limits</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: 'var(--admin-success)' }} />
            <div>
              <p className="font-medium" style={{ color: 'var(--admin-text)' }}>Compliance</p>
              <p>All emails include unsubscribe links and proper headers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
