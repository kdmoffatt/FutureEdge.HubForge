# Modification References

This file tracks implementation changes made in this session.

## Latest update (final completion implementation slice: menu/i18n/profile/modules)

Delivered framework-level implementation updates in the full template generator:

- API auth route template now includes:
  - `GET /v1/auth/profile`
  - `PUT /v1/auth/profile`
  - `POST /v1/auth/switch-tenant`
  - tenant preference persistence via `SettingsService` (`preferences.language`, `preferences.theme`, `preferences.timezone`)
- Portal scaffold now includes:
  - `app/lib/i18n.ts` (lightweight translation dictionary + hook)
  - `app/lib/menu.ts` (centralized dynamic menu section/item config)
  - `app/routes/_app.tsx` wired for i18n labels, collapsible sections, account menu, tenant switch API, notification panel
  - `app/routes/_app.profile._index.tsx` profile form wired to `/v1/auth/profile`
  - `app/routes/_app.settings.modules._index.tsx` module toggles wired to settings keys
- Fixed template regressions discovered during FieldOps validation:
  - Azure AI endpoint base normalization in generated API (`endsWith('/') ? slice(0, -1) : endpoint`)
  - Assistant route default prompt string escaping
  - Removed runtime dependency risk on `@hubforge/appstack` in portal routes by using generated local `app/lib/menu.ts`

FieldOps validation run executed with force upgrade and migration/seed, and portal production build succeeded after fixes.

## Latest update (final completion docs foundation)

Delivered documentation foundation requested by the final completion prompt for module/feature usage and background job authoring.

- Added new documentation set:
  - `docs/background-jobs.md` (step-by-step custom jobs guide)
  - `docs/i18n.md` (language strategy, keying, registration and persistence guidance)
  - `docs/features/settings.md`
  - `docs/features/rbac.md`
  - `docs/features/notifications.md`
  - `docs/features/billing.md`
  - `docs/features/ai-assistant.md`
  - `docs/features/background-jobs.md`
  - `docs/features/modules.md`
  - `docs/features/email-and-auth-server-settings.md`
- Updated root `README.md` with a dedicated **Feature Documentation** section linking all new docs.

This is the documentation-first slice of the broader final completion execution and is intended to be followed by UI/i18n/module-navigation framework code upgrades.

## Latest update (authserver enable command for existing projects)

Added a dedicated CLI command to enable auth-server scaffolding on existing generated projects without manual metadata editing.

- Added new command implementation:
  - `packages/hubforge-cli/src/commands/authserver.ts`
  - Supports `hubforge authserver enable [--target <path>] [--force]`
  - Workflow:
    - validates target `hubforge.json`
    - sets `authServer: true` if not already enabled
    - invokes existing `upgrade` flow to apply generated auth-server API/portal scaffolding
    - prints migration next-step guidance
- Wired command into CLI entrypoint/help in `packages/hubforge-cli/src/cli.ts`
- Hardened upgrade temp scaffolding path in `packages/hubforge-cli/src/commands/upgrade.ts`:
  - Sanitizes `hubforge.json.name` before building temporary scaffold directory path
  - Prevents Windows path failures when metadata name contains an absolute path
- Updated usage docs in `readme/CLI-Instructions.md`

Validation completed for authserver command pass:

- `pnpm --filter @hubforge/cli run build` passed
- `pnpm --filter @hubforge/cli run cli -- --help` includes `authserver enable`
- `pnpm --filter @hubforge/cli run cli -- authserver enable --target ./_tmp_regen_verify --force` passed

## Latest update (FieldOps regeneration/upgrade script parity)

Completed item 7 by adding a dedicated, repeatable FieldOps regeneration workflow script that upgrades existing sample workspaces and safely applies missing generated modules.

- Added new scripts:
  - `scripts/fieldops-regenerate.ps1` (PowerShell)
  - `scripts/fieldops-regenerate.sh` (bash)
- Added root package scripts for easy execution:
  - `pnpm fieldops:regen`
  - `pnpm fieldops:regen:sh`
