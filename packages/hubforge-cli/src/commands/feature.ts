import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getFlagValue, getPositionalArgs } from '../lib/args.js';
import { writeTextFile } from '../lib/fs.js';
import { getExecutionCwd } from '../lib/runtime.js';
import { loadHooks } from '../lib/plugins.js';

type FeatureType =
  | 'api'
  | 'api-resource'
  | 'admin-resource'
  | 'domain-resource'
  | 'ui'
  | 'public-page'
  | 'tenant-module'
  | 'worker'
  | 'background-job'
  | 'auth-flow'
  | 'billing-module'
  | 'notifications-module'
  | 'logging-module'
  | 'ai-agent';

export async function runFeatureCommand(args: string[]): Promise<void> {
  const [subcommand, ...rest] = args;

  if (subcommand !== 'add') {
    throw new Error('Unknown feature command. Usage: hubforge feature add <feature-name> [options]');
  }

  const positional = getPositionalArgs(rest);
  const featureName = positional[0];
  if (!featureName) {
    throw new Error('Missing feature name. Usage: hubforge feature add <feature-name> [options]');
  }

  const type = parseType(getFlagValue(rest, '--type') ?? 'api');
  const target = path.resolve(getExecutionCwd(), getFlagValue(rest, '--target') ?? '.');

  const hooks = await loadHooks(target);
  await hooks.beforeFeature?.({ cwd: target, command: 'feature', args, featureName, type, targetDir: target });

  await createFeature(featureName, type, target);
  await hooks.afterFeature?.({ cwd: target, command: 'feature', args, featureName, type, targetDir: target });
  console.log(`[hubforge] Feature '${featureName}' (${type}) added in ${target}`);
}

async function createFeature(featureName: string, type: FeatureType, targetDir: string): Promise<void> {
  const slug = toKebabCase(featureName);
  const pascal = toPascalCase(featureName);
  const title = toTitleCase(featureName);

  if (type === 'api') {
    await writeTextFile(
      path.join(targetDir, 'apps', 'api', 'src', 'routes', `${slug}.ts`),
      `import type { Hono } from 'hono';

export function register${pascal}Routes(app: Hono): void {
  app.get('/v1/${slug}', (c) => c.json({ items: [] }));
}
`,
    );

    await writeTextFile(
      path.join(targetDir, 'packages', 'events', 'src', `${slug}.ts`),
      `import { z } from 'zod';

export const ${toCamelCase(featureName)}CreatedEvent = z.object({
  kind: z.literal('${slug}.v1.created'),
  tenantId: z.string(),
  organizationId: z.string().optional(),
  entityId: z.string(),
  ts: z.number(),
});
`,
    );

    return;
  }

  if (type === 'api-resource') {
    await writeTextFile(
      path.join(targetDir, 'apps', 'api', 'src', 'routes', `${slug}.ts`),
      apiResourceRouteTs(slug, pascal),
    );
    await writeTextFile(
      path.join(targetDir, 'packages', 'events', 'src', `${slug}.ts`),
      apiResourceEventTs(slug, featureName),
    );
    await patchApiServerTs(targetDir, slug, pascal);
    return;
  }

  if (type === 'domain-resource') {
    await createDomainResource(featureName, slug, pascal, title, targetDir);
    return;
  }

  if (type === 'admin-resource') {
    await writeTextFile(
      path.join(targetDir, 'apps', 'api', 'src', 'routes', `${slug}.ts`),
      adminResourceRouteTs(slug, pascal),
    );
    await patchApiServerTs(targetDir, slug, pascal);
    await writeTextFile(
      path.join(targetDir, 'apps', 'portal', 'app', 'routes', `_app.${slug}._index.tsx`),
      adminResourceListPageTsx(pascal, title, slug),
    );
    await writeTextFile(
      path.join(targetDir, 'apps', 'portal', 'app', 'routes', `_app.${slug}.new.tsx`),
      adminResourceCreatePageTsx(pascal, title, slug),
    );
    await writeTextFile(
      path.join(targetDir, 'apps', 'portal', 'app', 'routes', `_app.${slug}.$id.tsx`),
      adminResourceDetailPageTsx(pascal, title, slug),
    );
    await writeTextFile(
      path.join(targetDir, 'packages', 'events', 'src', `${slug}.ts`),
      apiResourceEventTs(slug, featureName),
    );
    return;
  }

  if (type === 'ui') {
    // Creates an authenticated portal page route
    await writeTextFile(
      path.join(targetDir, 'apps', 'portal', 'app', 'routes', `_app.${slug}._index.tsx`),
      `export default function ${pascal}Page() {
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>${title}</h2>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '1.5rem' }}>
        <p style={{ color: '#6b7280' }}>Portal page for ${title}. Replace with your feature UI.</p>
      </div>
    </div>
  );
}
`,
    );
    return;
  }

  if (type === 'public-page') {
    // Creates a public site route (React Router 7 flatRoutes convention)
    await writeTextFile(
      path.join(targetDir, 'apps', 'ui', 'app', 'routes', `${slug}.tsx`),
      `export default function ${pascal}Page() {
  return (
    <main style={{ minHeight: '100vh', background: '#fff', color: '#111827', fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '6rem 1.5rem 4rem', textAlign: 'center' }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#2563eb', marginBottom: '1rem' }}>
          Public Experience
        </p>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 700, lineHeight: 1.05, marginBottom: '1.5rem' }}>
          ${title}
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#6b7280', maxWidth: 600, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          Public-facing page generated by HubForge CLI. Replace with your content.
        </p>
      </section>
    </main>
  );
}
`,
    );
    return;
  }

  if (type === 'tenant-module') {
    await createTenantModule(targetDir, slug, pascal, title);
    return;
  }

  if (type === 'auth-flow') {
    await writeTextFile(
      path.join(targetDir, 'apps', 'api', 'src', 'routes', `${slug}.ts`),
      authFlowRouteTs(slug, pascal),
    );
    await patchApiServerTs(targetDir, slug, pascal);
    await writeTextFile(
      path.join(targetDir, 'packages', 'auth-client', 'src', `${slug}.ts`),
      authFlowClientTs(featureName),
    );
    return;
  }

  if (type === 'billing-module') {
    await writeTextFile(
      path.join(targetDir, 'apps', 'api', 'src', 'routes', `${slug}.ts`),
      billingModuleRouteTs(slug, pascal),
    );
    await writeTextFile(
      path.join(targetDir, 'packages', 'events', 'src', `${slug}.ts`),
      billingModuleEventTs(slug, featureName),
    );
    await writeTextFile(
      path.join(targetDir, 'apps', 'portal', 'app', 'routes', `_app.${slug}._index.tsx`),
      billingModulePortalPageTsx(title),
    );
    await patchApiServerTs(targetDir, slug, pascal);
    return;
  }

  if (type === 'notifications-module') {
    await writeTextFile(
      path.join(targetDir, 'packages', 'notifications', 'package.json'),
      notificationsPackageJson(),
    );
    await writeTextFile(
      path.join(targetDir, 'packages', 'notifications', 'tsconfig.json'),
      notificationsTsConfig(),
    );
    await writeTextFile(
      path.join(targetDir, 'packages', 'notifications', 'src', 'index.ts'),
      notificationsIndexTs(),
    );
    await writeTextFile(
      path.join(targetDir, 'apps', 'api', 'src', 'routes', `${slug}.ts`),
      notificationsRouteTs(slug, pascal),
    );
    await writeTextFile(
      path.join(targetDir, 'apps', 'ai', `${slug}_worker.py`),
      notificationsWorkerPy(pascal),
    );
    await patchApiServerTs(targetDir, slug, pascal);
    return;
  }

  if (type === 'logging-module') {
    await writeTextFile(
      path.join(targetDir, 'apps', 'api', 'src', 'routes', `${slug}.ts`),
      loggingModuleRouteTs(slug, pascal),
    );
    await writeTextFile(
      path.join(targetDir, 'apps', 'portal', 'app', 'routes', `_app.${slug}._index.tsx`),
      loggingModulePortalViewerPageTsx(title, slug),
    );
    await writeTextFile(
      path.join(targetDir, 'apps', 'portal', 'app', 'routes', `_app.settings.${slug}._index.tsx`),
      loggingModulePortalSettingsPageTsx(title, slug),
    );
    await patchApiServerTs(targetDir, slug, pascal);
    return;
  }

  if (type === 'ai-agent') {
    await writeTextFile(
      path.join(targetDir, 'apps', 'ai', 'agents', `${slug}_agent.py`),
      aiAgentPy(pascal, title),
    );
    await writeTextFile(
      path.join(targetDir, 'apps', 'api', 'src', 'routes', `${slug}.ts`),
      aiAgentRouteTs(slug, pascal),
    );
    await patchApiServerTs(targetDir, slug, pascal);
    return;
  }

  if (type === 'background-job') {
    await writeTextFile(
      path.join(targetDir, 'apps', 'ai', `${slug}_worker.py`),
      `"""${pascal} background job worker generated by HubForge CLI."""


def run(payload: dict | None = None) -> None:
    data = payload or {}
    print('Running ${pascal} job with payload:', data)
`,
    );

    await writeTextFile(
      path.join(targetDir, 'apps', 'api', 'src', 'routes', `${slug}.ts`),
      `import type { Hono } from 'hono';

export function register${pascal}Routes(app: Hono): void {
  app.post('/v1/jobs/${slug}/trigger', async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { payload?: unknown };
    const job = {
      id: crypto.randomUUID(),
      type: '${slug}',
      payload: body.payload ?? null,
      status: 'queued',
      queuedAt: new Date().toISOString(),
    };
    return c.json(job, 202);
  });
}
`,
    );

    await patchApiServerTs(targetDir, slug, pascal);
    return;
  }

  await writeTextFile(
    path.join(targetDir, 'apps', 'ai', `${slug}_worker.py`),
    `"""${pascal} worker generated by HubForge CLI."""


def run() -> None:
    print('Running ${pascal} worker')
`,
  );
}

