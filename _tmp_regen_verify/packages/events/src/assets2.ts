import { z } from 'zod';

export const assets2CreatedEvent = z.object({
  kind: z.literal('assets2.v1.created'),
  tenantId: z.string(),
  organizationId: z.string().optional(),
  entityId: z.string(),
  ts: z.number(),
});

export const assets2UpdatedEvent = z.object({
  kind: z.literal('assets2.v1.updated'),
  tenantId: z.string(),
  entityId: z.string(),
  ts: z.number(),
});
