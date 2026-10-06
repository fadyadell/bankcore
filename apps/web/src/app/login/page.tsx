'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const dest = user.role === 'ADMIN' ? '/admin' : user.role === 'EMPLOYEE' ? '/employee' : '/dashboard';
      router.replace(dest);
    }
  }, [loading, user, router]);

  if (!loading && user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const err = await login(email, password);
    setSubmitting(false);
    if (err) {
      setError(err);
    } else {
      // Will re-render and redirect
    }
  };

  const fillDemo = (role: string) => {
    if (role === 'customer') { setEmail('customer@bankcore.local'); setPassword('customer123'); }
    if (role === 'employee') { setEmail('employee@bankcore.local'); setPassword('employee123'); }
    if (role === 'admin') { setEmail('admin@bankcore.local'); setPassword('admin123'); }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>BankCore</h1>
        <p className="subtitle">Sign in to your account</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@bankcore.local"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Quick demo access:</p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => fillDemo('customer')}>Customer</button>
            <button className="btn btn-ghost btn-sm" onClick={() => fillDemo('employee')}>Employee</button>
            <button className="btn btn-ghost btn-sm" onClick={() => fillDemo('admin')}>Admin</button>
          </div>
        </div>
      </div>
    </div>
  );
}
