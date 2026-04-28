# HubForge CLI Instructions

## Current package

- Package name: `@hubforge/cli`
- CLI binary name: `hubforge`
- Source path: `packages/hubforge-cli`

## Root scripts

Run from repository root:

- Build CLI only:
  - `pnpm hubforge:build`
- Execute CLI:
  - `pnpm hubforge init my-app --template full --db sqlite --tenant shared`
  - `pnpm hubforge init my-saas --template full-postgres-rls --db postgres --tenant isolated`
  - `pnpm hubforge init enterprise --template full-cloud --db postgres --tenant isolated --auth external --auth-provider zitadel`
  - `pnpm hubforge init local-dev --template full-local --db sqlite --tenant shared --auth local`
  - `pnpm hubforge init local-dev --ai-provider openai --ai-key sk_test_123 --seed`
  - `pnpm hubforge feature add billing --type api`
  - `pnpm hubforge feature add landing --type public-page --target my-saas`
  - `pnpm hubforge feature add catalog --type api-resource --target my-saas`
  - `pnpm hubforge feature add crm --type tenant-module --target my-saas`
  - `pnpm hubforge feature add sync-orders --type background-job --target my-saas`
  - `pnpm hubforge feature add auth --type auth-flow --target my-saas`
  - `pnpm hubforge feature add notifications --type notifications-module --target my-saas`
  - `pnpm hubforge infra --target k8s`
  - `pnpm hubforge db seed --target ./local-dev`
  - `pnpm hubforge authserver enable --target ./local-dev --force`
  - `pnpm hubforge upgrade --target ../fieldops-workhub-local`
  - `pnpm fieldops:regen`

## Commands

### 1. Init command

`hubforge init <project-name> [options]`

Options:

- `--template <pack>` where pack is one of:
  - `full` (default)
  - `full-postgres-rls`
  - `full-cloud` (alias profile: resolves to `full-postgres-rls` defaults)
  - `full-local` (alias profile: resolves to `full` defaults)
- `--db <provider>` where provider is one of:
  - `sqlite` (default)
  - `postgres`
  - `mysql`
  - `sqlserver`
- `--tenant <mode>` where mode is one of:
  - `shared` (default)
  - `isolated`
  - `schema-per-tenant`
  - `db-per-tenant`
- `--ai <mode>` where mode is one of:
  - `fastapi` (default)
  - `none`
- `--ai-provider <kind>` where kind is one of:
  - `mock` (default)
  - `openai`
  - `azure`
- `--ai-key <value>` provider API key (default: `change-me`)
- `--auth <mode>` where mode is one of:
  - `external`
  - `local`
- default is `local` (database authentication with seeded admin credentials)
- `--auth-provider <kind>` where kind is one of:
  - `zitadel` (default)
  - `auth0`
  - `keycloak`
  - `custom`
- `--authserver` to scaffold tenant-auth-server settings persistence and portal settings UI
- `--seed` to run install + migrate + seed immediately after scaffolding
- `--force` to scaffold into a non-empty target directory

When no flags are provided, `hubforge init` now enters an interactive prompt flow.

Generated output includes:

- profile metadata (`hubforge.json`)
- root workspace setup (`package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`)
- environment files (`.env.local`, `.env.staging`, `.env.production`)
- multi-app baseline (`apps/api`, `apps/ui` public site, `apps/portal` authenticated app, optional `apps/ai`)
- infrastructure baseline (`infra/compose/docker-compose.yml`)
- root test scaffolding (`vitest.workspace.ts`, API sample test)
- root CI/release scaffolding (`.github/workflows/ci.yml`, `.github/workflows/release.yml`)
- shared API client package (`packages/api-client`)
- tenancy package (`packages/tenancy`)
- appstack capability baseline package (`packages/appstack`)
- auth-client baseline package (`packages/auth-client`)
- sdk-server baseline package (`packages/sdk-server`)
- migration-ready DB package (`packages/db/prisma/schema.prisma`)
- migration tracking baseline (`packages/db/migrations/0001_init.sql`)
- API docs baseline (`/openapi.json` OpenAPI 3.1 + interactive `/docs` Scalar API Reference)
- API CORS baseline for browser clients (including preflight support)
- auth route compatibility aliases (`/auth/*` and `/v1/auth/*`)
- plugin hooks baseline (`hubforge.plugins.mjs`) and plugin SDK package (`@hubforge/plugin-sdk`)
- JetStream-ready events package baseline (`packages/events`)
- Kubernetes manifest baseline (`infra/k8s`)

