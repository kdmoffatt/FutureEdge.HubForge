export type ThemePreset = 'ynex-light' | 'slate' | 'forest';

const PRESETS: Record<ThemePreset, Record<string, string>> = {
  'ynex-light': {
    '--hf-primary': '#845adf',
    '--hf-primary-hover': '#7045ce',
    '--hf-surface': '#ffffff',
    '--hf-surface-alt': '#f0f1f7',
    '--hf-foreground': '#2a2f3e',
    '--hf-muted': '#8c9097',
    '--hf-border': '#e9edf4',
    '--hf-sidebar': '#ffffff',
    '--hf-sidebar-text': '#536485',
    '--hf-sidebar-active': '#f0ebfc',
    '--hf-sidebar-active-text': '#845adf',
    '--hf-header': '#ffffff',
  },
  slate: {
    '--hf-primary': '#2563eb',
    '--hf-primary-hover': '#1d4ed8',
    '--hf-surface': '#0f172a',
    '--hf-surface-alt': '#020617',
    '--hf-foreground': '#e2e8f0',
    '--hf-muted': '#94a3b8',
    '--hf-border': '#1e293b',
    '--hf-sidebar': '#0b1220',
    '--hf-sidebar-text': '#93a2b8',
    '--hf-sidebar-active': '#1e293b',
    '--hf-sidebar-active-text': '#93c5fd',
    '--hf-header': '#0b1220',
  },
  forest: {
    '--hf-primary': '#15803d',
    '--hf-primary-hover': '#166534',
    '--hf-surface': '#ffffff',
    '--hf-surface-alt': '#ecfdf5',
    '--hf-foreground': '#14532d',
    '--hf-muted': '#3f7a57',
    '--hf-border': '#bbf7d0',
    '--hf-sidebar': '#f0fdf4',
    '--hf-sidebar-text': '#166534',
    '--hf-sidebar-active': '#dcfce7',
    '--hf-sidebar-active-text': '#14532d',
    '--hf-header': '#f0fdf4',
  },
};

export function applyStoredPortalTheme(): void {
  if (typeof document === 'undefined') {
    return;
  }

  const preset = (localStorage.getItem('hf_theme_preset') as ThemePreset | null) ?? 'ynex-light';
  const customCssUrl = localStorage.getItem('hf_theme_css_url') ?? '';
  applyPortalTheme(preset, customCssUrl);
}

export function applyPortalTheme(preset: ThemePreset, customCssUrl?: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const tokens = PRESETS[preset] ?? PRESETS['ynex-light'];
  Object.entries(tokens).forEach(([key, value]) => root.style.setProperty(key, value));

  localStorage.setItem('hf_theme_preset', preset);

  const existing = document.getElementById('hf-theme-external') as HTMLLinkElement | null;
  const href = (customCssUrl ?? '').trim();
  if (!href) {
    existing?.remove();
    localStorage.removeItem('hf_theme_css_url');
    return;
  }

  if (existing) {
    existing.href = href;
  } else {
    const link = document.createElement('link');
    link.id = 'hf-theme-external';
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
  localStorage.setItem('hf_theme_css_url', href);
}
