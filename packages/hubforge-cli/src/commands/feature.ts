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
  | 'ui'
  | 'public-page'
  | 'tenant-module'
  | 'worker'
  | 'background-job'
  | 'auth-flow'
  | 'billing-module'
  | 'notifications-module'
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

function parseType(value: string): FeatureType {
  if (
    value === 'api'
    || value === 'api-resource'
      || value === 'admin-resource'
    || value === 'ui'
    || value === 'public-page'
    || value === 'tenant-module'
    || value === 'worker'
    || value === 'background-job'
    || value === 'auth-flow'
    || value === 'billing-module'
    || value === 'notifications-module'
    || value === 'ai-agent'
  ) {
    return value;
  }

  throw new Error(`Invalid feature type '${value}'. Use api, api-resource, admin-resource, ui, public-page, tenant-module, worker, background-job, auth-flow, billing-module, notifications-module, or ai-agent.`);
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

  const entry = `  { id: '${slug}', name: '${title}', route: '/app/${slug}' },`;
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
  return `export async function seed({ prisma, tenantIds }) {
  // Tenant-module seed hook for ${title}. Add module-specific baseline records here.
  if (!Array.isArray(tenantIds) || tenantIds.length === 0) {
    return;
  }

  await prisma.setting.upsert({
    where: { tenantId_module_key: { tenantId: tenantIds[0], module: '${slug}', key: 'enabled' } },
    update: { value: 'true', dataType: 'boolean' },
    create: { tenantId: tenantIds[0], module: '${slug}', key: 'enabled', value: 'true', dataType: 'boolean' },
  });
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
