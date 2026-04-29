# Decoupled Job Service

## Overview

A decoupled job service runs asynchronous work outside the API process.

Benefits:

- isolates long-running job execution from request latency
- enables independent scaling of API and worker capacity
- supports cleaner fault domains and deployment topologies

## Recommended Topology

- API: accepts requests, writes/queues job records
- Job service: claims queued jobs, executes handlers, updates status
- Redis (optional): queue transport for worker fan-out
- Database: source of truth for job state

## Logging Retention Cleanup Job

Use a scheduled or ensured singleton job type like `logging.cleanup` to purge expired logs.

Suggested flow:

1. List tenants
2. Read tenant logging retention setting
3. Delete log rows older than retention cutoff
4. Store completion metadata (`purged` count)

## Operational Notes

- Run worker with dedicated process script (for example, `dev:job-service`).
- Configure retries with exponential backoff for transient failures.
- Mark job states explicitly (`queued`, `running`, `completed`, `failed`).
- Keep handlers idempotent to survive retries.

## Licensing-Ready Module Boundary

Treat the job-service runtime as a separately deployable module:

- Core: shared job contract and queue/DB integration
- Enterprise: premium handlers, advanced scheduling, policy plugins

This boundary allows enterprise upgrades without changing API request contracts.
