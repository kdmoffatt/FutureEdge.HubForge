import path from 'node:path';
import { writeTextFile } from '../lib/fs.js';
import type { DbProvider, InitScaffoldOptions, TenantMode } from './types.js';

export async function scaffoldFullTemplatePack(targetDir: string, options: InitScaffoldOptions): Promise<void> {
  await writeTextFile(path.join(targetDir, 'package.json'), rootPackageJson(options.projectName));
  await writeTextFile(path.join(targetDir, 'pnpm-workspace.yaml'), workspaceYaml());
  await writeTextFile(path.join(targetDir, 'turbo.json'), turboConfig());
  await writeTextFile(path.join(targetDir, 'tsconfig.base.json'), tsconfigBase());
  await writeTextFile(path.join(targetDir, '.gitignore'), rootGitIgnore());
  await writeTextFile(path.join(targetDir, 'README.md'), projectReadme(options));
  await writeTextFile(path.join(targetDir, 'hubforge.plugins.mjs'), hubforgePluginsFile());

  await writeTextFile(path.join(targetDir, '.env.local'), envFile(options, 'local'));
  await writeTextFile(path.join(targetDir, '.env.staging'), envFile(options, 'staging'));
  await writeTextFile(path.join(targetDir, '.env.production'), envFile(options, 'production'));

  await writeTextFile(path.join(targetDir, 'infra', 'compose', 'docker-compose.yml'), composeFile(options));
  await writeTextFile(path.join(targetDir, 'infra', 'k8s', 'namespace.yaml'), k8sNamespaceYaml());
  await writeTextFile(path.join(targetDir, 'infra', 'k8s', 'api-deployment.yaml'), k8sApiDeploymentYaml());
  await writeTextFile(path.join(targetDir, 'infra', 'k8s', 'portal-deployment.yaml'), k8sPortalDeploymentYaml());
  await writeTextFile(path.join(targetDir, 'infra', 'k8s', 'ui-deployment.yaml'), k8sUiDeploymentYaml());

  await writeTextFile(path.join(targetDir, 'apps', 'api', 'package.json'), apiPackageJson());
  await writeTextFile(path.join(targetDir, 'apps', 'api', 'tsconfig.json'), appTsConfig());
  await writeTextFile(path.join(targetDir, 'apps', 'api', 'Dockerfile'), apiDockerfile());
  await writeTextFile(path.join(targetDir, 'apps', 'api', 'src', 'server.ts'), apiServerTs(options));
  await writeTextFile(path.join(targetDir, 'apps', 'api', 'src', 'lib', 'auth.ts'), apiAuthLibTs());
  await writeTextFile(path.join(targetDir, 'apps', 'api', 'src', 'lib', 'notifications.ts'), apiNotificationsLibTs());
  await writeTextFile(path.join(targetDir, 'apps', 'api', 'src', 'lib', 'webhook-queue.ts'), apiWebhookQueueLibTs());
  await writeTextFile(path.join(targetDir, 'apps', 'api', 'src', 'routes', 'health.ts'), apiHealthRouteTs());
  await writeTextFile(path.join(targetDir, 'apps', 'api', 'src', 'routes', 'tenancy.ts'), apiTenancyRouteTs());
  await writeTextFile(path.join(targetDir, 'apps', 'api', 'src', 'routes', 'auth.ts'), apiAuthRouteTs(options));
  if (options.authServer) {
    await writeTextFile(path.join(targetDir, 'apps', 'api', 'src', 'routes', 'auth-server-settings.ts'), apiAuthServerSettingsRouteTs());
  }
  await writeTextFile(path.join(targetDir, 'apps', 'api', 'src', 'routes', 'health.test.ts'), apiHealthRouteTestTs());
  await writeTextFile(path.join(targetDir, 'apps', 'api', 'vitest.config.ts'), apiVitestConfigTs());

  // apps/portal - authenticated tenant admin (React Router 7 SSR, port 3001)
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'package.json'), portalPackageJson());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'tsconfig.json'), rrAppTsConfig());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'vite.config.ts'), rrViteConfig());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'react-router.config.ts'), rrReactRouterConfigPortal());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'root.tsx'), portalRootTsx());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes.ts'), rrRoutesTs());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'app.css'), tailwindCss());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'lib', 'theme.ts'), portalThemeLibTs());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', '_index.tsx'), portalIndexRoute());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', 'login.tsx'), portalLoginRoute());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', '_app.tsx'), portalAppLayout(options));
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', '_app.dashboard._index.tsx'), portalDashboardRoute());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', '_app.docs._index.tsx'), portalDocsRoute());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', '_app.settings._index.tsx'), portalSettingsIndexRoute(options));
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', '_app.settings.theme._index.tsx'), portalThemeSettingsRoute());
  if (options.authServer) {
    await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', '_app.settings.auth-server._index.tsx'), portalAuthServerSettingsRoute());
  }
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'vitest.config.ts'), webVitestConfigTs());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'tests', 'smoke.test.ts'), webSmokeTestTs('portal'));

  // apps/ui - public-facing site (React Router 7 SSR, port 3010)
  await writeTextFile(path.join(targetDir, 'apps', 'ui', 'package.json'), uiPackageJson());
  await writeTextFile(path.join(targetDir, 'apps', 'ui', 'tsconfig.json'), rrAppTsConfig());
  await writeTextFile(path.join(targetDir, 'apps', 'ui', 'vite.config.ts'), rrViteConfig());
  await writeTextFile(path.join(targetDir, 'apps', 'ui', 'react-router.config.ts'), rrReactRouterConfigUi());
  await writeTextFile(path.join(targetDir, 'apps', 'ui', 'app', 'root.tsx'), uiRootTsx());
  await writeTextFile(path.join(targetDir, 'apps', 'ui', 'app', 'routes.ts'), rrRoutesTs());
  await writeTextFile(path.join(targetDir, 'apps', 'ui', 'app', 'app.css'), tailwindCss());
  await writeTextFile(path.join(targetDir, 'apps', 'ui', 'app', 'routes', '_index.tsx'), uiLandingRoute());
  await writeTextFile(path.join(targetDir, 'apps', 'ui', 'vitest.config.ts'), webVitestConfigTs());
  await writeTextFile(path.join(targetDir, 'apps', 'ui', 'app', 'tests', 'smoke.test.ts'), webSmokeTestTs('ui'));

  if (options.aiMode === 'fastapi') {
    await writeTextFile(path.join(targetDir, 'apps', 'ai', 'requirements.txt'), aiRequirementsTxt());
    await writeTextFile(path.join(targetDir, 'apps', 'ai', 'Dockerfile'), aiDockerfile());
    await writeTextFile(path.join(targetDir, 'apps', 'ai', 'main.py'), aiMainPy());
  }

  // packages/api-client
  await writeTextFile(path.join(targetDir, 'packages', 'api-client', 'package.json'), apiClientPackageJson());
  await writeTextFile(path.join(targetDir, 'packages', 'api-client', 'tsconfig.json'), packageTsConfig());
  await writeTextFile(path.join(targetDir, 'packages', 'api-client', 'src', 'index.ts'), apiClientIndexTs());

  // packages/tenancy
  await writeTextFile(path.join(targetDir, 'packages', 'tenancy', 'package.json'), tenancyPackageJson());
  await writeTextFile(path.join(targetDir, 'packages', 'tenancy', 'tsconfig.json'), packageTsConfig());
  await writeTextFile(path.join(targetDir, 'packages', 'tenancy', 'src', 'index.ts'), tenancyIndexTs());

  // packages/appstack
  await writeTextFile(path.join(targetDir, 'packages', 'appstack', 'package.json'), appstackPackageJson());
  await writeTextFile(path.join(targetDir, 'packages', 'appstack', 'tsconfig.json'), packageTsConfig());
  await writeTextFile(path.join(targetDir, 'packages', 'appstack', 'src', 'index.ts'), appstackIndexTs());

  // packages/auth-client
  await writeTextFile(path.join(targetDir, 'packages', 'auth-client', 'package.json'), authClientPackageJson());
  await writeTextFile(path.join(targetDir, 'packages', 'auth-client', 'tsconfig.json'), packageTsConfig());
  await writeTextFile(path.join(targetDir, 'packages', 'auth-client', 'src', 'index.ts'), authClientIndexTs());

  // packages/sdk-server
  await writeTextFile(path.join(targetDir, 'packages', 'sdk-server', 'package.json'), sdkServerPackageJson());
  await writeTextFile(path.join(targetDir, 'packages', 'sdk-server', 'tsconfig.json'), packageTsConfig());
  await writeTextFile(path.join(targetDir, 'packages', 'sdk-server', 'src', 'index.ts'), sdkServerIndexTs());

  // packages/events (JetStream-ready event sourcing baseline)
  await writeTextFile(path.join(targetDir, 'packages', 'events', 'package.json'), eventsPackageJson());
  await writeTextFile(path.join(targetDir, 'packages', 'events', 'tsconfig.json'), packageTsConfig());
  await writeTextFile(path.join(targetDir, 'packages', 'events', 'src', 'index.ts'), eventsIndexTs());
  await writeTextFile(path.join(targetDir, 'packages', 'events', 'src', 'jetstream.ts'), eventsJetstreamTs());

  // packages/hubforge-plugin-sdk
  await writeTextFile(path.join(targetDir, 'packages', 'hubforge-plugin-sdk', 'package.json'), hubforgePluginSdkPackageJson());
  await writeTextFile(path.join(targetDir, 'packages', 'hubforge-plugin-sdk', 'tsconfig.json'), packageTsConfig());
  await writeTextFile(path.join(targetDir, 'packages', 'hubforge-plugin-sdk', 'src', 'index.ts'), hubforgePluginSdkIndexTs());

  // packages/db
  await writeTextFile(path.join(targetDir, 'packages', 'db', 'package.json'), dbPackageJson());
  await writeTextFile(path.join(targetDir, 'packages', 'db', 'tsconfig.json'), packageTsConfig());
  await writeTextFile(path.join(targetDir, 'packages', 'db', '.env'), dbEnvFile(options.dbProvider));
  await writeTextFile(path.join(targetDir, 'packages', 'db', 'scripts', 'bootstrap-postgres.mjs'), dbBootstrapPostgresScript());
  await writeTextFile(path.join(targetDir, 'packages', 'db', 'src', 'index.ts'), dbIndexTs());
  await writeTextFile(path.join(targetDir, 'packages', 'db', 'scripts', 'seed.mjs'), dbSeedScript());
  await writeTextFile(path.join(targetDir, 'packages', 'db', 'prisma', 'schema.prisma'), prismaSchema(options));
  await writeTextFile(path.join(targetDir, 'packages', 'db', 'migrations', '0001_init.sql'), initialMigrationSql(options));

  // Root test + CI scaffolding
  await writeTextFile(path.join(targetDir, 'playwright.config.ts'), playwrightConfigTs());
  await writeTextFile(path.join(targetDir, 'e2e', 'smoke.spec.ts'), e2eSmokeSpecTs());
  await writeTextFile(path.join(targetDir, 'vitest.workspace.ts'), vitestWorkspace());
  await writeTextFile(path.join(targetDir, '.github', 'workflows', 'ci.yml'), ciWorkflowYaml());
  await writeTextFile(path.join(targetDir, '.github', 'workflows', 'release.yml'), releaseWorkflowYaml());
  await writeTextFile(path.join(targetDir, '.github', 'workflows', 'e2e.yml'), e2eWorkflowYaml());
}

