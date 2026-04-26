import type { Hono } from 'hono';

type Assets2Item = {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
};

const store = new Map<string, Assets2Item>();

export function registerAssets2Routes(app: Hono): void {
  app.get('/v1/assets2', (c) => {
    const items = Array.from(store.values());
    return c.json({ items, total: items.length, page: 1, limit: items.length || 20 });
  });

  app.get('/v1/assets2/:id', (c) => {
    const item = store.get(c.req.param('id'));
    if (!item) {
      return c.json({ error: 'Assets2 not found' }, 404);
    }
    return c.json(item);
  });

  app.post('/v1/assets2', async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { name?: unknown; status?: unknown };
    const now = new Date().toISOString();
    const item: Assets2Item = {
      id: crypto.randomUUID(),
      name: typeof body.name === 'string' && body.name.trim() ? body.name.trim() : 'Assets2',
      status: body.status === 'inactive' ? 'inactive' : 'active',
      createdAt: now,
      updatedAt: now,
    };
    store.set(item.id, item);
    return c.json(item, 201);
  });

  app.put('/v1/assets2/:id', async (c) => {
    const id = c.req.param('id');
    const existing = store.get(id);
    if (!existing) {
      return c.json({ error: 'Assets2 not found' }, 404);
    }
    const body = (await c.req.json().catch(() => ({}))) as { name?: unknown; status?: unknown };
    const updated: Assets2Item = {
      ...existing,
      name: typeof body.name === 'string' && body.name.trim() ? body.name.trim() : existing.name,
      status: body.status === 'inactive' ? 'inactive' : body.status === 'active' ? 'active' : existing.status,
      updatedAt: new Date().toISOString(),
    };
    store.set(id, updated);
    return c.json(updated);
  });

  app.delete('/v1/assets2/:id', (c) => {
    store.delete(c.req.param('id'));
    return c.body(null, 204);
  });
}
