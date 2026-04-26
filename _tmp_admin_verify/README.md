# _tmp_admin_verify

> Scaffolded with [HubForge CLI](https://github.com/FutureEdgePro/FutureEdge.HubForge) — opinionated full-stack SaaS scaffolding for TypeScript monorepos.

---

## Project profile

| Setting | Value |
|---------|-------|
| Database | sqlite |
| Tenancy mode | shared |
| AI service | fastapi |
| Auth mode | local |
| Auth provider | zitadel |

---

## Application stack

### API (apps/api) — port 4000

- **Framework:** [Hono v4](https://hono.dev) — lightweight, edge-ready HTTP framework
- **Auth:** JWT/OIDC validation via `jose` (JWKS discovery for zitadel)
- **Webhooks:** BullMQ + Redis retry queue with exponential backoff
- **Push:** Firebase Admin SDK for FCM push notifications
- **Validation:** Zod request schemas

### Public site (apps/ui) — port 3010

- **Framework:** [React Router v7](https://reactrouter.com) — server-side rendering (SSR)
- **Styling:** Tailwind CSS v4
- **Build:** Vite 5

### Authenticated portal (apps/portal) — port 3001

- **Framework:** [React Router v7](https://reactrouter.com) — SSR, protected layout hierarchy
- **Styling:** Tailwind CSS v4
- **Build:** Vite 5

### AI service (apps/ai) — port 5000

- **Framework:** [FastAPI](https://fastapi.tiangolo.com) (Python 3.11+)
- **ASGI:** Uvicorn

### Database

- **ORM:** [Prisma](https://www.prisma.io)
- **Provider:** sqlite
- **Multi-tenancy:** shared database

### Packages

| Package | Purpose |
|---------|---------|
| `@hubforge/api-client` | Type-safe fetch client for the API |
| `@hubforge/tenancy` | Tenant context resolution middleware |
| `@hubforge/appstack` | Module capability registry |
| `@hubforge/auth-client` | Browser OIDC session helpers |
| `@hubforge/sdk-server` | Server-side typed SDK wrappers |
| `@hubforge/db` | Prisma schema + migrations + bootstrap |

---

## Quick start

### Prerequisites

- Node.js 20+
- pnpm 10+ (`npm install -g pnpm`)
- Docker (for local infrastructure)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start infrastructure

```bash
pnpm infra:up
```

Starts PostgreSQL (5432), Redis (6379), and NATS (4222) via Docker Compose.

### 3. Bootstrap the database

```bash
pnpm db:migrate
```

This creates the database user/schema (if needed) and runs Prisma migrations.

### 4. Configure environment

Copy `.env.local` and fill in your values:

```bash
# Auth (zitadel)
AUTH_ISSUER_URL=http://localhost:8080
AUTH_CLIENT_ID=your-client-id
AUTH_CLIENT_SECRET=your-client-secret

# Firebase (push notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...

# Stripe (billing)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 5. Start the applications

```bash
pnpm dev:api      # API on :4000
pnpm dev:ui       # Public site on :3010
pnpm dev:portal   # Portal on :3001
```

---

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm build` | Build all packages and apps |
| `pnpm typecheck` | TypeScript check across all packages |
| `pnpm test` | Run all unit/integration tests (Vitest) |
| `pnpm test:e2e` | Run Playwright end-to-end tests |
| `pnpm dev:api` | Start API dev server with hot reload |
| `pnpm dev:ui` | Start public site dev server |
| `pnpm dev:portal` | Start portal dev server |
| `pnpm infra:up` | Start Docker Compose services |
| `pnpm infra:down` | Stop Docker Compose services |
| `pnpm db:migrate` | Bootstrap DB + run Prisma migrations |
| `pnpm db:generate` | Regenerate Prisma client |

---

## Adding features

Use the HubForge CLI from the project root to add new feature modules:

```bash
# Tenant-scoped module (CRM, inventory, etc.)
hubforge feature crm --type tenant-module

# Public-facing page
hubforge feature pricing --type public-page

# Billing module (Stripe)
hubforge feature billing --type billing-module

# Push notifications module (Firebase)
hubforge feature alerts --type notifications-module

# Auth flow (login/register/callback routes)
hubforge feature auth --type auth-flow

# AI agent endpoint (FastAPI backed)
hubforge feature embeddings --type ai-agent

# Background worker
hubforge feature sync --type worker
```

---

## Testing

```bash
# Unit and integration tests
pnpm test

# Watch mode
pnpm test:watch

# End-to-end (Playwright — requires apps running or uses webServer config)
pnpm test:e2e
```

---

## CI/CD

Three GitHub Actions workflows are included:

| Workflow | Trigger |
|---------|---------|
| `.github/workflows/ci.yml` | Pull requests to `main` |
| `.github/workflows/e2e.yml` | Pull requests + manual dispatch |
| `.github/workflows/release.yml` | Version tag push (`v*.*.*`) |