- Script workflow includes:
  - Build CLI (`pnpm hubforge:build`)
  - Upgrade target project (`hubforge upgrade --target <path>`)
  - Apply curated feature set only when marker files are missing (idempotent-safe behavior)
  - Validation phase (`pnpm install`, `pnpm db:migrate`, `pnpm db:seed`) unless skipped
- Added script controls for safe operation:
  - Initialize target if missing (`-InitializeIfMissing` / `--initialize-if-missing`)
  - Optional force upgrade (`-ForceUpgrade` / `--force-upgrade`)
  - Optional validation skip (`-SkipValidation` / `--skip-validation`)
- Updated `readme/CLI-Instructions.md` with a dedicated section documenting usage and behavior.

Validation completed for item 7 pass:

- `pnpm --filter @hubforge/cli run build` passed
- `pnpm fieldops:regen -- -TargetPath ./_tmp_regen_verify -InitializeIfMissing -SkipValidation` passed

## Latest update (CLI item 6 enhancements)

Completed CLI item 6 enhancements for init seeding workflow, DB seed command, and AI provider credential flags.

- Added new CLI command:
  - `hubforge db seed [--target <path>]`
  - Implemented in `packages/hubforge-cli/src/commands/db.ts`
  - Runs `pnpm db:seed` within the selected target directory
- Extended `hubforge init` command flags:
  - `--seed` to run post-scaffold seed workflow (`pnpm install`, `pnpm db:migrate`, `pnpm db:seed`)
  - `--ai-provider <mock|openai|azure>`
  - `--ai-key <value>`
  - Interactive prompt flow now includes AI provider/key and optional immediate seed workflow
- Updated template option model and scaffold propagation:
  - Added `aiProvider`, `aiKey`, and `seed` fields to `InitScaffoldOptions`
  - `full-pack.ts` env generation now writes `AI_PROVIDER` and `AI_KEY` from init options
- Updated upgrade compatibility defaults:
  - Upgrade metadata supports `aiProvider` with fallback to `mock`
  - `aiKey` defaults safely to `change-me` in upgrade scaffolds
- Updated CLI help text:
  - Added `db seed` usage/examples/options
  - Added new init flags and corrected auth default display (`local`)

Validation completed for item 6 pass:

- `pnpm --filter @hubforge/cli run build` passed

## Latest update (framework AI scheduler provider parity)

Completed framework-level AI scheduler provider integration with OpenAI/Azure support and deterministic mock fallback in generator templates.

- Extended generated AI assistant API route logic in `full-pack.ts` templates:
  - Added provider-aware AI JSON generation pipeline with support for:
    - OpenAI Chat Completions (`AI_PROVIDER=openai`)
    - Azure OpenAI Chat Completions (`AI_PROVIDER=azure`)
    - Mock fallback (`AI_PROVIDER=mock` or missing/invalid provider credentials)
  - Added provider calls with guarded parsing and automatic fallback on configuration gaps or runtime API failures
  - Added `POST /v1/ai/schedule` endpoint to produce scheduler recommendations from dispatcher inputs
  - Kept `POST /v1/ai-assistant/chat` endpoint and upgraded it to use the same provider/fallback integration path
- Added environment scaffolding for real provider integration:
  - `AI_PROVIDER`
  - `AI_KEY`
  - `AZURE_OPENAI_ENDPOINT`
  - `AZURE_OPENAI_DEPLOYMENT`
  - `AZURE_OPENAI_API_VERSION`
- Extended generated portal assistant page to include scheduler execution UX:
  - New scheduling controls and request payload generation
  - Calls `POST /v1/ai/schedule` and renders recommendation output
  - Displays whether response came from live provider or mock fallback

Validation completed for framework AI scheduler provider pass:

- `pnpm --filter @hubforge/cli run build` passed

## Latest update (framework AI assistant parity)

Completed framework-level AI assistant parity updates with API endpoints, portal assistant page, and RBAC permission gating in generator templates.

