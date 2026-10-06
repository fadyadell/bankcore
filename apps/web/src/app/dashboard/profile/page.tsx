'use client';

import { useAuth } from '@/lib/auth';

export default function CustomerProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p>View your personal information.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'white'
          }}>
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{user.firstName} {user.lastName}</h2>
            <div className="badge badge-blue">{user.role}</div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-input" value={user.email} disabled />
        </div>
        
        <div className="form-group">
          <label className="form-label">First Name</label>
          <input className="form-input" value={user.firstName} disabled />
        </div>

        <div className="form-group">
          <label className="form-label">Last Name</label>
          <input className="form-input" value={user.lastName} disabled />
        </div>

        <div className="form-group">
          <label className="form-label">Member Since</label>
          <input className="form-input" value={new Date(user.createdAt).toLocaleDateString()} disabled />
        </div>

        <div style={{ marginTop: '2rem' }}>
          <button className="btn btn-primary" disabled>Update Profile (Coming Soon)</button>
        </div>
      </div>
    </div>
  );
}