function rootPackageJson(projectName: string): string {
  const pkg = {
    name: projectName,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {
      build: 'pnpm -r run build',
      dev: 'pnpm --filter @hubforge/api dev',
      'dev:all': 'pnpm turbo dev',
      'dev:api': 'pnpm --filter @hubforge/api dev',
      'dev:ui': 'pnpm --filter @hubforge/ui-app dev',
      'dev:portal': 'pnpm --filter @hubforge/portal dev',
      'db:bootstrap': 'pnpm --filter @hubforge/db db:bootstrap',
      'db:migrate': 'pnpm db:bootstrap && pnpm --filter @hubforge/db db:migrate',
      'db:generate': 'pnpm --filter @hubforge/db db:generate',
      'db:seed': 'pnpm --filter @hubforge/db db:seed',
      'infra:up': 'docker compose -f infra/compose/docker-compose.yml up -d',
      'infra:down': 'docker compose -f infra/compose/docker-compose.yml down',
      'infra:k8s': 'echo "Apply manifests from infra/k8s with kubectl apply -f infra/k8s"',
      typecheck: 'pnpm -r run typecheck',
      test: 'vitest run --workspace vitest.workspace.ts',
      'test:watch': 'vitest --workspace vitest.workspace.ts',
      'test:e2e': 'playwright test',
    },
    devDependencies: {
      '@playwright/test': '^1.54.2',
      jsdom: '^26.1.0',
      turbo: '^2.0.0',
      typescript: '^5.4.0',
      vitest: '^2.0.0',
    },
  };

  return `${JSON.stringify(pkg, null, 2)}\n`;
}

function workspaceYaml(): string {
  return `packages:\n  - 'apps/*'\n  - 'packages/*'\n`;
}

function turboConfig(): string {
  return `{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "db:migrate": {
      "cache": false
    },
    "db:generate": {
      "cache": false
    }
  }
}
`;
}

function tsconfigBase(): string {
  return `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
`;
}

function rootGitIgnore(): string {
  return `node_modules/
.dist/
dist/
.env
.env.*.local
.DS_Store
`;
}

function projectReadme(options: InitScaffoldOptions): string {
  return `# ${options.projectName}

> Scaffolded with [HubForge CLI](https://github.com/FutureEdgePro/FutureEdge.HubForge) — opinionated full-stack SaaS scaffolding for TypeScript monorepos.

---

## Project profile

| Setting | Value |
|---------|-------|
| Database | ${options.dbProvider} |
| Tenancy mode | ${options.tenantMode} |
| AI service | ${options.aiMode} |
| Auth mode | ${options.authMode} |
| Auth provider | ${options.authProvider} |

---

## Application stack

### API (apps/api) — port 4000

- **Framework:** [Hono v4](https://hono.dev) — lightweight, edge-ready HTTP framework
- **Auth:** JWT/OIDC validation via \`jose\` (JWKS discovery for ${options.authProvider})
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

${options.aiMode === 'fastapi' ? `### AI service (apps/ai) — port 5000

- **Framework:** [FastAPI](https://fastapi.tiangolo.com) (Python 3.11+)
- **ASGI:** Uvicorn

` : ''}\
### Database

- **ORM:** [Prisma](https://www.prisma.io)
- **Provider:** ${options.dbProvider}
- **Multi-tenancy:** ${options.tenantMode === 'db-per-tenant'
    ? 'database-per-tenant'
    : options.tenantMode === 'schema-per-tenant' || options.tenantMode === 'isolated'
      ? 'schema-per-tenant / isolated'
      : 'shared database'}

### Packages

| Package | Purpose |
|---------|---------|
| \`@hubforge/api-client\` | Type-safe fetch client for the API |
| \`@hubforge/tenancy\` | Tenant context resolution middleware |
| \`@hubforge/appstack\` | Module capability registry |
| \`@hubforge/auth-client\` | Browser OIDC session helpers |
| \`@hubforge/sdk-server\` | Server-side typed SDK wrappers |
| \`@hubforge/db\` | Prisma schema + migrations + bootstrap |

---

## Quick start

### Prerequisites

- Node.js 20+
- pnpm 10+ (\`npm install -g pnpm\`)
- Docker (for local infrastructure)

### 1. Install dependencies

\`\`\`bash
pnpm install
\`\`\`

### 2. Start infrastructure

\`\`\`bash
pnpm infra:up
\`\`\`

Starts PostgreSQL (5432), Redis (6379), and NATS (4222) via Docker Compose.

### 3. Bootstrap the database

\`\`\`bash
pnpm db:migrate
\`\`\`

This creates the database user/schema (if needed) and runs Prisma migrations.

### 4. Configure environment

Copy \`.env.local\` and fill in your values:

\`\`\`bash
# Auth (${options.authProvider})
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
\`\`\`

### 5. Start the applications

\`\`\`bash
pnpm dev:api      # API on :4000
pnpm dev:ui       # Public site on :3010
pnpm dev:portal   # Portal on :3001
\`\`\`

---

## Scripts

| Script | Description |
|--------|-------------|
| \`pnpm build\` | Build all packages and apps |
| \`pnpm typecheck\` | TypeScript check across all packages |
| \`pnpm test\` | Run all unit/integration tests (Vitest) |
| \`pnpm test:e2e\` | Run Playwright end-to-end tests |
| \`pnpm dev:api\` | Start API dev server with hot reload |
| \`pnpm dev:ui\` | Start public site dev server |
| \`pnpm dev:portal\` | Start portal dev server |
| \`pnpm infra:up\` | Start Docker Compose services |
| \`pnpm infra:down\` | Stop Docker Compose services |
| \`pnpm db:migrate\` | Bootstrap DB + run Prisma migrations |
| \`pnpm db:generate\` | Regenerate Prisma client |

---

## Adding features

Use the HubForge CLI from the project root to add new feature modules:

\`\`\`bash
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
\`\`\`

---

## Testing

\`\`\`bash
# Unit and integration tests
pnpm test

# Watch mode
pnpm test:watch

# End-to-end (Playwright — requires apps running or uses webServer config)
pnpm test:e2e
\`\`\`

---

## CI/CD

Three GitHub Actions workflows are included:

| Workflow | Trigger |
|---------|---------|
| \`.github/workflows/ci.yml\` | Pull requests to \`main\` |
| \`.github/workflows/e2e.yml\` | Pull requests + manual dispatch |
| \`.github/workflows/release.yml\` | Version tag push (\`v*.*.*\`) |
`;
}

function envFile(options: InitScaffoldOptions, stage: 'local' | 'staging' | 'production'): string {
  return `NODE_ENV=${stage === 'production' ? 'production' : 'development'}
ENVIRONMENT=${stage}
TENANT_MODE=${options.tenantMode}
DATABASE_URL=${databaseUrlFor(options.dbProvider)}
REDIS_URL=redis://localhost:6379
NATS_URL=nats://localhost:4222
API_PORT=4000
UI_PORT=3010
PORTAL_PORT=3001
AI_PORT=5000
AUTH_MODE=${options.authMode}
AUTH_PROVIDER=${options.authProvider}
AUTH_ISSUER_URL=http://localhost:8080
AUTH_CLIENT_ID=hubforge-web
AUTH_CLIENT_SECRET=change-me
BILLING_PROVIDER=stripe
BILLING_CURRENCY=USD
STRIPE_SECRET_KEY=sk_test_change_me
STRIPE_WEBHOOK_SECRET=whsec_change_me
STRIPE_PUBLISHABLE_KEY=pk_test_change_me
NOTIFICATION_PROVIDER=firebase
NOTIFICATION_CHANNEL=push
FIREBASE_PROJECT_ID=change-me
FIREBASE_CLIENT_EMAIL=change-me
FIREBASE_PRIVATE_KEY=change-me
BACKGROUND_JOB_BACKEND=redis
WEBHOOK_ENDPOINT_URL=http://localhost:4000/v1/webhooks/inbound
SMTP_HOST=localhost
SMTP_PORT=1025
AI_MODEL=gpt-4o-mini
`;
}

function databaseUrlFor(provider: DbProvider): string {
  if (provider === 'sqlite') {
    return 'file:./dev.db';
  }

  if (provider === 'postgres') {
    return 'postgresql://hubforge:hubforge@localhost:5432/hubforge';
  }

  if (provider === 'mysql') {
    return 'mysql://hubforge:hubforge@localhost:3306/hubforge';
  }

  return 'sqlserver://localhost:1433;database=hubforge;user=sa;password=YourStrong!Passw0rd;encrypt=true;trustServerCertificate=true';
}

function dbEnvFile(provider: DbProvider): string {
  const databaseUrl = databaseUrlFor(provider);
  if (provider === 'postgres') {
    return `DATABASE_URL=${databaseUrl}\nSHADOW_DATABASE_URL=postgresql://hubforge:hubforge@localhost:5432/hubforge_shadow\n`;
  }
  return `DATABASE_URL=${databaseUrl}\n`;
}

function composeFile(options: InitScaffoldOptions): string {
  const dbService = options.dbProvider === 'postgres'
    ? `  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: hubforge
      POSTGRES_PASSWORD: hubforge
      POSTGRES_DB: hubforge
    ports:
      - '5432:5432'`
    : options.dbProvider === 'mysql'
      ? `  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: hubforge
      MYSQL_USER: hubforge
      MYSQL_PASSWORD: hubforge
    ports:
      - '3306:3306'`
      : options.dbProvider === 'sqlserver'
        ? `  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      ACCEPT_EULA: 'Y'
      MSSQL_SA_PASSWORD: 'YourStrong!Passw0rd'
    ports:
      - '1433:1433'`
        : `  # SQLite default profile runs without a DB container`;

  const aiService = options.aiMode === 'fastapi'
    ? `
  ai:
    build: ../../apps/ai
    ports:
      - '5000:5000'`
    : '';

  return `version: '3.9'

services:
${dbService}

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

  nats:
    image: nats:2-alpine
    command: '-js -sd /data'
    ports:
      - '4222:4222'
      - '8222:8222'

  minio:
    image: minio/minio
    command: server /data --console-address ':9001'
    environment:
      MINIO_ROOT_USER: hubforge
      MINIO_ROOT_PASSWORD: hubforge-secret
    ports:
      - '9000:9000'
      - '9001:9001'${aiService}
`;
}

function appTsConfig(): string {
  return `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "../..",
    "baseUrl": ".",
    "paths": {
      "@hubforge/tenancy": ["../../packages/tenancy/src/index.ts"],
      "@hubforge/db": ["../../packages/db/src/index.ts"]
    }
  },
  "include": ["src", "../../packages/tenancy/src", "../../packages/db/src"]
}
`;
}

function packageTsConfig(): string {
  return `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src"]
}
`;
}

function apiPackageJson(): string {
  const pkg = {
    name: '@hubforge/api',
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'tsx watch src/server.ts',
      build: 'tsc -p tsconfig.json',
      typecheck: 'tsc --noEmit -p tsconfig.json',
      start: 'node dist/server.js',
    },
    dependencies: {
      '@hono/node-server': '^1.12.0',
      '@hubforge/db': 'workspace:*',
      '@hubforge/tenancy': 'workspace:*',
      bullmq: '^5.58.5',
      'firebase-admin': '^12.5.0',
      hono: '^4.8.0',
      ioredis: '^5.4.1',
      jose: '^5.9.3',
      zod: '^3.23.0',
    },
    devDependencies: {
      '@types/node': '^20.0.0',
      vitest: '^2.0.0',
      tsx: '^4.9.0',
      typescript: '^5.4.0',
    },
  };

  return `${JSON.stringify(pkg, null, 2)}\n`;
}