async function createDomainResource(
  _featureName: string,
  slug: string,
  pascal: string,
  title: string,
  targetDir: string,
): Promise<void> {
  // 1. Drizzle table schema appended to packages/db/src/fieldops.ts
  const fieldopsSchemaPath = path.join(targetDir, 'packages', 'db', 'src', 'fieldops.ts');
  let existingSchema = '';
  try {
    existingSchema = await readFile(fieldopsSchemaPath, 'utf8');
  } catch {
    existingSchema = domainSchemaHeader();
  }
  const tableExport = `export const fo${pascal}s`;
  if (!existingSchema.includes(tableExport)) {
    existingSchema = `${existingSchema.trimEnd()}\n\n${domainTableTs(slug, pascal, title)}\n`;
    await writeTextFile(fieldopsSchemaPath, existingSchema);
  }

  // 2. API route using Drizzle
  await writeTextFile(
    path.join(targetDir, 'apps', 'api', 'src', 'routes', `${slug}.ts`),
    domainResourceRouteTs(slug, pascal),
  );
  await patchApiServerTs(targetDir, slug, pascal);

  // 3. Portal pages (list + detail + new)
  await writeTextFile(
    path.join(targetDir, 'apps', 'portal', 'app', 'routes', `_app.${slug}._index.tsx`),
    domainResourceListPageTsx(pascal, title, slug),
  );
  await writeTextFile(
    path.join(targetDir, 'apps', 'portal', 'app', 'routes', `_app.${slug}.$id.tsx`),
    domainResourceDetailPageTsx(pascal, title, slug),
  );
  await writeTextFile(
    path.join(targetDir, 'apps', 'portal', 'app', 'routes', `_app.${slug}.new.tsx`),
    domainResourceNewPageTsx(pascal, title, slug),
  );
}

