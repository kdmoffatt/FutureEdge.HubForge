import { registerAssets2Routes } from './routes/assets2.js';
import { registerAssetsRoutes } from './routes/assets.js';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { requireAuth } from './lib/auth.js';
import { sendPushNotification } from './lib/notifications.js';
import { enqueueWebhookDelivery, startWebhookWorker } from './lib/webhook-queue.js';
import { resolveTenantContext } from '@hubforge/tenancy';
import { registerHealthRoutes } from './routes/health.js';
import { registerTenancyRoutes } from './routes/tenancy.js';
import { registerAuthRoutes } from './routes/auth.js';


const app = new Hono();
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const responseCache = new Map<string, { expiresAt: number; body: unknown }>();
const publicV1Paths = new Set([
  '/v1/tenancy/context',
  '/v1/auth/provider',
  '/v1/auth/login',
  '/v1/auth/register',
  '/v1/auth/me',
]);

app.use(
  '*',
  cors({
    origin: (origin) => origin ?? '*',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'x-environment', 'x-trace-id', 'x-request-id'],
    exposeHeaders: ['x-trace-id', 'x-request-id'],
    maxAge: 86_400,
  }),
);

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

  const authMode = process.env['AUTH_MODE'] ?? 'local';
  if (authMode === 'external' && c.req.path.startsWith('/v1') && !publicV1Paths.has(c.req.path)) {
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
registerAssets2Routes(app);
registerAssetsRoutes(app);
registerAuthRoutes(app);

app.use('/v1/*', async (c, next) => {
  if (publicV1Paths.has(c.req.path)) {
    await next();
    return;
  }
  await requireAuth(c, next);
});

app.post('/v1/notifications/push', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as {
    token?: unknown;
    title?: unknown;
    body?: unknown;
    data?: unknown;
  };

  if (typeof body.token !== 'string' || typeof body.title !== 'string' || typeof body.body !== 'string') {
    return c.json({ error: 'token, title and body are required' }, 400);
  }

  const messageId = await sendPushNotification({
    token: body.token,
    notification: { title: body.title, body: body.body },
    data: typeof body.data === 'object' && body.data ? (body.data as Record<string, string>) : undefined,
  });

  return c.json({ queued: false, messageId });
});

app.post('/v1/webhooks/dispatch', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as {
    endpoint?: unknown;
    payload?: unknown;
    headers?: unknown;
  };

  if (typeof body.endpoint !== 'string' || !body.payload) {
    return c.json({ error: 'endpoint and payload are required' }, 400);
  }

  const jobId = await enqueueWebhookDelivery({
    endpoint: body.endpoint,
    payload: body.payload,
    headers: typeof body.headers === 'object' && body.headers ? (body.headers as Record<string, string>) : undefined,
  });

  return c.json({ queued: true, jobId });
});

app.get('/', (c) => c.redirect('/docs'));

function openApiFromHonoRoutes() {
  const honoApp = app as unknown as { routes?: Array<{ method: string; path: string }> };
  const paths: Record<string, Record<string, unknown>> = {};

  for (const route of honoApp.routes ?? []) {
    const method = route.method.toLowerCase();
    if (method === 'options') {
      continue;
    }

    const normalizedPath = route.path.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
    const pathEntry = paths[normalizedPath] ?? {};
    pathEntry[method] = {
      summary: method.toUpperCase() + ' ' + normalizedPath,
      responses: {
        '200': { description: 'Success response' },
      },
    };
    paths[normalizedPath] = pathEntry;
  }

  return {
    openapi: '3.1.0',
    info: { title: 'HubForge API', version: '0.1.0', description: 'Generated from Hono routes' },
    servers: [{ url: 'http://localhost:4000', description: 'Local API' }],
    jsonSchemaDialect: 'https://json-schema.org/draft/2020-12/schema',
    paths,
  };
}

app.get('/openapi.json', (c) => {
  return c.json(openApiFromHonoRoutes());
});

app.get('/docs', (c) =>
  c.html([
    '<!doctype html>',
    '<html lang="en">',
    '  <head>',
    '    <meta charset="utf-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1" />',
    '    <title>HubForge API Reference</title>',
    '    <style>body { margin: 0; }</style>',
    '  </head>',
    '  <body>',
    '    <script id="api-reference" data-url="/openapi.json"></script>',
    '    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@latest/dist/browser/standalone.js" crossorigin></script>',
    '  </body>',
    '</html>',
  ].join('')),
);

app.get('/metrics', (c) => {
  return c.text('hubforge_requests_total ' + requestCounts.size + '\n');
});

serve({
  fetch: app.fetch,
  port: Number(process.env['API_PORT'] ?? 4000),
});

startWebhookWorker();