function apiDockerfile(): string {
  return `FROM node:20-alpine
WORKDIR /app
COPY . .
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @hubforge/api run build
EXPOSE 4000
CMD ["node", "apps/api/dist/server.js"]
`;
}

function apiServerTs(options: InitScaffoldOptions): string {
  const authServerImport = options.authServer ? "import { registerAuthServerSettingsRoutes } from './routes/auth-server-settings.js';\n" : '';
  const authServerRegister = options.authServer ? '\nregisterAuthServerSettingsRoutes(app);' : '';

  return `import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { requireAuth } from './lib/auth.js';
import { sendPushNotification } from './lib/notifications.js';
import { enqueueWebhookDelivery, startWebhookWorker } from './lib/webhook-queue.js';
import { resolveTenantContext } from '@hubforge/tenancy';
import { registerHealthRoutes } from './routes/health.js';
import { registerTenancyRoutes } from './routes/tenancy.js';
import { registerAuthRoutes } from './routes/auth.js';
${authServerImport}

const app = new Hono();
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const responseCache = new Map<string, { expiresAt: number; body: unknown }>();
const publicV1Paths = new Set([
  '/v1/tenancy/context',
  '/v1/auth/provider',
  '/v1/auth/login',
  '/v1/auth/register',
  '/v1/auth/me',
]);

app.use(
  '*',
  cors({
    origin: (origin) => origin ?? '*',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'x-environment', 'x-trace-id', 'x-request-id'],
    exposeHeaders: ['x-trace-id', 'x-request-id'],
    maxAge: 86_400,
  }),
);

function traceIdFromHeaders(req: Request): string {
  return req.headers.get('x-trace-id') ?? req.headers.get('x-request-id') ?? crypto.randomUUID();
}

app.use('*', async (c, next) => {
  const traceId = traceIdFromHeaders(c.req.raw);
  c.header('x-trace-id', traceId);
  c.header('x-request-id', traceId);
  c.header('x-content-type-options', 'nosniff');
  c.header('x-frame-options', 'DENY');
  c.header('referrer-policy', 'same-origin');

  const rateKey = c.req.header('x-forwarded-for') ?? c.req.header('x-real-ip') ?? 'local';
  const now = Date.now();
  const entry = requestCounts.get(rateKey) ?? { count: 0, resetAt: now + 60_000 };
  if (entry.resetAt < now) {
    entry.count = 0;
    entry.resetAt = now + 60_000;
  }
  entry.count += 1;
  requestCounts.set(rateKey, entry);
  if (entry.count > 300) {
    return c.json({ error: 'Too many requests' }, 429);
  }

  const authMode = process.env['AUTH_MODE'] ?? 'local';
  if (authMode === 'external' && c.req.path.startsWith('/v1') && !publicV1Paths.has(c.req.path)) {
    const authz = c.req.header('authorization');
    if (!authz) {
      return c.json({ error: 'Missing Authorization header' }, 401);
    }
  }

  const tenantIdHeader = c.req.header('x-tenant-id');
  const environmentHeader = c.req.header('x-environment');
  const tenantContext = resolveTenantContext({
    ...(tenantIdHeader ? { tenantId: tenantIdHeader } : {}),
    ...(environmentHeader ? { environment: environmentHeader } : {}),
  });

  const cacheKey = c.req.method + ':' + c.req.path;
  if (c.req.method === 'GET') {
    const hit = responseCache.get(cacheKey);
    if (hit && hit.expiresAt > now) {
      return c.json(hit.body);
    }
  }

  (c as unknown as { set: (key: string, value: unknown) => void }).set('tenantContext', tenantContext);
  (c as unknown as { set: (key: string, value: unknown) => void }).set('traceId', traceId);
  const startedAt = Date.now();
  await next();

  if (c.req.method === 'GET' && c.res.ok && c.req.path === '/v1/tenancy/context') {
    const body = await c.res.clone().json().catch(() => undefined);
    if (body) {
      responseCache.set(cacheKey, { expiresAt: Date.now() + 15_000, body });
    }
  }

  const latencyMs = Date.now() - startedAt;
  console.log(JSON.stringify({
    level: 'info',
    traceId,
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    latencyMs,
  }));

  return c.res;
});

registerHealthRoutes(app);
registerTenancyRoutes(app);
registerAuthRoutes(app);${authServerRegister}

app.use('/v1/*', async (c, next) => {
  if (publicV1Paths.has(c.req.path)) {
    await next();
    return;
  }
  await requireAuth(c, next);
});

app.post('/v1/notifications/push', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as {
    token?: unknown;
    title?: unknown;
    body?: unknown;
    data?: unknown;
  };

  if (typeof body.token !== 'string' || typeof body.title !== 'string' || typeof body.body !== 'string') {
    return c.json({ error: 'token, title and body are required' }, 400);
  }

  const messageId = await sendPushNotification({
    token: body.token,
    notification: { title: body.title, body: body.body },
    data: typeof body.data === 'object' && body.data ? (body.data as Record<string, string>) : undefined,
  });

  return c.json({ queued: false, messageId });
});

app.post('/v1/webhooks/dispatch', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as {
    endpoint?: unknown;
    payload?: unknown;
    headers?: unknown;
  };

  if (typeof body.endpoint !== 'string' || !body.payload) {
    return c.json({ error: 'endpoint and payload are required' }, 400);
  }

  const jobId = await enqueueWebhookDelivery({
    endpoint: body.endpoint,
    payload: body.payload,
    headers: typeof body.headers === 'object' && body.headers ? (body.headers as Record<string, string>) : undefined,
  });

  return c.json({ queued: true, jobId });
});

app.get('/', (c) => c.redirect('/docs'));

function openApiFromHonoRoutes() {
  const honoApp = app as unknown as { routes?: Array<{ method: string; path: string }> };
  const paths: Record<string, Record<string, unknown>> = {};

  for (const route of honoApp.routes ?? []) {
    const method = route.method.toLowerCase();
    if (method === 'options') {
      continue;
    }

    const normalizedPath = route.path.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
    const pathEntry = paths[normalizedPath] ?? {};
    pathEntry[method] = {
      summary: method.toUpperCase() + ' ' + normalizedPath,
      responses: {
        '200': { description: 'Success response' },
      },
    };
    paths[normalizedPath] = pathEntry;
  }

  return {
    openapi: '3.1.0',
    info: { title: 'HubForge API', version: '0.1.0', description: 'Generated from Hono routes' },
    servers: [{ url: 'http://localhost:4000', description: 'Local API' }],
    jsonSchemaDialect: 'https://json-schema.org/draft/2020-12/schema',
    paths,
  };
}

app.get('/openapi.json', (c) => {
  return c.json(openApiFromHonoRoutes());
});

app.get('/docs', (c) =>
  c.html([
    '<!doctype html>',
    '<html lang="en">',
    '  <head>',
    '    <meta charset="utf-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1" />',
    '    <title>HubForge API Reference</title>',
    '    <style>body { margin: 0; }</style>',
    '  </head>',
    '  <body>',
    '    <script id="api-reference" data-url="/openapi.json"></script>',
    '    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@latest/dist/browser/standalone.js" crossorigin></script>',
    '  </body>',
    '</html>',
  ].join('')),
);

app.get('/metrics', (c) => {
  return c.text('hubforge_requests_total ' + requestCounts.size + '\\n');
});

serve({
  fetch: app.fetch,
  port: Number(process.env['API_PORT'] ?? 4000),
});

startWebhookWorker();
`;
}

function apiHealthRouteTs(): string {
  return `import type { Hono } from 'hono';

export function registerHealthRoutes(app: Hono): void {
  app.get('/health', (c) => c.json({ ok: true, service: 'hubforge-api' }));
}
`;
}

function apiAuthLibTs(): string {
  return `import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { Context, Next } from 'hono';

const localIssuer = 'http://localhost:4000/local-auth';
const localAudience = 'hubforge-local';

function authProfileFromEnv() {
  const mode = process.env['AUTH_MODE'] ?? 'local';
  const provider = process.env['AUTH_PROVIDER'] ?? 'zitadel';
  const issuer = process.env['AUTH_ISSUER_URL']
    ?? (provider === 'auth0'
      ? 'https://example.us.auth0.com/'
      : provider === 'keycloak'
        ? 'http://localhost:8080/realms/master'
        : 'http://localhost:8080');
  const audience = process.env['AUTH_AUDIENCE'] ?? process.env['AUTH_CLIENT_ID'] ?? 'hubforge-web';

  return { mode, provider, issuer, audience };
}

function normalizeBearerToken(header: string | undefined): string | undefined {
  if (!header) {
    return undefined;
  }
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return undefined;
  }
  return token;
}

async function verifyExternalToken(token: string, issuer: string, audience: string) {
  const jwks = createRemoteJWKSet(new URL(issuer.replace(/\\/$/, '') + '/.well-known/jwks.json'));
  const { payload } = await jwtVerify(token, jwks, {
    issuer,
    audience,
  });
  return payload;
}

async function verifyLocalToken(token: string) {
  const secret = new TextEncoder().encode(process.env['AUTH_LOCAL_JWT_SECRET'] ?? 'hubforge-local-dev-secret');
  const { payload } = await jwtVerify(token, secret, {
    issuer: localIssuer,
    audience: localAudience,
  });
  return payload;
}

export async function requireAuth(c: Context, next: Next): Promise<Response | void> {
  const { mode, issuer, audience } = authProfileFromEnv();
  const token = normalizeBearerToken(c.req.header('authorization'));
  if (!token) {
    return c.json({ error: 'Missing Bearer token' }, 401);
  }

  try {
    const payload = mode === 'local'
      ? await verifyLocalToken(token)
      : await verifyExternalToken(token, issuer, audience);

    (c as unknown as { set: (key: string, value: unknown) => void }).set('auth', payload);
    await next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid token';
    return c.json({ error: 'Unauthorized', details: message }, 401);
  }
}
`;
}

function apiNotificationsLibTs(): string {
  return `import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging, type MessagingPayload } from 'firebase-admin/messaging';

type PushRequest = {
  token: string;
  notification: { title: string; body: string };
  data: Record<string, string> | undefined;
};

function shouldUseFirebaseProvider(): boolean {
  const provider = process.env['NOTIFICATION_PROVIDER'] ?? 'firebase';
  return provider.toLowerCase() === 'firebase';
}

function ensureFirebaseApp(): void {
  if (!shouldUseFirebaseProvider() || getApps().length > 0) {
    return;
  }

  const projectId = process.env['FIREBASE_PROJECT_ID'];
  const clientEmail = process.env['FIREBASE_CLIENT_EMAIL'];
  const privateKey = process.env['FIREBASE_PRIVATE_KEY']?.replace(/\\n/g, '\\n');

  if (projectId && clientEmail && privateKey) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
    return;
  }

  initializeApp({ credential: applicationDefault() });
}

export async function sendPushNotification(input: PushRequest): Promise<string> {
  if (!shouldUseFirebaseProvider()) {
    throw new Error('Only firebase provider is currently implemented in runtime dispatch.');
  }

  ensureFirebaseApp();

  const message: MessagingPayload & { token: string } = {
    token: input.token,
    notification: input.notification,
    ...(input.data ? { data: input.data } : {}),
  };

  return getMessaging().send(message as never);
}
`;
}