function domainSchemaHeader(): string {
  return `import { pgTable, text, boolean, timestamp, doublePrecision, index } from 'drizzle-orm/pg-core';
import { tenants } from './schema.js';

const now = () => new Date();
const genId = () => crypto.randomUUID();
`;
}

function domainTableTs(slug: string, pascal: string, title: string): string {
  const tableSlug = slug.replace(/-/g, '_');
  return `// ── ${title} ──────────────────────────────────────────────────────────────────
export const fo${pascal}s = pgTable('fo_${tableSlug}', {
  id: text('id').primaryKey().$defaultFn(genId),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').notNull().default('active'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date' }).$defaultFn(now).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).$defaultFn(now).notNull(),
}, (t) => [
  index('fo_${tableSlug}_tenant_idx').on(t.tenantId),
  index('fo_${tableSlug}_tenant_active_idx').on(t.tenantId, t.isActive),
]);`;
}

function domainResourceRouteTs(slug: string, pascal: string): string {
  return `import type { Hono } from 'hono';
import { db, fo${pascal}s } from '@hubforge/db';
import { eq, and, desc, ilike, sql } from 'drizzle-orm';

export function register${pascal}Routes(app: Hono): void {
  app.get('/v1/${slug}', async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    const search = c.req.query('search');
    const page = Math.max(1, Number(c.req.query('page') ?? 1));
    const limit = Math.min(100, Number(c.req.query('limit') ?? 20));
    const conditions = [eq(fo${pascal}s.tenantId, tenantId)];
    if (search) conditions.push(ilike(fo${pascal}s.name, \`%\${search}%\`));
    const [items, [{ total }]] = await Promise.all([
      db.select().from(fo${pascal}s).where(and(...conditions))
        .orderBy(desc(fo${pascal}s.createdAt)).limit(limit).offset((page - 1) * limit),
      db.select({ total: sql<number>\`count(*)::int\` }).from(fo${pascal}s).where(and(...conditions)),
    ]);
    return c.json({ items, total, page, limit });
  });

  app.get('/v1/${slug}/:id', async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    const item = await db.query.fo${pascal}s.findFirst({
      where: and(eq(fo${pascal}s.id, c.req.param('id')), eq(fo${pascal}s.tenantId, tenantId)),
    });
    if (!item) return c.json({ error: 'Not found' }, 404);
    return c.json(item);
  });

  app.post('/v1/${slug}', async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    if (typeof body['name'] !== 'string' || !body['name'].trim()) {
      return c.json({ error: 'name is required' }, 400);
    }
    const [item] = await db.insert(fo${pascal}s).values({
      tenantId,
      name: body['name'].trim(),
      description: typeof body['description'] === 'string' ? body['description'] : null,
      status: typeof body['status'] === 'string' ? body['status'] : 'active',
      updatedAt: new Date(),
    }).returning();
    return c.json(item, 201);
  });

  app.patch('/v1/${slug}/:id', async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof body['name'] === 'string') patch['name'] = body['name'].trim();
    if (typeof body['description'] === 'string') patch['description'] = body['description'];
    if (typeof body['status'] === 'string') patch['status'] = body['status'];
    if (typeof body['isActive'] === 'boolean') patch['isActive'] = body['isActive'];
    const [updated] = await db.update(fo${pascal}s).set(patch as never)
      .where(and(eq(fo${pascal}s.id, c.req.param('id')), eq(fo${pascal}s.tenantId, tenantId))).returning();
    if (!updated) return c.json({ error: 'Not found' }, 404);
    return c.json(updated);
  });

  app.delete('/v1/${slug}/:id', async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    const [deleted] = await db.delete(fo${pascal}s)
      .where(and(eq(fo${pascal}s.id, c.req.param('id')), eq(fo${pascal}s.tenantId, tenantId)))
      .returning({ id: fo${pascal}s.id });
    if (!deleted) return c.json({ error: 'Not found' }, 404);
    return c.json({ deleted: true });
  });
}
`;
}

function domainResourceListPageTsx(pascal: string, title: string, slug: string): string {
  return `import { useLoaderData, Link } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';

type ${pascal}Item = { id: string; name: string; description: string | null; status: string; isActive: boolean; createdAt: string };

export async function clientLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get('search') ?? '';
  const page = Number(url.searchParams.get('page') ?? '1');
  const tenantId = typeof window !== 'undefined' ? (localStorage.getItem('tenantId') ?? '') : '';
  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') ?? '') : '';
  try {
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    const res = await fetch(\`\${API}/v1/${slug}?\${params}\`, { headers: { 'x-tenant-id': tenantId, authorization: \`Bearer \${token}\` } });
    if (res.ok) {
      const data = (await res.json()) as { items: ${pascal}Item[]; total: number; page: number; limit: number };
      return { ...data, search, error: null };
    }
    return { items: [] as ${pascal}Item[], total: 0, page: 1, limit: 20, search, error: \`API \${res.status}\` };
  } catch {
    return { items: [] as ${pascal}Item[], total: 0, page: 1, limit: 20, search, error: 'API unavailable' };
  }
}

export default function ${pascal}ListPage() {
  const { items, total, page, limit, search, error } = useLoaderData<typeof clientLoader>();
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>${title}</h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>{total} record(s)</p>
        </div>
        <Link to="/${slug}/new" style={{ padding: '0.5rem 1.25rem', background: '#2563eb', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>+ New ${title}</Link>
      </div>
      <form method="get" style={{ marginBottom: '1rem', display: 'flex', gap: 8 }}>
        <input name="search" defaultValue={search} placeholder="Search..." style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.875rem', width: 280, outline: 'none' }} />
        <button type="submit" style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer', fontSize: '0.875rem' }}>Search</button>
      </form>
      {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '0.75rem' }}>⚠️ {error}</p>}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              {['Name', 'Status', 'Created', ''].map((h) => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>No ${title.toLowerCase()} records found.</td></tr>}
            {items.map((item) => (
              <tr key={item.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px' }}>
                  <p style={{ margin: '0 0 2px', fontWeight: 500, color: '#111827', fontSize: '0.875rem' }}>{item.name}</p>
                  {item.description && <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>{item.description}</p>}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600, background: item.isActive ? '#dcfce7' : '#f1f5f9', color: item.isActive ? '#166534' : '#64748b' }}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#6b7280' }}>{new Date(item.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '12px 16px' }}>
                  <Link to={\`/${slug}/\${item.id}\`} style={{ color: '#2563eb', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>View →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: '1rem', justifyContent: 'flex-end' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a key={p} href={\`?page=\${p}\${search ? \`&search=\${encodeURIComponent(search)}\` : ''}\`}
              style={{ padding: '4px 10px', borderRadius: 6, background: p === page ? '#2563eb' : '#f3f4f6', color: p === page ? '#fff' : '#374151', textDecoration: 'none', fontSize: '0.875rem' }}>{p}</a>
          ))}
        </div>
      )}
    </div>
  );
}
`;
}

