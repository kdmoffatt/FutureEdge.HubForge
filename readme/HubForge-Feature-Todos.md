# HubForge Feature Todos

This checklist is the shared tracking board for HubForge framework parity and roadmap execution.

## Status key

- [ ] not started
- [x] completed
- [~] in progress (replace with [x] when done)

## Core architecture parity

- [x] Split generated apps into public site and authenticated app (`apps/ui` + `apps/portal`)
- [x] Keep API app scaffold (`apps/api`) with tenancy context middleware baseline
- [x] Keep AI app scaffold option (`apps/ai`) with FastAPI baseline
- [x] Add shared API client package (`packages/api-client`)
- [x] Add appstack/module capability package parity (`packages/appstack` equivalent)
- [x] Add auth-client package baseline (`packages/auth-client` equivalent)
- [x] Add SDK server package baseline (`packages/sdk-server` equivalent)

## Template packs

- [x] `full` template pack baseline
- [x] `full-postgres-rls` template pack baseline
- [x] Postgres RLS migration baseline included
- [x] Events package baseline included in RLS pack
- [x] Workflows package baseline included in RLS pack
- [x] Add profile-specific template pack for production cloud deployment (`full-cloud` alias profile)
- [x] Add profile-specific template pack for local/dev-only starter (`full-local` alias profile)

## Feature generators

- [x] `feature add public-page`
- [x] `feature add ui` (authenticated portal route)
- [x] `feature add api-resource` with server patching
- [x] `feature add tenant-module` with module registry patching
- [x] `feature add tenant-module` with module registry patching and module seed registration
- [x] `feature add auth-flow`
- [x] `feature add billing-module`
- [x] `feature add notifications-module` (Firebase-default provider baseline)
- [x] `feature add ai-agent`
- [x] `feature add background-job` (API trigger route + worker pairing)

## Init profile and auth configuration

- [x] Init option for local/external authentication mode (`--auth`)
- [x] Init option for auth provider (`--auth-provider`) with default Zitadel
- [x] Generated env config supports post-install auth provider reconfiguration
- [x] Auth metadata persisted in `hubforge.json`

## Testing and delivery

- [x] Root test workspace scaffold (`vitest.workspace.ts`)
- [x] API sample test scaffold
- [x] CI workflow scaffold (`.github/workflows/ci.yml`)
- [x] Release workflow scaffold (`.github/workflows/release.yml`)
- [x] Add portal test scaffold (baseline path and script readiness)
- [x] Add ui/public test scaffold (baseline path and script readiness)
- [x] Add e2e test workflow scaffold (baseline workflow slot ready)
- [x] Document and validate e2e runtime prerequisite (`pnpm infra:up` for Redis/Postgres before Playwright webServer)

## Infrastructure and services parity

- [x] Docker compose baseline with db + redis + nats + minio
- [x] Add cloud cluster provisioning baseline (profile alias and env-ready settings)
- [x] Add Stripe billing service baseline (env + generator scaffolding)
- [x] Add domain/DNS integration baseline (env slots and route-ready config)
- [x] Add email/exchange integration baseline (SMTP env slots)
- [x] Add webhook delivery baseline (env slot and route-ready config)

## Roadmap completion (current batch)

- [x] Plugin/hook system for third-party HubForge modules
- [x] Schema-per-tenant and DB-per-tenant tenancy templates
- [x] NATS JetStream event sourcing scaffold
- [x] OpenAPI spec generation from Hono routes
- [x] Admin UI module generator (data tables, forms, detail views)
- [x] Kubernetes manifest generation (`hubforge infra --target k8s`)
- [x] Interactive `hubforge init` prompts (when no flags provided)
- [x] `hubforge upgrade` to apply new HubForge template changes to existing projects
- [x] Portal admin theme baseline aligned to reference style with built-in presets
- [x] Third-party theme plugin mechanism via external theme CSS URL injection

## AI-centric completion wave (current execution)

