import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import { registerHealthRoutes } from './health.js';

describe('health route', () => {
  it('returns ok and service name', async () => {
    const app = new Hono();
    registerHealthRoutes(app);

    const res = await app.request('/health');
    const json = await res.json() as { ok: boolean; service: string };

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.service).toBe('hubforge-api');
  });
});
