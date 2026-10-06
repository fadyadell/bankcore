'use client';

import { useState, useEffect } from 'react';
import { getUsers } from '@/lib/apiClient';
import type { UserDto } from '@bankcore/contracts';

export default function AdminUsersPage() {
  const [data, setData] = useState<{ items: UserDto[]; total: number; page: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    let active = true;
    getUsers({ page, pageSize: 15, role: role || undefined, search }).then(res => {
      if (!active) return;
      if (res.data) setData(res.data);
      else setError(res.error?.message || 'Failed to load');
      setLoading(false);
    });
    return () => { active = false; };
  }, [page, search, role]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPage(1);
  };

  if (loading && !data) return <div className="loading-page"><div className="loading-spinner" /><p>Loading users...</p></div>;

  return (
    <div className="fade-in">
      <header className="page-header">
        <div>
          <h1>User Management</h1>
          <p className="text-secondary">Manage Customers, Employees, and Admins</p>
        </div>
      </header>

      {error && <div className="alert alert-error mb-6">{error}</div>}

      <div className="card mb-6">
        <form className="flex gap-4 mb-4" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by name or email..."
            className="input flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input w-48" value={role} onChange={e => { setRole(e.target.value); setLoading(true); setPage(1); }}>
            <option value="">All Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button type="submit" className="btn btn-primary">Filter</button>
        </form>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>User ID</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map(u => (
                <tr key={u.id}>
                  <td className="font-medium">{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-error' : u.role === 'EMPLOYEE' ? 'badge-warning' : 'badge-success'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td><code className="text-xs text-muted">{u.id}</code></td>
                  <td className="text-sm text-secondary">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {data?.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-8">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="pagination mt-4">
            <span>Page {data.page} of {data.totalPages} ({data.total} total)</span>
            <div className="pagination-buttons">
              <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => { setLoading(true); setPage(p => p - 1); }}>Previous</button>
              <button className="btn btn-ghost btn-sm" disabled={page >= data.totalPages} onClick={() => { setLoading(true); setPage(p => p + 1); }}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