function apiWebhookQueueLibTs(): string {
  return `import { Queue, Worker, type JobsOptions } from 'bullmq';
import IORedis from 'ioredis';

type WebhookJob = {
  endpoint: string;
  payload: unknown;
  headers: Record<string, string> | undefined;
};

const connection = new IORedis(process.env['REDIS_URL'] ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});
const queueName = process.env['WEBHOOK_QUEUE_NAME'] ?? 'webhook-delivery';
const queue = new Queue<WebhookJob>(queueName, { connection });

const jobDefaults: JobsOptions = {
  attempts: Number(process.env['WEBHOOK_RETRY_ATTEMPTS'] ?? 5),
  backoff: {
    type: 'exponential',
    delay: Number(process.env['WEBHOOK_RETRY_DELAY_MS'] ?? 1_000),
  },
  removeOnComplete: true,
  removeOnFail: 100,
};

export async function enqueueWebhookDelivery(job: WebhookJob): Promise<string> {
  const queued = await queue.add('dispatch', job, jobDefaults);
  return queued.id ?? crypto.randomUUID();
}

async function dispatchWebhook(job: WebhookJob): Promise<void> {
  const res = await fetch(job.endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(job.headers ?? {}),
    },
    body: JSON.stringify(job.payload),
  });

  if (!res.ok) {
    throw new Error('Webhook delivery failed: ' + res.status + ' ' + res.statusText);
  }
}

export function startWebhookWorker(): void {
  const enabled = (process.env['BACKGROUND_JOB_BACKEND'] ?? 'redis').toLowerCase() === 'redis';
  if (!enabled) {
    return;
  }

  const worker = new Worker<WebhookJob>(
    queueName,
    async (job) => {
      await dispatchWebhook(job.data);
    },
    { connection },
  );

  worker.on('failed', (job, error) => {
    console.error('[hubforge][webhook] job failed', {
      id: job?.id,
      attemptsMade: job?.attemptsMade,
      error: error.message,
    });
  });
}
`;
}

function playwrightConfigTs(): string {
  return `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env['CI'] ? 2 : 0,
  use: {
    baseURL: 'http://127.0.0.1:3010',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'pnpm dev:api',
      url: 'http://127.0.0.1:4000/health',
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
    },
    {
      command: 'pnpm dev:ui',
      url: 'http://127.0.0.1:3010',
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
    },
    {
      command: 'pnpm dev:portal',
      url: 'http://127.0.0.1:3001',
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
    },
  ],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
`;
}

function e2eSmokeSpecTs(): string {
  return `import { expect, test } from '@playwright/test';

test('public UI and portal boot', async ({ page, request }) => {
  const health = await request.get('http://127.0.0.1:4000/health');
  expect(health.ok()).toBeTruthy();

  await page.goto('/');
  await expect(page.locator('text=HubForge')).toBeVisible();

  await page.goto('http://127.0.0.1:3001');
  await expect(page.locator('text=HubForge Portal')).toBeVisible();
});
`;
}

function apiHealthRouteTestTs(): string {
  return `import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import { registerHealthRoutes } from './health.js';

describe('health route', () => {
  it('returns ok and service name', async () => {
    const app = new Hono();
    registerHealthRoutes(app);

    const res = await app.request('/health');
    const json = await res.json() as { ok: boolean; service: string };

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.service).toBe('hubforge-api');
  });
});
`;
}

function apiTenancyRouteTs(): string {
  return `import type { Hono } from 'hono';

type TenantContext = {
  tenantId: string;
  environment: string;
};

export function registerTenancyRoutes(app: Hono): void {
  app.get('/v1/tenancy/context', (c) => {
    const tenantContext = (c as unknown as { get: (key: string) => unknown }).get('tenantContext') as TenantContext | undefined;

    return c.json({
      tenantId: tenantContext?.tenantId ?? 'default-tenant',
      environment: tenantContext?.environment ?? 'local',
      mode: 'shared',
    });
  });
}
`;
}

function apiAuthRouteTs(options: InitScaffoldOptions): string {
  const providerBlock = options.authServer
    ? `const tenantId = c.req.header('x-tenant-id');
    if (tenantId) {
      const settings = await prisma.authServerSettings.findUnique({ where: { tenantId } });
      if (settings?.enabled) {
        return c.json({
          mode: 'external',
          provider: settings.provider ?? 'custom',
          issuer: settings.issuerUrl ?? null,
          jwksUrl: settings.jwksUrl ?? null,
          audience: settings.audience ?? null,
          source: 'database',
        });
      }
    }

    return c.json({
      mode: 'local',
      provider: 'database',
      issuer,
      source: 'database',
    });`
    : `return c.json({
      mode: 'local',
      provider: 'database',
      issuer,
      source: 'database',
    });`;

  return `import type { Hono } from 'hono';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from '@hubforge/db';

const secret = new TextEncoder().encode(
  process.env['AUTH_LOCAL_JWT_SECRET'] ?? 'hubforge-local-dev-secret-change-me',
);
const issuer = 'http://localhost:4000/local-auth';
const audience = 'hubforge-local';

async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function signToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ sub: userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(issuer)
    .setAudience(audience)
    .setExpirationTime('8h')
    .sign(secret);
}

export function registerAuthRoutes(app: Hono): void {
  app.get('/v1/auth/provider', async (c) => {
    ${providerBlock}
  });

  const registerHandler = async (c: any) => {
    const body = (await c.req.json().catch(() => ({}))) as {
      email?: unknown; name?: unknown; password?: unknown; tenantSlug?: unknown;
    };
    if (typeof body.email !== 'string' || typeof body.password !== 'string') {
      return c.json({ error: 'email and password are required' }, 400);
    }
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return c.json({ error: 'Email already registered' }, 409);

    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: { email: body.email, name: typeof body.name === 'string' ? body.name : null, passwordHash },
    });

    const slug = typeof body.tenantSlug === 'string' && body.tenantSlug
      ? body.tenantSlug
      : body.email.split('@')[0]!.toLowerCase().replace(/[^a-z0-9]/g, '-');
    let tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) tenant = await prisma.tenant.create({ data: { slug, name: slug } });

    await prisma.membership.upsert({
      where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
      update: {},
      create: { tenantId: tenant.id, userId: user.id, role: 'admin' },
    });
    const token = await signToken(user.id, user.email);
    return c.json({ token, user: { id: user.id, email: user.email, name: user.name }, tenantId: tenant.id }, 201);
  };

  app.post('/auth/register', registerHandler);
  app.post('/v1/auth/register', registerHandler);

  const loginHandler = async (c: any) => {
    const body = (await c.req.json().catch(() => ({}))) as { email?: unknown; password?: unknown };
    if (typeof body.email !== 'string' || typeof body.password !== 'string') {
      return c.json({ error: 'email and password are required' }, 400);
    }
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user?.passwordHash) return c.json({ error: 'Invalid credentials' }, 401);
    const hash = await hashPassword(body.password);
    if (hash !== user.passwordHash) return c.json({ error: 'Invalid credentials' }, 401);
    const membership = await prisma.membership.findFirst({ where: { userId: user.id } });
    const token = await signToken(user.id, user.email);
    return c.json({ token, user: { id: user.id, email: user.email, name: user.name }, tenantId: membership?.tenantId ?? null });
  };

  app.post('/auth/login', loginHandler);
  app.post('/v1/auth/login', loginHandler);

  const meHandler = async (c: any) => {
    const authz = c.req.header('authorization');
    const token = authz?.startsWith('Bearer ') ? authz.slice(7) : null;
    if (!token) return c.json({ error: 'Unauthorized' }, 401);
    try {
      const { payload } = await jwtVerify(token, secret, { issuer, audience });
      const user = await prisma.user.findUnique({ where: { id: payload['sub'] as string } });
      if (!user) return c.json({ error: 'User not found' }, 404);
      const memberships = await prisma.membership.findMany({ where: { userId: user.id }, include: { tenant: true } });
      return c.json({ user: { id: user.id, email: user.email, name: user.name }, memberships });
    } catch {
      return c.json({ error: 'Invalid token' }, 401);
    }
  };

  app.get('/auth/me', meHandler);
  app.get('/v1/auth/me', meHandler);
}
`;
}

function apiAuthServerSettingsRouteTs(): string {
  return `import type { Hono } from 'hono';
import { prisma } from '@hubforge/db';

export function registerAuthServerSettingsRoutes(app: Hono): void {
  app.get('/v1/settings/auth-server', async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    const settings = await prisma.authServerSettings.findUnique({ where: { tenantId } });
    return c.json({
      enabled: settings?.enabled ?? false,
      provider: settings?.provider ?? null,
      issuerUrl: settings?.issuerUrl ?? null,
      jwksUrl: settings?.jwksUrl ?? null,
      clientId: settings?.clientId ?? null,
      clientSecret: settings?.clientSecret ?? null,
      audience: settings?.audience ?? null,
    });
  });

  app.put('/v1/settings/auth-server', async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;

    const settings = await prisma.authServerSettings.upsert({
      where: { tenantId },
      update: {
        enabled: body['enabled'] === true,
        provider: typeof body['provider'] === 'string' ? body['provider'] : null,
        issuerUrl: typeof body['issuerUrl'] === 'string' ? body['issuerUrl'] : null,
        jwksUrl: typeof body['jwksUrl'] === 'string' ? body['jwksUrl'] : null,
        clientId: typeof body['clientId'] === 'string' ? body['clientId'] : null,
        clientSecret: typeof body['clientSecret'] === 'string' ? body['clientSecret'] : null,
        audience: typeof body['audience'] === 'string' ? body['audience'] : null,
      },
      create: {
        tenantId,
        enabled: body['enabled'] === true,
        provider: typeof body['provider'] === 'string' ? body['provider'] : null,
        issuerUrl: typeof body['issuerUrl'] === 'string' ? body['issuerUrl'] : null,
        jwksUrl: typeof body['jwksUrl'] === 'string' ? body['jwksUrl'] : null,
        clientId: typeof body['clientId'] === 'string' ? body['clientId'] : null,
        clientSecret: typeof body['clientSecret'] === 'string' ? body['clientSecret'] : null,
        audience: typeof body['audience'] === 'string' ? body['audience'] : null,
      },
    });

    return c.json(settings);
  });
}
`;
}

