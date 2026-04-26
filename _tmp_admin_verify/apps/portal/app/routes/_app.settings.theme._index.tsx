import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { applyPortalTheme, type ThemePreset } from '../lib/theme';

const presets: ThemePreset[] = ['ynex-light', 'slate', 'forest'];

export default function ThemeSettingsPage() {
  const [preset, setPreset] = useState<ThemePreset>('ynex-light');
  const [cssUrl, setCssUrl] = useState('');

  useEffect(() => {
    const storedPreset = (localStorage.getItem('hf_theme_preset') as ThemePreset | null) ?? 'ynex-light';
    const storedCssUrl = localStorage.getItem('hf_theme_css_url') ?? '';
    setPreset(storedPreset);
    setCssUrl(storedCssUrl);
  }, []);

  function save(e: FormEvent) {
    e.preventDefault();
    applyPortalTheme(preset, cssUrl);
  }

  return (
    <form onSubmit={save} style={{ maxWidth: 720, display: 'grid', gap: '0.75rem', background: 'var(--hf-surface)', border: '1px solid var(--hf-border)', borderRadius: 12, padding: '1rem' }}>
      <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Portal Theme</h2>
      <p style={{ margin: 0, color: 'var(--hf-muted)', fontSize: '0.9rem' }}>
        Pick a built-in admin theme or provide a third-party hosted CSS URL.
      </p>
      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--hf-muted)' }}>Theme preset</span>
        <select value={preset} onChange={(e) => setPreset(e.currentTarget.value as ThemePreset)} style={{ border: '1px solid var(--hf-border)', borderRadius: 8, padding: '8px 10px' }}>
          {presets.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--hf-muted)' }}>Third-party theme CSS URL (optional)</span>
        <input value={cssUrl} onChange={(e) => setCssUrl(e.currentTarget.value)} placeholder="https://example.com/admin-theme.css" style={{ border: '1px solid var(--hf-border)', borderRadius: 8, padding: '8px 10px' }} />
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" style={{ border: 'none', borderRadius: 8, background: 'var(--hf-primary)', color: '#fff', padding: '8px 14px', cursor: 'pointer' }}>Apply Theme</button>
        <button type="button" onClick={() => { setCssUrl(''); applyPortalTheme(preset, ''); }} style={{ border: '1px solid var(--hf-border)', borderRadius: 8, background: 'transparent', color: 'var(--hf-foreground)', padding: '8px 14px', cursor: 'pointer' }}>Clear External CSS</button>
      </div>
    </form>
  );
}