- Added AI assistant route generation and API server registration in `full-pack.ts` templates:
  - New generated API route: `apps/api/src/routes/ai-assistant.ts`
  - Endpoints: `GET /v1/ai-assistant/access` and `POST /v1/ai-assistant/chat`
  - Chat endpoint returns structured assistant responses and execution trace metadata
- Implemented permission gating for AI assistant endpoints:
  - Route-level checks enforce `ai-assistant:read` for access probe and `ai-assistant:invoke` for chat invoke
  - Authorization resolves user identity from authenticated JWT payload and validates tenant role permissions
- Added AI assistant permission defaults in framework templates:
  - Permission registry defaults include `ai-assistant:read` and `ai-assistant:invoke`
  - Seed bootstrap defaults include both AI assistant permissions for initial admin assignment
- Added portal AI assistant page generation:
  - New generated route: `apps/portal/app/routes/_app.assistant._index.tsx`
  - UI includes access check, prompt composer, assistant invoke action, and response rendering
  - Added sidebar/settings links for AI Assistant navigation

Validation completed for framework AI assistant pass:

- `pnpm --filter @hubforge/cli run build` passed

## Latest update (framework notifications parity)

Completed framework-level notifications parity updates with template persistence, provider abstraction, and delivery log UI in generator templates.

- Added notifications route generation and API server registration in `full-pack.ts` templates:
  - New generated API route: `apps/api/src/routes/notifications.ts`
  - Endpoints for template CRUD, delivery log listing, templated send, and compatibility `push`/`email` sends
- Added notifications provider abstraction in generated API lib:
  - `dispatchNotification(...)` supports email and push channels
  - Provider strategy supports firebase/smtp with mock fallbacks for local development or placeholder credentials
- Added notifications database service generation:
  - New generated DB service: `packages/db/src/notifications.ts`
  - `NotificationService` supports template upsert/list/delete and delivery create/sent/failed lifecycle updates
- Added notifications persistence models in Prisma and baseline migration templates:
  - `NotificationTemplate`
  - `NotificationDelivery`
  - Tenant relations and corresponding SQL table scaffolding
- Added portal notifications admin page generation:
  - New generated route: `apps/portal/app/routes/_app.notifications._index.tsx`
  - UI for template editing, test sending, and delivery log inspection
  - Added sidebar and settings navigation links to notifications page

Validation completed for framework notifications pass:

- `pnpm --filter @hubforge/cli run build` passed

## Latest update (framework billing lifecycle parity)

Completed framework-level Stripe webhook and subscription lifecycle updates with local mock fallback in generator templates.

- Added billing route generation and server registration in `full-pack.ts` templates:
  - New generated API route: `apps/api/src/routes/billing.ts`
  - Endpoints: billing config, subscription list, mock subscription upsert, Stripe webhook ingest
  - Webhook logic supports Stripe signature verification when configured and JSON mock fallback for local development
- Added billing database service generation:
  - New generated DB service: `packages/db/src/billing.ts`
  - `BillingService` supports subscription lifecycle upsert, billing event recording, and tenant subscription listing
- Added billing persistence models in Prisma and baseline migration templates:
  - `BillingCustomer`, `BillingSubscription`, `BillingEvent`
  - Tenant relations and corresponding SQL table scaffolding
- Added generated dependency and exports wiring:
  - API dependency baseline now includes `stripe`
  - DB index exports `BillingService`

Validation completed for framework billing lifecycle pass:

- `pnpm --filter @hubforge/cli run build` passed

## Latest update (framework jobs scheduler parity)

Completed framework-level background jobs scheduler parity updates in generator templates.

- Added scheduler-capable jobs architecture in `full-pack.ts` templates:
  - Prisma models: `JobSchedule` + `BackgroundJob.scheduleId` relation
  - Baseline SQL migration template: `job_schedule` table and `background_job.schedule_id`
  - `JobService` expanded with schedule CRUD, due-schedule discovery, claim/mark lifecycle, and schedule run touch APIs
  - API jobs routes expanded with job detail/cancel and schedule list/create/update/delete endpoints
- Added generated jobs worker package:
  - `packages/jobs/package.json`
  - `packages/jobs/tsconfig.json`
  - `packages/jobs/src/worker.ts` (cron parser + due schedule enqueue + queue processing loop)
