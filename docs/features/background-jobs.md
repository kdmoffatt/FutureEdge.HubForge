# Feature: Background Jobs

## Purpose and Scope

Background jobs provide asynchronous processing, retries, and recurring schedule support for tenant workflows.

## Installation via CLI

Use generators for job-oriented additions:

- `hubforge feature add sync-orders --type background-job`

## Database Schema

Models:

- `BackgroundJob`
- `JobSchedule`

Important fields:

- `jobType`, `status`, `attempts`, `maxAttempts`
- `scheduledFor`, `startedAt`, `completedAt`, `failedAt`

## API Endpoints

- `GET /v1/jobs`
- `GET /v1/jobs/:jobId`
- `POST /v1/jobs/:jobType/trigger`
- `POST /v1/jobs/:jobId/retry`
- `POST /v1/jobs/:jobId/cancel`
- `GET /v1/jobs/schedules/list`
- `POST /v1/jobs/schedules`
- `PUT /v1/jobs/schedules/:id`
- `DELETE /v1/jobs/schedules/:id`

## Portal UI

Portal jobs pages show job queue state and schedule management.

## Settings and Configuration

- `BACKGROUND_JOB_BACKEND`
- Redis endpoint and queue parameters

## Seeding

Seed can insert sample scheduled jobs for local demos.

## Extension Points

- Add job handlers per module
- Add dead-letter queue policies
- Add workload sharding by tenant or job type

## Known Limitations

- Default scheduler cadence is local-dev oriented and should be tuned for production
