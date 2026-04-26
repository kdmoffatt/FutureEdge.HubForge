import { Queue, Worker, type JobsOptions } from 'bullmq';
import IORedis from 'ioredis';

type WebhookJob = {
  endpoint: string;
  payload: unknown;
  headers: Record<string, string> | undefined;
};

const connection = new IORedis(process.env['REDIS_URL'] ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});
const queueName = process.env['WEBHOOK_QUEUE_NAME'] ?? 'webhook-delivery';
const queue = new Queue<WebhookJob>(queueName, { connection });

const jobDefaults: JobsOptions = {
  attempts: Number(process.env['WEBHOOK_RETRY_ATTEMPTS'] ?? 5),
  backoff: {
    type: 'exponential',
    delay: Number(process.env['WEBHOOK_RETRY_DELAY_MS'] ?? 1_000),
  },
  removeOnComplete: true,
  removeOnFail: 100,
};

export async function enqueueWebhookDelivery(job: WebhookJob): Promise<string> {
  const queued = await queue.add('dispatch', job, jobDefaults);
  return queued.id ?? crypto.randomUUID();
}

async function dispatchWebhook(job: WebhookJob): Promise<void> {
  const res = await fetch(job.endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(job.headers ?? {}),
    },
    body: JSON.stringify(job.payload),
  });

  if (!res.ok) {
    throw new Error('Webhook delivery failed: ' + res.status + ' ' + res.statusText);
  }
}

export function startWebhookWorker(): void {
  const enabled = (process.env['BACKGROUND_JOB_BACKEND'] ?? 'redis').toLowerCase() === 'redis';
  if (!enabled) {
    return;
  }

  const worker = new Worker<WebhookJob>(
    queueName,
    async (job) => {
      await dispatchWebhook(job.data);
    },
    { connection },
  );

  worker.on('failed', (job, error) => {
    console.error('[hubforge][webhook] job failed', {
      id: job?.id,
      attemptsMade: job?.attemptsMade,
      error: error.message,
    });
  });
}
