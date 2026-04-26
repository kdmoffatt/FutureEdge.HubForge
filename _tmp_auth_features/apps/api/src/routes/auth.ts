import type { Hono } from 'hono';

export function registerAuthRoutes(app: Hono): void {
  app.get('/v1/auth/provider', (c) => {
    return c.json({
      mode: process.env['AUTH_MODE'] ?? 'external',
      provider: process.env['AUTH_PROVIDER'] ?? 'zitadel',
      issuer: process.env['AUTH_ISSUER_URL'] ?? 'http://localhost:8080',
    });
  });
}
