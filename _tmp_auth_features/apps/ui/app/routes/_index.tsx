const PORTAL_URL = typeof process !== 'undefined'
  ? (process.env['PORTAL_URL'] ?? 'http://localhost:3001')
  : 'http://localhost:3001';

export default function LandingPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#fff', color: '#111827', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ borderBottom: '1px solid #f3f4f6', padding: '0 1.5rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1200, margin: '0 auto' }}>
        <span style={{ fontWeight: 600 }}>HubForge</span>
        <a href={PORTAL_URL} style={{ fontSize: 14, background: '#2563eb', color: '#fff', padding: '6px 16px', borderRadius: 8, textDecoration: 'none' }}>
          Sign in
        </a>
      </nav>
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '6rem 1.5rem 4rem', textAlign: 'center' }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#2563eb', marginBottom: '1rem' }}>
          AI-First Application Framework
        </p>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 700, lineHeight: 1.05, marginBottom: '1.5rem' }}>
          Ship multi-tenant products faster with HubForge.
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#6b7280', maxWidth: 600, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          Opinionated baseline with API, portal, AI, Docker, tenancy, and migrations already in place.
        </p>
        <a href={PORTAL_URL} style={{ display: 'inline-block', background: '#2563eb', color: '#fff', fontSize: '1.125rem', padding: '12px 32px', borderRadius: 12, textDecoration: 'none' }}>
          Get started
        </a>
      </section>
    </main>
  );
}
