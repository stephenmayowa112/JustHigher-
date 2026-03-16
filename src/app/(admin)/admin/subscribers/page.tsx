'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAllSubscribers } from '@/lib/blog';
import { Subscriber } from '@/lib/types';
import { useAuth } from '@/components/auth/AuthProvider';

export default function AdminSubscribers() {
  const { user, loading: authLoading } = useAuth();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Add subscriber state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Action state
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<{ id: string; email: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadSubscribers();
    }
  }, [authLoading, user]);

  const loadSubscribers = async () => {
    try {
      const allSubscribers = await getAllSubscribers(1000);
      setSubscribers(allSubscribers);
    } catch (error) {
      console.error('Error loading subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setAddLoading(true);
    setAddError('');

    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        showToast('success', `Added ${newEmail.trim()}`);
        setNewEmail('');
        setShowAddForm(false);
        await loadSubscribers();
      } else {
        setAddError(data.error || 'Failed to add subscriber');
      }
    } catch {
      setAddError('Network error');
    } finally {
      setAddLoading(false);
    }
  };

  const handleToggleStatus = async (subscriber: Subscriber) => {
    setTogglingId(subscriber.id);
    try {
      const res = await fetch('/api/subscribers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subscriber.id, active: !subscriber.active }),
      });
      const data = await res.json();

      if (data.success) {
        showToast('success', `${subscriber.email} ${subscriber.active ? 'deactivated' : 'reactivated'}`);
        await loadSubscribers();
      } else {
        showToast('error', data.error || 'Failed to update');
      }
    } catch {
      showToast('error', 'Network error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setShowDeleteModal(null);
    try {
      const res = await fetch('/api/subscribers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();

      if (data.success) {
        showToast('success', 'Subscriber deleted');
        await loadSubscribers();
      } else {
        showToast('error', data.error || 'Failed to delete');
      }
    } catch {
      showToast('error', 'Network error');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredSubscribers = useMemo(() => {
    let result = [...subscribers];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(s => s.email.toLowerCase().includes(searchLower));
    }

    if (statusFilter === 'active') result = result.filter(s => s.active);
    if (statusFilter === 'inactive') result = result.filter(s => !s.active);

    return result;
  }, [subscribers, search, statusFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      total: subscribers.length,
      active: subscribers.filter(s => s.active).length,
      thisMonth: subscribers.filter(s => s.active && new Date(s.subscribed_at) >= thisMonth).length,
    };
  }, [subscribers]);

  const exportSubscribers = () => {
    const csvContent = [
      ['Email', 'Subscribed Date', 'Status', 'Source'].join(','),
      ...subscribers.map(sub => [
        sub.email,
        new Date(sub.subscribed_at).toLocaleDateString(),
        sub.active ? 'Active' : 'Inactive',
        sub.source || 'website'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `justhigher-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded animate-pulse" style={{ backgroundColor: 'var(--admin-border)' }} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--admin-border)' }} />
          ))}
        </div>
        <div className="h-64 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--admin-border)' }} />
      </div>
    );
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--admin-text)' }}>
            Subscribers
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--admin-text-secondary)' }}>
            Manage your newsletter subscribers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setShowAddForm(!showAddForm); setAddError(''); }} className="btn btn-accent">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Subscriber
          </button>
          <button onClick={exportSubscribers} className="btn btn-secondary">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Add Subscriber Form */}
      {showAddForm && (
        <div className="admin-card p-4 animate-fade-in">
          <form onSubmit={handleAddSubscriber} className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--admin-text-secondary)' }}>
                Email Address
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => { setNewEmail(e.target.value); setAddError(''); }}
                placeholder="subscriber@example.com"
                className="w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                style={{ backgroundColor: 'var(--admin-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}
                required
                autoFocus
              />
              {addError && (
                <p className="text-xs mt-1" style={{ color: 'var(--admin-danger)' }}>{addError}</p>
              )}
            </div>
            <button type="submit" disabled={addLoading} className="btn btn-accent" style={{ height: '38px' }}>
              {addLoading ? 'Adding...' : 'Add'}
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-ghost" style={{ height: '38px' }}>
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="stat-card-value">{stats.total}</p>
            <p className="stat-card-label">Total Subscribers</p>
          </div>
          <div className="stat-card-icon primary">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="stat-card-value">{stats.active}</p>
            <p className="stat-card-label">Active Subscribers</p>
          </div>
          <div className="stat-card-icon success">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="stat-card-value">{stats.thisMonth}</p>
            <p className="stat-card-label">New This Month</p>
          </div>
          <div className="stat-card-icon warning">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--admin-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500"
            style={{ backgroundColor: 'var(--admin-bg-secondary)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}
          />
        </div>
        <div className="flex rounded-lg p-1" style={{ backgroundColor: 'var(--admin-border-light)' }}>
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${statusFilter === f ? 'shadow-sm' : ''}`}
              style={{
                backgroundColor: statusFilter === f ? 'var(--admin-bg-secondary)' : 'transparent',
                color: statusFilter === f ? 'var(--admin-text)' : 'var(--admin-text-secondary)'
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Subscribers Table */}
      {filteredSubscribers.length === 0 ? (
        <div className="admin-card p-12 text-center">
          <svg className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--admin-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="font-medium mb-1" style={{ color: 'var(--admin-text)' }}>
            {search ? 'No subscribers found' : 'No subscribers yet'}
          </p>
          <p className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
            {search ? `No subscribers matching "${search}"` : 'Click "Add Subscriber" to add one manually, or wait for people to sign up via your newsletter form.'}
          </p>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Subscribed</th>
                  <th className="hidden md:table-cell">Source</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id}>
                    <td>
                      <span className="text-sm font-medium" style={{ color: 'var(--admin-text)' }}>
                        {subscriber.email}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                        {new Date(subscriber.subscribed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="hidden md:table-cell">
                      <span className="badge badge-tag">
                        {subscriber.source || 'website'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${subscriber.active ? 'badge-published' : 'badge-danger'}`}>
                        {subscriber.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        {/* Toggle Status */}
                        <button
                          onClick={() => handleToggleStatus(subscriber)}
                          disabled={togglingId === subscriber.id}
                          className="btn btn-ghost btn-sm"
                          title={subscriber.active ? 'Deactivate' : 'Reactivate'}
                        >
                          {togglingId === subscriber.id ? (
                            <span className="inline-block w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--admin-border)', borderTopColor: 'var(--admin-accent)' }} />
                          ) : subscriber.active ? (
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => setShowDeleteModal({ id: subscriber.id, email: subscriber.email })}
                          disabled={deletingId === subscriber.id}
                          className="btn btn-ghost btn-sm"
                          title="Delete subscriber"
                          style={{ color: 'var(--admin-danger)' }}
                        >
                          {deletingId === subscriber.id ? (
                            <span className="inline-block w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--admin-border)', borderTopColor: 'var(--admin-danger)' }} />
                          ) : (
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t text-center" style={{ borderColor: 'var(--admin-border)' }}>
            <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>
              Showing {filteredSubscribers.length} of {subscribers.length} subscribers
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: 'var(--admin-danger-light)' }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--admin-danger)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--admin-text)' }}>
                Delete Subscriber
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--admin-text-secondary)' }}>
                Are you sure you want to permanently delete <strong style={{ color: 'var(--admin-text)' }}>{showDeleteModal.email}</strong>? This cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setShowDeleteModal(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={() => handleDelete(showDeleteModal.id)} className="btn btn-danger">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}