function domainResourceDetailPageTsx(pascal: string, title: string, slug: string): string {
  return `import { useLoaderData, Link, useFetcher } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';

type ${pascal}Item = { id: string; name: string; description: string | null; status: string; isActive: boolean; createdAt: string; updatedAt: string };

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const tenantId = typeof window !== 'undefined' ? (localStorage.getItem('tenantId') ?? '') : '';
  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') ?? '') : '';
  try {
    const res = await fetch(\`\${API}/v1/${slug}/\${params['id']}\`, { headers: { 'x-tenant-id': tenantId, authorization: \`Bearer \${token}\` } });
    if (res.ok) return { item: (await res.json()) as ${pascal}Item, error: null };
    return { item: null, error: \`API \${res.status}\` };
  } catch {
    return { item: null, error: 'API unavailable' };
  }
}

export async function clientAction({ params, request }: LoaderFunctionArgs) {
  const tenantId = typeof window !== 'undefined' ? (localStorage.getItem('tenantId') ?? '') : '';
  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') ?? '') : '';
  const fd = await request.formData();
  const intent = fd.get('intent') as string;
  const headers = { 'x-tenant-id': tenantId, authorization: \`Bearer \${token}\`, 'content-type': 'application/json' };
  if (intent === 'toggle') {
    const item = JSON.parse(fd.get('item') as string) as ${pascal}Item;
    await fetch(\`\${API}/v1/${slug}/\${params['id']}\`, {
      method: 'PATCH', headers, body: JSON.stringify({ isActive: !item.isActive }),
    });
  }
  return null;
}

export default function ${pascal}DetailPage() {
  const { item, error } = useLoaderData<typeof clientLoader>();
  const fetcher = useFetcher();

  if (error || !item) {
    return (
      <div className="hf-detail-shell">
        <Link to="/${slug}" className="hf-back-link">Back to ${title}</Link>
        <p className="hf-page-error">Error: {error ?? 'Not found'}</p>
      </div>
    );
  }

  return (
    <div className="hf-detail-shell">
      <div className="hf-detail-head">
        <Link to="/${slug}" className="hf-back-link">Back to ${title}</Link>
        <h2 className="hf-detail-title">{item.name}</h2>
        <span className="hf-code-pill">{item.id.slice(0, 8)}</span>
        <span style={{ padding: '3px 12px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700, background: item.isActive ? '#dcfce7' : '#f1f5f9', color: item.isActive ? '#166534' : '#64748b' }}>
          {item.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="hf-card" style={{ maxWidth: 720 }}>
        <h3 className="hf-section-label">Overview</h3>
        <div className="hf-detail-row">
          <span className="hf-detail-key">Status</span>
          <span className="hf-detail-value">{item.status}</span>
        </div>
        {item.description && (
          <div className="hf-detail-row">
            <span className="hf-detail-key">Description</span>
            <span className="hf-detail-value">{item.description}</span>
          </div>
        )}
        <div className="hf-detail-row">
          <span className="hf-detail-key">Created</span>
          <span className="hf-detail-value">{new Date(item.createdAt).toLocaleString()}</span>
        </div>
        <div className="hf-detail-row">
          <span className="hf-detail-key">Updated</span>
          <span className="hf-detail-value">{new Date(item.updatedAt).toLocaleString()}</span>
        </div>
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: '0.35rem' }}>
          <fetcher.Form method="post">
            <input type="hidden" name="intent" value="toggle" />
            <input type="hidden" name="item" value={JSON.stringify(item)} />
            <button type="submit" className="hf-secondary-btn">
              {item.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </fetcher.Form>
        </div>
      </div>
    </div>
  );
}
`;
}

function domainResourceNewPageTsx(pascal: string, title: string, slug: string): string {
  return `import { useNavigate } from 'react-router';
import { useState } from 'react';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';

export default function ${pascal}NewPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const tenantId = localStorage.getItem('tenantId') ?? '';
    const token = localStorage.getItem('token') ?? '';
    try {
      const res = await fetch(\`\${API}/v1/${slug}\`, {
        method: 'POST',
        headers: { 'x-tenant-id': tenantId, authorization: \`Bearer \${token}\`, 'content-type': 'application/json' },
        body: JSON.stringify({ name: fd.get('name'), description: fd.get('description') || null }),
      });
      if (res.ok) {
        const created = (await res.json()) as { id: string };
        navigate(\`/${slug}/\${created.id}\`);
      } else {
        const err = (await res.json()) as { message?: string };
        setError(err.message ?? \`Error \${res.status}\`);
        setSubmitting(false);
      }
    } catch {
      setError('Network error - API unavailable');
      setSubmitting(false);
    }
  }

  return (
    <div className="hf-form-shell">
      <div className="hf-detail-head">
        <button type="button" onClick={() => navigate(-1)} className="hf-back-link" style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}>Back</button>
        <h2 className="hf-detail-title">Create ${title}</h2>
      </div>
      {error && <p className="hf-page-error">Warning: {error}</p>}
      <form onSubmit={handleSubmit} className="hf-card" style={{ display: 'grid', gap: '0.9rem' }}>
        <div className="hf-form-field">
          <label className="hf-form-label">Name *</label>
          <input className="hf-form-input" name="name" required placeholder="${title} name" />
        </div>
        <div className="hf-form-field">
          <label className="hf-form-label">Description</label>
          <textarea className="hf-form-textarea" name="description" rows={3} placeholder="Optional description..." />
        </div>
        <div className="hf-form-actions">
          <button type="button" onClick={() => navigate(-1)} className="hf-secondary-btn">Cancel</button>
          <button type="submit" disabled={submitting} className="hf-primary-btn">{submitting ? 'Creating...' : 'Create ${title}'}</button>
        </div>
      </form>
    </div>
  );
}
`;
}

