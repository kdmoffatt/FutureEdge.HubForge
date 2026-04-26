import { useState } from 'react';
import { useNavigate } from 'react-router';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@local-demo.com');
  const [password, setPassword] = useState('Password1!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch(API + '/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      setLoading(false);
      setError('Invalid credentials or API unavailable.');
      return;
    }

    const data = (await res.json()) as { token: string; tenantId: string | null };
    localStorage.setItem('token', data.token);
    if (data.tenantId) localStorage.setItem('tenantId', data.tenantId);
    setLoading(false);
    navigate('/dashboard');
  }

  return (
  ? (process.env['PORTAL_URL'] ?? 'http://localhost:3001')
  : 'http://localhost:3001';

        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>Sign in with database credentials.</p>
        <form onSubmit={onSubmit}>
    <main style={{ minHeight: '100vh', background: '#fff', color: '#111827', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ borderBottom: '1px solid #f3f4f6', padding: '0 1.5rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1200, margin: '0 auto' }}>
            <input value={email} onChange={(e) => setEmail(e.currentTarget.value)} type="email" name="email" required style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, boxSizing: 'border-box' }} />
        <a href={PORTAL_URL} style={{ fontSize: 14, background: '#2563eb', color: '#fff', padding: '6px 16px', borderRadius: 8, textDecoration: 'none' }}>
          <div style={{ marginBottom: '1rem' }}>
        </a>
            <input value={password} onChange={(e) => setPassword(e.currentTarget.value)} type="password" name="password" required style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, boxSizing: 'border-box' }} />
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '6rem 1.5rem 4rem', textAlign: 'center' }}>
          {error && <p style={{ color: '#dc2626', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{error}</p>}
          <button disabled={loading} type="submit" style={{ width: '100%', background: '#2563eb', color: '#fff', padding: 10, borderRadius: 8, border: 'none', fontWeight: 500, cursor: 'pointer' }}>
            {loading ? 'Signing in...' : 'Sign in'}
        </p>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 700, lineHeight: 1.05, marginBottom: '1.5rem' }}>
        <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>Default: admin@local-demo.com / Password1!</p>
          Opinionated baseline with API, portal, AI, Docker, tenancy, and migrations already in place.
        </p>
        <a href={PORTAL_URL} style={{ display: 'inline-block', background: '#2563eb', color: '#fff', fontSize: '1.125rem', padding: '12px 32px', borderRadius: 12, textDecoration: 'none' }}>
          Get started
        </a>
      </section>
    </main>
  );
}
