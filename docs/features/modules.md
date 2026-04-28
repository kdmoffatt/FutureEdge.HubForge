# Feature: Modules and Tenant Module Registry

## Purpose and Scope

Modules extend platform capabilities and tenant experiences through generated packages, routes, and admin surfaces.

## Installation via CLI

Create module scaffolds:

- `hubforge feature add inventory --type tenant-module`
- `hubforge feature add dispatch-board --type tenant-module`

## Generated Structure

Per module:

- `packages/modules/<slug>/package.json`
- `packages/modules/<slug>/src/index.ts`
- `packages/modules/<slug>/seed.mjs`

Patched files:

- `packages/workflows/src/modules.ts`
- `apps/portal/app/routes/_app.settings.modules._index.tsx`
- `packages/db/scripts/seed-registry.mjs`

## Runtime and Navigation

The modules page should list installed modules and provide links to module pages.

Recommended Setting keys:

- `modules.<moduleId>.enabled`
- `modules.<moduleId>.config`

## API and Extension Points

Use `SettingsService` APIs to read/write per-tenant module enablement and config.

## Known Limitations

Baseline module enable/disable route gating requires explicit integration in API route registration logic.
