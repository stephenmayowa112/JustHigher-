'use client';

import { useState, useEffect, useMemo } from 'react';
import { getRecentSubscribers } from '@/lib/blog';
import { Subscriber } from '@/lib/types';

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    try {
      const allSubscribers = await getRecentSubscribers(1000);
      setSubscribers(allSubscribers);
    } catch (error) {
      console.error('Error loading subscribers:', error);
    } finally {
      setLoading(false);
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
        <button onClick={exportSubscribers} className="btn btn-primary">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

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
            {search ? `No subscribers matching "${search}"` : 'Subscribers will appear here when people sign up for your newsletter.'}
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
    </div>
  );
}