- Updated generated root scripts with `dev:jobs` and wired API route generation to `apps/api/src/routes/background-jobs.ts`

Validation completed for framework jobs scheduler pass:

- `pnpm --filter @hubforge/cli run build` passed

## Latest update (framework template parity pass)

Completed framework-level parity updates in generator templates so newly scaffolded projects inherit scoped settings and full RBAC behaviors.

- Settings scope expansion is now implemented in `full-pack.ts` templates:
  - `Setting` model includes `environmentId` + `scope` and composite unique key
  - `SettingsService` uses scope/environment-aware read/write/list/delete/listModules
  - API settings routes support scoped access and `GET /v1/settings/modules`
  - Default seed logic now writes settings with scoped/environment-safe semantics
- Tenant module seed generator now writes module settings with scoped/environment-safe semantics in `commands/feature.ts`
- RBAC parity is now implemented in scaffolded API/portal templates:
  - API endpoints for user updates/deletes, user-role add/remove, role update/delete, role-permission add/remove, and permission CRUD
  - Portal templates for users and roles now support edit/delete and assignment management
  - New scaffolded permissions admin page (`/permissions`) with CRUD controls and sidebar navigation

Validation completed for framework template pass:

- `pnpm --filter @hubforge/cli run build` passed

## Latest update (FieldOps upgrade pass)

Implemented a major FieldOps sample upgrade pass for RBAC completeness and scoped settings.

- FieldOps API RBAC routes now support:
  - `POST /v1/user-roles`
  - `DELETE /v1/user-roles/:id`
  - `POST /v1/role-permissions`
  - `DELETE /v1/role-permissions/:id`
  - `DELETE /v1/users/:userId`
  - `DELETE /v1/roles/:roleId`
  - `POST|PUT|DELETE /v1/permissions`
- FieldOps portal now supports:
  - User edit/delete + role assignment/removal
  - Role edit/delete + permission assignment/removal
  - New permissions admin page (`/permissions`) with CRUD controls
- FieldOps settings system extended with scope and environment awareness:
  - `Setting` model now includes `environmentId` and `scope`
  - Composite uniqueness updated to `(tenantId, environmentId, scope, module, key)`
  - Settings service now accepts scoped/environment-aware read/write operations
  - Settings API now supports scoped module listing (`GET /v1/settings/modules`)

Validation completed for FieldOps:

- `pnpm --filter @hubforge/db db:generate` passed
- `pnpm --filter @hubforge/db typecheck` passed
- `pnpm --filter @hubforge/api typecheck` passed
- `pnpm --filter @hubforge/portal typecheck` passed
- `pnpm --filter @hubforge/api build` passed
- `pnpm --filter @hubforge/portal build` passed

## Summary

Implemented initial HubForge CLI foundation and added structured documentation tracking under `readme/`.

Added next-phase production scaffolding in the full template generator: tenant-aware settings + RBAC + background job database models/services, API route templates, portal admin pages, and a dedicated `background-job` feature generator.

Completed next phases for seeding and tenant-aware module generation, then applied the same behavior to the FieldOps sample workspace.

## Added files

- `package.json`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `.gitignore`
- `packages/hubforge-cli/package.json`
- `packages/hubforge-cli/tsconfig.json`
- `packages/hubforge-cli/src/index.ts`
- `packages/hubforge-cli/src/cli.ts`
- `packages/hubforge-cli/src/lib/args.ts`
- `packages/hubforge-cli/src/lib/fs.ts`
- `packages/hubforge-cli/src/commands/init.ts`
- `packages/hubforge-cli/src/commands/feature.ts`
- `packages/hubforge-cli/src/lib/runtime.ts`
- `packages/hubforge-cli/src/template-packs/types.ts`
- `packages/hubforge-cli/src/template-packs/full-pack.ts`
- `packages/hubforge-cli/src/template-packs/full-postgres-rls-pack.ts`
- `readme/README.md`
- `readme/CLI-Instructions.md`
- `readme/Implementation-Details.md`
- `readme/HubForge-Feature-Todos.md`
- `readme/Modification-References.md`

