# Adding API Routes and Endpoints in HubForge

This guide explains how to add new API routes and wire endpoints in both:

- HubForge framework templates (`packages/hubforge-cli/src/template-packs`)
- Existing generated projects (for example FieldOps)

## 1. Add a new endpoint to an existing project

1. Create a route module in `apps/api/src/routes`.
2. Export a `register...Routes(app: Hono)` function.
3. Register the route module in `apps/api/src/server.ts`.
4. Protect routes with `/v1/*` auth middleware unless endpoint is public.
5. Typecheck: `pnpm --filter @hubforge/api typecheck`.

Example route module:

```ts
import type { Hono } from 'hono';

export function registerWorkOrdersRoutes(app: Hono): void {
  app.get('/v1/work-orders', (c) => c.json({ items: [] }));

  app.post('/v1/work-orders', async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { title?: unknown };
    const title = typeof body.title === 'string' && body.title.trim() ? body.title.trim() : 'Untitled work order';
    return c.json({ id: crypto.randomUUID(), title }, 201);
  });
}
```

Then in `apps/api/src/server.ts`:

```ts
import { registerWorkOrdersRoutes } from './routes/work-orders.js';

registerWorkOrdersRoutes(app);
```

## 2. Add matching portal data loading

For authenticated portal pages, use client-side token reads from localStorage (the portal is configured with `ssr: false`).

Minimal fetch pattern:

```ts
const tenantId = localStorage.getItem('tenantId') ?? '';
const token = localStorage.getItem('token') ?? '';
const res = await fetch(API + '/v1/work-orders', {
  headers: {
    'x-tenant-id': tenantId,
    authorization: 'Bearer ' + token,
  },
});
```

## 3. Keep framework template parity

If you add routes directly in FieldOps and want all future generated projects to include them:

1. Update `apiServerTs()` and route template functions in:
   - `packages/hubforge-cli/src/template-packs/full-pack.ts`
2. Rebuild CLI:
   - `pnpm hubforge:build`
3. Regenerate test scaffold:
   - `pnpm hubforge init _tmp_regen_verify --force --template full --db sqlite --tenant shared`
4. Validate generated app:
   - `pnpm --filter @hubforge/api typecheck`
   - `pnpm --filter @hubforge/portal typecheck`

## 4. Use feature generator when possible

Prefer command-based generation for consistency:

- `hubforge feature add <name> --type api-resource`
- `hubforge feature add <name> --type admin-resource`

These auto-create route files and patch route registration.

## 5. OpenAPI docs behavior

`/openapi.json` is generated from registered Hono routes at runtime.

- Every route registered on `app` contributes a path/method entry.
- `/docs` renders Scalar API Reference using `/openapi.json`.

## 6. Public vs protected endpoints

Protected baseline:

- Any `/v1/*` route is authenticated by default.

Public exceptions are controlled in `publicV1Paths` in `apps/api/src/server.ts`.

When adding a public `/v1` endpoint, include it in `publicV1Paths`.

## 7. Common troubleshooting

- `401 Missing Authorization header`:
  - Ensure portal fetch includes `authorization: 'Bearer ' + token`.
  - Ensure token exists in localStorage.
- Endpoint returns 404:
  - Confirm route module is imported and `register...Routes(app)` is called.
- Endpoint appears in API but not docs:
  - Confirm route registration happens before serving requests.
  - Check `/openapi.json` response directly.
- Generated apps missing your new route:
  - You changed FieldOps only. Mirror changes into template functions in `full-pack.ts` and rebuild CLI.