function uiPackageJson(): string {
  const pkg = {
    name: '@hubforge/ui-app',
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'react-router dev --port 3010',
      build: 'react-router build',
      start: 'react-router-serve ./build/server/index.js',
      typecheck: 'react-router typegen && tsc --noEmit',
    },
    dependencies: {
      '@hubforge/api-client': 'workspace:*',
      '@react-router/node': '^7.0.0',
      '@react-router/serve': '^7.0.0',
      isbot: '^4.0.0',
      react: '^19.0.0',
      'react-dom': '^19.0.0',
      'react-router': '^7.0.0',
    },
    devDependencies: {
      '@react-router/dev': '^7.0.0',
      '@react-router/fs-routes': '^7.0.0',
      '@tailwindcss/vite': '^4.2.0',
      '@types/node': '^20.0.0',
      '@types/react': '^19.0.0',
      '@types/react-dom': '^19.0.0',
      tailwindcss: '^4.2.0',
      typescript: '^5.4.0',
      vite: '^5.0.0',
    },
  };

  return `${JSON.stringify(pkg, null, 2)}\n`;
}

function rrAppTsConfig(): string {
  return `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "outDir": "./.react-router/types",
    "rootDirs": [".", "./.react-router/types"],
    "types": ["node", "vite/client"]
  },
  "include": ["app", ".react-router/types/**/*", "vite.config.ts", "react-router.config.ts"]
}
`;
}

function rrViteConfig(): string {
  return `import tailwindcss from '@tailwindcss/vite';
import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
});
`;
}

function rrReactRouterConfigPortal(): string {
  return `import type { Config } from '@react-router/dev/config';

export default {
  ssr: false,
  appDirectory: 'app',
} satisfies Config;
`;
}

function rrReactRouterConfigUi(): string {
  return `import type { Config } from '@react-router/dev/config';

export default {
  ssr: true,
  appDirectory: 'app',
} satisfies Config;
`;
}

function rrRoutesTs(): string {
  return `import { flatRoutes } from '@react-router/fs-routes';
import type { RouteConfig } from '@react-router/dev/routes';

export default flatRoutes() satisfies RouteConfig;
`;
}

function tailwindCss(): string {
  return `@import "tailwindcss";

:root {
  --hf-font: Inter, ui-sans-serif, system-ui, sans-serif;
  --hf-primary: #845adf;
  --hf-primary-hover: #7045ce;
  --hf-surface: #ffffff;
  --hf-surface-alt: #f0f1f7;
  --hf-foreground: #2a2f3e;
  --hf-muted: #8c9097;
  --hf-border: #e9edf4;
  --hf-sidebar: #ffffff;
  --hf-sidebar-text: #536485;
  --hf-sidebar-active: #f0ebfc;
  --hf-sidebar-active-text: #845adf;
  --hf-header: #ffffff;
}

body {
  margin: 0;
  background: var(--hf-surface-alt);
  color: var(--hf-foreground);
  font-family: var(--hf-font);
}
`;
}

function uiRootTsx(): string {
  return `import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import './app.css';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
`;
}

function uiLandingRoute(): string {
  return `import { useState } from 'react';
import { useNavigate } from 'react-router';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@local-demo.com');
  const [password, setPassword] = useState('Password1!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch(API + '/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      setLoading(false);
      setError('Invalid credentials or API unavailable.');
      return;
    }

    const data = (await res.json()) as { token: string; tenantId: string | null };
    localStorage.setItem('token', data.token);
    if (data.tenantId) localStorage.setItem('tenantId', data.tenantId);
    setLoading(false);
    navigate('/dashboard');
  }

  return (
  ? (process.env['PORTAL_URL'] ?? 'http://localhost:3001')
  : 'http://localhost:3001';

        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>Sign in with database credentials.</p>
        <form onSubmit={onSubmit}>
    <main style={{ minHeight: '100vh', background: '#fff', color: '#111827', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ borderBottom: '1px solid #f3f4f6', padding: '0 1.5rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1200, margin: '0 auto' }}>
            <input value={email} onChange={(e) => setEmail(e.currentTarget.value)} type="email" name="email" required style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, boxSizing: 'border-box' }} />
        <a href={PORTAL_URL} style={{ fontSize: 14, background: '#2563eb', color: '#fff', padding: '6px 16px', borderRadius: 8, textDecoration: 'none' }}>
          <div style={{ marginBottom: '1rem' }}>
        </a>
            <input value={password} onChange={(e) => setPassword(e.currentTarget.value)} type="password" name="password" required style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, boxSizing: 'border-box' }} />
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '6rem 1.5rem 4rem', textAlign: 'center' }}>
          {error && <p style={{ color: '#dc2626', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{error}</p>}
          <button disabled={loading} type="submit" style={{ width: '100%', background: '#2563eb', color: '#fff', padding: 10, borderRadius: 8, border: 'none', fontWeight: 500, cursor: 'pointer' }}>
            {loading ? 'Signing in...' : 'Sign in'}
        </p>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 700, lineHeight: 1.05, marginBottom: '1.5rem' }}>
        <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>Default: admin@local-demo.com / Password1!</p>
          Opinionated baseline with API, portal, AI, Docker, tenancy, and migrations already in place.
        </p>
        <a href={PORTAL_URL} style={{ display: 'inline-block', background: '#2563eb', color: '#fff', fontSize: '1.125rem', padding: '12px 32px', borderRadius: 12, textDecoration: 'none' }}>
          Get started
        </a>
      </section>
    </main>
  );
}
`;
}

function aiRequirementsTxt(): string {
  return `fastapi==0.111.0
uvicorn[standard]==0.30.0
pydantic==2.7.0
`;
}

function aiDockerfile(): string {
  return `FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY main.py ./
EXPOSE 5000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
`;
}

function aiMainPy(): string {
  return `from fastapi import FastAPI

app = FastAPI(title='HubForge AI')


@app.get('/health')
def health() -> dict[str, bool]:
    return {'ok': True}


@app.post('/v1/embed')
def embed(payload: dict) -> dict:
    texts = payload.get('texts', [])
    return {'model': 'placeholder-v1', 'embeddings': [[0.0] * 8 for _ in texts]}
`;
}

function tenancyPackageJson(): string {
  const pkg = {
    name: '@hubforge/tenancy',
    version: '0.1.0',
    private: true,
    type: 'module',
    main: './dist/index.js',
    types: './dist/index.d.ts',
    scripts: {
      build: 'tsc -p tsconfig.json',
      typecheck: 'tsc --noEmit -p tsconfig.json',
    },
    devDependencies: {
      typescript: '^5.4.0',
    },
  };

  return `${JSON.stringify(pkg, null, 2)}\n`;
}

function tenancyIndexTs(): string {
  return `export type TenantStrategy = 'shared' | 'isolated' | 'schema-per-tenant' | 'db-per-tenant';

export type TenantContext = {
  tenantId: string;
  environment: string;
  strategy: TenantStrategy;
  schema: string;
  databaseUrlOverride: string | null;
};

export function resolveTenantContext(input: {
  tenantId?: string;
  environment?: string;
}): TenantContext {
  const tenantId = input.tenantId ?? 'default-tenant';
  const environment = input.environment ?? 'local';
  const strategy = (process.env['TENANT_MODE'] ?? 'shared') as TenantStrategy;
  const schema = strategy === 'schema-per-tenant' || strategy === 'isolated' ? 'tenant_' + tenantId.replace(/-/g, '_') : 'public';
  const databaseUrlOverride = strategy === 'db-per-tenant'
    ? process.env['TENANT_DB_URL_PREFIX']
      ? process.env['TENANT_DB_URL_PREFIX'] + tenantId
      : null
    : null;

  return {
    tenantId,
    environment,
    strategy,
    schema,
    databaseUrlOverride,
  };
}
`;
}

function appstackPackageJson(): string {
  const pkg = {
    name: '@hubforge/appstack',
    version: '0.1.0',
    private: true,
    type: 'module',
    main: './dist/index.js',
    types: './dist/index.d.ts',
    scripts: {
      build: 'tsc -p tsconfig.json',
      typecheck: 'tsc --noEmit -p tsconfig.json',
    },
    devDependencies: {
      typescript: '^5.4.0',
    },
  };

  return `${JSON.stringify(pkg, null, 2)}\n`;
}

function appstackIndexTs(): string {
  return `export type AppCapability = {
  id: string;
  description: string;
};

export const coreCapabilities: AppCapability[] = [
  { id: 'api-routing', description: 'API routing and middleware baseline' },
  { id: 'tenant-awareness', description: 'Tenant context resolution baseline' },
  { id: 'observability', description: 'Request logging, tracing headers, and health checks' },
];
`;
}

function authClientPackageJson(): string {
  const pkg = {
    name: '@hubforge/auth-client',
    version: '0.1.0',
    private: true,
    type: 'module',
    main: './dist/index.js',
    types: './dist/index.d.ts',
    scripts: {
      build: 'tsc -p tsconfig.json',
      typecheck: 'tsc --noEmit -p tsconfig.json',
    },
    devDependencies: {
      typescript: '^5.4.0',
    },
  };

  return `${JSON.stringify(pkg, null, 2)}\n`;
}

function authClientIndexTs(): string {
  return `export type AuthRuntimeConfig = {
  mode: 'external' | 'local';
  provider: 'zitadel' | 'auth0' | 'keycloak' | 'custom';
  issuerUrl: string;
  clientId: string;
};

export function resolveAuthRuntimeConfig(env: Record<string, string | undefined>): AuthRuntimeConfig {
  return {
    mode: (env['AUTH_MODE'] as AuthRuntimeConfig['mode'] | undefined) ?? 'external',
    provider: (env['AUTH_PROVIDER'] as AuthRuntimeConfig['provider'] | undefined) ?? 'zitadel',
    issuerUrl: env['AUTH_ISSUER_URL'] ?? 'http://localhost:8080',
    clientId: env['AUTH_CLIENT_ID'] ?? 'hubforge-web',
  };
}
`;
}

function sdkServerPackageJson(): string {
  const pkg = {
    name: '@hubforge/sdk-server',
    version: '0.1.0',
    private: true,
    type: 'module',
    main: './dist/index.js',
    types: './dist/index.d.ts',
    scripts: {
      build: 'tsc -p tsconfig.json',
      typecheck: 'tsc --noEmit -p tsconfig.json',
    },
    devDependencies: {
      typescript: '^5.4.0',
    },
  };

  return `${JSON.stringify(pkg, null, 2)}\n`;
}

function sdkServerIndexTs(): string {
  return `export type RequestMetadata = {
  requestId: string;
  tenantId: string;
};

export function buildRequestMetadata(requestId: string, tenantId: string): RequestMetadata {
  return { requestId, tenantId };
}
`;
}

function dbPackageJson(): string {
  const pkg = {
    name: '@hubforge/db',
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {
      'db:bootstrap': 'node ./scripts/bootstrap-postgres.mjs',
      'db:migrate': 'prisma migrate dev --name init --schema prisma/schema.prisma',
      'db:generate': 'prisma generate --schema prisma/schema.prisma',
      'db:seed': 'node ./scripts/seed.mjs',
      build: 'tsc -p tsconfig.json --pretty false --noEmit',
      typecheck: 'tsc -p tsconfig.json --pretty false --noEmit',
    },
    dependencies: {
      '@prisma/client': '^5.16.0',
      pg: '^8.13.1',
    },
    devDependencies: {
      '@types/node': '^20.0.0',
      prisma: '^5.16.0',
      typescript: '^5.4.0',
    },
  };

  return `${JSON.stringify(pkg, null, 2)}\n`;
}