## Updated files

- `readme/Modification-References.md`
  - Added workspace root setup and validation records
- `packages/hubforge-cli/src/template-packs/types.ts`
  - Added auth mode/provider scaffold options and profile aliases (`full-cloud`, `full-local`)
- `packages/hubforge-cli/src/commands/init.ts`
  - Added `--auth` and `--auth-provider` options with defaults (`external`, `zitadel`)
- `packages/hubforge-cli/src/cli.ts`
  - Expanded command help for auth options, template profiles, and new feature generators
- `packages/hubforge-cli/src/commands/feature.ts`
  - Added new generators: `auth-flow`, `billing-module`, `notifications-module`, `ai-agent`
  - Added `background-job` feature type (paired API trigger route + worker scaffold)
  - Tenant module generator now creates module `seed.mjs` and patches `packages/db/scripts/seed-registry.mjs`
  - Tenant module metadata now includes `tenantScoped: true`
- `packages/hubforge-cli/src/template-packs/full-pack.ts`
  - Added baseline packages: `appstack`, `auth-client`, `sdk-server`
  - Added auth, billing, notification, webhook, email, and AI defaults in env scaffolding
  - Added API baseline improvements (security headers, request tracing, rate limiting, cache baseline, OpenAPI/metrics route)
  - Added db bootstrap wiring and shadow db-aware prisma setup
  - Fixed template escaping for generated auth/notification runtime files (`issuer.replace(/\\/$/, '')`, Firebase private key newline replacement)
  - Fixed strict typing compatibility for generated API notifications/webhook contracts under `exactOptionalPropertyTypes`
  - Moved generated web smoke tests from `app/routes` to `app/tests` to prevent React Router `flatRoutes()` from importing Vitest files in dev runtime
- `readme/CLI-Instructions.md`
  - Synced docs with all new options and feature types
- `README.md`
  - Documented generated API CORS middleware baseline, OpenAPI 3.1 endpoint (`/openapi.json`), interactive docs (`/docs`), and `/v1/auth/*` compatibility aliases
  - Corrected authentication mode defaults table to `local` default
- `readme/CLI-Instructions.md`
  - Added generated API defaults for CORS, OpenAPI 3.1 + Scalar API Reference docs, and auth path compatibility aliases
- `readme/README.md`
  - Added agent handoff protocol reference
- `readme/Agent-Handoff-Protocol.md`
  - Added explicit per-change documentation update workflow
- `packages/hubforge-cli/src/template-packs/full-pack.ts`
  - Added generated API CORS middleware baseline and interactive docs scaffolding (`/docs` + OpenAPI 3.1)
  - Added `/auth/*` + `/v1/auth/*` route compatibility for auth endpoints
  - Added settings/RBAC/jobs route templates and server registration wiring
  - Added DB service templates (`settings`, `permissions`, `jobs`) and exports
  - Extended generated Prisma schema and baseline migration with settings, RBAC, and background job models
  - Added portal admin templates for `/users`, `/roles`, and `/jobs` plus sidebar/settings navigation links
  - Upgraded DB seed script with default permissions, admin role assignment, and tenant settings seed data
  - Added DB seed registry scaffold (`packages/db/scripts/seed-registry.mjs`)
  - Updated generated DB seed script to run registered module seeders

## FieldOps sample workspace sync

- `packages/db/scripts/seed.mjs`
  - Added module seeding invocation via `runModuleSeeders(...)`
- `packages/db/scripts/seed-registry.mjs`
  - Added centralized module seeder registry for sample modules
- `packages/modules/*/seed.mjs`
  - Added module seed hooks for `audit-log`, `customer-portal`, `dispatch-board`, `inventory`, and `reporting-dashboard`
- `packages/modules/*/src/index.ts`
  - Added `tenantScoped: true` to module metadata entries
- `packages/workflows/src/modules.ts`
  - Expanded `TenantModule` type with optional `tenantScoped`

