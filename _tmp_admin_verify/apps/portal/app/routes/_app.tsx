import { Outlet, NavLink } from 'react-router';
import { useEffect } from 'react';
import type { LoaderFunctionArgs } from 'react-router';
import { applyStoredPortalTheme } from '../lib/theme';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  return { pathname: url.pathname };
}

export default function AppLayout() {
  useEffect(() => {
    applyStoredPortalTheme();
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--hf-surface-alt)', color: 'var(--hf-foreground)' }}>
      <aside style={{ width: 240, background: 'var(--hf-sidebar)', borderRight: '1px solid var(--hf-border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 1.25rem', borderBottom: '1px solid var(--hf-border)' }}>
          <span style={{ fontWeight: 700, color: 'var(--hf-primary)' }}>HubForge Portal</span>
        </div>
        <nav style={{ padding: '0.75rem 0.5rem', flex: 1, overflowY: 'auto' }}>
          {[{ href: '/dashboard', label: 'Dashboard' }, { href: '/settings', label: 'Settings' }, { href: '/settings/theme', label: 'Theme' }, { href: '/docs', label: 'API Docs' }].map(
            ({ href, label }) => (
              <NavLink
                key={href}
                to={href}
                style={({ isActive }) => ({
                  display: 'block',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  marginBottom: 4,
                  color: isActive ? 'var(--hf-sidebar-active-text)' : 'var(--hf-sidebar-text)',
                  background: isActive ? 'var(--hf-sidebar-active)' : 'transparent',
                })}
              >
                {label}
              </NavLink>
            ),
          )}
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid var(--hf-border)' }}>
          <button
            onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('tenantId'); window.location.href = '/login'; }}
            style={{ width: '100%', padding: '6px', borderRadius: 6, background: 'transparent', border: '1px solid var(--hf-border)', color: 'var(--hf-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: 56, background: 'var(--hf-header)', borderBottom: '1px solid var(--hf-border)', display: 'flex', alignItems: 'center', padding: '0 1.5rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Workspace</span>
        </header>
        <main style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