function parseType(value: string): FeatureType {
  if (
    value === 'api'
    || value === 'api-resource'
    || value === 'admin-resource'
    || value === 'domain-resource'
    || value === 'ui'
    || value === 'public-page'
    || value === 'tenant-module'
    || value === 'worker'
    || value === 'background-job'
    || value === 'auth-flow'
    || value === 'billing-module'
    || value === 'notifications-module'
    || value === 'logging-module'
    || value === 'ai-agent'
  ) {
    return value;
  }

  throw new Error(`Invalid feature type '${value}'. Use: api, api-resource, admin-resource, domain-resource, ui, public-page, tenant-module, worker, background-job, auth-flow, billing-module, notifications-module, logging-module, or ai-agent.`);
}

function adminResourceRouteTs(slug: string, pascal: string): string {
  return `import type { Hono } from 'hono';

type ${pascal}Item = {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
};

const store = new Map<string, ${pascal}Item>();

export function register${pascal}Routes(app: Hono): void {
  app.get('/v1/${slug}', (c) => {
    const items = Array.from(store.values());
    return c.json({ items, total: items.length, page: 1, limit: items.length || 20 });
  });

  app.get('/v1/${slug}/:id', (c) => {
    const item = store.get(c.req.param('id'));
    if (!item) {
      return c.json({ error: '${pascal} not found' }, 404);
    }
    return c.json(item);
  });

  app.post('/v1/${slug}', async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { name?: unknown; status?: unknown };
    const now = new Date().toISOString();
    const item: ${pascal}Item = {
      id: crypto.randomUUID(),
      name: typeof body.name === 'string' && body.name.trim() ? body.name.trim() : '${pascal}',
      status: body.status === 'inactive' ? 'inactive' : 'active',
      createdAt: now,
      updatedAt: now,
    };
    store.set(item.id, item);
    return c.json(item, 201);
  });

  app.put('/v1/${slug}/:id', async (c) => {
    const id = c.req.param('id');
    const existing = store.get(id);
    if (!existing) {
      return c.json({ error: '${pascal} not found' }, 404);
    }
    const body = (await c.req.json().catch(() => ({}))) as { name?: unknown; status?: unknown };
    const updated: ${pascal}Item = {
      ...existing,
      name: typeof body.name === 'string' && body.name.trim() ? body.name.trim() : existing.name,
      status: body.status === 'inactive' ? 'inactive' : body.status === 'active' ? 'active' : existing.status,
      updatedAt: new Date().toISOString(),
    };
    store.set(id, updated);
    return c.json(updated);
  });

  app.delete('/v1/${slug}/:id', (c) => {
    store.delete(c.req.param('id'));
    return c.body(null, 204);
  });
}
`;
}

function adminResourceListPageTsx(pascal: string, title: string, slug: string): string {
  return `import { useEffect, useState } from 'react';
import { Link } from 'react-router';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';

type ${pascal}Item = { id: string; name: string; status: string; createdAt: string };

export default function ${pascal}ListPage() {
  const [items, setItems] = useState<${pascal}Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tenantId = localStorage.getItem('tenantId') ?? '';
    const token = localStorage.getItem('token') ?? '';
    fetch(API + '/v1/${slug}', { headers: { 'x-tenant-id': tenantId, authorization: 'Bearer ' + token } })
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data: { items?: ${pascal}Item[] }) => setItems(data.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>${title}</h2>
        <Link to="/${slug}/new" style={{ background: '#2563eb', color: '#fff', borderRadius: 8, textDecoration: 'none', padding: '8px 12px' }}>+ New</Link>
      </div>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={{ textAlign: 'left', padding: 12 }}>Name</th><th style={{ textAlign: 'left', padding: 12 }}>Status</th><th style={{ textAlign: 'left', padding: 12 }}>Created</th><th style={{ padding: 12 }} /></tr></thead>
          <tbody>
            {!loading && items.length === 0 && <tr><td colSpan={4} style={{ padding: 18, color: '#94a3b8' }}>No records</td></tr>}
            {items.map((item) => (
              <tr key={item.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: 12 }}>{item.name}</td>
                <td style={{ padding: 12 }}>{item.status}</td>
                <td style={{ padding: 12 }}>{new Date(item.createdAt).toLocaleString()}</td>
                <td style={{ padding: 12 }}><Link to="/${slug}/\${item.id}">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`;
}

function adminResourceCreatePageTsx(pascal: string, title: string, slug: string): string {
  return `import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';

export default function ${pascal}CreatePage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  async function submit(e: FormEvent) {
    e.preventDefault();
    const tenantId = localStorage.getItem('tenantId') ?? '';
    const token = localStorage.getItem('token') ?? '';
    const res = await fetch(API + '/v1/${slug}', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-tenant-id': tenantId, authorization: 'Bearer ' + token },
      body: JSON.stringify({ name, status }),
    });
    if (res.ok) {
      navigate('/${slug}');
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 560, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem', display: 'grid', gap: '0.75rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Create ${title}</h2>
      <input value={name} onChange={(e) => setName(e.currentTarget.value)} placeholder="Name" style={{ border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 10px' }} />
      <select value={status} onChange={(e) => setStatus(e.currentTarget.value === 'inactive' ? 'inactive' : 'active')} style={{ border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 10px' }}>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <button type="submit" style={{ border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', padding: '8px 12px' }}>Create</button>
    </form>
  );
}
`;
}

