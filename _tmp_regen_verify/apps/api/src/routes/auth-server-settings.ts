import type { Hono } from 'hono';
import { prisma } from '@hubforge/db';

export function registerAuthServerSettingsRoutes(app: Hono): void {
  app.get('/v1/settings/auth-server', async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    const settings = await prisma.authServerSettings.findUnique({ where: { tenantId } });
    return c.json({
      enabled: settings?.enabled ?? false,
      provider: settings?.provider ?? null,
      issuerUrl: settings?.issuerUrl ?? null,
      jwksUrl: settings?.jwksUrl ?? null,
      clientId: settings?.clientId ?? null,
      clientSecret: settings?.clientSecret ?? null,
      audience: settings?.audience ?? null,
    });
  });

  app.put('/v1/settings/auth-server', async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;

    const settings = await prisma.authServerSettings.upsert({
      where: { tenantId },
      update: {
        enabled: body['enabled'] === true,
        provider: typeof body['provider'] === 'string' ? body['provider'] : null,
        issuerUrl: typeof body['issuerUrl'] === 'string' ? body['issuerUrl'] : null,
        jwksUrl: typeof body['jwksUrl'] === 'string' ? body['jwksUrl'] : null,
        clientId: typeof body['clientId'] === 'string' ? body['clientId'] : null,
        clientSecret: typeof body['clientSecret'] === 'string' ? body['clientSecret'] : null,
        audience: typeof body['audience'] === 'string' ? body['audience'] : null,
      },
      create: {
        tenantId,
        enabled: body['enabled'] === true,
        provider: typeof body['provider'] === 'string' ? body['provider'] : null,
        issuerUrl: typeof body['issuerUrl'] === 'string' ? body['issuerUrl'] : null,
        jwksUrl: typeof body['jwksUrl'] === 'string' ? body['jwksUrl'] : null,
        clientId: typeof body['clientId'] === 'string' ? body['clientId'] : null,
        clientSecret: typeof body['clientSecret'] === 'string' ? body['clientSecret'] : null,
        audience: typeof body['audience'] === 'string' ? body['audience'] : null,
      },
    });

    return c.json(settings);
  });
}
