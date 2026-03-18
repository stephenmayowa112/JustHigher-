'use client';

import { useState, useEffect, useCallback } from 'react';

interface Subscriber {
  id: string;
  email: string;
  active: boolean;
  created_at: string;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchSubscribers = useCallback(async () => {
    try {
      const res = await fetch('/api/subscribers');
      const data = await res.json();
      if (data.success) {
        setSubscribers(data.subscribers || []);
      } else {
        setError(data.error || 'Failed to load subscribers');
      }
    } catch {
      setError('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setAdding(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Subscriber added successfully');
        setNewEmail('');
        fetchSubscribers();
      } else {
        setError(data.error || 'Failed to add subscriber');
      }
    } catch {
      setError('Failed to add subscriber');
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    setTogglingId(id);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/subscribers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !active }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscribers(prev =>
          prev.map(s => s.id === id ? { ...s, active: !active } : s)
        );
        setMessage(`Subscriber ${!active ? 'activated' : 'deactivated'}`);
      } else {
        setError(data.error || 'Failed to update subscriber');
      }
    } catch {
      setError('Failed to update subscriber');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Delete ${email}? This cannot be undone.`)) return;
    setDeletingId(id);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/subscribers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscribers(prev => prev.filter(s => s.id !== id));
        setMessage('Subscriber deleted');
      } else {
        setError(data.error || 'Failed to delete subscriber');
      }
    } catch {
      setError('Failed to delete subscriber');
    } finally {
      setDeletingId(null);
    }
  };

  const activeCount = subscribers.filter(s => s.active).length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subscribers</h1>
        <p className="text-sm text-gray-500 mt-1">
          {subscribers.length} total · {activeCount} active
        </p>
      </div>

      {message && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Add subscriber */}
      <form onSubmit={handleAdd} className="mb-6 flex gap-2">
        <input
          type="email"
          value={newEmail}
          onChange={e => setNewEmail(e.target.value)}
          placeholder="Add subscriber email"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          disabled={adding}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {adding ? 'Adding...' : 'Add'}
        </button>
      </form>

      {/* Subscribers list */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No subscribers yet</div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Joined</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscribers.map(sub => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{sub.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      sub.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {sub.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => handleToggle(sub.id, sub.active)}
                      disabled={togglingId === sub.id}
                      className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                    >
                      {togglingId === sub.id ? '...' : sub.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(sub.id, sub.email)}
                      disabled={deletingId === sub.id}
                      className="text-xs px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === sub.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
