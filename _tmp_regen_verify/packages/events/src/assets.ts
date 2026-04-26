import { z } from 'zod';

export const assetsCreatedEvent = z.object({
  kind: z.literal('assets.v1.created'),
  tenantId: z.string(),
  organizationId: z.string().optional(),
  entityId: z.string(),
  ts: z.number(),
});

export const assetsUpdatedEvent = z.object({
  kind: z.literal('assets.v1.updated'),
  tenantId: z.string(),
  entityId: z.string(),
  ts: z.number(),
});
