# HubForge

**HubForge** is an opinionated, full-stack SaaS scaffolding framework and CLI for TypeScript monorepos. It generates production-ready multi-tenant applications with a curated stack — batteries included, no magic hidden.

> Think Laravel/ABP-style DX but for the TypeScript ecosystem: scaffold once, own everything.

---

## Table of Contents

- [What HubForge generates](#what-hubforge-generates)
- [Application Stack](#application-stack)
  - [Language & Runtime](#language--runtime)
  - [API Layer](#api-layer)
  - [Front-end: Public Site (apps/ui)](#front-end-public-site-appsui)
  - [Front-end: Authenticated Portal (apps/portal)](#front-end-authenticated-portal-appsportal)
  - [AI Service (apps/ai)](#ai-service-appsai)
  - [Database & ORM](#database--orm)
  - [Authentication](#authentication)
  - [Background Jobs & Queues](#background-jobs--queues)
  - [Push Notifications](#push-notifications)
  - [Billing](#billing)
  - [Messaging / Events](#messaging--events)
  - [Infrastructure](#infrastructure)
  - [Testing](#testing)
  - [CI/CD](#cicd)
- [Package Structure](#package-structure)
- [Monorepo Tooling](#monorepo-tooling)
- [CLI Usage](#cli-usage)
- [Feature Documentation](#feature-documentation)
- [Getting Started for Contributors](#getting-started-for-contributors)
- [Contribution Guide](#contribution-guide)
- [Repository Layout](#repository-layout)
- [Design Principles](#design-principles)
- [Roadmap](#roadmap)

---

## What HubForge generates

Running `hubforge init my-app --template full-postgres-rls` produces a complete pnpm monorepo containing:

| Path | Purpose |
|------|---------|
| `apps/api` | Hono HTTP API with tenant middleware, JWT auth, webhooks |
| `apps/ui` | Public-facing React Router 7 SSR site (port 3010) |
| `apps/portal` | Authenticated tenant admin portal, React Router 7 SSR (port 3001) |
| `apps/ai` | Optional FastAPI (Python) AI inference service (port 5000) |
| `packages/api-client` | Type-safe fetch client shared across front-end apps |
| `packages/tenancy` | Tenant context resolution middleware and helpers |
| `packages/appstack` | Module capability registry (feature flags per module) |
| `packages/auth-client` | Browser-side OIDC session helpers (Zitadel / Auth0 / Keycloak) |
| `packages/sdk-server` | Server-side typed SDK wrappers |
| `packages/db` | Prisma schema, migrations, and database bootstrapping |
| `infra/compose` | Docker Compose for local infrastructure services |
| `e2e/` | Playwright end-to-end smoke tests |
| `.github/workflows/` | CI, release, and e2e GitHub Actions pipelines |

---

## Application Stack

### Language & Runtime

| Concern | Choice |
|---------|--------|
| **Primary language** | TypeScript 5.4+ (strict mode, `exactOptionalPropertyTypes`) |
| **Runtime** | Node.js 20 LTS |
| **Module system** | ESM (`"type": "module"`) throughout |
| **Package manager** | pnpm 10 with workspaces |
| **Monorepo orchestration** | Turborepo 2 |

All TypeScript is compiled to ESM. The `tsconfig.base.json` uses `moduleResolution: bundler` to support path aliases and workspace packages without additional tooling.

---

### API Layer

| Concern | Choice |
|---------|--------|
| **Framework** | [Hono v4](https://hono.dev) — ultra-fast, edge-ready HTTP framework |
| **Server adapter** | `@hono/node-server` for local Node.js execution |
| **Auth middleware** | `jose` (JOSE-standard JWT/JWKS verification) |
| **Validation** | `zod` for request/response schemas |
| **Webhook delivery** | BullMQ + IORedis with exponential backoff retry |
| **Push notifications** | Firebase Admin SDK (`firebase-admin`) |

**Port:** 4000

The generated API (`apps/api/src/server.ts`) mounts:

- `/health` — liveness probe (unauthenticated)
- `/v1/tenancy/context` — returns resolved tenant + environment for the current request
- `/auth/login`, `/auth/register`, `/auth/me` — database auth endpoints for local mode
- `/v1/auth/login`, `/v1/auth/register`, `/v1/auth/me` — compatibility aliases for clients using `/v1` auth paths
- `/openapi.json` — OpenAPI 3.1 spec endpoint
- `/docs` — interactive Scalar API Reference (root `/` redirects to this)
- Domain routes added by `hubforge feature` commands

Generated API servers also include CORS middleware by default (methods, headers, and preflight support) for local browser-to-API development.

**Auth middleware** (`apps/api/src/lib/auth.ts`) uses the [`jose`](https://github.com/panva/jose) library to validate JWTs via JWKS discovery. It supports two modes controlled by environment variables:

- `AUTH_MODE=external` — validates tokens against a remote OIDC provider JWKS endpoint (`AUTH_ISSUER_URL/.well-known/jwks.json`)
- `AUTH_MODE=local` — validates symmetric HMAC-signed tokens for local development (no external IdP required)

Provider-specific JWKS URL conventions are handled automatically for Zitadel, Auth0, and Keycloak.

---

### Front-end: Public Site (`apps/ui`)

| Concern | Choice |
|---------|--------|
| **Framework** | [React Router v7](https://reactrouter.com) (framework mode, SSR enabled) |
| **Rendering** | Server-side rendering with streaming via `@react-router/node` |
| **Styling** | Tailwind CSS v4 (via `@tailwindcss/vite` Vite plugin) |
| **Build tool** | Vite 5 |
| **Language** | TypeScript + TSX |

**Port:** 3010

`apps/ui` is the public-facing marketing/landing site. It is intentionally separated from the authenticated portal so it can be deployed independently (CDN, edge, separate Docker container). It shares the `@hubforge/api-client` package for any server-driven content.

Routes use React Router 7's file-based routing convention. The root layout (`app/root.tsx`) sets up global providers, fonts, and the Tailwind stylesheet. Individual route modules export `loader`, `action`, and default component.

---

### Front-end: Authenticated Portal (`apps/portal`)

| Concern | Choice |
|---------|--------|
| **Framework** | [React Router v7](https://reactrouter.com) (framework mode, SSR enabled) |
| **Rendering** | Server-side rendering with streaming via `@react-router/node` |
| **Styling** | Tailwind CSS v4 |
| **Build tool** | Vite 5 |
| **Language** | TypeScript + TSX |

**Port:** 3001

`apps/portal` is the authenticated tenant-admin application. Its layout hierarchy enforces authentication:

- `_index.tsx` — redirects unauthenticated users to `auth.login`
- `auth.login.tsx` — login page (OIDC redirect or local form)
- `_app.tsx` — parent layout for all protected routes (sidebar, nav)
- `_app.dashboard._index.tsx` — default dashboard view

Feature commands (`hubforge feature my-module --type tenant-module`) append new routes and components into `apps/portal/app/routes/`.

---

### AI Service (`apps/ai`)

| Concern | Choice |
|---------|--------|
| **Framework** | [FastAPI](https://fastapi.tiangolo.com) (Python 3.11+) |
| **ASGI server** | Uvicorn |
| **Dependency management** | `requirements.txt` (pip) |

**Port:** 5000 (optional, only generated with `--ai fastapi`)

The AI service exposes a `/predict` endpoint for model inference. The generated stub is intentionally thin — the Dockerfile handles environment setup and the FastAPI app mounts a POST route ready for any ML/LLM integration.

---

### Database & ORM

| Concern | Choice |
|---------|--------|
| **ORM** | [Prisma](https://www.prisma.io) |
| **Supported providers** | `postgresql`, `sqlite`, `mysql`, `sqlserver` |
| **Migrations** | Prisma migrate (SQL migration files committed to source) |
| **Multi-tenancy** | Shared DB (default), schema-per-tenant (`full-postgres-rls` template) |

The generated Prisma schema (`packages/db/prisma/schema.prisma`) includes a core multi-tenant data model:

- `Organization` — top-level tenant
- `Environment` — per-tenant deployment environment (dev/staging/prod)
- `Membership` — user-to-organization role assignment
- `User` — application user linked to external IdP identity

A **bootstrap script** (`packages/db/scripts/bootstrap-postgres.mjs`) handles Postgres database + user creation for local development without requiring Docker — it uses the `pg` client directly and runs idempotently.

---

### Authentication

HubForge supports both local-dev and production OIDC authentication, selectable at project init time.
New projects default to local database authentication with a seeded admin account:

```
pnpm hubforge init my-app
cd my-app
pnpm install
pnpm db:migrate
pnpm db:seed
```

Default seeded credentials:

- Email: `admin@local-demo.com`
- Password: `Password1!`

You can still choose auth mode explicitly:

```
hubforge init my-app --auth external --auth-provider zitadel
hubforge init my-app --auth external --auth-provider auth0
hubforge init my-app --auth external --auth-provider keycloak
hubforge init my-app --auth local
```

To scaffold tenant-configurable auth server settings in the database and portal settings menu, add:

```
hubforge init my-app --authserver
```

| Mode | Description |
|------|-------------|
| `local` (default) | Uses database credentials and signs/validates JWTs with a local HMAC secret. No external IdP required for development. |
| `external` | Validates JWTs via OIDC JWKS endpoint. Works with any OIDC-compliant IdP. |

**Supported OIDC Providers:**

| Provider | Notes |
|----------|-------|
| [Zitadel](https://zitadel.com) | Default. Self-hostable, Kubernetes-native. JWKS at `{issuer}/.well-known/jwks.json` |
| [Auth0](https://auth0.com) | SaaS. JWKS at `https://{tenant}.us.auth0.com/.well-known/jwks.json` |
| [Keycloak](https://www.keycloak.org) | Self-hostable. JWKS at `{issuer}/realms/{realm}/protocol/openid-connect/certs` |

The server-side auth middleware (`apps/api/src/lib/auth.ts`) uses [`jose`](https://github.com/panva/jose) — a modern, zero-dependency JOSE implementation — to verify JWTs against remote JWKS endpoints with audience and issuer validation.

The browser-side auth client (`packages/auth-client`) wraps OIDC redirect flows for use inside React Router loaders and actions.

---

### Background Jobs & Queues

| Concern | Choice |
|---------|--------|
| **Queue backend** | [BullMQ](https://bullmq.io) (Redis-backed) |
| **Redis client** | [IORedis](https://github.com/redis/ioredis) |
| **Job processor** | In-process worker started at API boot |

The generated webhook retry queue (`apps/api/src/lib/webhook-queue.ts`) provides:

- `enqueueWebhookDelivery(job)` — adds a webhook delivery job to the BullMQ queue
- `startWebhookWorker()` — starts an in-process worker that fetches and dispatches jobs
- **Retry policy:** 5 attempts with exponential backoff (configurable via env vars)
- **Error logging:** failed jobs are logged with attempt count and error message

The worker is started automatically in `server.ts` at API boot when `BACKGROUND_JOB_BACKEND=redis` (default).

Environment variables:
```
REDIS_URL=redis://localhost:6379
WEBHOOK_QUEUE_NAME=webhook-delivery
WEBHOOK_RETRY_ATTEMPTS=5
WEBHOOK_RETRY_DELAY_MS=1000
```

---

### Push Notifications

| Concern | Choice |
|---------|--------|
| **Provider** | Firebase Cloud Messaging (FCM) via `firebase-admin` |
| **Credentials** | Service account (env vars) or Application Default Credentials |

The generated notification dispatcher (`apps/api/src/lib/notifications.ts`) provides:

- `sendPushNotification({ token, notification, data })` — sends an FCM push to a device token
- Lazy Firebase app initialization (safe to call multiple times)
- Supports both explicit service account credentials and ADC for GCP-hosted deployments

Environment variables:
```
NOTIFICATION_PROVIDER=firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
```

---

### Billing

Billing is generated by `hubforge feature billing --type billing-module`. It produces:

- Stripe SDK integration for checkout sessions and subscriptions
- Prisma models for `Subscription`, `Invoice`, `PaymentMethod`
- API routes for Stripe webhook handling with signature verification
- Portal UI pages for plan management and billing history

Environment variables:
```
BILLING_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

### Messaging / Events

| Concern | Choice |
|---------|--------|
| **Message broker** | [NATS](https://nats.io) (optional, included in Docker Compose) |
| **Events package** | `packages/events` (in `full-postgres-rls` template) |
| **Workflows package** | `packages/workflows` (in `full-postgres-rls` template) |

The `full-postgres-rls` template includes `packages/events` and `packages/workflows` for domain event publishing and workflow orchestration. NATS is included in the Docker Compose stack.

---

### Infrastructure

All infrastructure for local development is defined in `infra/compose/docker-compose.yml` and managed with:

```bash
pnpm infra:up    # Start all containers
pnpm infra:down  # Stop all containers
```

Default services included:

| Service | Image | Port |
|---------|-------|------|
| PostgreSQL | `postgres:16` | 5432 |
| Redis | `redis:7-alpine` | 6379 |
| NATS | `nats:2-alpine` | 4222 |
| AI service | Custom Dockerfile | 5000 |

All apps and packages have `Dockerfile`s for production containerisation.

---

### Testing

HubForge generates a multi-layer testing setup:

| Layer | Tool | Location |
|-------|------|---------|
| **Unit / integration** | [Vitest](https://vitest.dev) | Per-package `vitest.config.ts` |
| **Workspace runner** | Vitest workspace | `vitest.workspace.ts` (root) |
| **End-to-end** | [Playwright](https://playwright.dev) | `e2e/smoke.spec.ts` |

Running tests:

```bash
pnpm test           # All unit/integration tests (vitest workspace)
pnpm test:e2e       # Playwright e2e (requires apps running)
```

The Playwright config (`playwright.config.ts`) uses `webServer` entries to spin up the API, UI, and Portal automatically before running e2e tests. In CI mode it retries twice on failure.

---

### CI/CD

Three GitHub Actions workflows are generated:

| Workflow | Trigger | Steps |
|---------|---------|-------|
| `ci.yml` | PR to `main` | Install → Typecheck → Unit tests |
| `e2e.yml` | PR to `main` + manual | Install → Typecheck → Install Playwright browsers → Playwright e2e |
| `release.yml` | Push `v*.*.*` tag + manual | Install → Build → Typecheck → Test → GitHub Release |

---

## Package Structure

```
packages/
├── api-client/       # Type-safe fetch wrapper for apps/api routes
│   └── src/index.ts  # Exported functions: getHealth(), fetchTenantContext(), etc.
├── appstack/         # Module capability registry
│   └── src/index.ts  # createAppStack(), registerModule(), hasCapability()
├── auth-client/      # Browser OIDC session helpers
│   └── src/index.ts  # getSession(), redirectToLogin(), clearSession()
├── db/               # Prisma schema + migrations + bootstrap scripts
│   ├── prisma/schema.prisma
│   ├── migrations/
│   └── scripts/bootstrap-postgres.mjs
├── sdk-server/       # Typed server-side SDK helpers
│   └── src/index.ts  # createHubForgeContext(), resolveServiceConfig()
└── tenancy/          # Tenant context resolution (used in API middleware)
    └── src/index.ts  # resolveTenantContext(), TenantContext type
```

The `full-postgres-rls` template additionally includes:

```
packages/
├── events/           # Domain event types and NATS publisher
└── workflows/        # Workflow orchestration and webhook retry queue helpers
```

---

## Monorepo Tooling

| Tool | Purpose |
|------|---------|
| [pnpm](https://pnpm.io) 10 | Package manager, workspace linking |
| [Turborepo](https://turbo.build) 2 | Task orchestration with build caching |
| [TypeScript](https://www.typescriptlang.org) 5.4 | Strict type checking across all packages |
| [Vite](https://vitejs.dev) 5 | Bundler for React Router apps |

The root `turbo.json` defines task pipelines. `typecheck` and `build` respect package dependency order (`dependsOn: ["^build"]`). `dev` tasks run in parallel with `cache: false`.

---

## CLI Usage

```bash
# Install globally
npm install -g @hubforge/cli

# Scaffold a new project
hubforge init my-saas-app --template full-postgres-rls --db postgres --tenant isolated --auth external --auth-provider zitadel

# Add a feature to an existing project
hubforge feature crm --type tenant-module
hubforge feature landing --type public-page
hubforge feature stripe --type billing-module
hubforge feature push-alerts --type notifications-module
hubforge feature embeddings --type ai-agent
hubforge feature users --type auth-flow

# List available templates and features
hubforge --help
```

### Init flags

| Flag | Default | Options |
|------|---------|---------|
| `--template` | `full` | `full`, `full-postgres-rls` |
| `--db` | `sqlite` | `sqlite`, `postgres`, `mysql`, `sqlserver` |
| `--tenant` | `shared` | `shared`, `isolated` |
| `--ai` | `none` | `none`, `fastapi` |
| `--auth` | `external` | `external`, `local` |
| `--auth-provider` | `zitadel` | `zitadel`, `auth0`, `keycloak`, `custom` |

---

## Feature Documentation

Detailed implementation and usage guides are available under `docs/`:

- `docs/background-jobs.md`
- `docs/i18n.md`
- `docs/features/settings.md`
- `docs/features/rbac.md`
- `docs/features/notifications.md`
- `docs/features/billing.md`
- `docs/features/ai-assistant.md`
- `docs/features/background-jobs.md`
- `docs/features/modules.md`
- `docs/features/email-and-auth-server-settings.md`

---

## Getting Started for Contributors

### Prerequisites

- Node.js 20+
- pnpm 10+ (`npm install -g pnpm`)
- Git

### Clone and install

```bash
git clone https://github.com/FutureEdgePro/FutureEdge.HubForge.git
cd FutureEdge.HubForge
pnpm install
```

### Build the CLI

```bash
pnpm hubforge:build
```

This compiles `packages/hubforge-cli/src/` to `packages/hubforge-cli/dist/`.

### Run the CLI locally

```bash
# Via the root workspace script
pnpm hubforge init test-project --template full --db sqlite

# Or directly
node packages/hubforge-cli/dist/cli.js init test-project --template full --db sqlite
```

### Typecheck everything

```bash
pnpm typecheck
```

### Smoke-test a generated project

```bash
# Scaffold a test project
pnpm hubforge init _smoke_test --template full-postgres-rls --db postgres --auth external --auth-provider zitadel

# Enter the project
cd _smoke_test

# Install dependencies
pnpm install

# Run typecheck inside the generated project
pnpm typecheck
```

---

## Contribution Guide

### Where to make changes

| Change type | Location |
|-------------|---------|
| Add/change generated file content | `packages/hubforge-cli/src/template-packs/full-pack.ts` |
| Add Postgres RLS-specific files | `packages/hubforge-cli/src/template-packs/full-postgres-rls-pack.ts` |
| Add/change a feature generator | `packages/hubforge-cli/src/commands/feature.ts` |
| Add/change a CLI command | `packages/hubforge-cli/src/commands/` |
| Add new scaffold option types | `packages/hubforge-cli/src/template-packs/types.ts` |
| Update CLI help text | `packages/hubforge-cli/src/cli.ts` |

### Template string conventions

Generated file content is returned from functions that return template literal strings, e.g.:

```typescript
function apiServerTs(): string {
  return `import { Hono } from 'hono';
// ... file content ...
`;
}
```

**Critical rules:**
- Each template-returning function must close with `` `; `` then `}` on separate lines
- Do **not** leave a blank line between `` ` `` and `}` — this causes silent unclosed template bugs
- Use `${'${expr}'}` to escape template expressions that should appear literally in the generated output (e.g., GitHub Actions `${{ }}` syntax)
- Test all changes with `pnpm hubforge:build` immediately after editing

### Adding a new generated file

1. Add a `writeTextFile(...)` call in `scaffoldFullTemplatePack()` (or the RLS variant)
2. Write a `function myNewFileTs(): string { return \`...\`; }` function
3. If the file requires new npm dependencies in a generated package, update the relevant `*PackageJson()` function
4. Build and smoke-test: `pnpm hubforge:build && hubforge init _test --template full`

### Adding a new feature generator type

1. Add the new type to the union in `feature.ts` (`FeatureType`)
2. Add a case in the `generateFeature()` switch statement
3. Write template functions for the files the feature generates
4. Update `cli.ts` help text
5. Update `readme/CLI-Instructions.md`

### Documentation protocol

Per `readme/Agent-Handoff-Protocol.md`:

- Update `readme/Modification-References.md` with a dated entry for every meaningful change
- Update `readme/HubForge-Feature-Todos.md` to reflect completed items and new backlog
- Keep this README current when the stack or architecture changes

### Running CI checks locally

```bash
pnpm hubforge:build    # CLI compiles
pnpm typecheck         # All TS in repo typechecks
```

---

## Repository Layout

```
FutureEdge.HubForge/
├── packages/
│   └── hubforge-cli/          # The CLI package (@hubforge/cli)
│       └── src/
│           ├── cli.ts          # Entry point and command router
│           ├── index.ts        # Package exports
│           ├── commands/
│           │   ├── init.ts     # hubforge init
│           │   └── feature.ts  # hubforge feature
│           ├── template-packs/
│           │   ├── types.ts               # Scaffold option types
│           │   ├── full-pack.ts           # Full template (all generated files)
│           │   └── full-postgres-rls-pack.ts  # Postgres RLS variant
│           └── lib/
│               └── fs.ts       # writeTextFile helper
├── readme/
│   ├── CLI-Instructions.md        # User-facing CLI command docs
│   ├── Implementation-Details.md  # Architecture rationale
│   ├── Modification-References.md # Change log
│   ├── HubForge-Feature-Todos.md  # Backlog tracker
│   └── Agent-Handoff-Protocol.md  # AI agent continuity protocol
├── tsconfig.base.json
├── package.json                   # Root workspace scripts
└── pnpm-workspace.yaml
```

---

## Design Principles

1. **Own your output** — generated code is yours. No runtime HubForge dependency in generated projects.
2. **Explicit over magic** — profile choices (DB, auth, tenancy mode) are recorded in generated files. Nothing is inferred at runtime.
3. **Stack parity between apps** — `apps/ui` and `apps/portal` use the same framework and build toolchain so knowledge transfers directly.
4. **Layered escape hatches** — every generated abstraction is thin. Swap Hono for Express, replace Firebase with your own dispatcher — no framework lock-in.
5. **Security by default** — auth middleware is wired into the server from day one. Routes must opt out of auth, not opt in.
6. **Test-first scaffolding** — every app and package gets a vitest config and at least one smoke test. Playwright e2e is included in every generated project.

---

## Roadmap

See `readme/HubForge-Feature-Todos.md` for the detailed backlog. High-level upcoming work:

- [ ] Plugin/hook system for third-party HubForge modules
- [ ] Schema-per-tenant and DB-per-tenant tenancy templates
- [ ] NATS JetStream event sourcing scaffold
- [ ] OpenAPI spec generation from Hono routes
- [ ] Admin UI module generator (data tables, forms, detail views)
- [ ] Kubernetes manifest generation (`hubforge infra --target k8s`)
- [ ] Interactive `hubforge init` prompts (when no flags provided)
- [ ] `hubforge upgrade` to apply new HubForge template changes to existing projects

---

*Built by [FutureEdge Pro](https://github.com/FutureEdgePro). Licensed MIT.*
