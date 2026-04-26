import { z } from 'zod';
import { createJetStreamClient } from './jetstream.js';

export const domainEventSchema = z.object({
  kind: z.string(),
  tenantId: z.string(),
  entityId: z.string(),
  ts: z.number(),
  payload: z.record(z.unknown()).default({}),
});

export type DomainEvent = z.infer<typeof domainEventSchema>;

export async function publishDomainEvent(event: DomainEvent): Promise<void> {
  const js = await createJetStreamClient();
  const data = new TextEncoder().encode(JSON.stringify(event));
  await js.publish('events.' + event.kind, data);
}
