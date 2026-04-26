import { z } from 'zod';

export const devicesCreatedEvent = z.object({
  kind: z.literal('devices.v1.created'),
  tenantId: z.string(),
  organizationId: z.string().optional(),
  entityId: z.string(),
  ts: z.number(),
});

export const devicesUpdatedEvent = z.object({
  kind: z.literal('devices.v1.updated'),
  tenantId: z.string(),
  entityId: z.string(),
  ts: z.number(),
});
