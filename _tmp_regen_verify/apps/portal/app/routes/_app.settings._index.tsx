import { Link } from 'react-router';

export default function SettingsIndexPage() {
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.75rem' }}>Settings</h2>
      <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.9rem' }}>
        Configure authentication and platform behavior after logging in with database credentials.
      </p>
      <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 620 }}>
        <Link to="/settings/auth-server" style={{ textDecoration: 'none', border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', padding: '1rem' }}>
          <p style={{ fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem' }}>Auth Server</p>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Store OIDC provider settings in your tenant database.</p>
        </Link>
      </div>
    </div>
  );
}
