import type { Hono } from 'hono';

type TenantContext = {
  tenantId: string;
  environment: string;
};

export function registerTenancyRoutes(app: Hono): void {
  app.get('/v1/tenancy/context', (c) => {
    const tenantContext = (c as unknown as { get: (key: string) => unknown }).get('tenantContext') as TenantContext | undefined;

    return c.json({
      tenantId: tenantContext?.tenantId ?? 'default-tenant',
      environment: tenantContext?.environment ?? 'local',
      mode: 'shared',
    });
  });
}
