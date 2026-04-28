# Background Jobs Guide

This guide explains how to define, register, enqueue, schedule, monitor, and test background jobs in generated HubForge projects.

## 1. Architecture Overview

Generated projects include:

- API routes for job lifecycle in `apps/api/src/routes/background-jobs.ts`
- DB service methods in `packages/db/src/jobs.ts`
- Worker loop in `packages/jobs/src/worker.ts`
- Schedule persistence model `JobSchedule` in Prisma schema

Primary scripts:

- `pnpm dev:jobs` runs the jobs worker
- `pnpm db:migrate` applies job schema changes

## 2. Creating a Job Handler

In generated projects, add your handler in `packages/jobs/src/worker.ts` or split by file under `packages/jobs/src/handlers`.

Recommended signature:

```ts
type JobHandler = (payload: any, deps: { tenantId: string | null }) => Promise<void>;
```

Example:

```ts
const sendReminderHandler: JobHandler = async (payload, deps) => {
  const tenantId = deps.tenantId;
  const customerId = String(payload.customerId ?? '');
  if (!customerId) throw new Error('customerId required');

  // Add your domain logic here.
  console.log('Sending reminder', { tenantId, customerId });
};
```

## 3. Registering a Job Type

Use a registry map so worker dispatch stays predictable:

```ts
const handlers: Record<string, JobHandler> = {
  'reminders.send': sendReminderHandler,
};
```

Then dispatch with a safe fallback:

```ts
const handler = handlers[job.jobType];
if (!handler) {
  throw new Error(`No handler registered for ${job.jobType}`);
}
await handler(payload, { tenantId: job.tenantId });
```

## 4. Enqueueing a Job

### API route

Use `POST /v1/jobs/:jobType/trigger`.

Example:

```bash
curl -X POST http://localhost:4000/v1/jobs/reminders.send/trigger \
  -H "content-type: application/json" \
  -H "authorization: Bearer <token>" \
  -H "x-tenant-id: <tenant-id>" \
  -d '{"payload":{"customerId":"cus_123"},"priority":1,"maxAttempts":3}'
```

### Server-side enqueue

Use `JobService.enqueue(...)` from `@hubforge/db`:

```ts
await JobService.enqueue({
  tenantId,
  jobType: 'reminders.send',
  payload: { customerId: 'cus_123' },
  priority: 1,
  scheduledFor: null,
  maxAttempts: 3,
  createdBy: userId,
});
```

## 5. Scheduling Recurring Jobs

Use `POST /v1/jobs/schedules` with cron-like input:

```json
{
  "name": "nightly-reminders",
  "jobType": "reminders.send",
  "cron": "*/30 * * * *",
  "timezone": "UTC",
  "payload": { "batch": true },
  "isActive": true
}
```

Scheduler behavior in generated worker:

- Reads due schedules
- Enqueues corresponding jobs
- Computes and stores next run time

## 6. Monitoring, Retry, and Cleanup

Monitoring endpoints:

- `GET /v1/jobs`
- `GET /v1/jobs/:jobId`
- `GET /v1/jobs/schedules/list`

Retry and cancel endpoints:

- `POST /v1/jobs/:jobId/retry`
- `POST /v1/jobs/:jobId/cancel`

Suggested policies:

- Keep `maxAttempts` low for non-idempotent tasks
- Capture structured failure reasons
- Add periodic cleanup for old completed jobs

## 7. Local Development Testing

1. Start dependencies and migrate:

```bash
pnpm infra:up
pnpm db:migrate
pnpm db:seed
```

2. Start API and jobs worker:

```bash
pnpm dev:api
pnpm dev:jobs
```

3. Trigger test jobs from portal or API endpoint.

4. Verify status transitions:

- `queued` -> `running` -> `completed`
- or `queued` -> `running` -> `failed` -> retry

## 8. Extension Points

You can extend generated jobs with:

- Module-specific handlers
- Tenant-aware throttling
- Event-driven enqueue hooks
- Additional dashboards in portal jobs pages

## 9. Known Limitations

Current default worker loop is polling-based and optimized for local development.
For higher throughput production workloads, consider queue backends and worker scaling strategies per tenant.
