import { Link } from 'react-router';

export default function SettingsIndexPage() {
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.75rem' }}>Settings</h2>
      <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.9rem' }}>
        Configure authentication and platform behavior after logging in with database credentials.
      </p>
      <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 620 }}>
        <Link to="/settings/theme" style={{ textDecoration: 'none', border: '1px solid var(--hf-border)', borderRadius: 12, background: 'var(--hf-surface)', padding: '1rem' }}>
          <p style={{ fontWeight: 700, color: 'var(--hf-foreground)', margin: '0 0 0.25rem' }}>Theme</p>
          <p style={{ margin: 0, color: 'var(--hf-muted)', fontSize: '0.85rem' }}>Switch built-in admin themes or load a third-party CSS theme URL.</p>
        </Link>

      </div>
    </div>
  );
}
