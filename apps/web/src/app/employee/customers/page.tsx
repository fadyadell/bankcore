'use client';

import { useEffect, useState } from 'react';
import { getUsers } from '@/lib/apiClient';
import type { UserDto, PaginatedResponse } from '@bankcore/contracts';

export default function EmployeeCustomersPage() {
  const [data, setData] = useState<PaginatedResponse<UserDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    getUsers({ page, pageSize: 15, role: 'CUSTOMER', search }).then(res => {
      if (!active) return;
      if (res.data) setData(res.data);
      else setError(res.error?.message || 'Failed to load');
      setLoading(false);
    });
    return () => { active = false; };
  }, [page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPage(1);
  };

  if (loading && !data) return <div className="loading-page"><div className="loading-spinner" /><p>Loading customers...</p></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Customers</h1><p>Manage and view customer profiles.</p></div>
      </div>

      <div className="toolbar">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search by name or email..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      {!data || data.items.length === 0 ? (
        <div className="empty-state"><p>No customers found</p></div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead><tr>
                <th>ID</th><th>Name</th><th>Email</th><th>Joined</th>
              </tr></thead>
              <tbody>
                {data.items.map(user => (
                  <tr key={user.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{user.id.slice(0, 8)}...</td>
                    <td style={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <span>Page {data.page} of {data.totalPages} ({data.total} total)</span>
            <div className="pagination-buttons">
              <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => { setLoading(true); setPage(p => p - 1); }}>Previous</button>
              <button className="btn btn-ghost btn-sm" disabled={page >= data.totalPages} onClick={() => { setLoading(true); setPage(p => p + 1); }}>Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
