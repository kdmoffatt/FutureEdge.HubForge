# Feature: Settings

## Purpose and Scope

Settings centralizes tenant/environment/system configuration using the `Setting` table. It supports dynamic module options, defaults, and runtime overrides.

## Installation via CLI

Settings support is part of the full template pack baseline.

## Database Schema

Primary model:

- `Setting`

Important fields:

- `tenantId` nullable for system scope
- `environmentId` nullable for environment-specific overrides
- `scope` (`tenant`, `environment`, `system`)
- `module`, `key`, `value`, `dataType`

## API Endpoints

- `GET /v1/settings/modules`
- `GET /v1/settings/:module`
- `GET /v1/settings/:module/:key`
- `PUT /v1/settings/:module/:key`
- `DELETE /v1/settings/:module/:key`

Headers:

- `authorization`
- `x-tenant-id`
- optional `x-environment-id`

## Portal UI

Settings is exposed under portal settings routes and links.

## Settings and Configuration

Examples:

- `notifications.emailEnabled`
- `theme.preset`
- `localization.defaultLanguage`
- `modules.<moduleId>.enabled`

## Seeding

Seed includes baseline settings and can be extended in `packages/db/scripts/seed.mjs`.

## Extension Points

- Add new module keys without schema changes
- Add environment override strategy

## Known Limitations

- No full schema validation per key at baseline
- Complex nested values rely on JSON serialization
