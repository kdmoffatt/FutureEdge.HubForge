# ThemeForest Theme Integration Guide

HubForge uses CSS custom properties (`--hf-*` variables) for its entire design system.
Any third-party CSS theme — including commercial ThemeForest admin templates — can be wired
in through a lightweight **adapter file** that bridges the theme's tokens to HubForge's variables.

---

## How the Theme System Works

| Layer | What it does |
|---|---|
| `app/app.css` | Defines default `--hf-*` CSS variable values |
| `app/lib/theme.ts` | Applies built-in presets or external CSS at runtime |
| `app/lib/theme-registry.ts` | Your catalogue of installed custom/ThemeForest themes |
| `public/themes/` | Local CSS files served at `/themes/<filename>` |
| Theme Settings page | UI for switching themes at runtime |

---

## Compatibility with ThemeForest Themes

ThemeForest admin templates fall into two categories:

| Type | Examples | Works with HubForge? |
|---|---|---|
| CSS-variable-based | Vuexy, Ynex, Velzon | ✅ Full adapter support |
| Class-based only (Bootstrap) | Metronic, Datta | ✅ Partial — use token overrides |
| Tailwind utility-first | Modernize | ⚠️ May conflict with Tailwind v4 |

> **Important:** HubForge does **not** use a ThemeForest theme's HTML structure — only its CSS.
> The portal components keep their own markup; only colours, typography, and spacing are overridden.

---

## Step-by-Step: Installing a ThemeForest Theme

### Step 1 — Purchase and download

Buy the theme from ThemeForest. Download the "source files" package (`.zip`).

### Step 2 — Extract the compiled CSS

Inside the zip, locate the compiled/minified CSS file. It is usually at a path like:

```
<theme-name>/
  dist/
    css/
      app.min.css      ← This is the file you need
```

Copy that CSS file into:

```
apps/portal/public/themes/<theme-key>/
```

Example for Vuexy:

```
apps/portal/public/themes/vuexy/app.min.css
```

This file is then served at `/themes/vuexy/app.min.css` by the Vite dev server and production build.

### Step 3 — Create an adapter CSS file

Create a new file `apps/portal/public/themes/<theme-key>-adapter.css`.

Use `apps/portal/public/themes/example-themeforest-adapter.css` as your starting point.

The adapter file should:
1. `@import` the ThemeForest CSS
2. Override `--hf-*` variables using the theme's colours

**Example — Vuexy adapter** (`public/themes/vuexy-adapter.css`):

```css
/* Import the extracted ThemeForest CSS */
@import './vuexy/app.min.css';

/* Map Vuexy's CSS variables → HubForge variables */
:root {
  --hf-primary:             var(--bs-primary, #7367f0);
  --hf-primary-hover:       #6259cc;
  --hf-surface:             var(--bs-body-bg, #fff);
  --hf-surface-alt:         var(--bs-tertiary-bg, #f8f8f8);
  --hf-foreground:          var(--bs-body-color, #6e6b7b);
  --hf-muted:               var(--bs-secondary-color, #a8aaae);
  --hf-border:              var(--bs-border-color, #ebe9f1);
  --hf-sidebar:             #fff;
  --hf-sidebar-text:        #625f6e;
  --hf-sidebar-active:      #f0eeff;
  --hf-sidebar-active-text: var(--bs-primary, #7367f0);
  --hf-header:              #fff;
  --hf-font:                'Montserrat', ui-sans-serif, sans-serif;
}
```

> **Tip:** Open the ThemeForest theme's demo in your browser DevTools, inspect the `:root`
> block, and copy the variable names directly from there.

### Step 4 — Register the theme

Open `apps/portal/app/lib/theme-registry.ts` and add an entry to `CUSTOM_THEMES`:

```ts
export const CUSTOM_THEMES: CustomTheme[] = [
  {
    key: 'vuexy',
    name: 'Vuexy Admin',
    cssUrl: '/themes/vuexy-adapter.css',
    // Optional: hard-code token overrides applied on top of the CSS
    // (useful when the ThemeForest theme is purely class-based and
    //  doesn't expose CSS variables)
    tokens: {
      '--hf-primary': '#7367f0',
      '--hf-primary-hover': '#6259cc',
    },
  },
];
```

**Field reference:**

| Field | Required | Description |
|---|---|---|
| `key` | ✅ | Unique identifier — no spaces, lowercase |
| `name` | ✅ | Display name shown in the Theme Settings page |
| `cssUrl` | ✅ | Path to the adapter CSS. Use `/themes/...` for local files |
| `tokens` | optional | Additional `--hf-*` overrides applied after the CSS loads |

### Step 5 — Restart the dev server

```bash
pnpm --filter @hubforge/portal dev
```

Navigate to **Settings → Theme** in the portal. Your theme will appear under **Installed Themes**.
Click it to activate.

---

## Option B: Hosted CDN URL (No Local Files)

If a ThemeForest theme provides a CDN-hosted stylesheet you can skip Steps 1–2 and use
the URL directly:

```ts
{
  key: 'ynex-cdn',
  name: 'Ynex Light (CDN)',
  cssUrl: 'https://cdn.example.com/ynex/ynex.min.css',
}
```

Or paste the URL directly in the **External CSS URL** field on the Theme Settings page
without registering it — good for quick testing.

---

## HubForge CSS Variable Reference

| Variable | Controls |
|---|---|
| `--hf-primary` | Buttons, active states, links |
| `--hf-primary-hover` | Button hover / focus |
| `--hf-surface` | Card and panel background |
| `--hf-surface-alt` | Page / content area background |
| `--hf-foreground` | Primary text colour |
| `--hf-muted` | Secondary / placeholder text |
| `--hf-border` | Borders and dividers |
| `--hf-sidebar` | Sidebar background |
| `--hf-sidebar-text` | Sidebar link text |
| `--hf-sidebar-active` | Sidebar active item background |
| `--hf-sidebar-active-text` | Sidebar active item text |
| `--hf-header` | Top header background |
| `--hf-font` | Body font stack |

---

## Troubleshooting

**Theme applies but colours look wrong**
— Check that the adapter `:root` block is not being overridden by the ThemeForest theme's
own `:root` block. Add `!important` to specific variables if needed, or reorder the `@import`.

**ThemeForest CSS breaks portal layout**
— Some themes reset margins or change box-sizing globally. Add the following to the bottom
of your adapter file to restore HubForge's base styles:

```css
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; }
```

**Font doesn't change**
— Set `--hf-font` in your adapter and ensure the font is loaded (either via `@import url(...)` 
in the adapter or a `<link>` in `app/root.tsx`).

**Tailwind classes conflict with the ThemeForest theme**
— HubForge uses Tailwind v4. Class-name conflicts are rare since the portal components use
inline styles, not Tailwind utility classes, for layout. If you see conflicts, scope the
ThemeForest CSS to a wrapper class in the adapter.

---

## File Locations Summary

```
fieldops-workhub-local/
└── apps/portal/
    ├── public/
    │   └── themes/                          ← Drop ThemeForest CSS files here
    │       ├── example-themeforest-adapter.css
    │       └── vuexy/
    │           └── app.min.css
    └── app/
        └── lib/
            ├── theme.ts                     ← Core theme engine (do not edit)
            └── theme-registry.ts            ← Register your themes here ✏️
```