function adminResourceDetailPageTsx(pascal: string, title: string, slug: string): string {
  return `import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';

type ${pascal}Item = { id: string; name: string; status: string; createdAt: string; updatedAt: string };

export default function ${pascal}DetailPage() {
  const params = useParams();
  const [item, setItem] = useState<${pascal}Item | null>(null);

  useEffect(() => {
    if (!params.id) return;
    const tenantId = localStorage.getItem('tenantId') ?? '';
    const token = localStorage.getItem('token') ?? '';
    fetch(API + '/v1/${slug}/' + params.id, { headers: { 'x-tenant-id': tenantId, authorization: 'Bearer ' + token } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setItem(data));
  }, [params.id]);

  if (!item) {
    return <p style={{ color: '#94a3b8' }}>Loading ${title}...</p>;
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 0 }}>{item.name}</h2>
      <p>Status: {item.status}</p>
      <p>Created: {new Date(item.createdAt).toLocaleString()}</p>
      <p>Updated: {new Date(item.updatedAt).toLocaleString()}</p>
    </div>
  );
}
`;
}

async function patchApiServerTs(targetDir: string, slug: string, pascal: string): Promise<void> {
  const serverPath = path.join(targetDir, 'apps', 'api', 'src', 'server.ts');
  const importLine = `import { register${pascal}Routes } from './routes/${slug}.js';`;
  const registerLine = `register${pascal}Routes(app);`;
  const existing = await readFile(serverPath, 'utf8');

  let updated = existing;
  if (!updated.includes(importLine)) {
    updated = `${importLine}\n${updated}`;
  }
  if (!updated.includes(registerLine)) {
    updated = updated.replace('registerTenancyRoutes(app);', `registerTenancyRoutes(app);\n${registerLine}`);
  }

  await writeTextFile(serverPath, updated);
}

async function createTenantModule(targetDir: string, slug: string, pascal: string, title: string): Promise<void> {
  const moduleDir = path.join(targetDir, 'packages', 'modules', slug);
  await writeTextFile(path.join(moduleDir, 'package.json'), tenantModulePackageJson(slug));
  await writeTextFile(path.join(moduleDir, 'tsconfig.json'), tenantModuleTsConfig());
  await writeTextFile(path.join(moduleDir, 'src', 'index.ts'), tenantModuleIndexTs(slug, pascal, title));
  await writeTextFile(path.join(moduleDir, 'seed.mjs'), tenantModuleSeedScript(slug, title));

  await patchModulesRegistry(targetDir, slug, pascal, title);
  await patchPortalModulesRoute(targetDir, slug, pascal, title);
  await patchDbSeedRegistry(targetDir, slug, pascal);
}

async function patchDbSeedRegistry(targetDir: string, slug: string, pascal: string): Promise<void> {
  const registryPath = path.join(targetDir, 'packages', 'db', 'scripts', 'seed-registry.mjs');
  const seedFn = `${toCamelCase(pascal)}ModuleSeed`;
  const importLine = `import { seed as ${seedFn} } from '../../modules/${slug}/seed.mjs';`;
  const entryLine = `  ${seedFn},`;

  let existing = '';
  try {
    existing = await readFile(registryPath, 'utf8');
  } catch {
    existing = `const moduleSeeders = [\n];\n\nexport async function runModuleSeeders(context) {\n  for (const seed of moduleSeeders) {\n    await seed(context);\n  }\n}\n`;
  }

  let updated = existing;
  if (!updated.includes(importLine)) {
    updated = `${importLine}\n${updated}`;
  }

  if (!updated.includes(entryLine)) {
    if (updated.includes('const moduleSeeders = [')) {
      updated = updated.replace('const moduleSeeders = [', `const moduleSeeders = [\n${entryLine}`);
    } else {
      updated = `${updated}\n\nconst moduleSeeders = [\n${entryLine}\n];\n`;
    }
  }

  if (!updated.includes('export async function runModuleSeeders')) {
    updated = `${updated}\n\nexport async function runModuleSeeders(context) {\n  for (const seed of moduleSeeders) {\n    await seed(context);\n  }\n}\n`;
  }

  await writeTextFile(registryPath, updated);
}

async function patchModulesRegistry(targetDir: string, slug: string, pascal: string, title: string): Promise<void> {
  const registryPath = path.join(targetDir, 'packages', 'workflows', 'src', 'modules.ts');
  const importLine = `import { ${toCamelCase(pascal)}Module } from '../../modules/${slug}/src/index.js';`;
  const entryLine = `  ${toCamelCase(pascal)}Module,`;

  let existing = '';
  try {
    existing = await readFile(registryPath, 'utf8');
  } catch {
    existing = `export type TenantModule = {\n  id: string;\n  name: string;\n  route: string;\n};\n\nexport const tenantModules: TenantModule[] = [\n];\n`;
  }

  let updated = existing;
  if (!updated.includes(importLine)) {
    updated = `${importLine}\n${updated}`;
  }
  if (!updated.includes(entryLine)) {
    updated = updated.replace('export const tenantModules: TenantModule[] = [', `export const tenantModules: TenantModule[] = [\n${entryLine}`);
    if (!updated.includes('export const tenantModules: TenantModule[] = [')) {
      updated = `${updated}\n\nexport const tenantModules: TenantModule[] = [\n${entryLine}\n];\n`;
    }
  }

  // Ensure shape exists for older baseline
  if (!updated.includes('export type TenantModule =')) {
    updated = `export type TenantModule = {\n  id: string;\n  name: string;\n  route: string;\n};\n\n${updated}`;
  }

  await writeTextFile(registryPath, updated);
}

