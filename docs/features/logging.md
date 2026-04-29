# Enterprise Logging

## Overview

HubForge supports a layered logging approach designed for local-first defaults with optional enterprise sinks.

- Default sink: local database storage per tenant
- Optional advanced sink: Elastic-compatible HTTP endpoint
- Sources: backend request/event logs and frontend browser logs
- Tenant controls: level, retention days, local DB on/off, advanced sink on/off

The feature can be scaffolded with:

```bash
hubforge feature logging --type logging-module
```

## Baseline Behavior

- API always emits structured JSON logs to stdout for platform capture.
- When tenant logging is enabled for local DB, logs are persisted in `LogEntry`.
- Advanced sink is best-effort and should not fail request paths.
- Log levels are filtered by tenant setting (`error`, `warn`, `info`, `debug`).

## Tenant Settings Model

Store settings under module key `logging` using `SettingsService` keys:

- `level`
- `useLocalDb`
- `retentionDays`
- `advancedEnabled`

Recommended defaults:

- `level: info`
- `useLocalDb: true`
- `retentionDays: 30`
- `advancedEnabled: false`

## API Surface (recommended)

- `GET /v1/logs/settings`
- `PUT /v1/logs/settings`
- `GET /v1/logs`
- `POST /v1/logs`

All routes should enforce tenant context and auth except where anonymous ingestion is explicitly desired.

## Frontend Integration

- Capture `window.error` and `unhandledrejection`.
- Send normalized events to `POST /v1/logs`.
- Keep client-side level controls separate from tenant server-side policy.

## Licensing-Ready Toggle Strategy

Keep logging implementation modular:

- Core module: local DB + portal settings/viewer
- Enterprise module: advanced sink enablement and external forwarding

Use module capability checks to gate enterprise-only controls while preserving shared data model compatibility.
