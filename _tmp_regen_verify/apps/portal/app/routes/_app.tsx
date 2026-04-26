import { Outlet } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  return { pathname: url.pathname };
}

export default function AppLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f9fafb' }}>
      <aside style={{ width: 240, background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <span style={{ fontWeight: 600 }}>HubForge Portal</span>
        </div>
        <nav style={{ padding: '1rem', flex: 1 }}>
          {[{ href: '/dashboard', label: 'Dashboard' }, { href: '/settings', label: 'Settings' }, { href: '/docs', label: 'API Docs' }].map(
            ({ href, label }) => (
              <a key={href} href={href} style={{ display: 'block', padding: '8px 12px', borderRadius: 8, fontSize: '0.875rem', color: '#374151', textDecoration: 'none', marginBottom: 4 }}>
                {label}
              </a>
            ),
          )}
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb' }}>
          <button
            onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('tenantId'); window.location.href = '/login'; }}
            style={{ width: '100%', padding: '6px', borderRadius: 6, background: 'transparent', border: '1px solid #d1d5db', color: '#475569', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: 56, background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', padding: '0 1.5rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Workspace</span>
        </header>
        <main style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