function dbBootstrapPostgresScript(): string {
  return `import { readFileSync, existsSync } from 'node:fs';
import { Client } from 'pg';

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\\r?\\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }
    const idx = line.indexOf('=');
    if (idx <= 0) {
      continue;
    }
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function quoteIdentifier(identifier) {
  return '"' + identifier.replaceAll('"', '""') + '"';
}

function quoteLiteral(value) {
  return "'" + value.replaceAll("'", "''") + "'";
}

function buildAdminCandidates(databaseUrlRaw) {
  const candidates = [];
  const explicit = process.env.DATABASE_ADMIN_URL ?? process.env.POSTGRES_ADMIN_URL;
  if (explicit) {
    candidates.push(explicit);
  }

  const defaultAdmin = new URL(databaseUrlRaw);
  defaultAdmin.username = process.env.POSTGRES_ADMIN_USER ?? 'postgres';
  defaultAdmin.password = process.env.POSTGRES_ADMIN_PASSWORD ?? 'postgres';
  defaultAdmin.pathname = '/postgres';
  candidates.push(defaultAdmin.toString());

  const sameCreds = new URL(databaseUrlRaw);
  sameCreds.pathname = '/postgres';
  candidates.push(sameCreds.toString());

  return [...new Set(candidates)];
}

async function ensureDefaultsWithAdmin(adminUrl, appRole, appPassword, appDb, shadowDb) {
  const admin = new Client({ connectionString: adminUrl });
  await admin.connect();

  const roleExists = await admin.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [appRole]);
  if (roleExists.rowCount === 0) {
    await admin.query('CREATE ROLE ' + quoteIdentifier(appRole) + ' WITH LOGIN PASSWORD ' + quoteLiteral(appPassword));
  } else {
    await admin.query('ALTER ROLE ' + quoteIdentifier(appRole) + ' WITH LOGIN PASSWORD ' + quoteLiteral(appPassword));
  }

  const dbExists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [appDb]);
  if (dbExists.rowCount === 0) {
    await admin.query('CREATE DATABASE ' + quoteIdentifier(appDb) + ' OWNER ' + quoteIdentifier(appRole));
  }

  const shadowExists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [shadowDb]);
  if (shadowExists.rowCount === 0) {
    await admin.query('CREATE DATABASE ' + quoteIdentifier(shadowDb) + ' OWNER ' + quoteIdentifier(appRole));
  }

  await admin.query('GRANT ALL PRIVILEGES ON DATABASE ' + quoteIdentifier(appDb) + ' TO ' + quoteIdentifier(appRole));
  await admin.query('GRANT ALL PRIVILEGES ON DATABASE ' + quoteIdentifier(shadowDb) + ' TO ' + quoteIdentifier(appRole));
  await admin.end();
}

async function bootstrapPostgres() {
  loadDotEnv('.env');

  const databaseUrlRaw = process.env.DATABASE_URL;
  if (!databaseUrlRaw) {
    throw new Error('DATABASE_URL is required for db bootstrap.');
  }

  const databaseUrl = new URL(databaseUrlRaw);
  const protocol = databaseUrl.protocol.replace(':', '');
  if (protocol !== 'postgresql' && protocol !== 'postgres') {
    console.log('[hubforge][db] Non-Postgres provider detected; bootstrap skipped.');
    return;
  }

  const appDb = databaseUrl.pathname.replace(/^\\//, '');
  const appRole = decodeURIComponent(databaseUrl.username || 'hubforge');
  const appPassword = decodeURIComponent(databaseUrl.password || 'hubforge');
  const shadowDatabaseUrlRaw = process.env.SHADOW_DATABASE_URL;
  const shadowDb = shadowDatabaseUrlRaw ? new URL(shadowDatabaseUrlRaw).pathname.replace(/^\\\//, '') : appDb + '_shadow';
  if (!appDb) {
    throw new Error('DATABASE_URL must include a database name for Postgres bootstrap.');
  }

  const adminCandidates = buildAdminCandidates(databaseUrlRaw);
  let lastAdminError;
  let defaultsEnsured = false;

  for (const adminCandidate of adminCandidates) {
    try {
      await ensureDefaultsWithAdmin(adminCandidate, appRole, appPassword, appDb, shadowDb);
      defaultsEnsured = true;
      break;
    } catch (error) {
      lastAdminError = error;
    }
  }

  if (!defaultsEnsured) {
    const reason = lastAdminError instanceof Error ? lastAdminError.message : String(lastAdminError);
    throw new Error(
      'Unable to create role/database defaults with available admin credentials. Set DATABASE_ADMIN_URL (or POSTGRES_ADMIN_URL). Last error: '
      + reason,
    );
  }

  const appClient = new Client({ connectionString: databaseUrlRaw });
  await appClient.connect();
  try {
    await appClient.query('ALTER SCHEMA public OWNER TO ' + quoteIdentifier(appRole));
    await appClient.query('GRANT ALL ON SCHEMA public TO ' + quoteIdentifier(appRole));
    await appClient.query('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ' + quoteIdentifier(appRole));
    await appClient.query('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ' + quoteIdentifier(appRole));
    await appClient.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ' + quoteIdentifier(appRole));
    await appClient.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ' + quoteIdentifier(appRole));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('[hubforge][db] Schema ownership/grant hardening skipped:', message);
  }
  await appClient.end();

  console.log('[hubforge][db] Postgres defaults ensured: role, database, owner, grants.');
}

bootstrapPostgres().catch((error) => {
  console.error('[hubforge][db] Bootstrap failed:', error?.message ?? error);
  process.exit(1);
});
`;
}

function dbIndexTs(): string {
  return `import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma
  ?? new PrismaClient({
    log: process.env['NODE_ENV'] === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;
}

export { PrismaClient };
`;
}

function dbSeedScript(): string {
  return `#!/usr/bin/env node
import prismaPkg from '@prisma/client';
import { createHash } from 'node:crypto';

const { PrismaClient } = prismaPkg;

const prisma = new PrismaClient();

function hash(password) {
  return createHash('sha256').update(password).digest('hex');
}

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'local-demo' },
    update: {},
    create: { slug: 'local-demo', name: 'Local Demo Tenant' },
  });

  const user = await prisma.user.upsert({
    where: { email: 'admin@local-demo.com' },
    update: {},
    create: { email: 'admin@local-demo.com', name: 'Local Admin', passwordHash: hash('Password1!') },
  });

  await prisma.membership.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
    update: {},
    create: { tenantId: tenant.id, userId: user.id, role: 'admin' },
  });

  console.log('Seed complete');
  console.log('Email: admin@local-demo.com');
  console.log('Password: Password1!');
  console.log('TenantId: ' + tenant.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
`;
}

function prismaSchema(options: InitScaffoldOptions): string {
  const provider = options.dbProvider === 'postgres'
    ? 'postgresql'
    : options.dbProvider === 'mysql'
      ? 'mysql'
      : options.dbProvider === 'sqlserver'
        ? 'sqlserver'
        : 'sqlite';
  const shadowLine = options.dbProvider === 'postgres' ? '\n  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")' : '';
  const authServerSettingsRelation = options.authServer ? '\n  authServerSettings AuthServerSettings?' : '';
  const authServerSettingsModel = options.authServer
    ? `

model AuthServerSettings {
  id           String   @id @default(cuid())
  tenantId     String   @unique
  enabled      Boolean  @default(false)
  provider     String?
  issuerUrl    String?
  jwksUrl      String?
  clientId     String?
  clientSecret String?
  audience     String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  tenant       Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
}
`
    : '';

  return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")${shadowLine}
}

model Tenant {
  id           String        @id @default(cuid())
  slug         String        @unique
  name         String
  createdAt    DateTime      @default(now())
  environments Environment[]
  memberships  Membership[]${authServerSettingsRelation}
}

model Environment {
  id         String   @id @default(cuid())
  tenantId   String
  name       String
  isDefault  Boolean  @default(false)
  createdAt  DateTime @default(now())

  tenant     Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  memberships Membership[]

  @@unique([tenantId, name])
}

model User {
  id          String        @id @default(cuid())
  email       String        @unique
  name        String?
  passwordHash String?
  createdAt   DateTime      @default(now())
  memberships Membership[]
}

model Membership {
  id            String   @id @default(cuid())
  tenantId      String
  userId        String
  role          String   @default("member")
  environmentId String?
  createdAt     DateTime @default(now())

  tenant        Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  environment   Environment? @relation(fields: [environmentId], references: [id], onDelete: SetNull)

  @@unique([tenantId, userId])
}
${authServerSettingsModel}
`;
}

function initialMigrationSql(options: InitScaffoldOptions): string {
  const authServerMigration = options.authServer ? `

CREATE TABLE IF NOT EXISTS auth_server_settings (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL UNIQUE,
  enabled INTEGER NOT NULL DEFAULT 0,
  provider TEXT,
  issuer_url TEXT,
  jwks_url TEXT,
  client_id TEXT,
  client_secret TEXT,
  audience TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
` : '';

  return `-- HubForge baseline migration 0001
-- This file is generated as a tracked migration reference.

CREATE TABLE IF NOT EXISTS tenant (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS environment (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  is_default INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (tenant_id, name)
);

CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  password_hash TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS membership (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  environment_id TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (tenant_id, user_id)
);${authServerMigration}
`;
}

// Portal

function portalPackageJson(): string {
  const pkg = {
    name: '@hubforge/portal',
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'react-router dev --port 3001',
      build: 'react-router build',
      start: 'react-router-serve ./build/server/index.js',
      typecheck: 'react-router typegen && tsc --noEmit',
    },
    dependencies: {
      '@hubforge/api-client': 'workspace:*',
      '@react-router/node': '^7.0.0',
      '@react-router/serve': '^7.0.0',
      isbot: '^4.0.0',
      react: '^19.0.0',
      'react-dom': '^19.0.0',
      'react-router': '^7.0.0',
    },
    devDependencies: {
      '@react-router/dev': '^7.0.0',
      '@react-router/fs-routes': '^7.0.0',
      '@tailwindcss/vite': '^4.2.0',
      '@types/node': '^20.0.0',
      '@types/react': '^19.0.0',
      '@types/react-dom': '^19.0.0',
      tailwindcss: '^4.2.0',
      typescript: '^5.4.0',
      vite: '^5.0.0',
    },
  };

  return `${JSON.stringify(pkg, null, 2)}\n`;
}

function portalRootTsx(): string {
  return `import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import './app.css';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
`;
}

function portalIndexRoute(): string {
  return `import { redirect } from 'react-router';

export async function clientLoader() {
  return redirect('/login');
}

export default function Index() {
  return null;
}
`;
}

function portalLoginRoute(): string {
  return `export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <div style={{ width: '100%', maxWidth: 400, background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Sign in</h1>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>Sign in to your HubForge workspace.</p>
        <form method="post">
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Email</label>
            <input type="email" name="email" required style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Password</label>
            <input type="password" name="password" required style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, boxSizing: 'border-box' }} />
          </div>
          <button type="submit" style={{ width: '100%', background: '#2563eb', color: '#fff', padding: 10, borderRadius: 8, border: 'none', fontWeight: 500, cursor: 'pointer' }}>
            Sign in
          </button>
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>
          Wire up OIDC / Zitadel in lib/auth.server.ts when ready.
        </p>
      </div>
    </div>
  );
}
`;
}

function portalAppLayout(options: InitScaffoldOptions): string {
  const settingsNav = options.authServer
    ? "{ href: '/settings', label: 'Settings' }, { href: '/settings/theme', label: 'Theme' }, { href: '/settings/auth-server', label: 'Auth Server' }"
    : "{ href: '/settings', label: 'Settings' }, { href: '/settings/theme', label: 'Theme' }";

  return `import { Outlet, NavLink } from 'react-router';
