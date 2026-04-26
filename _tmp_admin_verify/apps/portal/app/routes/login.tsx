export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <div style={{ width: '100%', maxWidth: 400, background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Sign in</h1>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>Sign in to your HubForge workspace.</p>
        <form method="post">
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Email</label>
            <input type="email" name="email" required style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Password</label>
            <input type="password" name="password" required style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, boxSizing: 'border-box' }} />
          </div>
          <button type="submit" style={{ width: '100%', background: '#2563eb', color: '#fff', padding: 10, borderRadius: 8, border: 'none', fontWeight: 500, cursor: 'pointer' }}>
            Sign in
          </button>
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>
          Wire up OIDC / Zitadel in lib/auth.server.ts when ready.
        </p>
      </div>
    </div>
  );
}
