import type { Hono } from 'hono';

export function registerSupportAgentRoutes(app: Hono): void {
  app.post('/v1/support-agent/invoke', async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { prompt?: unknown };
    const prompt = typeof body.prompt === 'string' ? body.prompt : '';
    return c.json({
      ok: true,
      model: process.env['AI_MODEL'] ?? 'gpt-4o-mini',
      prompt,
    });
  });
}