import { useEffect } from 'react';
import type { LoaderFunctionArgs } from 'react-router';
import { applyStoredPortalTheme } from '../lib/theme';

export async function clientLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  return { pathname: url.pathname };
}

export default function AppLayout() {
  useEffect(() => {
    applyStoredPortalTheme();
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--hf-surface-alt)', color: 'var(--hf-foreground)' }}>
      <aside style={{ width: 240, background: 'var(--hf-sidebar)', borderRight: '1px solid var(--hf-border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 1.25rem', borderBottom: '1px solid var(--hf-border)' }}>
          <span style={{ fontWeight: 700, color: 'var(--hf-primary)' }}>HubForge Portal</span>
        </div>
        <nav style={{ padding: '0.75rem 0.5rem', flex: 1, overflowY: 'auto' }}>
          {[{ href: '/dashboard', label: 'Dashboard' }, ${settingsNav}, { href: '/docs', label: 'API Docs' }].map(
            ({ href, label }) => (
              <NavLink
                key={href}
                to={href}
                style={({ isActive }) => ({
                  display: 'block',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  marginBottom: 4,
                  color: isActive ? 'var(--hf-sidebar-active-text)' : 'var(--hf-sidebar-text)',
                  background: isActive ? 'var(--hf-sidebar-active)' : 'transparent',
                })}
              >
                {label}
              </NavLink>
            ),
          )}
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid var(--hf-border)' }}>
          <button
            onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('tenantId'); window.location.href = '/login'; }}
            style={{ width: '100%', padding: '6px', borderRadius: 6, background: 'transparent', border: '1px solid var(--hf-border)', color: 'var(--hf-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: 56, background: 'var(--hf-header)', borderBottom: '1px solid var(--hf-border)', display: 'flex', alignItems: 'center', padding: '0 1.5rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Workspace</span>
        </header>
        <main style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
`;
}

function portalSettingsIndexRoute(options: InitScaffoldOptions): string {
  const authServerLink = options.authServer
    ? `
        <Link to="/settings/auth-server" style={{ textDecoration: 'none', border: '1px solid var(--hf-border)', borderRadius: 12, background: 'var(--hf-surface)', padding: '1rem' }}>
          <p style={{ fontWeight: 700, color: 'var(--hf-foreground)', margin: '0 0 0.25rem' }}>Auth Server</p>
          <p style={{ margin: 0, color: 'var(--hf-muted)', fontSize: '0.85rem' }}>Store OIDC provider settings in your tenant database.</p>
        </Link>`
    : '';

  return `import { Link } from 'react-router';

export default function SettingsIndexPage() {
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.75rem' }}>Settings</h2>
      <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.9rem' }}>
        Configure authentication and platform behavior after logging in with database credentials.
      </p>
      <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 620 }}>
        <Link to="/settings/theme" style={{ textDecoration: 'none', border: '1px solid var(--hf-border)', borderRadius: 12, background: 'var(--hf-surface)', padding: '1rem' }}>
          <p style={{ fontWeight: 700, color: 'var(--hf-foreground)', margin: '0 0 0.25rem' }}>Theme</p>
          <p style={{ margin: 0, color: 'var(--hf-muted)', fontSize: '0.85rem' }}>Switch built-in admin themes or load a third-party CSS theme URL.</p>
        </Link>
${authServerLink}
      </div>
    </div>
  );
}
`;
}

function portalAuthServerSettingsRoute(): string {
  return `import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';

type AuthServerSettings = {
  enabled: boolean;
  provider: string;
  issuerUrl: string;
  jwksUrl: string;
  clientId: string;
  clientSecret: string;
  audience: string;
};

const DEFAULT_SETTINGS: AuthServerSettings = {
  enabled: false,
  provider: 'custom',
  issuerUrl: '',
  jwksUrl: '',
  clientId: '',
  clientSecret: '',
  audience: '',
};

