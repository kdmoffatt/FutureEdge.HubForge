import { registerSupportAgentRoutes } from './routes/support-agent.js';
import { registerNotificationsRoutes } from './routes/notifications.js';
import { registerBillingRoutes } from './routes/billing.js';
import { registerAuthRoutes } from './routes/auth.js';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { resolveTenantContext } from '@hubforge/tenancy';
import { registerHealthRoutes } from './routes/health.js';
import { registerTenancyRoutes } from './routes/tenancy.js';

const app = new Hono();
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const responseCache = new Map<string, { expiresAt: number; body: unknown }>();

function traceIdFromHeaders(req: Request): string {
  return req.headers.get('x-trace-id') ?? req.headers.get('x-request-id') ?? crypto.randomUUID();
}

app.use('*', async (c, next) => {
  const traceId = traceIdFromHeaders(c.req.raw);
  c.header('x-trace-id', traceId);
  c.header('x-request-id', traceId);
  c.header('x-content-type-options', 'nosniff');
  c.header('x-frame-options', 'DENY');
  c.header('referrer-policy', 'same-origin');

  const rateKey = c.req.header('x-forwarded-for') ?? c.req.header('x-real-ip') ?? 'local';
  const now = Date.now();
  const entry = requestCounts.get(rateKey) ?? { count: 0, resetAt: now + 60_000 };
  if (entry.resetAt < now) {
    entry.count = 0;
    entry.resetAt = now + 60_000;
  }
  entry.count += 1;
  requestCounts.set(rateKey, entry);
  if (entry.count > 300) {
    return c.json({ error: 'Too many requests' }, 429);
  }

  const authMode = process.env['AUTH_MODE'] ?? 'external';
  if (authMode === 'external' && c.req.path.startsWith('/v1') && c.req.path !== '/v1/tenancy/context') {
    const authz = c.req.header('authorization');
    if (!authz) {
      return c.json({ error: 'Missing Authorization header' }, 401);
    }
  }

  const tenantIdHeader = c.req.header('x-tenant-id');
  const environmentHeader = c.req.header('x-environment');
  const tenantContext = resolveTenantContext({
    ...(tenantIdHeader ? { tenantId: tenantIdHeader } : {}),
    ...(environmentHeader ? { environment: environmentHeader } : {}),
  });

  const cacheKey = c.req.method + ':' + c.req.path;
  if (c.req.method === 'GET') {
    const hit = responseCache.get(cacheKey);
    if (hit && hit.expiresAt > now) {
      return c.json(hit.body);
    }
  }

  (c as unknown as { set: (key: string, value: unknown) => void }).set('tenantContext', tenantContext);
  (c as unknown as { set: (key: string, value: unknown) => void }).set('traceId', traceId);
  const startedAt = Date.now();
  await next();

  if (c.req.method === 'GET' && c.res.ok && c.req.path === '/v1/tenancy/context') {
    const body = await c.res.clone().json().catch(() => undefined);
    if (body) {
      responseCache.set(cacheKey, { expiresAt: Date.now() + 15_000, body });
    }
  }

  const latencyMs = Date.now() - startedAt;
  console.log(JSON.stringify({
    level: 'info',
    traceId,
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    latencyMs,
  }));

  return c.res;
});

registerHealthRoutes(app);
registerTenancyRoutes(app);
registerSupportAgentRoutes(app);
registerNotificationsRoutes(app);
registerBillingRoutes(app);
registerAuthRoutes(app);

app.get('/openapi.json', (c) => {
  return c.json({
    openapi: '3.0.3',
    info: { title: 'HubForge API', version: '0.1.0' },
    paths: {
      '/health': { get: { summary: 'Health check' } },
      '/v1/tenancy/context': { get: { summary: 'Tenant context' } },
    },
  });
});

app.get('/metrics', (c) => {
  return c.text('hubforge_requests_total ' + requestCounts.size + '\n');
});

serve({
  fetch: app.fetch,
  port: Number(process.env['API_PORT'] ?? 4000),
});