Validation rerun in FieldOps workspace:

- `pnpm --filter @hubforge/db db:seed` passed
- `pnpm --filter @hubforge/api typecheck` passed
- `pnpm --filter @hubforge/portal typecheck` passed
- `pnpm --filter @hubforge/db typecheck` passed
  - Fixed generated middleware allowlist to keep `/v1/auth/login|register|me|provider` and `/v1/tenancy/context` public
  - Fixed generated Postgres bootstrap script escaping for `SHADOW_DATABASE_URL` pathname normalization
  - Fixed generated DB seed script Prisma import style for ESM/CJS compatibility (`import prismaPkg ...` + destructure)
  - Fixed generated `/docs` HTML emission to avoid unterminated string literals in scaffolded `apps/api/src/server.ts`

## Functional outcomes

- New full template-pack flow for `hubforge init`:
  - supports `--template full`
  - supports `--template full-postgres-rls`
  - scaffolds complete multi-app baseline (`api`, `ui` public, `portal` authenticated, optional `ai`)
  - scaffolds infra baseline (`infra/compose/docker-compose.yml`)
  - scaffolds shared API client baseline (`packages/api-client`)
  - scaffolds tenancy helpers (`packages/tenancy`)
  - scaffolds migration tracking baseline (`packages/db/prisma` and `packages/db/migrations`)
  - scaffolds environment differentiation files (`.env.local`, `.env.staging`, `.env.production`)
  - scaffolds validation/release baseline (`vitest.workspace.ts`, API sample test, CI and release workflows)
- Postgres RLS template additionally scaffolds:
  - tracked SQL RLS migration defaults
  - event package baseline
  - workflow package baseline, including module registry file for tenant-module extensions
- `hubforge feature add` generates feature skeletons for:
  - API
  - API resource (route + server registration patch)
  - internal authenticated UI route in portal
  - public page
  - tenant module package + registry patching
  - worker
  - auth flow
  - billing module
  - notifications module
  - AI agent
- Public pages are now scaffolded as dedicated React Router routes in `apps/ui/app/routes`.
- Init flow now supports explicit auth-mode selection (`local` or `external`) and provider (`zitadel` default) and keeps this configurable via generated env files after install.
- Generated projects now include additional parity baseline packages: appstack, auth-client, and sdk-server.
- Generated DB migration flow now includes bootstrap support intended for non-docker Postgres role/database defaults.
- Generated templates now include portal/ui test scaffolds and an e2e workflow baseline.
- Generated API baseline now includes structured logging, tracing headers, rate limiting, metrics endpoint, cache baseline, and OpenAPI JSON endpoint.
- Generated API baseline now includes CORS middleware, interactive Scalar API Reference docs (`/docs`), OpenAPI 3.1 output, and `/auth/*` + `/v1/auth/*` compatibility behavior.
- Portal baseline now includes a dedicated `/docs` route that embeds the Scalar API Reference in an iframe, with a sidebar nav entry.
- Added plugin hook system (`hubforge.plugins.mjs`) with lifecycle support in init/feature/upgrade flows (`beforeInit`, `afterInit`, `beforeFeature`, `afterFeature`, `beforeUpgrade`, `afterUpgrade`).
- Added `hubforge infra --target k8s` command and scaffolded baseline manifests under `infra/k8s`.
- Added `hubforge upgrade` command to apply latest template changes to existing generated projects.
- Added interactive `hubforge init` prompt mode when no flags are supplied.
- Added new tenancy modes (`schema-per-tenant`, `db-per-tenant`) and extended generated tenancy helpers/environment strategy settings.
- Added JetStream-ready events scaffold in `packages/events` (`nats` + publish helper).
- Added OpenAPI generation from Hono route registry (runtime-derived `/openapi.json`) in framework template and FieldOps demo API.
- Added `feature add --type admin-resource` generator (CRUD API + portal list/create/detail views).
- Updated generated portal admin theme baseline to be token-driven and aligned with reference style; added theme settings route and third-party CSS URL hook for theme extensibility.
- Updated FieldOps demo portal with the new theme engine/settings page and switched portal React Router config to client-rendered mode (`ssr: false`) to fix authenticated data loading with localStorage tokens.
- **Scalar migration (Swagger → Scalar API Reference)**: Replaced Swagger UI (`swagger-ui-dist@5`) with Scalar API Reference (CDN `@scalar/api-reference@latest`) in both FieldOps runtime (`apps/api/src/server.ts`) and the HubForge full-pack template (`apiServerTs()`). Scalar is zero npm-dep (CDN only) and is rendered via `<script id="api-reference" data-url="/openapi.json"></script>`. A dedicated portal `/docs` route (`_app.docs._index.tsx`) embeds the Scalar UI in a full-height iframe; the sidebar nav was updated with an API Docs entry in both FieldOps and the generator template. All typechecks pass; regeneration validation confirmed clean.
- `pnpm hubforge:build` completed successfully after framework template updates for CORS/docs/auth compatibility.
- Regeneration validation rerun (`_tmp_regen_verify`) after template fixes:
  - `pnpm db:migrate` succeeded
  - `pnpm db:seed` succeeded
  - `pnpm --filter @hubforge/api typecheck` succeeded
  - Runtime smoke checks succeeded for `/openapi.json`, `/docs`, CORS preflight, `/auth/login`, and `/v1/auth/login`