Additional `full-postgres-rls` output includes:

- tracked RLS migration baseline (`packages/db/migrations/0002_enable_rls.sql`)
- event package (`packages/events`)
- workflow package (`packages/workflows`)
- Postgres bootstrap helper (`packages/db/scripts/bootstrap-postgres.mjs`)
- shadow database support in Prisma datasource (`SHADOW_DATABASE_URL`)

### 2. Feature command

`hubforge feature add <feature-name> [options]`

Options:

- `--type <kind>` where kind is one of:
  - `api` (default)
  - `api-resource`
  - `admin-resource`
  - `ui`
  - `public-page`
  - `tenant-module`
  - `worker`
  - `background-job`
  - `auth-flow`
  - `billing-module`
  - `notifications-module`
  - `ai-agent`
- `--target <path>` target project path (defaults to current directory)

Generated output by type:

- `api`: route skeleton + event schema skeleton
- `api-resource`: REST resource route + event schema + API server route registration patch
- `admin-resource`: API CRUD route + portal list/create/detail pages + event schema stub + server patch
- `ui`: authenticated portal route in `apps/portal/app/routes`
- `public-page`: public React Router route in `apps/ui/app/routes`
- `tenant-module`: module package in `packages/modules/<slug>` + registry patches in workflows and portal module listing
- `tenant-module`: module package in `packages/modules/<slug>` + registry patches in workflows and portal module listing + module seed hook registration in `packages/db/scripts/seed-registry.mjs`
- `worker`: Python worker skeleton in AI app area
- `background-job`: paired API trigger route + worker skeleton for job-oriented features
- `auth-flow`: auth route + auth client helper scaffold with provider introspection
- `billing-module`: billing route + billing events + portal billing page + server patch
- `notifications-module`: notifications package + API route + worker scaffold + server patch
- `ai-agent`: AI agent Python scaffold + API invoke route + server patch

Unified seeding baseline:

- Scaffolded DB package now includes `packages/db/scripts/seed-registry.mjs`
- Base seed entrypoint (`packages/db/scripts/seed.mjs`) invokes `runModuleSeeders(...)`
- Tenant module generation creates a module `seed.mjs` and auto-registers it in the DB seed registry

### 3. Infra command

`hubforge infra --target k8s`

Generates Kubernetes baseline manifests under `infra/k8s`:

- namespace
- api deployment
- portal deployment
- ui deployment

### 4. DB command

`hubforge db seed [--target <path>]`

- Runs `pnpm db:seed` inside an existing generated HubForge project
- Useful for re-seeding demo/admin data after schema changes or local resets

### 5. Upgrade command

`hubforge upgrade [--target <path>] [--force]`

- Reads `hubforge.json` in target project
- Re-scaffolds current template into a temporary directory
- Applies missing files (or all template files with `--force`)
- Supports plugin hooks (`beforeUpgrade`, `afterUpgrade`)

### 6. Authserver command

`hubforge authserver enable [--target <path>] [--force]`

- Enables `authServer` in target `hubforge.json`
- Runs template upgrade so auth-server route and portal settings scaffolding are applied
- Use `--force` to overwrite existing template files where needed
- After enabling, run database migration in the target project:
  - `pnpm --dir <target> db:migrate`

### 7. FieldOps regeneration/upgrade script

Use the repository script to safely bring an existing FieldOps workspace up to parity with current generators.

Default command (PowerShell):

- `pnpm fieldops:regen`

Optional shell equivalent:

- `pnpm fieldops:regen:sh -- --target ../fieldops-workhub-local --skip-validation`

Behavior:

- Builds the HubForge CLI first
- Runs `hubforge upgrade` against the target project
- Applies a curated feature set only when each feature marker file is missing
- Runs `pnpm install`, `pnpm db:migrate`, and `pnpm db:seed` unless validation is explicitly skipped

PowerShell flags (`scripts/fieldops-regenerate.ps1`):

- `-TargetPath <path>` defaults to `../fieldops-workhub-local`
- `-InitializeIfMissing` scaffold target first if `hubforge.json` is missing
- `-ForceUpgrade` passes `--force` to `hubforge upgrade`
- `-SkipValidation` skips install/migrate/seed

## Documentation discipline

- For every implementation change, update both:
  - `readme/Modification-References.md`
  - `readme/HubForge-Feature-Todos.md`
- Keep entries concise and agent-friendly so another AI can continue work with minimal context loss.