export default function AuthServerSettingsPage() {
  const [settings, setSettings] = useState<AuthServerSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const tenantId = localStorage.getItem('tenantId') ?? '';
    const token = localStorage.getItem('token') ?? '';

    fetch(API + '/v1/settings/auth-server', {
      headers: {
        'x-tenant-id': tenantId,
        authorization: 'Bearer ' + token,
      },
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as Partial<AuthServerSettings>;
        setSettings({ ...DEFAULT_SETTINGS, ...data });
      })
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setMessage(null);
    const tenantId = localStorage.getItem('tenantId') ?? '';
    const token = localStorage.getItem('token') ?? '';

    const res = await fetch(API + '/v1/settings/auth-server', {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'x-tenant-id': tenantId,
        authorization: 'Bearer ' + token,
      },
      body: JSON.stringify(settings),
    });

    setSaving(false);
    setMessage(res.ok ? 'Saved settings.' : 'Failed to save settings.');
  }

  function update<K extends keyof AuthServerSettings>(key: K, value: AuthServerSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.75rem' }}>Auth Server Settings</h2>
      <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.9rem' }}>
        Database login always stays enabled. External auth can be configured here per tenant.
      </p>
      {loading ? (
        <p style={{ color: '#6b7280' }}>Loading...</p>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem', display: 'grid', gap: '0.75rem', maxWidth: 720 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#334155' }}>
            <input type="checkbox" checked={settings.enabled} onChange={(e) => update('enabled', e.currentTarget.checked)} />
            Enable external auth server for this tenant
          </label>

          <input value={settings.provider} onChange={(e) => update('provider', e.currentTarget.value)} placeholder="Provider (e.g. zitadel, auth0, keycloak, custom)" style={inputStyle} />
          <input value={settings.issuerUrl} onChange={(e) => update('issuerUrl', e.currentTarget.value)} placeholder="Issuer URL" style={inputStyle} />
          <input value={settings.jwksUrl} onChange={(e) => update('jwksUrl', e.currentTarget.value)} placeholder="JWKS URL (optional override)" style={inputStyle} />
          <input value={settings.clientId} onChange={(e) => update('clientId', e.currentTarget.value)} placeholder="Client ID" style={inputStyle} />
          <input value={settings.clientSecret} onChange={(e) => update('clientSecret', e.currentTarget.value)} placeholder="Client Secret" style={inputStyle} />
          <input value={settings.audience} onChange={(e) => update('audience', e.currentTarget.value)} placeholder="Audience" style={inputStyle} />

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button onClick={save} disabled={saving} style={{ border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', padding: '8px 14px', fontSize: '0.9rem', cursor: 'pointer' }}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            {message && <span style={{ fontSize: '0.85rem', color: '#475569' }}>{message}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: CSSProperties = {
  border: '1px solid #d1d5db',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: '0.9rem',
};
`;
}

function portalDashboardRoute(): string {
  return `export default function DashboardPage() {
  const stats = ['Active tenants', 'Requests today', 'AI completions'];

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {stats.map((label) => (
          <div key={label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '1.25rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{label}</p>
            <p style={{ fontSize: '2rem', fontWeight: 600, margin: '0.25rem 0 0' }}>&#8212;</p>
          </div>
        ))}
      </div>
    </div>
  );
}
`;
}

function portalDocsRoute(): string {
  return [
    "import { useState, useEffect } from 'react';",
    '',
    "const DEFAULT_API_URL = 'http://localhost:4000';",
    '',
    'export default function DocsPage() {',
    '  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);',
    '',
    '  useEffect(() => {',
    "    const metaApiUrl = (document.querySelector('meta[name=\\\"api-url\\\"]') as HTMLMetaElement | null)?.content;",
    '    const envApiUrl = (window as typeof window & { ENV?: { API_URL?: string } }).ENV?.API_URL;',
    '    setApiUrl(metaApiUrl ?? envApiUrl ?? DEFAULT_API_URL);',
    '  }, []);',
    '',
    '  return (',
    '    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>',
    '      <div style={{ marginBottom: "1rem", flexShrink: 0 }}>',
    '        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.25rem" }}>',
    '          API Reference',
    '        </h2>',
    '        <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>',
    '          Interactive API documentation. Try any endpoint directly from your browser.',
    '        </p>',
    '      </div>',
    '      <div style={{ flex: 1, minHeight: 0, border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "#fff" }}>',
    '        <iframe',
    '          src={apiUrl + "/docs"}',
    '          title="API Reference"',
    '          style={{ width: "100%", height: "100%", border: "none", display: "block" }}',
    '        />',
    '      </div>',
    '    </div>',
    '  );',
    '}',
  ].join('\n') + '\n';
}

function portalThemeLibTs(): string {
  return `export type ThemePreset = 'ynex-light' | 'slate' | 'forest';

const PRESETS: Record<ThemePreset, Record<string, string>> = {
  'ynex-light': {
    '--hf-primary': '#845adf',
    '--hf-primary-hover': '#7045ce',
    '--hf-surface': '#ffffff',
    '--hf-surface-alt': '#f0f1f7',
    '--hf-foreground': '#2a2f3e',
    '--hf-muted': '#8c9097',
    '--hf-border': '#e9edf4',
    '--hf-sidebar': '#ffffff',
    '--hf-sidebar-text': '#536485',
    '--hf-sidebar-active': '#f0ebfc',
    '--hf-sidebar-active-text': '#845adf',
    '--hf-header': '#ffffff',
  },
  slate: {
    '--hf-primary': '#2563eb',
    '--hf-primary-hover': '#1d4ed8',
    '--hf-surface': '#0f172a',
    '--hf-surface-alt': '#020617',
    '--hf-foreground': '#e2e8f0',
    '--hf-muted': '#94a3b8',
    '--hf-border': '#1e293b',
    '--hf-sidebar': '#0b1220',
    '--hf-sidebar-text': '#93a2b8',
    '--hf-sidebar-active': '#1e293b',
    '--hf-sidebar-active-text': '#93c5fd',
    '--hf-header': '#0b1220',
  },
  forest: {
    '--hf-primary': '#15803d',
    '--hf-primary-hover': '#166534',
    '--hf-surface': '#ffffff',
    '--hf-surface-alt': '#ecfdf5',
    '--hf-foreground': '#14532d',
    '--hf-muted': '#3f7a57',
    '--hf-border': '#bbf7d0',
    '--hf-sidebar': '#f0fdf4',
    '--hf-sidebar-text': '#166534',
    '--hf-sidebar-active': '#dcfce7',
    '--hf-sidebar-active-text': '#14532d',
    '--hf-header': '#f0fdf4',
  },
};

export function applyStoredPortalTheme(): void {
  if (typeof document === 'undefined') {
    return;
  }

  const preset = (localStorage.getItem('hf_theme_preset') as ThemePreset | null) ?? 'ynex-light';
  const customCssUrl = localStorage.getItem('hf_theme_css_url') ?? '';
  applyPortalTheme(preset, customCssUrl);
}

export function applyPortalTheme(preset: ThemePreset, customCssUrl?: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const tokens = PRESETS[preset] ?? PRESETS['ynex-light'];
  Object.entries(tokens).forEach(([key, value]) => root.style.setProperty(key, value));

  localStorage.setItem('hf_theme_preset', preset);

  const existing = document.getElementById('hf-theme-external') as HTMLLinkElement | null;
  const href = (customCssUrl ?? '').trim();
  if (!href) {
    existing?.remove();
    localStorage.removeItem('hf_theme_css_url');
    return;
  }

  if (existing) {
    existing.href = href;
  } else {
    const link = document.createElement('link');
    link.id = 'hf-theme-external';
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
  localStorage.setItem('hf_theme_css_url', href);
}
`;
}

function portalThemeSettingsRoute(): string {
  return `import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { applyPortalTheme, type ThemePreset } from '../lib/theme';

const presets: ThemePreset[] = ['ynex-light', 'slate', 'forest'];

export default function ThemeSettingsPage() {
  const [preset, setPreset] = useState<ThemePreset>('ynex-light');
  const [cssUrl, setCssUrl] = useState('');

  useEffect(() => {
    const storedPreset = (localStorage.getItem('hf_theme_preset') as ThemePreset | null) ?? 'ynex-light';
    const storedCssUrl = localStorage.getItem('hf_theme_css_url') ?? '';
    setPreset(storedPreset);
    setCssUrl(storedCssUrl);
  }, []);

  function save(e: FormEvent) {
    e.preventDefault();
    applyPortalTheme(preset, cssUrl);
  }

  return (
    <form onSubmit={save} style={{ maxWidth: 720, display: 'grid', gap: '0.75rem', background: 'var(--hf-surface)', border: '1px solid var(--hf-border)', borderRadius: 12, padding: '1rem' }}>
      <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Portal Theme</h2>
      <p style={{ margin: 0, color: 'var(--hf-muted)', fontSize: '0.9rem' }}>
        Pick a built-in admin theme or provide a third-party hosted CSS URL.
      </p>
      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--hf-muted)' }}>Theme preset</span>
        <select value={preset} onChange={(e) => setPreset(e.currentTarget.value as ThemePreset)} style={{ border: '1px solid var(--hf-border)', borderRadius: 8, padding: '8px 10px' }}>
          {presets.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--hf-muted)' }}>Third-party theme CSS URL (optional)</span>
        <input value={cssUrl} onChange={(e) => setCssUrl(e.currentTarget.value)} placeholder="https://example.com/admin-theme.css" style={{ border: '1px solid var(--hf-border)', borderRadius: 8, padding: '8px 10px' }} />
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" style={{ border: 'none', borderRadius: 8, background: 'var(--hf-primary)', color: '#fff', padding: '8px 14px', cursor: 'pointer' }}>Apply Theme</button>
        <button type="button" onClick={() => { setCssUrl(''); applyPortalTheme(preset, ''); }} style={{ border: '1px solid var(--hf-border)', borderRadius: 8, background: 'transparent', color: 'var(--hf-foreground)', padding: '8px 14px', cursor: 'pointer' }}>Clear External CSS</button>
      </div>
    </form>
  );
}
`;
}

function hubforgePluginsFile(): string {
  return `/**
 * HubForge plugin hooks.
 * Add custom logic for init/feature/upgrade without forking the framework.
 */
export default {
  async beforeInit(ctx) {
    // console.log('[plugin] beforeInit', ctx.projectName);
  },
  async afterInit(ctx) {
    // console.log('[plugin] afterInit', ctx.targetDir);
  },
};
`;
}

function hubforgePluginSdkPackageJson(): string {
  const pkg = {
    name: '@hubforge/plugin-sdk',
    version: '0.1.0',
    private: true,
    type: 'module',
    main: './dist/index.js',
    types: './dist/index.d.ts',
    scripts: {
      build: 'tsc -p tsconfig.json',
      typecheck: 'tsc --noEmit -p tsconfig.json',
    },
    devDependencies: {
      typescript: '^5.4.0',
    },
  };

  return `${JSON.stringify(pkg, null, 2)}\n`;
}

function hubforgePluginSdkIndexTs(): string {
  return `export type HookContext = {
  cwd: string;
  command: 'init' | 'feature' | 'infra' | 'upgrade';
  args: string[];
};

export type HubForgeHooks = {
  beforeInit?: (input: HookContext & { projectName: string; options: Record<string, string | boolean> }) => Promise<void> | void;
  afterInit?: (input: HookContext & { projectName: string; targetDir: string }) => Promise<void> | void;
  beforeFeature?: (input: HookContext & { featureName: string; type: string; targetDir: string }) => Promise<void> | void;
  afterFeature?: (input: HookContext & { featureName: string; type: string; targetDir: string }) => Promise<void> | void;
  beforeUpgrade?: (input: HookContext & { targetDir: string; force: boolean }) => Promise<void> | void;
  afterUpgrade?: (input: HookContext & { targetDir: string; upgradedFiles: string[] }) => Promise<void> | void;
};
`;
}

function eventsPackageJson(): string {
  const pkg = {
    name: '@hubforge/events',
    version: '0.1.0',
    private: true,
    type: 'module',
    main: './dist/index.js',
    types: './dist/index.d.ts',
    scripts: {
      build: 'tsc -p tsconfig.json',
      typecheck: 'tsc --noEmit -p tsconfig.json',
    },
    dependencies: {
      nats: '^2.29.3',
      zod: '^3.23.0',
    },
    devDependencies: {
      typescript: '^5.4.0',
    },
  };

  return `${JSON.stringify(pkg, null, 2)}\n`;
}

function eventsIndexTs(): string {
  return `import { z } from 'zod';
import { createJetStreamClient } from './jetstream.js';

export const domainEventSchema = z.object({
  kind: z.string(),
  tenantId: z.string(),
  entityId: z.string(),
  ts: z.number(),
  payload: z.record(z.unknown()).default({}),
});

export type DomainEvent = z.infer<typeof domainEventSchema>;

export async function publishDomainEvent(event: DomainEvent): Promise<void> {
  const js = await createJetStreamClient();
  const data = new TextEncoder().encode(JSON.stringify(event));
  await js.publish('events.' + event.kind, data);
}
`;
}

function eventsJetstreamTs(): string {
  return `import { connect } from 'nats';

let cached: Awaited<ReturnType<typeof connect>> | null = null;

export async function createJetStreamClient() {
  if (!cached) {
    cached = await connect({ servers: process.env['NATS_URL'] ?? 'nats://localhost:4222' });
  }
  return cached.jetstream();
}
`;
}

function k8sNamespaceYaml(): string {
  return `apiVersion: v1
kind: Namespace
metadata:
  name: hubforge
`;
}

function k8sApiDeploymentYaml(): string {
  return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: hubforge-api
  namespace: hubforge
spec:
  replicas: 1
  selector:
    matchLabels:
      app: hubforge-api
  template:
    metadata:
      labels:
        app: hubforge-api
    spec:
      containers:
        - name: api
          image: ghcr.io/futureedgepro/hubforge-api:latest
          ports:
            - containerPort: 4000
`;
}

function k8sPortalDeploymentYaml(): string {
  return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: hubforge-portal
  namespace: hubforge
spec:
  replicas: 1
  selector:
    matchLabels:
      app: hubforge-portal
  template:
    metadata:
      labels:
        app: hubforge-portal
    spec:
      containers:
        - name: portal
          image: ghcr.io/futureedgepro/hubforge-portal:latest
          ports:
            - containerPort: 3001
`;
}

function k8sUiDeploymentYaml(): string {
  return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: hubforge-ui
  namespace: hubforge
spec:
  replicas: 1
  selector:
    matchLabels:
      app: hubforge-ui
  template:
    metadata:
      labels:
        app: hubforge-ui
    spec:
      containers:
        - name: ui
          image: ghcr.io/futureedgepro/hubforge-ui:latest
          ports:
            - containerPort: 3010
`;
}

// API Client

function apiClientPackageJson(): string {
  const pkg = {
    name: '@hubforge/api-client',
    version: '0.1.0',
    private: true,
    type: 'module',
    main: './dist/index.js',
    types: './dist/index.d.ts',
    scripts: {
      build: 'tsc -p tsconfig.json',
      typecheck: 'tsc --noEmit -p tsconfig.json',
    },
    devDependencies: {
      typescript: '^5.4.0',
    },
  };

  return `${JSON.stringify(pkg, null, 2)}\n`;
}

function apiClientIndexTs(): string {
  return `export type ApiClientOptions = {
  baseUrl: string;
  getToken?: () => Promise<string | undefined>;
};

export type ApiClient = ReturnType<typeof createApiClient>;

export function createApiClient(options: ApiClientOptions) {
  const { baseUrl, getToken } = options;

  async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const token = getToken ? await getToken() : undefined;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }
    const res = await fetch(baseUrl + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : null,
    });
    if (!res.ok) {
      throw new Error('API ' + res.status + ': ' + res.statusText);
    }
    return res.json() as Promise<T>;
  }

  return {
    get<T>(path: string): Promise<T> {
      return request<T>('GET', path);
    },
    post<T>(path: string, body: unknown): Promise<T> {
      return request<T>('POST', path, body);
    },
    put<T>(path: string, body: unknown): Promise<T> {
      return request<T>('PUT', path, body);
    },
    delete<T>(path: string): Promise<T> {
      return request<T>('DELETE', path);
    },
    health() {
      return request<{ ok: boolean; service: string }>('GET', '/health');
    },
  };
}
`;
}

// Vitest + CI

function apiVitestConfigTs(): string {
  return `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
  },
});
`;
}

function webVitestConfigTs(): string {
  return `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['app/**/*.test.ts'],
  },
});
`;
}

function webSmokeTestTs(appName: 'portal' | 'ui'): string {
  return `import { describe, expect, it } from 'vitest';

describe('${appName} scaffold smoke', () => {
  it('keeps baseline test runner wired', () => {
    expect(true).toBe(true);
  });
});
`;
}

function vitestWorkspace(): string {
  return `import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'apps/api/vitest.config.ts',
  'apps/portal/vitest.config.ts',
  'apps/ui/vitest.config.ts',
]);
`;
}

function ciWorkflowYaml(): string {
  return `name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

concurrency:
  group: ${'${{ github.workflow }}'}-${'${{ github.ref }}'}
  cancel-in-progress: true

jobs:
  ci:
    name: Typecheck and test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Typecheck
        run: pnpm typecheck

      - name: Test
        run: pnpm test
`;
}

function releaseWorkflowYaml(): string {
  return `name: Release

on:
  workflow_dispatch:
  push:
    tags:
      - 'v*.*.*'

jobs:
  release:
    name: Build and publish release notes
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Typecheck
        run: pnpm typecheck

      - name: Test
        run: pnpm test

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          generate_release_notes: true
`;
}

function e2eWorkflowYaml(): string {
  return `name: E2E

on:
  workflow_dispatch:
  pull_request:
    branches: [main]

jobs:
  e2e:
    name: Playwright E2E
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Typecheck
        run: pnpm typecheck

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps chromium

      - name: Run Playwright e2e tests
        run: pnpm test:e2e
`;
}