## Agent handoff protocol

- On every implementation change, update:
  - `readme/Modification-References.md` (what changed and why)
  - `readme/HubForge-Feature-Todos.md` (status and any new backlog items)
- Keep entries short and explicit for continuation by another AI agent.

## Notes

- This is an initial implementation baseline intended for iterative expansion.
- No existing project business logic was modified.

## Validation completed

- `pnpm install` completed successfully.
- `pnpm hubforge:build` completed successfully.
- `pnpm typecheck` completed successfully.
- `pnpm hubforge init _tmp_full_pack --template full --db sqlite --tenant shared --ai fastapi` completed successfully (scaffold smoke test).
- `pnpm hubforge init _tmp_postgres_rls --template full-postgres-rls --db postgres --tenant isolated --ai fastapi` completed successfully (RLS scaffold smoke test).
- `pnpm hubforge feature add marketing-landing --type public-page --target _tmp_postgres_rls_2` completed successfully (public page smoke test).
- `pnpm hubforge init _tmp_full_next --template full --db postgres --tenant shared --ai fastapi` completed successfully (portal/public split smoke test).
- `pnpm hubforge feature add products --type api-resource --target _tmp_full_next` completed successfully (api-resource patch smoke test).
- `pnpm hubforge feature add crm-suite --type tenant-module --target _tmp_full_next` completed successfully (tenant-module registry patch smoke test).
- `pnpm hubforge init _tmp_full_postgres_next --template full-postgres-rls --db postgres --tenant isolated --ai fastapi` completed successfully (RLS split-architecture smoke test).
- `pnpm hubforge init _tmp_auth_features --template full-local --db sqlite --tenant shared --ai fastapi --auth external --auth-provider zitadel` completed successfully.
- `pnpm hubforge feature add auth --type auth-flow --target _tmp_auth_features` completed successfully.
- `pnpm hubforge feature add billing --type billing-module --target _tmp_auth_features` completed successfully.
- `pnpm hubforge feature add notifications --type notifications-module --target _tmp_auth_features` completed successfully.
- `pnpm hubforge feature add support-agent --type ai-agent --target _tmp_auth_features` completed successfully.
- `pnpm -C _tmp_auth_features typecheck` completed for generated scaffold and feature additions.
- Full FieldOps command flow executed against `..\\fieldops-workhub-local` (init + expanded feature batch) successfully.
- `pnpm -C ..\\fieldops-workhub-local typecheck` completed successfully after template fixes.
- `pnpm -C ..\\fieldops-workhub-local test` completed successfully.
- `pnpm -C ..\\fieldops-workhub-local test:e2e` currently fails when Redis is not running (`ECONNREFUSED 127.0.0.1:6379`); requires `pnpm infra:up` before e2e.
