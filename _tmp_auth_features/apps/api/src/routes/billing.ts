import type { Hono } from 'hono';

export function registerBillingRoutes(app: Hono): void {
  app.get('/v1/billing/config', (c) => {
    return c.json({
      provider: process.env['BILLING_PROVIDER'] ?? 'stripe',
      currency: process.env['BILLING_CURRENCY'] ?? 'USD',
    });
  });
}