async function patchPortalModulesRoute(targetDir: string, slug: string, pascal: string, title: string): Promise<void> {
  const routePath = path.join(targetDir, 'apps', 'portal', 'app', 'routes', '_app.settings.modules._index.tsx');

  let existing = '';
  try {
    existing = await readFile(routePath, 'utf8');
  } catch {
    existing = `const moduleCards: Array<{ id: string; name: string; route: string }> = [\n];\n\nexport default function ModulesPage() {\n  return (\n    <div>\n      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Modules</h2>\n      <div style={{ display: 'grid', gap: '0.75rem' }}>\n        {moduleCards.map((item) => (\n          <div key={item.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '1rem' }}>\n            <p style={{ fontWeight: 600, margin: 0 }}>{item.name}</p>\n            <p style={{ color: '#6b7280', margin: '0.25rem 0 0' }}>{item.route}</p>\n          </div>\n        ))}\n      </div>\n    </div>\n  );\n}\n`;
  }

  const entry = `  { id: '${slug}', name: '${title}', route: '/${slug}' },`;
  if (existing.includes(entry)) {
    await writeTextFile(routePath, existing);
    return;
  }

  let updated = existing.replace('const moduleCards: Array<{ id: string; name: string; route: string }> = [', `const moduleCards: Array<{ id: string; name: string; route: string }> = [\n${entry}`);
  if (!updated.includes('const moduleCards: Array<{ id: string; name: string; route: string }> = [')) {
    updated = `${entry}\n${updated}`;
  }

  await writeTextFile(routePath, updated);
}

function apiResourceRouteTs(slug: string, pascal: string): string {
  return `import type { Hono } from 'hono';

export function register${pascal}Routes(app: Hono): void {
  app.get('/v1/${slug}', (c) => c.json({ items: [] }));

  app.post('/v1/${slug}', async (c) => {
    const payload = (await c.req.json().catch(() => ({}))) as { name?: unknown };
    const name = typeof payload.name === 'string' && payload.name.trim() ? payload.name : '${slug}';
    return c.json({ id: crypto.randomUUID(), name }, 201);
  });
}
`;
}

function apiResourceEventTs(slug: string, featureName: string): string {
  const camel = toCamelCase(featureName);
  return `import { z } from 'zod';

export const ${camel}CreatedEvent = z.object({
  kind: z.literal('${slug}.v1.created'),
  tenantId: z.string(),
  organizationId: z.string().optional(),
  entityId: z.string(),
  ts: z.number(),
});

export const ${camel}UpdatedEvent = z.object({
  kind: z.literal('${slug}.v1.updated'),
  tenantId: z.string(),
  entityId: z.string(),
  ts: z.number(),
});
`;
}

function authFlowRouteTs(slug: string, pascal: string): string {
  return `import type { Hono } from 'hono';

export function register${pascal}Routes(app: Hono): void {
  app.get('/v1/${slug}/provider', (c) => {
    return c.json({
      mode: process.env['AUTH_MODE'] ?? 'external',
      provider: process.env['AUTH_PROVIDER'] ?? 'zitadel',
      issuer: process.env['AUTH_ISSUER_URL'] ?? 'http://localhost:8080',
    });
  });
}
`;
}

function authFlowClientTs(featureName: string): string {
  const camel = toCamelCase(featureName);
  return `export type AuthProviderProfile = {
  mode: string;
  provider: string;
  issuer: string;
};

export async function get${toPascalCase(camel)}Profile(baseUrl: string): Promise<AuthProviderProfile> {
  const res = await fetch(baseUrl + '/v1/${toKebabCase(featureName)}/provider');
  if (!res.ok) {
    throw new Error('Failed to resolve auth provider profile');
  }
  return res.json() as Promise<AuthProviderProfile>;
}
`;
}

function billingModuleRouteTs(slug: string, pascal: string): string {
  return `import type { Hono } from 'hono';

export function register${pascal}Routes(app: Hono): void {
  app.get('/v1/${slug}/config', (c) => {
    return c.json({
      provider: process.env['BILLING_PROVIDER'] ?? 'stripe',
      currency: process.env['BILLING_CURRENCY'] ?? 'USD',
    });
  });
}
`;
}

function billingModuleEventTs(slug: string, featureName: string): string {
  const camel = toCamelCase(featureName);
  return `import { z } from 'zod';

export const ${camel}InvoiceCreatedEvent = z.object({
  kind: z.literal('${slug}.v1.invoice-created'),
  tenantId: z.string(),
  entityId: z.string(),
  ts: z.number(),
});

export const ${camel}InvoicePaidEvent = z.object({
  kind: z.literal('${slug}.v1.invoice-paid'),
  tenantId: z.string(),
  entityId: z.string(),
  ts: z.number(),
});
`;
}

function billingModulePortalPageTsx(title: string): string {
  return `export default function BillingModulePage() {
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>${title}</h2>
      <p style={{ color: '#6b7280' }}>
        Billing module scaffold is ready. Configure BILLING_PROVIDER and Stripe keys in environment files.
      </p>
    </div>
  );
}
`;
}

function notificationsPackageJson(): string {
  const pkg = {
    name: '@hubforge/notifications',
    version: '0.1.0',
    private: true,
    type: 'module',
    main: './dist/index.js',
    types: './dist/index.d.ts',
    scripts: {
      build: 'tsc -p tsconfig.json',
      typecheck: 'tsc --noEmit -p tsconfig.json',
    },
    devDependencies: {
      typescript: '^5.4.0',
    },
  };

  return `${JSON.stringify(pkg, null, 2)}\n`;
}

function notificationsTsConfig(): string {
  return `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src"]
}
`;
}

function notificationsIndexTs(): string {
  return `export type NotificationPayload = {
  channel: 'push' | 'email' | 'webhook';
  title: string;
  body: string;
  tenantId: string;
};

export function defaultNotificationProvider(): string {
  return 'firebase';
}
`;
}

function notificationsRouteTs(slug: string, pascal: string): string {
  return `import type { Hono } from 'hono';

export function register${pascal}Routes(app: Hono): void {
  app.get('/v1/${slug}/health', (c) => {
    return c.json({
      ok: true,
      provider: process.env['NOTIFICATION_PROVIDER'] ?? 'firebase',
      channel: process.env['NOTIFICATION_CHANNEL'] ?? 'push',
    });
  });
}
`;
}

