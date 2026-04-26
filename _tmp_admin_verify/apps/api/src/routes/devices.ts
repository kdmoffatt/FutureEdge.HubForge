import type { Hono } from 'hono';

type DevicesItem = {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
};

const store = new Map<string, DevicesItem>();

export function registerDevicesRoutes(app: Hono): void {
  app.get('/v1/devices', (c) => {
    const items = Array.from(store.values());
    return c.json({ items, total: items.length, page: 1, limit: items.length || 20 });
  });

  app.get('/v1/devices/:id', (c) => {
    const item = store.get(c.req.param('id'));
    if (!item) {
      return c.json({ error: 'Devices not found' }, 404);
    }
    return c.json(item);
  });

  app.post('/v1/devices', async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { name?: unknown; status?: unknown };
    const now = new Date().toISOString();
    const item: DevicesItem = {
      id: crypto.randomUUID(),
      name: typeof body.name === 'string' && body.name.trim() ? body.name.trim() : 'Devices',
      status: body.status === 'inactive' ? 'inactive' : 'active',
      createdAt: now,
      updatedAt: now,
    };
    store.set(item.id, item);
    return c.json(item, 201);
  });

  app.put('/v1/devices/:id', async (c) => {
    const id = c.req.param('id');
    const existing = store.get(id);
    if (!existing) {
      return c.json({ error: 'Devices not found' }, 404);
    }
    const body = (await c.req.json().catch(() => ({}))) as { name?: unknown; status?: unknown };
    const updated: DevicesItem = {
      ...existing,
      name: typeof body.name === 'string' && body.name.trim() ? body.name.trim() : existing.name,
      status: body.status === 'inactive' ? 'inactive' : body.status === 'active' ? 'active' : existing.status,
      updatedAt: new Date().toISOString(),
    };
    store.set(id, updated);
    return c.json(updated);
  });

  app.delete('/v1/devices/:id', (c) => {
    store.delete(c.req.param('id'));
    return c.body(null, 204);
  });
}
