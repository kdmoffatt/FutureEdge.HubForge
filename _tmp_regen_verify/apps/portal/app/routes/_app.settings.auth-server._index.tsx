import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';

type AuthServerSettings = {
  enabled: boolean;
  provider: string;
  issuerUrl: string;
  jwksUrl: string;
  clientId: string;
  clientSecret: string;
  audience: string;
};

const DEFAULT_SETTINGS: AuthServerSettings = {
  enabled: false,
  provider: 'custom',
  issuerUrl: '',
  jwksUrl: '',
  clientId: '',
  clientSecret: '',
  audience: '',
};

export default function AuthServerSettingsPage() {
  const [settings, setSettings] = useState<AuthServerSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const tenantId = localStorage.getItem('tenantId') ?? '';
    const token = localStorage.getItem('token') ?? '';

    fetch(API + '/v1/settings/auth-server', {
      headers: {
        'x-tenant-id': tenantId,
        authorization: 'Bearer ' + token,
      },
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as Partial<AuthServerSettings>;
        setSettings({ ...DEFAULT_SETTINGS, ...data });
      })
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setMessage(null);
    const tenantId = localStorage.getItem('tenantId') ?? '';
    const token = localStorage.getItem('token') ?? '';

    const res = await fetch(API + '/v1/settings/auth-server', {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'x-tenant-id': tenantId,
        authorization: 'Bearer ' + token,
      },
      body: JSON.stringify(settings),
    });

    setSaving(false);
    setMessage(res.ok ? 'Saved settings.' : 'Failed to save settings.');
  }

  function update<K extends keyof AuthServerSettings>(key: K, value: AuthServerSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.75rem' }}>Auth Server Settings</h2>
      <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.9rem' }}>
        Database login always stays enabled. External auth can be configured here per tenant.
      </p>
      {loading ? (
        <p style={{ color: '#6b7280' }}>Loading...</p>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem', display: 'grid', gap: '0.75rem', maxWidth: 720 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#334155' }}>
            <input type="checkbox" checked={settings.enabled} onChange={(e) => update('enabled', e.currentTarget.checked)} />
            Enable external auth server for this tenant
          </label>

          <input value={settings.provider} onChange={(e) => update('provider', e.currentTarget.value)} placeholder="Provider (e.g. zitadel, auth0, keycloak, custom)" style={inputStyle} />
          <input value={settings.issuerUrl} onChange={(e) => update('issuerUrl', e.currentTarget.value)} placeholder="Issuer URL" style={inputStyle} />
          <input value={settings.jwksUrl} onChange={(e) => update('jwksUrl', e.currentTarget.value)} placeholder="JWKS URL (optional override)" style={inputStyle} />
          <input value={settings.clientId} onChange={(e) => update('clientId', e.currentTarget.value)} placeholder="Client ID" style={inputStyle} />
          <input value={settings.clientSecret} onChange={(e) => update('clientSecret', e.currentTarget.value)} placeholder="Client Secret" style={inputStyle} />
          <input value={settings.audience} onChange={(e) => update('audience', e.currentTarget.value)} placeholder="Audience" style={inputStyle} />

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button onClick={save} disabled={saving} style={{ border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', padding: '8px 14px', fontSize: '0.9rem', cursor: 'pointer' }}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            {message && <span style={{ fontSize: '0.85rem', color: '#475569' }}>{message}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: CSSProperties = {
  border: '1px solid #d1d5db',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: '0.9rem',
};
