import { connect } from 'nats';

let cached: Awaited<ReturnType<typeof connect>> | null = null;

export async function createJetStreamClient() {
  if (!cached) {
    cached = await connect({ servers: process.env['NATS_URL'] ?? 'nats://localhost:4222' });
  }
  return cached.jetstream();
}
