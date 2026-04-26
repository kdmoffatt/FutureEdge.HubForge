import { z } from 'zod';

export const billingInvoiceCreatedEvent = z.object({
  kind: z.literal('billing.v1.invoice-created'),
  tenantId: z.string(),
  entityId: z.string(),
  ts: z.number(),
});

export const billingInvoicePaidEvent = z.object({
  kind: z.literal('billing.v1.invoice-paid'),
  tenantId: z.string(),
  entityId: z.string(),
  ts: z.number(),
});
