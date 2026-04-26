import type { Hono } from 'hono';

export function registerNotificationsRoutes(app: Hono): void {
  app.get('/v1/notifications/health', (c) => {
    return c.json({
      ok: true,
      provider: process.env['NOTIFICATION_PROVIDER'] ?? 'firebase',
      channel: process.env['NOTIFICATION_CHANNEL'] ?? 'push',
    });
  });
}
