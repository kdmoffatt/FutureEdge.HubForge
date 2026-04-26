# HubForge Implementation Details

## Why this implementation first

This implementation establishes a practical baseline for a cross-platform CLI that scaffolds a production-ready TypeScript SaaS monorepo in a single command — analogous to Laravel `new` or `dotnet new` but for the TypeScript/React ecosystem.

- Node-based CLI runs on Windows, macOS, and Linux
- `init` scaffolds a tenant-aware, environment-aware monorepo baseline
- Database choice is explicit and generated into config from day one
- Migration tracking is included by default via committed Prisma migrations
- Authentication is wired from day one (not bolted on later)

## Technology choices

### CLI

- **Language:** TypeScript (compiled to ESM, Node.js 20+)
- **Argument parsing:** Raw `process.argv` with Zod validation
- **File generation:** Node.js `fs/promises` via a `writeTextFile` helper
- **Build:** `tsc` (no bundler — the CLI is a pure Node script)

### Generated API (apps/api)

- **Framework:** Hono v4 — chosen for its minimal footprint, excellent TypeScript types, and compatibility with edge runtimes (future deployment target)
- **Auth:** `jose` library — JOSE-standard, zero native dependencies, works in Node and edge environments
- **Background jobs:** BullMQ + IORedis — the de facto Redis queue for Node.js with mature TypeScript types and UI tooling
- **Push notifications:** `firebase-admin` — covers FCM for both Android and iOS; supports service account and ADC credentials
- **Validation:** Zod — colocated schema + type inference, no code generation step

### Generated Front-end (apps/ui and apps/portal)

- **Framework:** React Router v7 (framework mode) — chosen over Next.js for its clean loader/action data flow, explicit SSR control, and absence of vendor lock-in
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite` — zero PostCSS config, integrated with Vite
- **Build:** Vite 5 — fast HMR, excellent plugin ecosystem, native ESM output

### Generated Database

- **ORM:** Prisma — chosen for its multi-provider support (sqlite/postgres/mysql/sqlserver) and committed migration files (no implicit drift)
- **Tenancy:** Shared DB by default; schema-per-tenant with RLS in `full-postgres-rls` template

### Generated AI Service (apps/ai)

- **Framework:** FastAPI (Python 3.11+) — industry standard for ML serving, async-native, OpenAPI auto-generation

### Generated Infrastructure

- **Containerisation:** Docker + Docker Compose for local; Dockerfiles per app for production
- **Message broker:** NATS (included in Compose, optional usage)
- **Cache/queue:** Redis (required for BullMQ webhook retry)

### Testing

- **Unit/integration:** Vitest — fast, ESM-native, compatible with Vite config
- **E2e:** Playwright — reliable cross-browser automation, `webServer` integration for zero-config CI setup

## Runtime auth middleware design

The generated `apps/api/src/lib/auth.ts` is a real JWT validation implementation using `jose`:

1. `authProfileFromEnv()` reads `AUTH_MODE`, `AUTH_PROVIDER`, `AUTH_ISSUER_URL`, `AUTH_AUDIENCE` at runtime
2. `verifyExternalToken()` fetches JWKS from `{issuer}/.well-known/jwks.json` and validates with issuer + audience claims
3. `verifyLocalToken()` validates a symmetric HMAC JWT for local development
4. `requireAuth()` is a Hono middleware that extracts the Bearer token, validates it, and sets `auth` on the context

This means no additional configuration is needed to swap between Zitadel, Auth0, and Keycloak — only the environment variables change.

## Webhook retry queue design

The generated `apps/api/src/lib/webhook-queue.ts` uses BullMQ directly:

- Queue and Worker share a single IORedis connection
- `enqueueWebhookDelivery()` adds a job with configured retry policy
- `startWebhookWorker()` is called at server boot; it starts an in-process worker
- Failed jobs emit `failed` events for structured logging

This is intentionally an in-process worker for simplicity. In production, the worker can be extracted to a separate `apps/worker` app using the same queue name.

## Design constraints applied

- Generated code has **no runtime HubForge dependency** — generated apps are standalone
- Profile choices are **recorded in generated files** (`.env.*`, `hubforge.json`)
- Template functions are **pure string templates** — no file copying, no runtime code generation
- Each generated package is independently typecheckable

## Completed implementation milestones

- [x] CLI package + root workspace scaffolding
- [x] `full` and `full-postgres-rls` template packs (complete monorepo)
- [x] Portal/public split (apps/ui vs apps/portal)
- [x] All base feature generators (api, api-resource, ui, public-page, tenant-module, worker)
- [x] Auth flags (`--auth`, `--auth-provider`) with Zitadel default
- [x] Extended feature generators: auth-flow, billing-module, notifications-module, ai-agent
- [x] New baseline packages: appstack, auth-client, sdk-server
- [x] DB bootstrap + non-Docker Postgres migration support
- [x] Real JWT/OIDC auth middleware using `jose` (Zitadel/Auth0/Keycloak/local)
- [x] Real Firebase push dispatcher (firebase-admin, ADC + service account)
- [x] Real BullMQ webhook retry queue (5 attempts, exponential backoff)
- [x] Playwright e2e wiring (config + smoke spec + CI workflow)
- [x] Comprehensive root README for open-source contributors

## Next expansion targets

- Plugin/hook system for third-party HubForge modules
- Schema-per-tenant and DB-per-tenant tenancy templates
- NATS JetStream event sourcing scaffold
- OpenAPI spec generation from Hono routes
- Admin UI module generator (data tables, forms, detail views)
- Kubernetes manifest generation
- Interactive `hubforge init` prompts
- `hubforge upgrade` to diff and apply template changes to existing projects