function notificationsWorkerPy(pascal: string): string {
  return `"""${pascal} notifications worker."""


def run() -> None:
    print('Dispatching queued notifications via configured provider')
`;
}

function loggingModuleRouteTs(slug: string, pascal: string): string {
  return `import type { Hono } from 'hono';

export function register${pascal}Routes(app: Hono): void {
  app.get('/v1/${slug}/health', (c) => c.json({ ok: true, module: '${slug}' }));
  app.post('/v1/${slug}', async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { level?: unknown; message?: unknown; details?: unknown };
    const level = body.level === 'error' || body.level === 'warn' || body.level === 'debug' ? body.level : 'info';
    const message = typeof body.message === 'string' && body.message.trim() ? body.message : 'Log event';
    return c.json({ ok: true, level, message, details: body.details ?? null }, 201);
  });
}
`;
}

function loggingModulePortalViewerPageTsx(title: string, slug: string): string {
  return `import { useEffect, useState } from 'react';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';

type LogRecord = { id?: string; level?: string; message?: string; timestamp?: string };

export default function ${toPascalCase(slug)}ViewerPage() {
  const [rows, setRows] = useState<LogRecord[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token') ?? '';
    const tenantId = localStorage.getItem('tenantId') ?? '';
    fetch(API + '/v1/${slug}', { headers: { authorization: 'Bearer ' + token, 'x-tenant-id': tenantId } })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setRows(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.75rem' }}>${title} Viewer</h2>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff' }}>
        {rows.map((row, index) => (
          <div key={row.id ?? index} style={{ padding: '0.65rem 0.85rem', borderBottom: '1px solid #f1f5f9' }}>
            <strong>{row.level ?? 'info'}</strong> {row.message ?? 'log event'}
          </div>
        ))}
        {rows.length === 0 ? <p style={{ margin: 0, padding: '0.85rem', color: '#64748b' }}>No logs yet.</p> : null}
      </div>
    </div>
  );
}
`;
}

function loggingModulePortalSettingsPageTsx(title: string, slug: string): string {
  return `import { useState } from 'react';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';

export default function ${toPascalCase(slug)}SettingsPage() {
  const [status, setStatus] = useState('');

  async function save() {
    const token = localStorage.getItem('token') ?? '';
    const tenantId = localStorage.getItem('tenantId') ?? '';
    const res = await fetch(API + '/v1/${slug}', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token, 'x-tenant-id': tenantId },
      body: JSON.stringify({ level: 'info', message: '${title} settings saved' }),
    });
    setStatus(res.ok ? 'Saved' : 'Failed');
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.75rem' }}>${title} Settings</h2>
      <p style={{ color: '#64748b' }}>Configure defaults for logging module behavior.</p>
      <button onClick={save} style={{ border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', padding: '8px 12px', cursor: 'pointer' }}>Save</button>
      {status ? <p>{status}</p> : null}
    </div>
  );
}
`;
}

function aiAgentPy(pascal: string, title: string): string {
  return `"""${pascal} AI agent scaffold for ${title}."""


def run(prompt: str) -> dict[str, str]:
    return {
        'agent': '${pascal}',
        'input': prompt,
        'output': 'Placeholder response from generated agent scaffold.'
    }
`;
}

function aiAgentRouteTs(slug: string, pascal: string): string {
  return `import type { Hono } from 'hono';

export function register${pascal}Routes(app: Hono): void {
  app.post('/v1/${slug}/invoke', async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { prompt?: unknown };
    const prompt = typeof body.prompt === 'string' ? body.prompt : '';
    return c.json({
      ok: true,
      model: process.env['AI_MODEL'] ?? 'gpt-4o-mini',
      prompt,
    });
  });
}
`;
}

function tenantModulePackageJson(slug: string): string {
  const pkg = {
    name: `@hubforge/module-${slug}`,
    version: '0.1.0',
    private: true,
    type: 'module',
    main: './dist/index.js',
    types: './dist/index.d.ts',
    scripts: {
      build: 'tsc -p tsconfig.json',
      typecheck: 'tsc --noEmit -p tsconfig.json',
    },
    devDependencies: {
      typescript: '^5.4.0',
    },
  };

  return `${JSON.stringify(pkg, null, 2)}\n`;
}

function tenantModuleTsConfig(): string {
  return `{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src"]
}
`;
}

function tenantModuleIndexTs(slug: string, pascal: string, title: string): string {
  return `export const ${toCamelCase(pascal)}Module = {
  id: '${slug}',
  name: '${title}',
  route: '/app/${slug}',
  tenantScoped: true,
};

export type ${pascal}Module = typeof ${toCamelCase(pascal)}Module;
`;
}

function tenantModuleSeedScript(slug: string, title: string): string {
  return `import { db, settings } from '@hubforge/db';
import { and, eq } from 'drizzle-orm';

/**
 * Tenant-module seed hook for ${title}.
 * Enables the module in settings for each tenant.
 * @param {{ tenantIds: string[] }} context
 */
export async function seed({ tenantIds }) {
  if (!Array.isArray(tenantIds) || tenantIds.length === 0) return;

  for (const tenantId of tenantIds) {
    const key = 'modules.${slug}.enabled';
    const existing = await db.query.settings.findFirst({
      where: and(eq(settings.tenantId, tenantId), eq(settings.key, key)),
      columns: { id: true },
    });

    if (existing) {
      await db.update(settings)
        .set({ value: 'true', updatedAt: new Date() })
        .where(eq(settings.id, existing.id));
    } else {
      await db.insert(settings).values({
        tenantId,
        scope: 'tenant',
        module: '${slug}',
        key,
        value: 'true',
        dataType: 'boolean',
      });
    }
  }
}
`;
}

function toKebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase();
}

function toPascalCase(value: string): string {
  return toKebabCase(value)
    .split('-')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');
}

function toCamelCase(value: string): string {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toTitleCase(value: string): string {
  return toKebabCase(value)
    .split('-')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}