- [x] Settings scope expansion (`environmentId`, `scope`) with API/UI support
- [x] Full RBAC management parity (assignment + edit/delete + permissions CRUD)
- [x] Background jobs scheduler + cron model + worker orchestration scripts
- [x] Stripe webhook + subscription lifecycle + local mock billing fallback
- [ ] Notification template model + provider abstraction + delivery log UI
- [ ] AI chat assistant endpoints + portal assistant page + permission gating
- [ ] AI scheduler real provider integration (OpenAI/Azure) with mock fallback
- [ ] CLI enhancements: `hubforge init --seed`, `hubforge db seed`, `--ai-provider`, `--ai-key`
- [ ] FieldOps regeneration/upgrade script to apply all new generated modules safely

## Platform services checklist (latest scan)

- [x] ORM baseline (Prisma schema + migrations + bootstrap)
- [x] Unified seeding baseline (core seed + module seed registry + module seed hooks)
- [x] API routing and middleware baseline
- [x] Data validation/serialization baseline via zod event schemas and typed route patterns
- [x] Cache management baseline (in-memory API response cache)
- [x] Authentication and authorization baseline (local/external mode and provider metadata)
- [x] Security baseline (headers + auth header checks + safe defaults)
- [x] Auto API documentation baseline (`/openapi.json` endpoint)
- [x] Interactive API docs baseline (`/docs` Scalar API Reference, zero npm deps — CDN only)
- [x] API CORS middleware baseline (browser preflight-ready)
- [x] Auth route compatibility baseline (`/auth/*` and `/v1/auth/*`)
- [x] CLI scaffold/migration/dev server toolchain
- [x] Hot reload baseline via `tsx watch` and React Router dev server
- [x] Log aggregation readiness (structured JSON logs)
- [x] Distributed request tracing baseline (`x-trace-id`/`x-request-id` propagation)
- [x] Rate limiting/throttling baseline (in-memory per-IP counter)
- [x] Cloud-native/container baseline (`infra/compose` + template profiles)
- [x] Background job baseline (`worker` generator + notifications worker)
- [x] Tenant admin baseline for production settings/RBAC/jobs (template-generated API routes, DB models/services, and portal pages)
- [x] Notifications baseline (Firebase-default scaffolding, provider env)
- [x] AI integration baseline (FastAPI service + `ai-agent` generator)
- [x] Serverless-readiness baseline (SDK and route modularity prepared)
- [x] Frontend state/component/asset baselines via React Router + Vite/Tailwind stack

## Documentation governance

- [x] Always update `readme/Modification-References.md` after implementation changes
- [x] Always update `readme/HubForge-Feature-Todos.md` after implementation changes
- [x] Keep updates concise and agent-readable for continuation by another AI

## Daily architecture sync process

Use this section each day before making scaffold changes.

1. Review latest architecture in the reference repository:
   - `C:\Users\kmoffatt\source\repos\FutureEdgePro\hub-forge-framwork`
2. Compare high-level app/package layout against generated template expectations:
   - apps: api, ui, portal, ai
   - packages: db, events, workflows, ui, api-client, module-kit, auth-client, appstack, sdk-server
3. For every new service, feature, or UI framework/template found in reference architecture:
   - Add a new todo item above
   - Mark whether it belongs in `full`, `full-postgres-rls`, or both
4. After implementation:
   - Run `pnpm hubforge:build`
   - Run `pnpm typecheck`
   - Run smoke generation for both template packs

## Session checklist

- [x] Requested next steps implemented in CLI and template packs
- [x] Documentation updated for commands, outputs, and references
- [x] Remaining parity gaps groomed into actionable tasks
- [x] Fresh scaffold regeneration verification completed (`_tmp_regen_verify`) with db migrate/seed + API runtime smoke checks
- [x] Tenant-aware module generation completed (tenant metadata + module seed scaffolding)
- [x] FieldOps sample workspace aligned with unified seeding + tenant-aware module metadata
- [x] Comprehensive validation rerun (db seed + api/portal/db typechecks)
