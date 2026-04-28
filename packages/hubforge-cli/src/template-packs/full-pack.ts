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
  await writeTextFile(path.join(targetDir, 'apps', 'api', 'src', 'lib', 'email-settings-store.ts'), apiEmailSettingsStoreLibTs());
  await writeTextFile(path.join(targetDir, 'apps', 'api', 'src', 'lib', 'notifications.ts'), apiNotificationsLibTs());
  await writeTextFile(path.join(targetDir, 'apps', 'api', 'src', 'lib', 'webhook-queue.ts'), apiWebhookQueueLibTs());
  await writeTextFile(path.join(targetDir, 'apps', 'api', 'src', 'routes', 'health.ts'), apiHealthRouteTs());
  await writeTextFile(path.join(targetDir, 'apps', 'api', 'src', 'routes', 'audit-log.ts'), apiAuditLogRouteTs());
  await writeTextFile(path.join(targetDir, 'apps', 'api', 'src', 'routes', 'tenancy.ts'), apiTenancyRouteTs());
  await writeTextFile(path.join(targetDir, 'apps', 'api', 'src', 'routes', 'auth.ts'), apiAuthRouteTs(options));
  await writeTextFile(path.join(targetDir, 'apps', 'api', 'src', 'routes', 'email-account-settings.ts'), apiEmailAccountSettingsRouteTs());
  await writeTextFile(path.join(targetDir, 'apps', 'api', 'src', 'routes', 'settings.ts'), apiSettingsRouteTs());
  await writeTextFile(path.join(targetDir, 'apps', 'api', 'src', 'routes', 'notifications.ts'), apiNotificationsRouteTs());
  await writeTextFile(path.join(targetDir, 'apps', 'api', 'src', 'routes', 'ai-assistant.ts'), apiAiAssistantRouteTs());
  await writeTextFile(path.join(targetDir, 'apps', 'api', 'src', 'routes', 'rbac.ts'), apiRbacRouteTs());
  await writeTextFile(path.join(targetDir, 'apps', 'api', 'src', 'routes', 'billing.ts'), apiBillingRouteTs());
  await writeTextFile(path.join(targetDir, 'apps', 'api', 'src', 'routes', 'background-jobs.ts'), apiJobsRouteTs());
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
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'lib', 'theme-registry.ts'), portalThemeRegistryTs());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'public', 'themes', 'example-themeforest-adapter.css'), portalExampleThemeAdapterCss());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', '_index.tsx'), portalIndexRoute());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', 'login.tsx'), portalLoginRoute());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', '_app.tsx'), portalAppLayout(options));
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', '_app.dashboard._index.tsx'), portalDashboardRoute());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', '_app.users._index.tsx'), portalUsersRoute());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', '_app.roles._index.tsx'), portalRolesRoute());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', '_app.permissions._index.tsx'), portalPermissionsRoute());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', '_app.jobs._index.tsx'), portalJobsRoute());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', '_app.assistant._index.tsx'), portalAssistantRoute());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', '_app.notifications._index.tsx'), portalNotificationsRoute());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', '_app.profile._index.tsx'), portalProfileRoute());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', '_app.audit-log._index.tsx'), portalAuditLogRoute());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', '_app.docs._index.tsx'), portalDocsRoute());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', '_app.settings._index.tsx'), portalSettingsIndexRoute(options));
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', '_app.settings.modules._index.tsx'), portalModulesRoute());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', '_app.settings.email-account._index.tsx'), portalEmailAccountSettingsRoute());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', '_app.settings.theme._index.tsx'), portalThemeSettingsRoute());
  await writeTextFile(path.join(targetDir, 'apps', 'portal', 'app', 'routes', '$.tsx'), portalNotFoundRoute());
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

  // packages/jobs
  await writeTextFile(path.join(targetDir, 'packages', 'jobs', 'package.json'), jobsPackageJson());
  await writeTextFile(path.join(targetDir, 'packages', 'jobs', 'tsconfig.json'), packageTsConfig());
  await writeTextFile(path.join(targetDir, 'packages', 'jobs', 'src', 'worker.ts'), jobsWorkerTs());

  // packages/db
  await writeTextFile(path.join(targetDir, 'packages', 'db', 'package.json'), dbPackageJson());
  await writeTextFile(path.join(targetDir, 'packages', 'db', 'tsconfig.json'), packageTsConfig());
  await writeTextFile(path.join(targetDir, 'packages', 'db', '.env'), dbEnvFile(options.dbProvider));
  await writeTextFile(path.join(targetDir, 'packages', 'db', 'scripts', 'bootstrap-postgres.mjs'), dbBootstrapPostgresScript());
  await writeTextFile(path.join(targetDir, 'packages', 'db', 'scripts', 'seed-registry.mjs'), dbSeedRegistryScript());
  await writeTextFile(path.join(targetDir, 'packages', 'db', 'src', 'index.ts'), dbIndexTs());
  await writeTextFile(path.join(targetDir, 'packages', 'db', 'src', 'settings.ts'), dbSettingsTs());
  await writeTextFile(path.join(targetDir, 'packages', 'db', 'src', 'notifications.ts'), dbNotificationsTs());
  await writeTextFile(path.join(targetDir, 'packages', 'db', 'src', 'permissions.ts'), dbPermissionsTs());
  await writeTextFile(path.join(targetDir, 'packages', 'db', 'src', 'billing.ts'), dbBillingTs());
  await writeTextFile(path.join(targetDir, 'packages', 'db', 'src', 'jobs.ts'), dbJobsTs());
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
      'dev:jobs': 'pnpm --filter @hubforge/jobs dev',
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

> Scaffolded with [HubForge CLI](https://github.com/FutureEdgePro/FutureEdge.HubForge) - opinionated full-stack SaaS scaffolding for TypeScript monorepos.

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

### API (apps/api) - port 4000

- **Framework:** [Hono v4](https://hono.dev) - lightweight, edge-ready HTTP framework
- **Auth:** JWT/OIDC validation via \`jose\` (JWKS discovery for ${options.authProvider})
- **Webhooks:** BullMQ + Redis retry queue with exponential backoff
- **Push:** Firebase Admin SDK for FCM push notifications
- **Validation:** Zod request schemas

### Public site (apps/ui) - port 3010

- **Framework:** [React Router v7](https://reactrouter.com) - server-side rendering (SSR)
- **Styling:** Tailwind CSS v4
- **Build:** Vite 5

### Authenticated portal (apps/portal) - port 3001

- **Framework:** [React Router v7](https://reactrouter.com) - SSR, protected layout hierarchy
- **Styling:** Tailwind CSS v4
- **Build:** Vite 5

${options.aiMode === 'fastapi' ? `### AI service (apps/ai) - port 5000

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

# Background job endpoint + worker pairing
hubforge feature sync-orders --type background-job
\`\`\`

---

## Testing

\`\`\`bash
# Unit and integration tests
pnpm test

# Watch mode
pnpm test:watch

# End-to-end (Playwright - requires apps running or uses webServer config)
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
AI_PROVIDER=${options.aiProvider}
AI_KEY=${options.aiKey}
AI_MODEL=gpt-4o-mini
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
AZURE_OPENAI_API_VERSION=2024-02-15-preview
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
      nodemailer: '^6.10.1',
      stripe: '^16.10.0',
      zod: '^3.23.0',
    },
    devDependencies: {
      '@types/nodemailer': '^6.4.15',
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
import { enqueueWebhookDelivery, startWebhookWorker } from './lib/webhook-queue.js';
import { resolveTenantContext } from '@hubforge/tenancy';
import { registerHealthRoutes } from './routes/health.js';
import { registerAuditLogRoutes } from './routes/audit-log.js';
import { registerTenancyRoutes } from './routes/tenancy.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerEmailAccountSettingsRoutes } from './routes/email-account-settings.js';
import { registerSettingsRoutes } from './routes/settings.js';
import { registerNotificationRoutes } from './routes/notifications.js';
import { registerAiAssistantRoutes } from './routes/ai-assistant.js';
import { registerUsersRoutes, registerRolesRoutes, registerPermissionsRoutes } from './routes/rbac.js';
import { registerBillingRoutes } from './routes/billing.js';
import { registerJobRoutes } from './routes/background-jobs.js';
import { PermissionRegistry } from '@hubforge/db';
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
  '/v1/billing/webhooks/stripe',
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
registerAuditLogRoutes(app);
registerTenancyRoutes(app);
registerAuthRoutes(app);${authServerRegister}
registerEmailAccountSettingsRoutes(app);
registerSettingsRoutes(app);
registerNotificationRoutes(app);
registerAiAssistantRoutes(app);
registerUsersRoutes(app);
registerRolesRoutes(app);
registerPermissionsRoutes(app);
registerBillingRoutes(app);
registerJobRoutes(app);

app.use('/v1/*', async (c, next) => {
  if (publicV1Paths.has(c.req.path)) {
    await next();
    return;
  }
  await requireAuth(c, next);
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
PermissionRegistry.syncToDatabase().catch((error) => {
  console.error('[hubforge][rbac] Failed to sync permissions:', error);
});
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
  return `import nodemailer from 'nodemailer';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging, type MessagingPayload } from 'firebase-admin/messaging';
import { getEmailAccountSettings } from './email-settings-store.js';

export type NotificationChannel = 'email' | 'push';

export type NotificationDispatchInput = {
  tenantId?: string | null;
  channel: NotificationChannel;
  recipient: string;
  subject?: string;
  body: string;
  title?: string;
  data?: Record<string, string>;
};

export type NotificationDispatchResult = {
  provider: string;
  messageId: string;
  mocked: boolean;
};

function resolvePushProvider(): 'firebase' | 'mock' {
  const provider = (process.env['NOTIFICATION_PROVIDER'] ?? 'firebase').toLowerCase();
  return provider === 'firebase' ? 'firebase' : 'mock';
}

function resolveEmailProvider(): 'smtp' | 'mock' {
  const configured = (process.env['NOTIFICATION_EMAIL_PROVIDER'] ?? 'smtp').toLowerCase();
  return configured === 'smtp' ? 'smtp' : 'mock';
}

function ensureFirebaseApp(): void {
  if (getApps().length > 0) return;

  const projectId = process.env['FIREBASE_PROJECT_ID'];
  const clientEmail = process.env['FIREBASE_CLIENT_EMAIL'];
  const privateKey = process.env['FIREBASE_PRIVATE_KEY']?.replace(/\\n/g, '\\n');
  if (projectId && clientEmail && privateKey) {
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
    return;
  }

  initializeApp({ credential: applicationDefault() });
}

function isPlaceholderFirebaseConfig(): boolean {
  const projectId = process.env['FIREBASE_PROJECT_ID'] ?? '';
  const clientEmail = process.env['FIREBASE_CLIENT_EMAIL'] ?? '';
  const privateKey = process.env['FIREBASE_PRIVATE_KEY'] ?? '';
  return projectId.includes('change-me') || clientEmail.includes('change-me') || privateKey.includes('change-me');
}

async function sendPush(input: NotificationDispatchInput): Promise<NotificationDispatchResult> {
  const provider = resolvePushProvider();
  if (provider !== 'firebase' || isPlaceholderFirebaseConfig()) {
    return {
      provider: provider === 'firebase' ? 'mock-firebase' : 'mock',
      messageId: 'mock-push-' + crypto.randomUUID(),
      mocked: true,
    };
  }

  ensureFirebaseApp();
  const message: MessagingPayload & { token: string } = {
    token: input.recipient,
    notification: { title: input.title ?? 'Notification', body: input.body },
    ...(input.data ? { data: input.data } : {}),
  };
  const messageId = await getMessaging().send(message as never);
  return { provider: 'firebase', messageId, mocked: false };
}

async function sendEmail(input: NotificationDispatchInput): Promise<NotificationDispatchResult> {
  const provider = resolveEmailProvider();
  if (provider !== 'smtp') {
    return {
      provider: 'mock-email',
      messageId: 'mock-email-' + crypto.randomUUID(),
      mocked: true,
    };
  }

  const tenantId = input.tenantId ?? null;
  if (!tenantId) {
    throw new Error('tenantId is required for email notifications');
  }

  const settings = await getEmailAccountSettings(tenantId);
  if (!settings.enabled) {
    throw new Error('Email notifications are disabled for this tenant');
  }

  const transporter = nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpSecure,
    auth: settings.smtpUser ? { user: settings.smtpUser, pass: settings.smtpPass } : undefined,
  });

  const info = await transporter.sendMail({
    from: settings.fromName ? settings.fromName + ' <' + settings.fromEmail + '>' : settings.fromEmail,
    to: input.recipient,
    subject: input.subject ?? 'Notification',
    text: input.body,
    html: '<p>' + input.body + '</p>',
  });

  return { provider: 'smtp', messageId: info.messageId, mocked: false };
}

export async function dispatchNotification(input: NotificationDispatchInput): Promise<NotificationDispatchResult> {
  if (input.channel === 'push') {
    return sendPush(input);
  }
  return sendEmail(input);
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

function apiEmailSettingsStoreLibTs(): string {
  return `import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

export type EmailAccountSettings = {
  enabled: boolean;
  fromEmail: string;
  fromName: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
};

const storePath = path.join(process.cwd(), '.data', 'email-account-settings.json');

const defaults: EmailAccountSettings = {
  enabled: false,
  fromEmail: '',
  fromName: 'HubForge Notifications',
  smtpHost: process.env['SMTP_HOST'] ?? 'localhost',
  smtpPort: Number(process.env['SMTP_PORT'] ?? 1025),
  smtpSecure: false,
  smtpUser: process.env['SMTP_USER'] ?? '',
  smtpPass: process.env['SMTP_PASS'] ?? '',
};

type Store = Record<string, EmailAccountSettings>;

async function loadStore(): Promise<Store> {
  try {
    const raw = await readFile(storePath, 'utf8');
    return JSON.parse(raw) as Store;
  } catch {
    return {};
  }
}

async function saveStore(store: Store): Promise<void> {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(store, null, 2), 'utf8');
}

export async function getEmailAccountSettings(tenantId: string): Promise<EmailAccountSettings> {
  const store = await loadStore();
  return {
    ...defaults,
    ...(store[tenantId] ?? {}),
  };
}

export async function setEmailAccountSettings(tenantId: string, input: Partial<EmailAccountSettings>): Promise<EmailAccountSettings> {
  const store = await loadStore();
  const next: EmailAccountSettings = {
    ...(store[tenantId] ?? defaults),
    ...input,
    enabled: input.enabled === true,
    smtpPort: Number(input.smtpPort ?? store[tenantId]?.smtpPort ?? defaults.smtpPort),
    smtpSecure: input.smtpSecure === true,
    fromName: typeof input.fromName === 'string' ? input.fromName : store[tenantId]?.fromName ?? defaults.fromName,
    fromEmail: typeof input.fromEmail === 'string' ? input.fromEmail : store[tenantId]?.fromEmail ?? defaults.fromEmail,
    smtpHost: typeof input.smtpHost === 'string' ? input.smtpHost : store[tenantId]?.smtpHost ?? defaults.smtpHost,
    smtpUser: typeof input.smtpUser === 'string' ? input.smtpUser : store[tenantId]?.smtpUser ?? defaults.smtpUser,
    smtpPass: typeof input.smtpPass === 'string' ? input.smtpPass : store[tenantId]?.smtpPass ?? defaults.smtpPass,
  };
  store[tenantId] = next;
  await saveStore(store);
  return next;
}
`;
}

function apiEmailAccountSettingsRouteTs(): string {
  return `import type { Hono } from 'hono';
import { getEmailAccountSettings, setEmailAccountSettings } from '../lib/email-settings-store.js';

export function registerEmailAccountSettingsRoutes(app: Hono): void {
  app.get('/v1/settings/email-account', async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    const settings = await getEmailAccountSettings(tenantId);
    return c.json(settings);
  });

  app.put('/v1/settings/email-account', async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const update: Parameters<typeof setEmailAccountSettings>[1] = {};

    if (typeof body['enabled'] === 'boolean') update.enabled = body['enabled'];
    if (typeof body['fromEmail'] === 'string') update.fromEmail = body['fromEmail'];
    if (typeof body['fromName'] === 'string') update.fromName = body['fromName'];
    if (typeof body['smtpHost'] === 'string') update.smtpHost = body['smtpHost'];
    if (typeof body['smtpPort'] === 'number') update.smtpPort = body['smtpPort'];
    if (typeof body['smtpSecure'] === 'boolean') update.smtpSecure = body['smtpSecure'];
    if (typeof body['smtpUser'] === 'string') update.smtpUser = body['smtpUser'];
    if (typeof body['smtpPass'] === 'string') update.smtpPass = body['smtpPass'];

    const settings = await setEmailAccountSettings(tenantId, update);
    return c.json(settings);
  });
}
`;
}

function apiSettingsRouteTs(): string {
  return `import type { Hono } from 'hono';
import { SettingsService } from '@hubforge/db';
import { requireAuth } from '../lib/auth.js';

type SettingScope = 'tenant' | 'environment' | 'system';

function scopeFromRequest(raw: string | undefined): SettingScope {
  if (raw === 'environment' || raw === 'system') {
    return raw;
  }
  return 'tenant';
}

export function registerSettingsRoutes(app: Hono): void {
  app.get('/v1/settings/modules', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    const environmentId = c.req.header('x-environment-id') ?? null;
    const scope = scopeFromRequest(c.req.query('scope'));

    try {
      const modules = await SettingsService.listModules(tenantId, { environmentId, scope });
      return c.json(modules);
    } catch (err) {
      console.error('Error fetching settings modules:', err);
      return c.json({ error: 'Failed to fetch settings modules' }, 500);
    }
  });

  app.get('/v1/settings/:module', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    const environmentId = c.req.header('x-environment-id') ?? null;
    const scope = scopeFromRequest(c.req.query('scope'));
    const module = c.req.param('module');

    if (!module) {
      return c.json({ error: 'module is required' }, 400);
    }

    try {
      const settings = await SettingsService.list(tenantId, module, { environmentId, scope });
      return c.json(settings);
    } catch (err) {
      console.error('Error fetching settings:', err);
      return c.json({ error: 'Failed to fetch settings' }, 500);
    }
  });

  app.get('/v1/settings/:module/:key', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    const environmentId = c.req.header('x-environment-id') ?? null;
    const scope = scopeFromRequest(c.req.query('scope'));
    const module = c.req.param('module');
    const key = c.req.param('key');

    if (!module || !key) {
      return c.json({ error: 'module and key are required' }, 400);
    }

    try {
      const value = await SettingsService.get(tenantId, module, key, null, { environmentId, scope });
      return c.json({ module, key, value, scope, environmentId });
    } catch (err) {
      console.error('Error fetching setting:', err);
      return c.json({ error: 'Failed to fetch setting' }, 500);
    }
  });

  app.put('/v1/settings/:module/:key', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    const environmentId = c.req.header('x-environment-id') ?? null;
    const module = c.req.param('module');
    const key = c.req.param('key');

    if (!module || !key) {
      return c.json({ error: 'module and key are required' }, 400);
    }

    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const value = body['value'];
    const scope = scopeFromRequest(typeof body['scope'] === 'string' ? body['scope'] : c.req.query('scope'));

    if (value === undefined) {
      return c.json({ error: 'value is required' }, 400);
    }

    try {
      await SettingsService.set(tenantId, module, key, value, { environmentId, scope });
      return c.json({ success: true, module, key, value, scope, environmentId });
    } catch (err) {
      console.error('Error setting value:', err);
      return c.json({ error: 'Failed to update setting' }, 500);
    }
  });

  app.delete('/v1/settings/:module/:key', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    const environmentId = c.req.header('x-environment-id') ?? null;
    const scope = scopeFromRequest(c.req.query('scope'));
    const module = c.req.param('module');
    const key = c.req.param('key');

    if (!module || !key) {
      return c.json({ error: 'module and key are required' }, 400);
    }

    try {
      await SettingsService.delete(tenantId, module, key, { environmentId, scope });
      return c.json({ success: true });
    } catch (err) {
      console.error('Error deleting setting:', err);
      return c.json({ error: 'Failed to delete setting' }, 500);
    }
  });
}
`;
}

function apiNotificationsRouteTs(): string {
  return `import type { Hono } from 'hono';
import { NotificationService } from '@hubforge/db';
import { dispatchNotification } from '../lib/notifications.js';
import { requireAuth } from '../lib/auth.js';

function renderTemplate(text: string, variables: Record<string, unknown>): string {
  return text.replace(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g, (_, key: string) => {
    const value = variables[key];
    return value == null ? '' : String(value);
  });
}

export function registerNotificationRoutes(app: Hono): void {
  app.get('/v1/notifications/templates', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    const templates = await NotificationService.listTemplates(tenantId);
    return c.json(templates);
  });

  app.put('/v1/notifications/templates/:key', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    const key = c.req.param('key');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    if (!key) return c.json({ error: 'key is required' }, 400);

    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    if (typeof body['channel'] !== 'string' || (body['channel'] !== 'email' && body['channel'] !== 'push')) {
      return c.json({ error: 'channel must be "email" or "push"' }, 400);
    }
    if (typeof body['body'] !== 'string' || body['body'].trim().length === 0) {
      return c.json({ error: 'body is required' }, 400);
    }

    const template = await NotificationService.upsertTemplate({
      tenantId,
      key,
      channel: body['channel'],
      provider: typeof body['provider'] === 'string' ? body['provider'] : null,
      subject: typeof body['subject'] === 'string' ? body['subject'] : null,
      body: body['body'],
      isActive: typeof body['isActive'] === 'boolean' ? body['isActive'] : true,
      variablesSchema: typeof body['variablesSchema'] === 'object' && body['variablesSchema']
        ? (body['variablesSchema'] as Record<string, unknown>)
        : null,
    });

    return c.json(template);
  });

  app.delete('/v1/notifications/templates/:id', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    const id = c.req.param('id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    if (!id) return c.json({ error: 'id is required' }, 400);

    const result = await NotificationService.deleteTemplate(id, tenantId);
    return c.json({ deleted: result.count > 0 });
  });

  app.get('/v1/notifications/deliveries', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);

    const limitRaw = Number(c.req.query('limit') ?? 50);
    const limit = Number.isFinite(limitRaw) ? Math.min(200, Math.max(1, Math.floor(limitRaw))) : 50;
    const deliveries = await NotificationService.listDeliveries(tenantId, limit);
    return c.json(deliveries);
  });

  app.post('/v1/notifications/send', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);

    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const recipient = body['recipient'];
    const templateKey = body['templateKey'];
    const variables = typeof body['variables'] === 'object' && body['variables']
      ? (body['variables'] as Record<string, unknown>)
      : {};

    if (typeof recipient !== 'string') {
      return c.json({ error: 'recipient is required' }, 400);
    }

    let channel: 'email' | 'push' = 'email';
    let subject: string | null = null;
    let contentBody: string;
    let templateId: string | null = null;
    let providerHint: string | null = null;

    if (typeof templateKey === 'string' && templateKey.length > 0) {
      const template = await NotificationService.getTemplateByKey(templateKey, tenantId);
      if (!template || !template.isActive) {
        return c.json({ error: 'active notification template not found' }, 404);
      }
      channel = template.channel as 'email' | 'push';
      subject = template.subject ? renderTemplate(template.subject, variables) : null;
      contentBody = renderTemplate(template.body, variables);
      templateId = template.id;
      providerHint = template.provider;
    } else {
      const rawChannel = body['channel'];
      if (rawChannel !== 'email' && rawChannel !== 'push') {
        return c.json({ error: 'channel is required when templateKey is not provided' }, 400);
      }
      channel = rawChannel;
      subject = typeof body['subject'] === 'string' ? body['subject'] : null;
      if (typeof body['body'] !== 'string') {
        return c.json({ error: 'body is required when templateKey is not provided' }, 400);
      }
      contentBody = body['body'];
    }

    const delivery = await NotificationService.createDelivery({
      tenantId,
      templateId,
      channel,
      provider: providerHint,
      recipient,
      subject,
      body: contentBody,
      payload: { variables, request: body },
    });

    try {
      const result = await dispatchNotification({
        tenantId,
        channel,
        recipient,
        subject: subject ?? undefined,
        body: contentBody,
        ...(channel === 'push' ? { title: subject ?? 'Notification' } : {}),
      });

      const sent = await NotificationService.markDeliverySent(delivery.id, {
        provider: result.provider,
        externalMessageId: result.messageId,
      });
      return c.json(sent, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to deliver notification';
      const failed = await NotificationService.markDeliveryFailed(delivery.id, message);
      return c.json({ error: message, delivery: failed }, 500);
    }
  });

  app.post('/v1/notifications/push', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);

    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const token = body['token'];
    const title = body['title'];
    const messageBody = body['body'];
    if (typeof token !== 'string' || typeof title !== 'string' || typeof messageBody !== 'string') {
      return c.json({ error: 'token, title and body are required' }, 400);
    }

    const created = await NotificationService.createDelivery({
      tenantId,
      channel: 'push',
      recipient: token,
      subject: title,
      body: messageBody,
      payload: body['data'],
    });

    try {
      const sent = await dispatchNotification({
        tenantId,
        channel: 'push',
        recipient: token,
        title,
        body: messageBody,
      });

      const updated = await NotificationService.markDeliverySent(created.id, {
        provider: sent.provider,
        externalMessageId: sent.messageId,
      });
      return c.json(updated, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Push notification failed';
      const failed = await NotificationService.markDeliveryFailed(created.id, message);
      return c.json({ error: message, delivery: failed }, 500);
    }
  });

  app.post('/v1/notifications/email', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);

    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const to = body['to'];
    const subject = body['subject'];
    const messageBody = body['text'] ?? body['body'];
    if (typeof to !== 'string' || typeof subject !== 'string' || typeof messageBody !== 'string') {
      return c.json({ error: 'to, subject, and text/body are required' }, 400);
    }

    const created = await NotificationService.createDelivery({
      tenantId,
      channel: 'email',
      recipient: to,
      subject,
      body: messageBody,
      payload: body,
    });

    try {
      const sent = await dispatchNotification({
        tenantId,
        channel: 'email',
        recipient: to,
        subject,
        body: messageBody,
      });

      const updated = await NotificationService.markDeliverySent(created.id, {
        provider: sent.provider,
        externalMessageId: sent.messageId,
      });
      return c.json(updated, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Email notification failed';
      const failed = await NotificationService.markDeliveryFailed(created.id, message);
      return c.json({ error: message, delivery: failed }, 500);
    }
  });
}
`;
}

function apiAiAssistantRouteTs(): string {
  return `import type { Hono } from 'hono';
import { prisma } from '@hubforge/db';
import { requireAuth } from '../lib/auth.js';

type AuthPayload = { sub?: unknown; email?: unknown };

type SchedulerRequest = {
  jobType: string;
  jobPriority: string;
  customerLocation: string;
  requiredSkills: string[];
  preferredDateTime: string;
  technicianAvailability: Array<{ technicianId: string; windows: string[] }>;
  technicianSkillMatch: Array<{ technicianId: string; score: number }>;
  existingSchedule: Array<{ technicianId: string; slot: string }>;
  travelDistanceHint?: string;
  slaDeadline?: string;
};

type SchedulerResponse = {
  recommendedTechnician: string;
  recommendedAppointmentSlot: string;
  confidence: number;
  explanation: string;
  alternatives: string[];
  risks: string[];
};

function mockAssistantReply(prompt: string): { message: string; confidence: number; suggestions: string[] } {
  const summary = prompt.length > 160 ? prompt.slice(0, 160) + '...' : prompt;
  return {
    message: 'Assistant suggestion: review tenant context, prioritize high-impact actions, and validate dependent workflows before rollout. Prompt summary: ' + summary,
    confidence: 0.73,
    suggestions: [
      'Confirm required permissions before execution.',
      'Check related background jobs and notification templates.',
      'Document outcome for handoff continuity.',
    ],
  };
}

function mockSchedulerRecommendation(input: SchedulerRequest): SchedulerResponse {
  const topTech = input.technicianSkillMatch
    .slice()
    .sort((a, b) => b.score - a.score)[0]?.technicianId ?? input.technicianAvailability[0]?.technicianId ?? 'unassigned-tech';

  const preferred = input.preferredDateTime && !Number.isNaN(new Date(input.preferredDateTime).valueOf())
    ? new Date(input.preferredDateTime)
    : new Date(Date.now() + 60 * 60 * 1000);

  return {
    recommendedTechnician: topTech,
    recommendedAppointmentSlot: preferred.toISOString(),
    confidence: 0.74,
    explanation: 'Mock scheduler selected the highest skill-match technician and preferred slot, adjusted for feasibility.',
    alternatives: [
      'Move appointment by +2h to improve route clustering.',
      'Use secondary technician with similar skills for better SLA buffer.',
    ],
    risks: [
      'Traffic and travel time estimates are placeholder-only in mock mode.',
      'Real-time technician load is approximated from provided payload.',
    ],
  };
}

function readAiProvider(): 'mock' | 'openai' | 'azure' {
  const provider = (process.env['AI_PROVIDER'] ?? 'mock').toLowerCase();
  if (provider === 'openai' || provider === 'azure') return provider;
  return 'mock';
}

function hasValidAiKey(value: string | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.length > 10 && !trimmed.includes('change-me');
}

async function callOpenAiJson(model: string, apiKey: string, systemPrompt: string, userPrompt: string): Promise<unknown> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: 'Bearer ' + apiKey,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error('OpenAI request failed: ' + res.status + ' ' + text.slice(0, 220));
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI response missing message content');
  return JSON.parse(content);
}

async function callAzureOpenAiJson(
  endpoint: string,
  deployment: string,
  apiVersion: string,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<unknown> {
  const base = endpoint.replace(/\/$/, '');
  const url = base + '/openai/deployments/' + encodeURIComponent(deployment) + '/chat/completions?api-version=' + encodeURIComponent(apiVersion);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error('Azure OpenAI request failed: ' + res.status + ' ' + text.slice(0, 220));
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Azure OpenAI response missing message content');
  return JSON.parse(content);
}

async function generateAiJson(systemPrompt: string, userPrompt: string): Promise<{ provider: string; model: string; json: unknown; mocked: boolean; fallbackReason?: string }> {
  const provider = readAiProvider();
  const model = process.env['AI_MODEL'] ?? 'gpt-4o-mini';
  const apiKey = process.env['AI_KEY'];

  if (provider === 'openai') {
    if (!hasValidAiKey(apiKey)) {
      return { provider: 'mock', model, json: {}, mocked: true, fallbackReason: 'AI_KEY not configured for OpenAI' };
    }
    try {
      const json = await callOpenAiJson(model, apiKey as string, systemPrompt, userPrompt);
      return { provider: 'openai', model, json, mocked: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'OpenAI failure';
      return { provider: 'mock', model, json: {}, mocked: true, fallbackReason: message };
    }
  }

  if (provider === 'azure') {
    const endpoint = process.env['AZURE_OPENAI_ENDPOINT'] ?? '';
    const deployment = process.env['AZURE_OPENAI_DEPLOYMENT'] ?? '';
    const apiVersion = process.env['AZURE_OPENAI_API_VERSION'] ?? '2024-02-15-preview';

    if (!hasValidAiKey(apiKey) || !endpoint || !deployment || endpoint.includes('your-resource')) {
      return { provider: 'mock', model, json: {}, mocked: true, fallbackReason: 'Azure OpenAI config missing (AI_KEY/endpoint/deployment)' };
    }

    try {
      const json = await callAzureOpenAiJson(endpoint, deployment, apiVersion, apiKey as string, systemPrompt, userPrompt);
      return { provider: 'azure', model, json, mocked: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Azure OpenAI failure';
      return { provider: 'mock', model, json: {}, mocked: true, fallbackReason: message };
    }
  }

  return { provider: 'mock', model, json: {}, mocked: true, fallbackReason: 'AI_PROVIDER is mock' };
}

async function hasPermission(userId: string, tenantId: string, module: string, action: string): Promise<boolean> {
  const hit = await prisma.userRole.findFirst({
    where: {
      userId,
      role: {
        tenantId,
        permissions: {
          some: {
            permission: {
              module,
              action,
            },
          },
        },
      },
    },
    select: { id: true },
  });
  return Boolean(hit);
}

async function authorizeAiPermission(
  c: Parameters<Parameters<Hono['get']>[1]>[0],
  action: 'read' | 'invoke',
): Promise<{ userId: string; tenantId: string } | Response> {
  const tenantId = c.req.header('x-tenant-id');
  if (!tenantId) {
    return c.json({ error: 'x-tenant-id required' }, 400);
  }

  const auth = (c as unknown as { get: (key: string) => unknown }).get('auth') as AuthPayload | undefined;
  const userId = typeof auth?.sub === 'string' ? auth.sub : null;
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const allowed = await hasPermission(userId, tenantId, 'ai-assistant', action);
  if (!allowed) {
    return c.json({ error: 'Forbidden', requiredPermission: 'ai-assistant:' + action }, 403);
  }

  return { userId, tenantId };
}

export function registerAiAssistantRoutes(app: Hono): void {
  app.get('/v1/ai-assistant/access', requireAuth, async (c) => {
    const authz = await authorizeAiPermission(c, 'read');
    if (authz instanceof Response) return authz;
    return c.json({ allowed: true, tenantId: authz.tenantId, userId: authz.userId });
  });

  app.post('/v1/ai-assistant/chat', requireAuth, async (c) => {
    const authz = await authorizeAiPermission(c, 'invoke');
    if (authz instanceof Response) return authz;

    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const prompt = body['prompt'];
    if (typeof prompt !== 'string' || prompt.trim().length === 0) {
      return c.json({ error: 'prompt is required' }, 400);
    }

    const ai = await generateAiJson(
      'You are an operations assistant. Return valid JSON with keys: message (string), confidence (number 0..1), suggestions (string[]).',
      prompt.trim(),
    );

    const parsed = (typeof ai.json === 'object' && ai.json ? ai.json as Record<string, unknown> : {});
    const response = parsed['message'] && parsed['suggestions']
      ? {
        message: typeof parsed['message'] === 'string' ? parsed['message'] : 'Assistant response unavailable.',
        confidence: typeof parsed['confidence'] === 'number' ? parsed['confidence'] : 0.68,
        suggestions: Array.isArray(parsed['suggestions']) ? parsed['suggestions'].map((x) => String(x)) : ['No suggestions returned.'],
      }
      : mockAssistantReply(prompt.trim());

    return c.json({
      ok: true,
      provider: ai.provider,
      model: ai.model,
      prompt,
      response,
      mocked: ai.mocked,
      ...(ai.fallbackReason ? { fallbackReason: ai.fallbackReason } : {}),
      trace: {
        tenantId: authz.tenantId,
        userId: authz.userId,
        ts: new Date().toISOString(),
      },
    });
  });

  app.post('/v1/ai/schedule', requireAuth, async (c) => {
    const authz = await authorizeAiPermission(c, 'invoke');
    if (authz instanceof Response) return authz;

    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const input: SchedulerRequest = {
      jobType: typeof body['jobType'] === 'string' ? body['jobType'] : '',
      jobPriority: typeof body['jobPriority'] === 'string' ? body['jobPriority'] : 'normal',
      customerLocation: typeof body['customerLocation'] === 'string' ? body['customerLocation'] : 'unknown',
      requiredSkills: Array.isArray(body['requiredSkills']) ? body['requiredSkills'].map((v) => String(v)) : [],
      preferredDateTime: typeof body['preferredDateTime'] === 'string' ? body['preferredDateTime'] : new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      technicianAvailability: Array.isArray(body['technicianAvailability']) ? body['technicianAvailability'] as Array<{ technicianId: string; windows: string[] }> : [],
      technicianSkillMatch: Array.isArray(body['technicianSkillMatch']) ? body['technicianSkillMatch'] as Array<{ technicianId: string; score: number }> : [],
      existingSchedule: Array.isArray(body['existingSchedule']) ? body['existingSchedule'] as Array<{ technicianId: string; slot: string }> : [],
      travelDistanceHint: typeof body['travelDistanceHint'] === 'string' ? body['travelDistanceHint'] : undefined,
      slaDeadline: typeof body['slaDeadline'] === 'string' ? body['slaDeadline'] : undefined,
    };

    if (!input.jobType) {
      return c.json({ error: 'jobType is required' }, 400);
    }

    const ai = await generateAiJson(
      'You are a dispatch scheduling assistant. Return valid JSON with keys: recommendedTechnician (string), recommendedAppointmentSlot (ISO string), confidence (number 0..1), explanation (string), alternatives (string[]), risks (string[]).',
      JSON.stringify(input),
    );

    const parsed = (typeof ai.json === 'object' && ai.json ? ai.json as Record<string, unknown> : {});
    const recommendation: SchedulerResponse = parsed['recommendedTechnician'] && parsed['recommendedAppointmentSlot']
      ? {
        recommendedTechnician: String(parsed['recommendedTechnician']),
        recommendedAppointmentSlot: String(parsed['recommendedAppointmentSlot']),
        confidence: typeof parsed['confidence'] === 'number' ? parsed['confidence'] : 0.65,
        explanation: typeof parsed['explanation'] === 'string' ? parsed['explanation'] : 'Provider response did not include explanation.',
        alternatives: Array.isArray(parsed['alternatives']) ? parsed['alternatives'].map((x) => String(x)) : [],
        risks: Array.isArray(parsed['risks']) ? parsed['risks'].map((x) => String(x)) : [],
      }
      : mockSchedulerRecommendation(input);

    return c.json({
      ok: true,
      provider: ai.provider,
      model: ai.model,
      mocked: ai.mocked,
      ...(ai.fallbackReason ? { fallbackReason: ai.fallbackReason } : {}),
      recommendation,
      trace: {
        tenantId: authz.tenantId,
        userId: authz.userId,
        ts: new Date().toISOString(),
      },
    });
  });
}
`;
}

function apiRbacRouteTs(): string {
  return `import type { Hono } from 'hono';
import { prisma } from '@hubforge/db';
import { requireAuth } from '../lib/auth.js';

export function registerUsersRoutes(app: Hono): void {
  app.get('/v1/users', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);

    const users = await prisma.user.findMany({
      where: {
        memberships: {
          some: { tenantId },
        },
      },
      include: {
        memberships: { where: { tenantId } },
        userRoles: {
          where: { role: { tenantId } },
          include: { role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return c.json(users);
  });

  app.post('/v1/users', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const email = body['email'];
    const name = body['name'];

    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    if (typeof email !== 'string') return c.json({ error: 'email is required' }, 400);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return c.json({ error: 'User already exists' }, 409);

    const user = await prisma.user.create({
      data: {
        email,
        name: typeof name === 'string' ? name : null,
      },
    });

    await prisma.membership.upsert({
      where: { tenantId_userId: { tenantId, userId: user.id } },
      update: {},
      create: { tenantId, userId: user.id, role: 'member' },
    });

    const hydrated = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        memberships: { where: { tenantId } },
        userRoles: {
          where: { role: { tenantId } },
          include: { role: true },
        },
      },
    });

    return c.json(hydrated, 201);
  });

  app.put('/v1/users/:userId', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    const userId = c.req.param('userId');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    if (!userId) return c.json({ error: 'userId is required' }, 400);

    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const update: Record<string, unknown> = {};
    if (typeof body['name'] === 'string') update.name = body['name'];
    if (typeof body['email'] === 'string') update.email = body['email'];

    const membership = await prisma.membership.findFirst({ where: { tenantId, userId } });
    if (!membership) return c.json({ error: 'User not found in tenant' }, 404);

    const user = await prisma.user.update({
      where: { id: userId },
      data: update,
      include: {
        memberships: { where: { tenantId } },
        userRoles: {
          where: { role: { tenantId } },
          include: { role: true },
        },
      },
    });

    return c.json(user);
  });

  app.delete('/v1/users/:userId', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    const userId = c.req.param('userId');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    if (!userId) return c.json({ error: 'userId is required' }, 400);

    const membership = await prisma.membership.findFirst({ where: { tenantId, userId } });
    if (!membership) return c.json({ error: 'User not found in tenant' }, 404);

    const tenantRoleIds = await prisma.role.findMany({ where: { tenantId }, select: { id: true } });
    await prisma.userRole.deleteMany({
      where: {
        userId,
        roleId: { in: tenantRoleIds.map((r) => r.id) },
      },
    });

    await prisma.membership.deleteMany({ where: { tenantId, userId } });
    const remainingMemberships = await prisma.membership.count({ where: { userId } });
    if (remainingMemberships === 0) {
      await prisma.user.delete({ where: { id: userId } });
    }

    return c.json({ success: true });
  });

  app.post('/v1/user-roles', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const userId = body['userId'];
    const roleId = body['roleId'];
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    if (typeof userId !== 'string' || typeof roleId !== 'string') {
      return c.json({ error: 'userId and roleId are required' }, 400);
    }

    const role = await prisma.role.findFirst({ where: { id: roleId, tenantId } });
    if (!role) return c.json({ error: 'Role not found in tenant' }, 404);

    const membership = await prisma.membership.findFirst({ where: { tenantId, userId } });
    if (!membership) return c.json({ error: 'User must belong to tenant before assignment' }, 400);

    const assignment = await prisma.userRole.create({
      data: { userId, roleId },
      include: { role: true },
    });
    return c.json(assignment, 201);
  });

  app.delete('/v1/user-roles/:id', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    const id = c.req.param('id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    if (!id) return c.json({ error: 'id is required' }, 400);

    const assignment = await prisma.userRole.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!assignment || assignment.role.tenantId !== tenantId) {
      return c.json({ error: 'Assignment not found' }, 404);
    }

    const removed = await prisma.userRole.delete({ where: { id } });
    return c.json(removed);
  });
}

export function registerRolesRoutes(app: Hono): void {
  app.get('/v1/roles', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);

    const roles = await prisma.role.findMany({
      where: { tenantId },
      include: { permissions: { include: { permission: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return c.json(roles);
  });

  app.post('/v1/roles', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const name = body['name'];
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    if (typeof name !== 'string') return c.json({ error: 'name is required' }, 400);

    const role = await prisma.role.create({
      data: {
        tenantId,
        name,
        description: typeof body['description'] === 'string' ? body['description'] : null,
      },
      include: { permissions: { include: { permission: true } } },
    });
    return c.json(role, 201);
  });

  app.put('/v1/roles/:roleId', requireAuth, async (c) => {
    const roleId = c.req.param('roleId');
    if (!roleId) return c.json({ error: 'roleId is required' }, 400);

    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const update: Record<string, unknown> = {};
    if (typeof body['name'] === 'string') update.name = body['name'];
    if (typeof body['description'] === 'string') update.description = body['description'];

    const role = await prisma.role.update({
      where: { id: roleId },
      data: update,
      include: { permissions: { include: { permission: true } } },
    });
    return c.json(role);
  });

  app.delete('/v1/roles/:roleId', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    const roleId = c.req.param('roleId');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    if (!roleId) return c.json({ error: 'roleId is required' }, 400);

    const role = await prisma.role.findFirst({ where: { id: roleId, tenantId } });
    if (!role) return c.json({ error: 'Role not found' }, 404);

    await prisma.role.delete({ where: { id: roleId } });
    return c.json({ success: true });
  });

  app.post('/v1/role-permissions', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const roleId = body['roleId'];
    const permissionId = body['permissionId'];

    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    if (typeof roleId !== 'string' || typeof permissionId !== 'string') {
      return c.json({ error: 'roleId and permissionId are required' }, 400);
    }

    const role = await prisma.role.findFirst({ where: { id: roleId, tenantId } });
    if (!role) return c.json({ error: 'Role not found in tenant' }, 404);

    const assignment = await prisma.rolePermission.create({
      data: { roleId, permissionId },
      include: { permission: true },
    });

    return c.json(assignment, 201);
  });

  app.delete('/v1/role-permissions/:id', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    const id = c.req.param('id');

    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    if (!id) return c.json({ error: 'id is required' }, 400);

    const assignment = await prisma.rolePermission.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!assignment || assignment.role.tenantId !== tenantId) {
      return c.json({ error: 'Assignment not found' }, 404);
    }

    const removed = await prisma.rolePermission.delete({ where: { id } });
    return c.json(removed);
  });
}

export function registerPermissionsRoutes(app: Hono): void {
  app.get('/v1/permissions', requireAuth, async (c) => {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });

    return c.json(permissions);
  });

  app.post('/v1/permissions', requireAuth, async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const module = body['module'];
    const action = body['action'];
    const description = body['description'];

    if (typeof module !== 'string' || typeof action !== 'string') {
      return c.json({ error: 'module and action are required' }, 400);
    }

    const permission = await prisma.permission.create({
      data: {
        module,
        action,
        description: typeof description === 'string' ? description : null,
      },
    });

    return c.json(permission, 201);
  });

  app.put('/v1/permissions/:permissionId', requireAuth, async (c) => {
    const permissionId = c.req.param('permissionId');
    if (!permissionId) return c.json({ error: 'permissionId is required' }, 400);

    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const update: Record<string, unknown> = {};
    if (typeof body['module'] === 'string') update.module = body['module'];
    if (typeof body['action'] === 'string') update.action = body['action'];
    if (typeof body['description'] === 'string') update.description = body['description'];

    const permission = await prisma.permission.update({
      where: { id: permissionId },
      data: update,
    });

    return c.json(permission);
  });

  app.delete('/v1/permissions/:permissionId', requireAuth, async (c) => {
    const permissionId = c.req.param('permissionId');
    if (!permissionId) return c.json({ error: 'permissionId is required' }, 400);

    await prisma.permission.delete({ where: { id: permissionId } });
    return c.json({ success: true });
  });
}
`;
}

function apiBillingRouteTs(): string {
  return `import type { Hono } from 'hono';
import Stripe from 'stripe';
import { BillingService, type BillingSubscriptionStatus } from '@hubforge/db';
import { requireAuth } from '../lib/auth.js';

type GenericObject = Record<string, unknown>;

function parseIsoDate(value: unknown): Date | null {
  if (typeof value !== 'string') return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

function parseUnixSeconds(value: unknown): Date | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return new Date(value * 1000);
}

function normalizeStatus(input: unknown): BillingSubscriptionStatus {
  if (typeof input !== 'string') return 'incomplete';
  const value = input.toLowerCase();
  if (value === 'trialing' || value === 'active' || value === 'past_due' || value === 'canceled' || value === 'unpaid' || value === 'incomplete' || value === 'incomplete_expired' || value === 'paused') {
    return value;
  }
  return 'incomplete';
}

function extractMetadata(input: unknown): Record<string, unknown> | null {
  if (typeof input !== 'object' || !input) return null;
  return input as Record<string, unknown>;
}

function shouldUseStripeVerification(): boolean {
  const provider = (process.env['BILLING_PROVIDER'] ?? 'stripe').toLowerCase();
  if (provider !== 'stripe') return false;
  const stripeSecret = process.env['STRIPE_SECRET_KEY'] ?? '';
  const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'] ?? '';
  const hasValidStripeSecret = stripeSecret.startsWith('sk_') && !stripeSecret.endsWith('change_me');
  const hasValidWebhookSecret = webhookSecret.startsWith('whsec_') && !webhookSecret.endsWith('change_me');
  return hasValidStripeSecret && hasValidWebhookSecret;
}

function resolveTenantIdFromMetadata(metadata: Record<string, unknown> | null, fallbackTenantId: string | null): string | null {
  const metadataTenant = metadata?.['tenantId'];
  if (typeof metadataTenant === 'string' && metadataTenant.length > 0) return metadataTenant;
  return fallbackTenantId;
}

async function processStripeLikeEvent(event: GenericObject, tenantIdHint: string | null) {
  const eventType = typeof event['type'] === 'string' ? event['type'] : 'unknown';
  const eventId = typeof event['id'] === 'string' ? event['id'] : null;
  const data = typeof event['data'] === 'object' && event['data'] ? (event['data'] as GenericObject) : null;
  const object = data && typeof data['object'] === 'object' && data['object'] ? (data['object'] as GenericObject) : null;

  const metadata = extractMetadata(object?.['metadata']);
  const tenantId = resolveTenantIdFromMetadata(metadata, tenantIdHint);
  if (!tenantId) {
    return { ok: false as const, status: 400, body: { error: 'tenantId is required in x-tenant-id header or event metadata' } };
  }

  await BillingService.recordEvent({
    tenantId,
    provider: 'stripe',
    eventType,
    externalEventId: eventId,
    payload: event,
    status: 'received',
  });

  if (eventType === 'customer.subscription.created' || eventType === 'customer.subscription.updated' || eventType === 'customer.subscription.deleted') {
    const subscriptionId = typeof object?.['id'] === 'string' ? object['id'] : null;
    const customerExternalId = typeof object?.['customer'] === 'string' ? object['customer'] : null;
    if (!subscriptionId || !customerExternalId) {
      return { ok: false as const, status: 400, body: { error: 'subscription id and customer id are required in event payload' } };
    }

    const items = object?.['items'];
    const itemsData = typeof items === 'object' && items ? (items as GenericObject)['data'] : null;
    const firstItem = Array.isArray(itemsData) && itemsData.length > 0 && typeof itemsData[0] === 'object' && itemsData[0]
      ? (itemsData[0] as GenericObject)
      : null;
    const firstPrice = firstItem && typeof firstItem['price'] === 'object' && firstItem['price'] ? (firstItem['price'] as GenericObject) : null;
    const planCode = typeof firstPrice?.['id'] === 'string' ? firstPrice['id'] : 'default';
    const currency = typeof object?.['currency'] === 'string'
      ? object['currency'].toUpperCase()
      : (process.env['BILLING_CURRENCY'] ?? 'USD').toUpperCase();
    const status = eventType === 'customer.subscription.deleted'
      ? 'canceled'
      : normalizeStatus(object?.['status']);

    const customerEmail = typeof object?.['customer_email'] === 'string' ? object['customer_email'] : null;
    await BillingService.upsertSubscriptionLifecycle({
      tenantId,
      provider: 'stripe',
      externalCustomerId: customerExternalId,
      customerEmail,
      externalSubscriptionId: subscriptionId,
      planCode,
      status,
      currency,
      cancelAtPeriodEnd: Boolean(object?.['cancel_at_period_end']),
      currentPeriodStart: parseUnixSeconds(object?.['current_period_start']),
      currentPeriodEnd: parseUnixSeconds(object?.['current_period_end']),
      metadata,
    });
  }

  if (eventType === 'invoice.payment_failed' || eventType === 'invoice.payment_succeeded') {
    const subscriptionId = typeof object?.['subscription'] === 'string' ? object['subscription'] : null;
    const customerExternalId = typeof object?.['customer'] === 'string' ? object['customer'] : null;
    if (subscriptionId && customerExternalId) {
      await BillingService.upsertSubscriptionLifecycle({
        tenantId,
        provider: 'stripe',
        externalCustomerId: customerExternalId,
        customerEmail: typeof object?.['customer_email'] === 'string' ? object['customer_email'] : null,
        externalSubscriptionId: subscriptionId,
        planCode: 'default',
        status: eventType === 'invoice.payment_succeeded' ? 'active' : 'past_due',
        currency: typeof object?.['currency'] === 'string'
          ? object['currency'].toUpperCase()
          : (process.env['BILLING_CURRENCY'] ?? 'USD').toUpperCase(),
        metadata,
      });
    }
  }

  await BillingService.recordEvent({
    tenantId,
    provider: 'stripe',
    eventType,
    externalEventId: eventId,
    payload: event,
    status: 'processed',
  });

  return { ok: true as const, status: 200, body: { received: true, eventType } };
}

export function registerBillingRoutes(app: Hono): void {
  app.get('/v1/billing/config', requireAuth, async (c) => {
    return c.json({
      provider: process.env['BILLING_PROVIDER'] ?? 'stripe',
      currency: (process.env['BILLING_CURRENCY'] ?? 'USD').toUpperCase(),
      stripeConfigured: shouldUseStripeVerification(),
      mockFallbackEnabled: true,
    });
  });

  app.get('/v1/billing/subscriptions', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    const subscriptions = await BillingService.listSubscriptions(tenantId);
    return c.json(subscriptions);
  });

  app.post('/v1/billing/subscriptions/mock', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);

    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const externalCustomerId = typeof body['externalCustomerId'] === 'string' ? body['externalCustomerId'] : null;
    const externalSubscriptionId = typeof body['externalSubscriptionId'] === 'string' ? body['externalSubscriptionId'] : null;
    if (!externalCustomerId || !externalSubscriptionId) {
      return c.json({ error: 'externalCustomerId and externalSubscriptionId are required' }, 400);
    }

    const subscription = await BillingService.upsertSubscriptionLifecycle({
      tenantId,
      provider: 'mock',
      externalCustomerId,
      customerEmail: typeof body['customerEmail'] === 'string' ? body['customerEmail'] : null,
      externalSubscriptionId,
      planCode: typeof body['planCode'] === 'string' ? body['planCode'] : 'mock-plan',
      status: normalizeStatus(body['status'] ?? 'active'),
      currency: typeof body['currency'] === 'string'
        ? body['currency'].toUpperCase()
        : (process.env['BILLING_CURRENCY'] ?? 'USD').toUpperCase(),
      cancelAtPeriodEnd: Boolean(body['cancelAtPeriodEnd']),
      currentPeriodStart: parseIsoDate(body['currentPeriodStart']),
      currentPeriodEnd: parseIsoDate(body['currentPeriodEnd']),
      metadata: extractMetadata(body['metadata']),
    });

    return c.json(subscription, 201);
  });

  app.post('/v1/billing/webhooks/stripe', async (c) => {
    const tenantIdHeader = c.req.header('x-tenant-id') ?? null;
    const rawBody = await c.req.raw.text();

    let eventPayload: GenericObject;
    if (shouldUseStripeVerification()) {
      const signature = c.req.header('stripe-signature');
      if (!signature) return c.json({ error: 'stripe-signature header required' }, 400);

      const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] as string);
      try {
        const webhookEvent = stripe.webhooks.constructEvent(
          rawBody,
          signature,
          process.env['STRIPE_WEBHOOK_SECRET'] as string,
        );
        eventPayload = webhookEvent as unknown as GenericObject;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'invalid stripe signature';
        return c.json({ error: message }, 400);
      }
    } else {
      try {
        const parsed = JSON.parse(rawBody) as unknown;
        if (!parsed || typeof parsed !== 'object') return c.json({ error: 'invalid webhook payload' }, 400);
        eventPayload = parsed as GenericObject;
      } catch {
        return c.json({ error: 'invalid webhook payload' }, 400);
      }
    }

    const processed = await processStripeLikeEvent(eventPayload, tenantIdHeader);
    return c.json(processed.body, processed.status);
  });
}
`;
}

function apiJobsRouteTs(): string {
  return `import type { Hono } from 'hono';
import { JobService } from '@hubforge/db';
import { requireAuth } from '../lib/auth.js';

export function registerJobRoutes(app: Hono): void {
  app.get('/v1/jobs', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    const jobs = await JobService.list(tenantId ?? null);
    return c.json(jobs);
  });

  app.get('/v1/jobs/:jobId', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    const jobId = c.req.param('jobId');
    if (!jobId) return c.json({ error: 'jobId is required' }, 400);

    const job = await JobService.getById(jobId, tenantId ?? null);
    if (!job) return c.json({ error: 'Job not found' }, 404);
    return c.json(job);
  });

  app.post('/v1/jobs/:jobType/trigger', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    const jobType = c.req.param('jobType');
    if (!jobType) return c.json({ error: 'jobType is required' }, 400);

    const body = (await c.req.json().catch(() => ({}))) as {
      payload?: unknown;
      priority?: unknown;
      scheduledFor?: unknown;
      maxAttempts?: unknown;
    };
    const created = await JobService.enqueue({
      tenantId: tenantId ?? null,
      jobType,
      payload: body.payload,
      priority: typeof body.priority === 'number' ? body.priority : 0,
      scheduledFor: typeof body.scheduledFor === 'string' ? new Date(body.scheduledFor) : null,
      maxAttempts: typeof body.maxAttempts === 'number' ? body.maxAttempts : 3,
      createdBy: null,
    });
    return c.json(created, 201);
  });

  app.post('/v1/jobs/:jobId/retry', requireAuth, async (c) => {
    const jobId = c.req.param('jobId');
    if (!jobId) return c.json({ error: 'jobId is required' }, 400);

    const job = await JobService.retry(jobId);
    return c.json(job);
  });

  app.post('/v1/jobs/:jobId/cancel', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    const jobId = c.req.param('jobId');
    if (!jobId) return c.json({ error: 'jobId is required' }, 400);

    const result = await JobService.cancel(jobId, tenantId ?? null);
    return c.json({ cancelled: result.count > 0 });
  });

  app.get('/v1/jobs/schedules/list', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);

    const schedules = await JobService.listSchedules(tenantId);
    return c.json(schedules);
  });

  app.post('/v1/jobs/schedules', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);

    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const name = body['name'];
    const jobType = body['jobType'];
    const cron = body['cron'];
    if (typeof name !== 'string' || typeof jobType !== 'string' || typeof cron !== 'string') {
      return c.json({ error: 'name, jobType, and cron are required' }, 400);
    }

    const schedule = await JobService.createSchedule({
      tenantId,
      name,
      jobType,
      cron,
      timezone: typeof body['timezone'] === 'string' ? body['timezone'] : 'UTC',
      payload: body['payload'],
      isActive: typeof body['isActive'] === 'boolean' ? body['isActive'] : true,
      nextRunAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    return c.json(schedule, 201);
  });

  app.put('/v1/jobs/schedules/:id', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    const id = c.req.param('id');
    if (!id) return c.json({ error: 'id is required' }, 400);

    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
    const result = await JobService.updateSchedule(id, tenantId, {
      ...(typeof body['name'] === 'string' ? { name: body['name'] } : {}),
      ...(typeof body['cron'] === 'string' ? { cron: body['cron'] } : {}),
      ...(typeof body['timezone'] === 'string' ? { timezone: body['timezone'] } : {}),
      ...(typeof body['isActive'] === 'boolean' ? { isActive: body['isActive'] } : {}),
      ...(body['payload'] !== undefined ? { payload: body['payload'] } : {}),
    });

    return c.json({ updated: result.count > 0 });
  });

  app.delete('/v1/jobs/schedules/:id', requireAuth, async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    const id = c.req.param('id');
    if (!id) return c.json({ error: 'id is required' }, 400);

    const result = await JobService.deleteSchedule(id, tenantId);
    return c.json({ deleted: result.count > 0 });
  });
}
`;
}

function apiAuditLogRouteTs(): string {
  return `import type { Hono } from 'hono';
import { prisma } from '@hubforge/db';

export function registerAuditLogRoutes(app: Hono): void {
  app.get('/v1/audit-log', async (c) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'x-tenant-id required' }, 400);
    const page = Number(c.req.query('page') ?? '1');
    const limit = Math.min(100, Number(c.req.query('limit') ?? '30'));
    const start = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        skip: start,
        take: limit,
      }),
      prisma.auditLog.count({ where: { tenantId } }),
    ]);
    return c.json({ items, total, page, limit });
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
      '@hubforge/appstack': 'workspace:*',
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
  return `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@import "tailwindcss";

:root {
  --hf-font: "Plus Jakarta Sans", Inter, ui-sans-serif, system-ui, sans-serif;
  --hf-primary: #2563eb;
  --hf-primary-hover: #1d4ed8;
  --hf-primary-soft: rgba(37, 99, 235, 0.12);
  --hf-surface: rgba(255, 255, 255, 0.92);
  --hf-surface-alt: #f4f7fb;
  --hf-surface-muted: #eef3f8;
  --hf-foreground: #172033;
  --hf-muted: #617089;
  --hf-border: rgba(148, 163, 184, 0.22);
  --hf-border-strong: rgba(100, 116, 139, 0.32);
  --hf-sidebar: linear-gradient(180deg, #0f172a 0%, #111c34 100%);
  --hf-sidebar-text: #afbdd4;
  --hf-sidebar-active: rgba(255, 255, 255, 0.08);
  --hf-sidebar-active-text: #f8fbff;
  --hf-header: rgba(255, 255, 255, 0.82);
  --hf-card-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  --hf-card-shadow-soft: 0 8px 24px rgba(15, 23, 42, 0.05);
}

* {
  box-sizing: border-box;
}

html,
body {
  min-height: 100%;
}

body {
  margin: 0;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.12), transparent 28%),
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.08), transparent 26%),
    var(--hf-surface-alt);
  color: var(--hf-foreground);
  font-family: var(--hf-font);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

a {
  color: var(--hf-primary);
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  transition: transform 140ms ease, box-shadow 140ms ease, background-color 140ms ease, border-color 140ms ease, color 140ms ease;
}

button:not(:disabled):hover {
  transform: translateY(-1px);
}

button:disabled {
  opacity: 0.62;
  cursor: not-allowed;
}

input,
select,
textarea {
  background: rgba(255, 255, 255, 0.96);
  color: var(--hf-foreground);
  border: 1px solid var(--hf-border);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02);
  transition: border-color 140ms ease, box-shadow 140ms ease, background-color 140ms ease;
}

input::placeholder,
textarea::placeholder {
  color: color-mix(in srgb, var(--hf-muted) 82%, white 18%);
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: color-mix(in srgb, var(--hf-primary) 36%, white 64%);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--hf-primary) 12%, transparent 88%);
}

select {
  appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, var(--hf-muted) 50%),
    linear-gradient(135deg, var(--hf-muted) 50%, transparent 50%);
  background-position:
    calc(100% - 18px) calc(50% - 2px),
    calc(100% - 12px) calc(50% - 2px);
  background-size: 6px 6px, 6px 6px;
  background-repeat: no-repeat;
  padding-right: 2.25rem;
}

h1,
h2,
h3,
h4 {
  letter-spacing: -0.025em;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

thead {
  background: color-mix(in srgb, var(--hf-surface-muted) 78%, white 22%);
}

tbody tr {
  transition: background-color 140ms ease;
}

tbody tr:hover {
  background: color-mix(in srgb, var(--hf-primary-soft) 44%, white 56%);
}

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.35);
  border-radius: 999px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

::-webkit-scrollbar-track {
  background: transparent;
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

export type PortalMenuItem = {
  id: string;
  label: string;
  route: string;
  icon?: string;
  permissions?: string[];
  moduleId?: string;
  children?: PortalMenuItem[];
};

export type PortalMenuSection = {
  id: string;
  label: string;
  children: PortalMenuItem[];
};

export const coreCapabilities: AppCapability[] = [
  { id: 'api-routing', description: 'API routing and middleware baseline' },
  { id: 'tenant-awareness', description: 'Tenant context resolution baseline' },
  { id: 'observability', description: 'Request logging, tracing headers, and health checks' },
];

export function getPortalMenuSections(authServerEnabled = false): PortalMenuSection[] {
  return [
    {
      id: 'operations',
      label: 'Operations',
      children: [
        { id: 'dashboard', label: 'Dashboard', route: '/dashboard' },
        { id: 'users', label: 'Users', route: '/users', permissions: ['users:read'] },
        { id: 'roles', label: 'Roles', route: '/roles', permissions: ['roles:read'] },
        { id: 'permissions', label: 'Permissions', route: '/permissions', permissions: ['roles:manage'] },
        { id: 'assistant', label: 'AI Assistant', route: '/assistant', permissions: ['ai-assistant:read'] },
        { id: 'jobs', label: 'Background Jobs', route: '/jobs', permissions: ['jobs:read'] },
        { id: 'notifications', label: 'Notifications', route: '/notifications', permissions: ['notifications:read'] },
      ],
    },
    {
      id: 'platform',
      label: 'Platform',
      children: [
        { id: 'audit-log', label: 'Audit Log', route: '/audit-log' },
        { id: 'modules', label: 'Modules', route: '/settings/modules', moduleId: 'modules' },
        { id: 'settings', label: 'Settings', route: '/settings' },
        { id: 'email-account', label: 'Email Account', route: '/settings/email-account' },
        { id: 'theme', label: 'Theme', route: '/settings/theme' },
        ...(authServerEnabled ? [{ id: 'auth-server', label: 'Auth Server', route: '/settings/auth-server' }] : []),
        { id: 'docs', label: 'API Docs', route: '/docs' },
      ],
    },
  ];
}
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

function jobsPackageJson(): string {
  const pkg = {
    name: '@hubforge/jobs',
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'tsx watch src/worker.ts',
      build: 'tsc -p tsconfig.json',
      typecheck: 'tsc --noEmit -p tsconfig.json',
      start: 'node dist/worker.js',
    },
    dependencies: {
      '@hubforge/db': 'workspace:*',
    },
    devDependencies: {
      '@types/node': '^20.0.0',
      tsx: '^4.9.0',
      typescript: '^5.4.0',
    },
  };

  return `${JSON.stringify(pkg, null, 2)}\n`;
}

function jobsWorkerTs(): string {
  return `import { JobService } from '@hubforge/db';

function parsePayload(input: string | null): unknown {
  if (!input) return null;
  try {
    return JSON.parse(input);
  } catch {
    return input;
  }
}

function parseCronMinutes(cron: string): number {
  // Local-dev parser supports patterns like "*/5 * * * *" and "0 * * * *".
  const parts = cron.trim().split(/\s+/);
  if (parts.length < 1) return 5;
  const minute = parts[0] ?? '*/5';

  if (minute.startsWith('*/')) {
    const step = Number(minute.slice(2));
    return Number.isFinite(step) && step > 0 ? step : 5;
  }

  const atMinute = Number(minute);
  if (Number.isFinite(atMinute) && atMinute >= 0 && atMinute <= 59) {
    const now = new Date();
    const next = new Date(now);
    next.setSeconds(0, 0);
    next.setMinutes(atMinute);
    if (next <= now) next.setHours(next.getHours() + 1);
    return Math.max(1, Math.round((next.getTime() - now.getTime()) / 60000));
  }

  return 5;
}

function computeNextRunAt(cron: string): Date {
  const minutes = parseCronMinutes(cron);
  return new Date(Date.now() + minutes * 60000);
}

async function executeJob(job: {
  id: string;
  jobType: string;
  tenantId: string | null;
  payload: string | null;
}) {
  const payload = parsePayload(job.payload);
  return { ok: true, message: \`Job \${job.jobType} processed\`, tenantId: job.tenantId, payload };
}

async function processOneQueuedJob() {
  const claimed = await JobService.claimNextJob();
  if (!claimed) return false;

  try {
    const result = await executeJob({
      id: claimed.id,
      jobType: claimed.jobType,
      tenantId: claimed.tenantId,
      payload: claimed.payload,
    });
    await JobService.markCompleted(claimed.id, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown worker error';
    await JobService.markFailed(claimed.id, message);
  }

  return true;
}

async function enqueueDueSchedules() {
  const due = await JobService.listDueSchedules(new Date());
  for (const schedule of due) {
    await JobService.enqueue({
      tenantId: schedule.tenantId,
      scheduleId: schedule.id,
      jobType: schedule.jobType,
      payload: schedule.payload ? parsePayload(schedule.payload) : null,
      priority: 1,
      scheduledFor: new Date(),
    });

    await JobService.touchScheduleRun(schedule.id, computeNextRunAt(schedule.cron));
  }

  return due.length;
}

async function workerLoop() {
  const scheduled = await enqueueDueSchedules();
  let processed = 0;
  while (await processOneQueuedJob()) {
    processed += 1;
  }

  if (scheduled > 0 || processed > 0) {
    console.log(\`[jobs] scheduled=\${scheduled} processed=\${processed}\`);
  }
}

async function startWorker() {
  console.log('[jobs] worker started');
  await workerLoop();
  setInterval(() => {
    void workerLoop();
  }, 5000);
}

void startWorker();
`;
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
export { SettingsService, type SettingValue } from './settings.js';
export { NotificationService } from './notifications.js';
export { PermissionRegistry } from './permissions.js';
export { BillingService, type BillingSubscriptionStatus } from './billing.js';
export { JobService } from './jobs.js';
`;
}

function dbSettingsTs(): string {
  return `import { prisma } from './index.js';

export type SettingValue = string | number | boolean | object | null;
export type SettingScope = 'tenant' | 'environment' | 'system';

function resolveScope(tenantId: string | undefined | null, scope?: SettingScope): SettingScope {
  if (scope) return scope;
  return tenantId ? 'tenant' : 'system';
}

function parseSettingValue(setting: { value: string; dataType: string }, fallback: SettingValue = null): SettingValue {
  if (setting.dataType === 'json') {
    try {
      return JSON.parse(setting.value);
    } catch {
      return fallback;
    }
  }
  if (setting.dataType === 'number') {
    return Number(setting.value);
  }
  if (setting.dataType === 'boolean') {
    return setting.value === 'true';
  }
  return setting.value;
}

export class SettingsService {
  static async get(
    tenantId: string | undefined | null,
    module: string,
    key: string,
    defaultValue: SettingValue = null,
    options?: { environmentId?: string | null; scope?: SettingScope },
  ): Promise<SettingValue> {
    const scope = resolveScope(tenantId, options?.scope);
    const environmentId = options?.environmentId ?? null;
    const setting = await (prisma.setting.findFirst as any)({
      where: {
        tenantId: tenantId ?? null,
        environmentId,
        scope,
        module,
        key,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!setting) return defaultValue;
    return parseSettingValue(setting, defaultValue);
  }

  static async set(
    tenantId: string | undefined | null,
    module: string,
    key: string,
    value: SettingValue,
    options?: { environmentId?: string | null; scope?: SettingScope },
  ): Promise<void> {
    const scope = resolveScope(tenantId, options?.scope);
    const environmentId = options?.environmentId ?? null;
    const dataType =
      typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : typeof value === 'object' ? 'json' : 'string';
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    const existing = await (prisma.setting.findFirst as any)({
      where: {
        tenantId: tenantId ?? null,
        environmentId,
        scope,
        module,
        key,
      },
      select: { id: true },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      await (prisma.setting.update as any)({
        where: { id: existing.id },
        data: { value: stringValue, dataType, updatedAt: new Date() },
      });
      return;
    }

    await (prisma.setting.create as any)({
      data: {
        tenantId: tenantId ?? null,
        environmentId,
        scope,
        module,
        key,
        value: stringValue,
        dataType,
      },
    });
  }

  static async delete(
    tenantId: string | undefined | null,
    module: string,
    key: string,
    options?: { environmentId?: string | null; scope?: SettingScope },
  ): Promise<void> {
    const scope = resolveScope(tenantId, options?.scope);
    const environmentId = options?.environmentId ?? null;
    await (prisma.setting.deleteMany as any)({
      where: {
        tenantId: tenantId ?? null,
        environmentId,
        scope,
        module,
        key,
      },
    });
  }

  static async list(
    tenantId: string | undefined | null,
    module: string,
    options?: { environmentId?: string | null; scope?: SettingScope },
  ) {
    const scope = resolveScope(tenantId, options?.scope);
    const environmentId = options?.environmentId ?? null;
    return (prisma.setting.findMany as any)({
      where: {
        tenantId: tenantId ?? null,
        environmentId,
        scope,
        module,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getAll(
    tenantId: string | undefined | null,
    module: string,
    options?: { environmentId?: string | null; scope?: SettingScope },
  ): Promise<Record<string, SettingValue>> {
    const settings = await this.list(tenantId, module, options);
    const result: Record<string, SettingValue> = {};
    for (const item of settings) {
      result[item.key] = parseSettingValue(item, null);
    }
    return result;
  }

  static async listModules(
    tenantId: string | undefined | null,
    options?: { environmentId?: string | null; scope?: SettingScope },
  ): Promise<string[]> {
    const scope = resolveScope(tenantId, options?.scope);
    const environmentId = options?.environmentId ?? null;
    const rows = await (prisma.setting.findMany as any)({
      where: {
        tenantId: tenantId ?? null,
        environmentId,
        scope,
      },
      select: { module: true },
      distinct: ['module'],
      orderBy: { module: 'asc' },
    });

    return rows.map((row: { module: string }) => row.module);
  }
}
`;
}

function dbPermissionsTs(): string {
  return `import { prisma } from './index.js';

type Definition = { module: string; action: string; description?: string };

const defaults: Definition[] = [
  { module: 'users', action: 'read', description: 'View users' },
  { module: 'users', action: 'manage', description: 'Create/update users and assignments' },
  { module: 'roles', action: 'read', description: 'View roles' },
  { module: 'roles', action: 'manage', description: 'Create/update roles and permissions' },
  { module: 'settings', action: 'read', description: 'View tenant settings' },
  { module: 'settings', action: 'update', description: 'Update tenant settings' },
  { module: 'notifications', action: 'read', description: 'View notification templates and delivery history' },
  { module: 'notifications', action: 'manage', description: 'Manage notification templates and send notifications' },
  { module: 'ai-assistant', action: 'read', description: 'View AI assistant access and metadata' },
  { module: 'ai-assistant', action: 'invoke', description: 'Invoke AI assistant chat endpoint' },
  { module: 'billing', action: 'read', description: 'View billing subscriptions and events' },
  { module: 'billing', action: 'manage', description: 'Manage billing lifecycle and mock events' },
  { module: 'jobs', action: 'read', description: 'View background jobs' },
  { module: 'jobs', action: 'trigger', description: 'Trigger background jobs' },
];

export class PermissionRegistry {
  static async syncToDatabase(): Promise<void> {
    for (const perm of defaults) {
      await (prisma.permission.upsert as any)({
        where: { module_action: { module: perm.module, action: perm.action } },
        update: perm.description ? { description: perm.description } : {},
        create: perm,
      });
    }
  }
}
`;
}

function dbNotificationsTs(): string {
  return `import { prisma } from './index.js';

export type NotificationTemplateInput = {
  tenantId: string;
  key: string;
  channel: 'email' | 'push';
  provider?: string | null;
  subject?: string | null;
  body: string;
  isActive?: boolean;
  variablesSchema?: Record<string, unknown> | null;
};

export type NotificationDeliveryInput = {
  tenantId: string;
  templateId?: string | null;
  channel: 'email' | 'push';
  provider?: string | null;
  recipient: string;
  subject?: string | null;
  body: string;
  payload?: unknown;
};

export class NotificationService {
  static async listTemplates(tenantId: string) {
    return prisma.notificationTemplate.findMany({
      where: { tenantId },
      orderBy: [{ updatedAt: 'desc' }],
    });
  }

  static async getTemplateByKey(key: string, tenantId: string) {
    return prisma.notificationTemplate.findFirst({
      where: { tenantId, key },
    });
  }

  static async upsertTemplate(input: NotificationTemplateInput) {
    return prisma.notificationTemplate.upsert({
      where: { tenantId_key: { tenantId: input.tenantId, key: input.key } },
      update: {
        channel: input.channel,
        provider: input.provider ?? null,
        subject: input.subject ?? null,
        body: input.body,
        isActive: input.isActive ?? true,
        variablesSchema: input.variablesSchema == null ? null : JSON.stringify(input.variablesSchema),
      },
      create: {
        tenantId: input.tenantId,
        key: input.key,
        channel: input.channel,
        provider: input.provider ?? null,
        subject: input.subject ?? null,
        body: input.body,
        isActive: input.isActive ?? true,
        variablesSchema: input.variablesSchema == null ? null : JSON.stringify(input.variablesSchema),
      },
    });
  }

  static async deleteTemplate(id: string, tenantId: string) {
    return prisma.notificationTemplate.deleteMany({
      where: { id, tenantId },
    });
  }

  static async listDeliveries(tenantId: string, limit = 50) {
    return prisma.notificationDelivery.findMany({
      where: { tenantId },
      orderBy: [{ createdAt: 'desc' }],
      take: limit,
      include: { template: true },
    });
  }

  static async createDelivery(input: NotificationDeliveryInput) {
    return prisma.notificationDelivery.create({
      data: {
        tenantId: input.tenantId,
        templateId: input.templateId ?? null,
        channel: input.channel,
        provider: input.provider ?? null,
        recipient: input.recipient,
        subject: input.subject ?? null,
        body: input.body,
        payload: input.payload == null ? null : JSON.stringify(input.payload),
        status: 'queued',
      },
    });
  }

  static async markDeliverySent(id: string, result: { provider: string; externalMessageId: string }) {
    return prisma.notificationDelivery.update({
      where: { id },
      data: {
        provider: result.provider,
        externalMessageId: result.externalMessageId,
        status: 'sent',
        error: null,
        sentAt: new Date(),
      },
      include: { template: true },
    });
  }

  static async markDeliveryFailed(id: string, errorMessage: string) {
    return prisma.notificationDelivery.update({
      where: { id },
      data: {
        status: 'failed',
        error: errorMessage,
      },
      include: { template: true },
    });
  }
}
`;
}

function dbBillingTs(): string {
  return `import { prisma } from './index.js';

export type BillingSubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused';

export type BillingLifecycleInput = {
  tenantId: string;
  provider: 'stripe' | 'mock';
  externalCustomerId: string;
  customerEmail?: string | null;
  customerName?: string | null;
  externalSubscriptionId: string;
  planCode: string;
  status: BillingSubscriptionStatus;
  currency: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  metadata?: Record<string, unknown> | null;
};

export type BillingEventInput = {
  tenantId: string;
  provider: 'stripe' | 'mock';
  eventType: string;
  externalEventId?: string | null;
  payload: unknown;
  status: 'received' | 'processed' | 'failed';
  error?: string | null;
};

export class BillingService {
  static async listSubscriptions(tenantId: string) {
    return prisma.billingSubscription.findMany({
      where: { tenantId },
      include: { customer: true },
      orderBy: [{ updatedAt: 'desc' }],
    });
  }

  static async upsertSubscriptionLifecycle(input: BillingLifecycleInput) {
    const customer = await prisma.billingCustomer.upsert({
      where: {
        tenantId_provider_externalCustomerId: {
          tenantId: input.tenantId,
          provider: input.provider,
          externalCustomerId: input.externalCustomerId,
        },
      },
      update: {
        email: input.customerEmail ?? null,
        name: input.customerName ?? null,
      },
      create: {
        tenantId: input.tenantId,
        provider: input.provider,
        externalCustomerId: input.externalCustomerId,
        email: input.customerEmail ?? null,
        name: input.customerName ?? null,
      },
    });

    const cancelledAt = input.status === 'canceled' ? new Date() : null;
    const metadata = input.metadata == null ? null : JSON.stringify(input.metadata);

    return prisma.billingSubscription.upsert({
      where: {
        tenantId_provider_externalSubscriptionId: {
          tenantId: input.tenantId,
          provider: input.provider,
          externalSubscriptionId: input.externalSubscriptionId,
        },
      },
      update: {
        customerId: customer.id,
        planCode: input.planCode,
        status: input.status,
        currency: input.currency,
        cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
        currentPeriodStart: input.currentPeriodStart ?? null,
        currentPeriodEnd: input.currentPeriodEnd ?? null,
        metadata,
        cancelledAt,
      },
      create: {
        tenantId: input.tenantId,
        customerId: customer.id,
        provider: input.provider,
        externalSubscriptionId: input.externalSubscriptionId,
        planCode: input.planCode,
        status: input.status,
        currency: input.currency,
        cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
        currentPeriodStart: input.currentPeriodStart ?? null,
        currentPeriodEnd: input.currentPeriodEnd ?? null,
        metadata,
        cancelledAt,
      },
      include: {
        customer: true,
      },
    });
  }

  static async recordEvent(input: BillingEventInput) {
    return prisma.billingEvent.create({
      data: {
        tenantId: input.tenantId,
        provider: input.provider,
        eventType: input.eventType,
        externalEventId: input.externalEventId ?? null,
        payload: JSON.stringify(input.payload),
        status: input.status,
        error: input.error ?? null,
      },
    });
  }
}
`;
}

function dbJobsTs(): string {
  return `import { prisma } from './index.js';

export type JobInput = {
  tenantId: string | null;
  scheduleId?: string | null;
  jobType: string;
  payload?: unknown;
  priority?: number;
  scheduledFor?: Date | null;
  maxAttempts?: number;
  createdBy?: string | null;
};

export type JobScheduleInput = {
  tenantId: string;
  name: string;
  jobType: string;
  cron: string;
  timezone?: string;
  payload?: unknown;
  isActive?: boolean;
  nextRunAt?: Date | null;
};

export class JobService {
  static async enqueue(input: JobInput) {
    return prisma.backgroundJob.create({
      data: {
        tenantId: input.tenantId,
        scheduleId: input.scheduleId ?? null,
        jobType: input.jobType,
        status: 'queued',
        priority: input.priority ?? 0,
        maxAttempts: input.maxAttempts ?? 3,
        scheduledFor: input.scheduledFor ?? null,
        payload: input.payload == null ? null : JSON.stringify(input.payload),
        createdBy: input.createdBy ?? null,
      },
    });
  }

  static async list(tenantId: string | null) {
    return prisma.backgroundJob.findMany({
      where: tenantId ? { tenantId } : {},
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        schedule: true,
      },
    });
  }

  static async getById(jobId: string, tenantId: string | null) {
    return prisma.backgroundJob.findFirst({
      where: {
        id: jobId,
        ...(tenantId ? { tenantId } : {}),
      },
      include: {
        schedule: true,
      },
    });
  }

  static async retry(jobId: string) {
    return prisma.backgroundJob.update({
      where: { id: jobId },
      data: {
        status: 'queued',
        error: null,
        nextRetry: null,
        completedAt: null,
      },
    });
  }

  static async cancel(jobId: string, tenantId: string | null) {
    return prisma.backgroundJob.updateMany({
      where: {
        id: jobId,
        ...(tenantId ? { tenantId } : {}),
      },
      data: {
        status: 'cancelled',
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  static async markRunning(jobId: string) {
    return prisma.backgroundJob.update({
      where: { id: jobId },
      data: {
        status: 'running',
      },
    });
  }

  static async markCompleted(jobId: string, result?: unknown) {
    return prisma.backgroundJob.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        result: result == null ? null : JSON.stringify(result),
        error: null,
        completedAt: new Date(),
      },
    });
  }

  static async markFailed(jobId: string, errorMessage: string) {
    const job = await prisma.backgroundJob.findUnique({ where: { id: jobId } });
    if (!job) return null;

    const attempts = job.attempts + 1;
    const hasRetries = attempts < job.maxAttempts;
    return prisma.backgroundJob.update({
      where: { id: jobId },
      data: {
        attempts,
        status: hasRetries ? 'queued' : 'failed',
        error: errorMessage,
        nextRetry: hasRetries ? new Date(Date.now() + Math.pow(2, attempts) * 60000) : null,
      },
    });
  }

  static async claimNextJob() {
    const now = new Date();
    const job = await prisma.backgroundJob.findFirst({
      where: {
        status: 'queued',
        OR: [{ scheduledFor: null }, { scheduledFor: { lte: now } }],
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });

    if (!job) return null;

    const claimed = await prisma.backgroundJob.updateMany({
      where: { id: job.id, status: 'queued' },
      data: { status: 'running' },
    });

    if (claimed.count === 0) return null;
    return prisma.backgroundJob.findUnique({ where: { id: job.id } });
  }

  static async listSchedules(tenantId: string) {
    return prisma.jobSchedule.findMany({
      where: { tenantId },
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });
  }

  static async createSchedule(input: JobScheduleInput) {
    return prisma.jobSchedule.create({
      data: {
        tenantId: input.tenantId,
        name: input.name,
        jobType: input.jobType,
        cron: input.cron,
        timezone: input.timezone ?? 'UTC',
        payload: input.payload == null ? null : JSON.stringify(input.payload),
        isActive: input.isActive ?? true,
        nextRunAt: input.nextRunAt ?? null,
      },
    });
  }

  static async updateSchedule(
    id: string,
    tenantId: string,
    patch: Partial<{ name: string; cron: string; timezone: string; payload: unknown; isActive: boolean; nextRunAt: Date | null }>,
  ) {
    return prisma.jobSchedule.updateMany({
      where: { id, tenantId },
      data: {
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.cron !== undefined ? { cron: patch.cron } : {}),
        ...(patch.timezone !== undefined ? { timezone: patch.timezone } : {}),
        ...(patch.isActive !== undefined ? { isActive: patch.isActive } : {}),
        ...(patch.nextRunAt !== undefined ? { nextRunAt: patch.nextRunAt } : {}),
        ...(patch.payload !== undefined ? { payload: patch.payload == null ? null : JSON.stringify(patch.payload) } : {}),
      },
    });
  }

  static async deleteSchedule(id: string, tenantId: string) {
    return prisma.jobSchedule.deleteMany({
      where: { id, tenantId },
    });
  }

  static async listDueSchedules(now: Date) {
    return prisma.jobSchedule.findMany({
      where: {
        isActive: true,
        nextRunAt: { lte: now },
      },
      orderBy: { nextRunAt: 'asc' },
    });
  }

  static async touchScheduleRun(id: string, nextRunAt: Date) {
    return prisma.jobSchedule.update({
      where: { id },
      data: {
        lastRunAt: new Date(),
        nextRunAt,
      },
    });
  }
}
`;
}

function dbSeedScript(): string {
  return `#!/usr/bin/env node
import prismaPkg from '@prisma/client';
import { createHash } from 'node:crypto';
import { runModuleSeeders } from './seed-registry.mjs';

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

  const permissions = [
    ['users', 'read', 'View users'],
    ['users', 'manage', 'Create/update users and assignments'],
    ['roles', 'read', 'View roles'],
    ['roles', 'manage', 'Create/update roles and permissions'],
    ['settings', 'read', 'View tenant settings'],
    ['settings', 'update', 'Update tenant settings'],
    ['ai-assistant', 'read', 'View AI assistant access and metadata'],
    ['ai-assistant', 'invoke', 'Invoke AI assistant chat endpoint'],
    ['jobs', 'read', 'View background jobs'],
    ['jobs', 'trigger', 'Trigger background jobs'],
  ];

  for (const [module, action, description] of permissions) {
    await prisma.permission.upsert({
      where: { module_action: { module, action } },
      update: { description },
      create: { module, action, description },
    });
  }

  const adminRole = await prisma.role.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: 'Admin' } },
    update: { description: 'Tenant administrator role' },
    create: { tenantId: tenant.id, name: 'Admin', description: 'Tenant administrator role' },
  });

  const allPerms = await prisma.permission.findMany();
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: adminRole.id } },
    update: {},
    create: { userId: user.id, roleId: adminRole.id },
  });

  const existingNotificationSetting = await (prisma.setting.findFirst as any)({
    where: {
      tenantId: tenant.id,
      environmentId: null,
      scope: 'tenant',
      module: 'notifications',
      key: 'emailEnabled',
    },
    select: { id: true },
  });

  if (existingNotificationSetting) {
    await (prisma.setting.update as any)({
      where: { id: existingNotificationSetting.id },
      data: { value: 'true', dataType: 'boolean' },
    });
  } else {
    await (prisma.setting.create as any)({
      data: {
        tenantId: tenant.id,
        environmentId: null,
        scope: 'tenant',
        module: 'notifications',
        key: 'emailEnabled',
        value: 'true',
        dataType: 'boolean',
      },
    });
  }

  await runModuleSeeders({
    prisma,
    tenantIds: [tenant.id],
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

function dbSeedRegistryScript(): string {
  return `const moduleSeeders = [
];

export async function runModuleSeeders(context) {
  for (const seed of moduleSeeders) {
    await seed(context);
  }
}
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
  memberships  Membership[]
  settings     Setting[]
  roles        Role[]
  auditLogs    AuditLog[]
  notificationTemplates  NotificationTemplate[]
  notificationDeliveries NotificationDelivery[]
  billingCustomers     BillingCustomer[]
  billingSubscriptions BillingSubscription[]
  billingEvents        BillingEvent[]
  jobSchedules JobSchedule[]
  backgroundJobs BackgroundJob[]${authServerSettingsRelation}
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
  userRoles   UserRole[]
  createdJobs BackgroundJob[] @relation("BackgroundJobCreatedBy")
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

model AuditLog {
  id         String   @id @default(cuid())
  tenantId   String
  action     String
  entityType String
  entityId   String?
  traceId    String?
  createdAt  DateTime @default(now())

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
}

model Setting {
  id            String   @id @default(cuid())
  tenantId      String?
  environmentId String?
  scope         String   @default("tenant")
  module        String
  key           String
  value         String
  dataType      String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  tenant      Tenant?      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  environment Environment? @relation(fields: [environmentId], references: [id], onDelete: SetNull)

  @@unique([tenantId, environmentId, scope, module, key])
  @@index([tenantId, scope, module])
}

model Permission {
  id          String   @id @default(cuid())
  module      String
  action      String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  roles RolePermission[]

  @@unique([module, action])
}

model Role {
  id          String   @id @default(cuid())
  tenantId    String
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tenant      Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  users       UserRole[]
  permissions RolePermission[]

  @@unique([tenantId, name])
}

model UserRole {
  id        String   @id @default(cuid())
  userId    String
  roleId    String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  role Role @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@unique([userId, roleId])
}

model RolePermission {
  id           String   @id @default(cuid())
  roleId       String
  permissionId String
  createdAt    DateTime @default(now())

  role       Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@unique([roleId, permissionId])
}

model BillingCustomer {
  id                 String   @id @default(cuid())
  tenantId           String
  provider           String   @default("stripe")
  externalCustomerId String
  email              String?
  name               String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  tenant         Tenant                @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  subscriptions  BillingSubscription[]

  @@unique([tenantId, provider, externalCustomerId])
  @@index([tenantId, provider])
}

model BillingSubscription {
  id                     String   @id @default(cuid())
  tenantId               String
  customerId             String
  provider               String   @default("stripe")
  externalSubscriptionId String
  planCode               String
  status                 String
  currency               String   @default("USD")
  cancelAtPeriodEnd      Boolean  @default(false)
  currentPeriodStart     DateTime?
  currentPeriodEnd       DateTime?
  cancelledAt            DateTime?
  metadata               String?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  tenant    Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  customer  BillingCustomer @relation(fields: [customerId], references: [id], onDelete: Cascade)

  @@unique([tenantId, provider, externalSubscriptionId])
  @@index([tenantId, status])
}

model BillingEvent {
  id              String   @id @default(cuid())
  tenantId        String
  provider        String   @default("stripe")
  eventType       String
  externalEventId String?
  payload         String
  status          String
  error           String?
  receivedAt      DateTime @default(now())
  processedAt     DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId, receivedAt])
  @@index([externalEventId])
}

model NotificationTemplate {
  id              String   @id @default(cuid())
  tenantId        String
  key             String
  channel         String
  provider        String?
  subject         String?
  body            String
  variablesSchema String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  tenant      Tenant                 @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  deliveries  NotificationDelivery[]

  @@unique([tenantId, key])
  @@index([tenantId, channel, isActive])
}

model NotificationDelivery {
  id                String   @id @default(cuid())
  tenantId          String
  templateId        String?
  channel           String
  provider          String?
  recipient         String
  subject           String?
  body              String
  payload           String?
  status            String
  externalMessageId String?
  error             String?
  sentAt            DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  tenant    Tenant                @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  template  NotificationTemplate? @relation(fields: [templateId], references: [id], onDelete: SetNull)

  @@index([tenantId, createdAt])
  @@index([tenantId, status])
}

model BackgroundJob {
  id           String   @id @default(cuid())
  tenantId     String?
  scheduleId   String?
  jobType      String
  status       String
  priority     Int      @default(0)
  payload      String?
  result       String?
  error        String?
  attempts     Int      @default(0)
  maxAttempts  Int      @default(3)
  nextRetry    DateTime?
  scheduledFor DateTime?
  completedAt  DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  createdBy    String?

  tenant         Tenant?      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  schedule       JobSchedule? @relation(fields: [scheduleId], references: [id], onDelete: SetNull)
  createdByUser  User?        @relation("BackgroundJobCreatedBy", fields: [createdBy], references: [id], onDelete: SetNull)

  @@index([tenantId, status, scheduledFor])
  @@index([scheduleId])
}

model JobSchedule {
  id          String   @id @default(cuid())
  tenantId    String
  name        String
  jobType     String
  cron        String
  timezone    String   @default("UTC")
  payload     String?
  isActive    Boolean  @default(true)
  lastRunAt   DateTime?
  nextRunAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tenant      Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  jobs        BackgroundJob[]

  @@unique([tenantId, name])
  @@index([tenantId, isActive, nextRunAt])
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
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  trace_id TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS setting (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  module TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  data_type TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, module, key)
);

CREATE TABLE IF NOT EXISTS permission (
  id TEXT PRIMARY KEY,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (module, action)
);

CREATE TABLE IF NOT EXISTS role_definition (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, name)
);

CREATE TABLE IF NOT EXISTS user_role (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS role_permission (
  id TEXT PRIMARY KEY,
  role_id TEXT NOT NULL,
  permission_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS billing_customer (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'stripe',
  external_customer_id TEXT NOT NULL,
  email TEXT,
  name TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, provider, external_customer_id)
);

CREATE TABLE IF NOT EXISTS billing_subscription (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'stripe',
  external_subscription_id TEXT NOT NULL,
  plan_code TEXT NOT NULL,
  status TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
  current_period_start TEXT,
  current_period_end TEXT,
  cancelled_at TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, provider, external_subscription_id)
);

CREATE TABLE IF NOT EXISTS billing_event (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'stripe',
  event_type TEXT NOT NULL,
  external_event_id TEXT,
  payload TEXT NOT NULL,
  status TEXT NOT NULL,
  error TEXT,
  received_at TEXT NOT NULL,
  processed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notification_template (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  key TEXT NOT NULL,
  channel TEXT NOT NULL,
  provider TEXT,
  subject TEXT,
  body TEXT NOT NULL,
  variables_schema TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, key)
);

CREATE TABLE IF NOT EXISTS notification_delivery (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  template_id TEXT,
  channel TEXT NOT NULL,
  provider TEXT,
  recipient TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  payload TEXT,
  status TEXT NOT NULL,
  external_message_id TEXT,
  error TEXT,
  sent_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS background_job (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  schedule_id TEXT,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  payload TEXT,
  result TEXT,
  error TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  next_retry TEXT,
  scheduled_for TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by TEXT
);

CREATE TABLE IF NOT EXISTS job_schedule (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  job_type TEXT NOT NULL,
  cron TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  payload TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  last_run_at TEXT,
  next_run_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, name)
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
  const authServerEnabled = options.authServer ? 'true' : 'false';

  return `import { Outlet, NavLink, useNavigate } from 'react-router';
import { useEffect, useMemo, useState } from 'react';
import { getPortalMenuSections } from '@hubforge/appstack';
import { applyPortalTheme, applyStoredPortalTheme } from '../lib/theme';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';
const AUTH_SERVER_ENABLED = ${authServerEnabled};

type Membership = { tenantId: string; role: string; tenant?: { name?: string | null } | null };
type MeResponse = { user?: { name?: string | null; email?: string | null } | null; memberships?: Membership[] };
type NotificationDelivery = { id: string; status: string; subject?: string | null; createdAt?: string };

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function AppLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [accountOpen, setAccountOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [me, setMe] = useState<MeResponse>({});
  const [deliveries, setDeliveries] = useState<NotificationDelivery[]>([]);

  const sections = useMemo(() => getPortalMenuSections(AUTH_SERVER_ENABLED), []);

  useEffect(() => {
    applyStoredPortalTheme();
    const rawCollapse = localStorage.getItem('hf_nav_collapsed');
    if (rawCollapse) {
      try {
        setCollapsed(JSON.parse(rawCollapse) as Record<string, boolean>);
      } catch {
        setCollapsed({});
      }
    }

    const storedLang = (localStorage.getItem('hf_lang') as 'en' | 'es' | null) ?? 'en';
    setLanguage(storedLang);

    const preset = (localStorage.getItem('hf_theme_preset') ?? 'ynex-light') as string;
    setThemeMode(preset === 'slate' ? 'dark' : 'light');

    void loadUserMenuData();
  }, []);

  async function loadUserMenuData() {
    const token = localStorage.getItem('token') ?? '';
    const tenantId = localStorage.getItem('tenantId') ?? '';

    const meRes = await fetch(API + '/v1/auth/me', {
      headers: { authorization: 'Bearer ' + token, 'x-tenant-id': tenantId },
    });
    if (meRes.ok) {
      setMe((await meRes.json()) as MeResponse);
    }

    const notifRes = await fetch(API + '/v1/notifications/deliveries?limit=8', {
      headers: { authorization: 'Bearer ' + token, 'x-tenant-id': tenantId },
    });
    if (notifRes.ok) {
      setDeliveries((await notifRes.json()) as NotificationDelivery[]);
    }
  }

  function toggleSection(sectionId: string) {
    const next = { ...collapsed, [sectionId]: !collapsed[sectionId] };
    setCollapsed(next);
    localStorage.setItem('hf_nav_collapsed', JSON.stringify(next));
  }

  function changeLanguage(value: 'en' | 'es') {
    setLanguage(value);
    localStorage.setItem('hf_lang', value);
  }

  function toggleTheme() {
    const next = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(next);
    applyPortalTheme(next === 'light' ? 'ynex-light' : 'slate');
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('tenantId');
    window.location.href = '/login';
  }

  const unreadCount = deliveries.filter((d) => d.status !== 'sent').length;
  const displayName = me.user?.name?.trim() || me.user?.email?.trim() || 'User';
  const avatarLabel = initialsFromName(displayName);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--hf-surface-alt)', color: 'var(--hf-foreground)' }}>
      <aside style={{ width: 276, background: 'var(--hf-sidebar)', borderRight: '1px solid rgba(148, 163, 184, 0.2)', display: 'flex', flexDirection: 'column', color: '#d7e1f0' }}>
        <div style={{ minHeight: 72, display: 'flex', alignItems: 'center', padding: '0 1.25rem', borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 40%, #0ea5e9 100%)', marginRight: 10 }} />
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: '#eff6ff' }}>HubForge</p>
            <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#9fb0cb', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Portal Workspace</p>
          </div>
        </div>

        <nav style={{ padding: '0.9rem 0.6rem', flex: 1, overflowY: 'auto' }}>
          {sections.map((section) => {
            const isCollapsed = collapsed[section.id] === true;
            return (
              <div key={section.id} style={{ marginBottom: '0.95rem' }}>
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  style={{ width: '100%', textAlign: 'left', margin: '0 0 0.45rem', padding: '0.25rem 0.45rem', fontSize: '0.68rem', color: '#8fa2c0', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                >
                  <span>{section.label}</span>
                  <span>{isCollapsed ? '+' : '-'}</span>
                </button>

                {!isCollapsed && section.children.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.route}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      padding: '9px 11px',
                      borderRadius: 11,
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                      marginBottom: 4.5,
                      color: isActive ? 'var(--hf-sidebar-active-text)' : 'var(--hf-sidebar-text)',
                      background: isActive ? 'var(--hf-sidebar-active)' : 'transparent',
                      border: isActive ? '1px solid rgba(255, 255, 255, 0.24)' : '1px solid transparent',
                      fontWeight: isActive ? 600 : 500,
                    })}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}>
          <button onClick={logout} style={{ width: '100%', padding: '8px 10px', borderRadius: 10, background: 'rgba(15, 23, 42, 0.35)', border: '1px solid rgba(148, 163, 184, 0.24)', color: '#d6e0ee', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
            Logout
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ minHeight: 72, background: 'var(--hf-header)', borderBottom: '1px solid var(--hf-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.65rem', position: 'relative' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--hf-muted)', fontWeight: 700 }}>Workspace</p>
            <p style={{ margin: '2px 0 0', fontSize: '1.05rem', fontWeight: 700 }}>Control Center</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              style={{ position: 'relative', width: 34, height: 34, borderRadius: 10, border: '1px solid var(--hf-border)', background: 'var(--hf-surface)', cursor: 'pointer' }}
              aria-label="Notifications"
            >
              🔔
              {unreadCount > 0 ? (
                <span style={{ position: 'absolute', top: -6, right: -6, minWidth: 18, height: 18, borderRadius: 999, background: '#dc2626', color: '#fff', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                  {unreadCount}
                </span>
              ) : null}
            </button>

            {notifOpen ? (
              <div style={{ position: 'absolute', top: 42, right: 120, width: 340, maxHeight: 360, overflow: 'auto', border: '1px solid var(--hf-border)', borderRadius: 12, background: 'var(--hf-surface)', boxShadow: 'var(--hf-card-shadow)' }}>
                <div style={{ padding: '0.75rem 0.9rem', borderBottom: '1px solid var(--hf-border)', fontWeight: 700 }}>Recent Notifications</div>
                {deliveries.map((item) => (
                  <div key={item.id} style={{ padding: '0.65rem 0.9rem', borderBottom: '1px solid var(--hf-border)' }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{item.subject ?? 'Notification'}</p>
                    <p style={{ margin: '0.2rem 0 0', color: 'var(--hf-muted)', fontSize: '0.8rem' }}>{item.status}</p>
                  </div>
                ))}
                {deliveries.length === 0 ? <p style={{ margin: 0, padding: '0.85rem', color: 'var(--hf-muted)' }}>No notifications.</p> : null}
                <button type="button" onClick={() => setDeliveries([])} style={{ margin: '0.75rem', width: 'calc(100% - 1.5rem)', border: '1px solid var(--hf-border)', borderRadius: 8, background: 'transparent', padding: '0.45rem', cursor: 'pointer' }}>
                  Clear
                </button>
              </div>
            ) : null}

            <button type="button" onClick={() => setAccountOpen((v) => !v)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid var(--hf-border)', borderRadius: 999, background: 'var(--hf-surface)', padding: '0.25rem 0.55rem', cursor: 'pointer' }}>
              <span style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--hf-primary-soft)', color: 'var(--hf-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>{avatarLabel}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{displayName}</span>
            </button>

            {accountOpen ? (
              <div style={{ position: 'absolute', top: 42, right: 0, width: 260, border: '1px solid var(--hf-border)', borderRadius: 12, background: 'var(--hf-surface)', boxShadow: 'var(--hf-card-shadow)' }}>
                <button type="button" onClick={() => { setAccountOpen(false); navigate('/profile'); }} style={menuActionStyle}>Profile</button>
                <div style={{ padding: '0.45rem 0.75rem', borderTop: '1px solid var(--hf-border)' }}>
                  <p style={{ margin: '0 0 0.4rem', fontSize: '0.74rem', color: 'var(--hf-muted)', textTransform: 'uppercase' }}>Switch Tenant</p>
                  <div style={{ display: 'grid', gap: '0.3rem' }}>
                    {(me.memberships ?? []).map((m) => (
                      <button key={m.tenantId} type="button" onClick={() => { localStorage.setItem('tenantId', m.tenantId); window.location.reload(); }} style={menuActionStyle}>
                        {m.tenant?.name ?? m.tenantId}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '0.45rem 0.75rem', borderTop: '1px solid var(--hf-border)' }}>
                  <label style={{ fontSize: '0.74rem', color: 'var(--hf-muted)', display: 'block', marginBottom: 4 }}>Language</label>
                  <select value={language} onChange={(e) => changeLanguage(e.currentTarget.value as 'en' | 'es')} style={{ width: '100%', borderRadius: 8, padding: '0.35rem 0.5rem' }}>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>
                <button type="button" onClick={toggleTheme} style={menuActionStyle}>Theme: {themeMode === 'light' ? 'Light' : 'Dark'}</button>
                <button type="button" onClick={logout} style={{ ...menuActionStyle, color: '#b91c1c' }}>Logout</button>
              </div>
            ) : null}
          </div>
        </header>

        <main style={{ flex: 1, overflow: 'auto', padding: '1.65rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const menuActionStyle = {
  width: '100%',
  textAlign: 'left' as const,
  border: 'none',
  background: 'transparent',
  padding: '0.6rem 0.75rem',
  cursor: 'pointer',
  borderTop: '1px solid var(--hf-border)',
};
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
        <Link to="/users" style={{ textDecoration: 'none', border: '1px solid var(--hf-border)', borderRadius: 12, background: 'var(--hf-surface)', padding: '1rem' }}>
          <p style={{ fontWeight: 700, color: 'var(--hf-foreground)', margin: '0 0 0.25rem' }}>Users & Roles</p>
          <p style={{ margin: 0, color: 'var(--hf-muted)', fontSize: '0.85rem' }}>Manage users, roles, and permission assignments for this tenant.</p>
        </Link>
        <Link to="/profile" style={{ textDecoration: 'none', border: '1px solid var(--hf-border)', borderRadius: 12, background: 'var(--hf-surface)', padding: '1rem' }}>
          <p style={{ fontWeight: 700, color: 'var(--hf-foreground)', margin: '0 0 0.25rem' }}>Profile</p>
          <p style={{ margin: 0, color: 'var(--hf-muted)', fontSize: '0.85rem' }}>Edit your display profile and account-level preferences.</p>
        </Link>
        <Link to="/settings/modules" style={{ textDecoration: 'none', border: '1px solid var(--hf-border)', borderRadius: 12, background: 'var(--hf-surface)', padding: '1rem' }}>
          <p style={{ fontWeight: 700, color: 'var(--hf-foreground)', margin: '0 0 0.25rem' }}>Modules</p>
          <p style={{ margin: 0, color: 'var(--hf-muted)', fontSize: '0.85rem' }}>Enable or disable tenant modules from a single control page.</p>
        </Link>
        <Link to="/jobs" style={{ textDecoration: 'none', border: '1px solid var(--hf-border)', borderRadius: 12, background: 'var(--hf-surface)', padding: '1rem' }}>
          <p style={{ fontWeight: 700, color: 'var(--hf-foreground)', margin: '0 0 0.25rem' }}>Background Jobs</p>
          <p style={{ margin: 0, color: 'var(--hf-muted)', fontSize: '0.85rem' }}>Monitor queued work and trigger jobs directly from admin.</p>
        </Link>
        <Link to="/assistant" style={{ textDecoration: 'none', border: '1px solid var(--hf-border)', borderRadius: 12, background: 'var(--hf-surface)', padding: '1rem' }}>
          <p style={{ fontWeight: 700, color: 'var(--hf-foreground)', margin: '0 0 0.25rem' }}>AI Assistant</p>
          <p style={{ margin: 0, color: 'var(--hf-muted)', fontSize: '0.85rem' }}>Use the tenant assistant endpoint for guided operations and planning support.</p>
        </Link>
        <Link to="/notifications" style={{ textDecoration: 'none', border: '1px solid var(--hf-border)', borderRadius: 12, background: 'var(--hf-surface)', padding: '1rem' }}>
          <p style={{ fontWeight: 700, color: 'var(--hf-foreground)', margin: '0 0 0.25rem' }}>Notifications</p>
          <p style={{ margin: 0, color: 'var(--hf-muted)', fontSize: '0.85rem' }}>Manage templates and inspect delivery outcomes by tenant.</p>
        </Link>
        <Link to="/settings/theme" style={{ textDecoration: 'none', border: '1px solid var(--hf-border)', borderRadius: 12, background: 'var(--hf-surface)', padding: '1rem' }}>
          <p style={{ fontWeight: 700, color: 'var(--hf-foreground)', margin: '0 0 0.25rem' }}>Theme</p>
          <p style={{ margin: 0, color: 'var(--hf-muted)', fontSize: '0.85rem' }}>Switch built-in admin themes or load a third-party CSS theme URL.</p>
        </Link>
        <Link to="/settings/email-account" style={{ textDecoration: 'none', border: '1px solid var(--hf-border)', borderRadius: 12, background: 'var(--hf-surface)', padding: '1rem' }}>
          <p style={{ fontWeight: 700, color: 'var(--hf-foreground)', margin: '0 0 0.25rem' }}>Email Account</p>
          <p style={{ margin: 0, color: 'var(--hf-muted)', fontSize: '0.85rem' }}>Configure SMTP account settings for outbound email notifications.</p>
        </Link>
${authServerLink}
      </div>
    </div>
  );
}
`;
}

function portalProfileRoute(): string {
  return `import { useEffect, useState } from 'react';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';

type ProfileForm = {
  name: string;
  email: string;
  timezone: string;
  locale: string;
};

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileForm>({ name: '', email: '', timezone: 'UTC', locale: 'en' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const tenantId = localStorage.getItem('tenantId') ?? '';
    const token = localStorage.getItem('token') ?? '';

    fetch(API + '/v1/auth/me', {
      headers: { authorization: 'Bearer ' + token, 'x-tenant-id': tenantId },
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as { user?: { name?: string | null; email?: string | null } | null };
        setForm((current) => ({
          ...current,
          name: data.user?.name ?? '',
          email: data.user?.email ?? '',
          locale: (localStorage.getItem('hf_lang') ?? 'en') as string,
        }));
      })
      .catch(() => undefined);
  }, []);

  async function save() {
    setSaving(true);
    setMessage(null);
    localStorage.setItem('hf_lang', form.locale || 'en');
    setTimeout(() => {
      setMessage('Profile preferences saved locally.');
      setSaving(false);
    }, 300);
  }

  return (
    <section style={{ maxWidth: 720 }}>
      <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem' }}>Profile</h2>
      <p style={{ margin: '0 0 1rem', color: 'var(--hf-muted)' }}>Manage account preferences and language defaults.</p>
      <div style={{ border: '1px solid var(--hf-border)', borderRadius: 14, background: 'var(--hf-surface)', padding: '1rem', display: 'grid', gap: '0.75rem' }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--hf-muted)' }}>Display name</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.currentTarget.value })} style={{ borderRadius: 8, border: '1px solid var(--hf-border)', padding: '0.5rem 0.65rem' }} />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--hf-muted)' }}>Email</span>
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.currentTarget.value })} style={{ borderRadius: 8, border: '1px solid var(--hf-border)', padding: '0.5rem 0.65rem' }} />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--hf-muted)' }}>Timezone</span>
          <input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.currentTarget.value })} style={{ borderRadius: 8, border: '1px solid var(--hf-border)', padding: '0.5rem 0.65rem' }} />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--hf-muted)' }}>Language</span>
          <select value={form.locale} onChange={(e) => setForm({ ...form, locale: e.currentTarget.value })} style={{ borderRadius: 8, border: '1px solid var(--hf-border)', padding: '0.45rem 0.6rem' }}>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </label>
        <button type="button" disabled={saving} onClick={save} style={{ width: 160, borderRadius: 8, border: '1px solid var(--hf-primary)', background: 'var(--hf-primary)', color: '#fff', padding: '0.5rem 0.75rem', cursor: 'pointer', fontWeight: 600 }}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
        {message ? <p style={{ margin: 0, color: 'var(--hf-muted)', fontSize: '0.84rem' }}>{message}</p> : null}
      </div>
    </section>
  );
}
`;
}

function portalModulesRoute(): string {
  return `import { useEffect, useMemo, useState } from 'react';
import { getPortalMenuSections } from '@hubforge/appstack';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';

export default function ModulesSettingsPage() {
  const menu = useMemo(() => getPortalMenuSections(true), []);
  const moduleItems = useMemo(() => menu.flatMap((section) => section.children.filter((item) => item.moduleId || item.id === 'assistant' || item.id === 'notifications' || item.id === 'jobs')), [menu]);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    const tenantId = localStorage.getItem('tenantId') ?? '';
    const token = localStorage.getItem('token') ?? '';
    Promise.all(
      moduleItems.map(async (item) => {
        const key = 'modules.' + item.id + '.enabled';
        const res = await fetch(API + '/v1/settings/' + encodeURIComponent(key), {
          headers: { authorization: 'Bearer ' + token, 'x-tenant-id': tenantId },
        });
        if (!res.ok) return [item.id, true] as const;
        const data = (await res.json()) as { value?: boolean };
        return [item.id, data.value !== false] as const;
      }),
    ).then((entries) => setEnabled(Object.fromEntries(entries)));
  }, [moduleItems]);

  async function toggleModule(id: string, value: boolean) {
    setSavingKey(id);
    const tenantId = localStorage.getItem('tenantId') ?? '';
    const token = localStorage.getItem('token') ?? '';
    const key = 'modules.' + id + '.enabled';
    await fetch(API + '/v1/settings/' + encodeURIComponent(key), {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer ' + token,
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify({ value }),
    });
    setEnabled((current) => ({ ...current, [id]: value }));
    setSavingKey(null);
  }

  return (
    <section style={{ maxWidth: 820 }}>
      <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem' }}>Modules</h2>
      <p style={{ margin: '0 0 1rem', color: 'var(--hf-muted)' }}>Enable and disable tenant modules without editing code.</p>
      <div style={{ display: 'grid', gap: '0.7rem' }}>
        {moduleItems.map((item) => {
          const isEnabled = enabled[item.id] !== false;
          return (
            <div key={item.id} style={{ border: '1px solid var(--hf-border)', borderRadius: 12, background: 'var(--hf-surface)', padding: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: '0 0 0.2rem', fontWeight: 700 }}>{item.label}</p>
                <p style={{ margin: 0, color: 'var(--hf-muted)', fontSize: '0.84rem' }}>{item.route}</p>
              </div>
              <button
                type="button"
                disabled={savingKey === item.id}
                onClick={() => toggleModule(item.id, !isEnabled)}
                style={{ borderRadius: 999, border: '1px solid var(--hf-border)', background: isEnabled ? 'var(--hf-primary)' : 'transparent', color: isEnabled ? '#fff' : 'var(--hf-foreground)', padding: '0.4rem 0.8rem', cursor: 'pointer', minWidth: 96 }}
              >
                {savingKey === item.id ? 'Saving...' : isEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          );
        })}
      </div>
    </section>
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

function portalUsersRoute(): string {
  return `import { useEffect, useMemo, useState } from 'react';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';

type RoleRecord = { id: string; name: string };

type UserRoleAssignment = {
  id: string;
  role: RoleRecord;
};

type UserRecord = {
  id: string;
  email: string;
  name: string | null;
  userRoles: UserRoleAssignment[];
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [roleByUser, setRoleByUser] = useState<Record<string, string>>({});

  function authHeaders(withJson = false): Record<string, string> {
    const token = localStorage.getItem('token') ?? '';
    const tenantId = localStorage.getItem('tenantId') ?? '';
    return {
      ...(withJson ? { 'content-type': 'application/json' } : {}),
      authorization: 'Bearer ' + token,
      'x-tenant-id': tenantId,
    };
  }

  async function load() {
    const [usersRes, rolesRes] = await Promise.all([
      fetch(API + '/v1/users', { headers: authHeaders() }),
      fetch(API + '/v1/roles', { headers: authHeaders() }),
    ]);
    if (!usersRes.ok || !rolesRes.ok) return;
    const usersData = (await usersRes.json()) as UserRecord[];
    const rolesData = (await rolesRes.json()) as RoleRecord[];
    setUsers(usersData);
    setRoles(rolesData);
  }

  useEffect(() => {
    void load();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const roleText = u.userRoles.map((r) => r.role.name.toLowerCase()).join(' ');
      return (u.email + ' ' + (u.name ?? '') + ' ' + roleText).toLowerCase().includes(q);
    });
  }, [search, users]);

  async function createUser() {
    const res = await fetch(API + '/v1/users', {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify({ email, name }),
    });
    if (res.ok) {
      setEmail('');
      setName('');
      await load();
    }
  }

  async function saveUser(user: UserRecord) {
    const res = await fetch(API + '/v1/users/' + user.id, {
      method: 'PUT',
      headers: authHeaders(true),
      body: JSON.stringify({ email: user.email, name: user.name }),
    });
    if (res.ok) {
      await load();
    }
  }

  async function deleteUser(userId: string) {
    const res = await fetch(API + '/v1/users/' + userId, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.ok) {
      await load();
    }
  }

  async function assignRole(userId: string) {
    const roleId = roleByUser[userId];
    if (!roleId) return;
    const res = await fetch(API + '/v1/user-roles', {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify({ userId, roleId }),
    });
    if (res.ok) {
      setRoleByUser((prev) => ({ ...prev, [userId]: '' }));
      await load();
    }
  }

  async function removeRole(assignmentId: string) {
    const res = await fetch(API + '/v1/user-roles/' + assignmentId, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.ok) {
      await load();
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--hf-muted)', marginBottom: 8 }}>Access control</div>
        <h2 style={{ fontSize: '1.9rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--hf-foreground)', letterSpacing: '-0.04em' }}>Users</h2>
        <p style={{ margin: 0, color: 'var(--hf-muted)' }}>Create, edit, remove users, and manage role assignments.</p>
      </div>

      <div style={{ background: 'var(--hf-surface)', border: '1px solid var(--hf-border)', borderRadius: 22, padding: '1rem', boxShadow: 'var(--hf-card-shadow)', marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: '2fr 2fr auto', marginBottom: '0.75rem', maxWidth: 880 }}>
          <input value={email} onChange={(e) => setEmail(e.currentTarget.value)} placeholder="Email" style={inputStyle} />
          <input value={name} onChange={(e) => setName(e.currentTarget.value)} placeholder="Name" style={inputStyle} />
          <button onClick={createUser} style={buttonStyle}>Add User</button>
        </div>

        <input value={search} onChange={(e) => setSearch(e.currentTarget.value)} placeholder="Search users by name, email, role..." style={{ ...inputStyle, width: '100%', maxWidth: 880 }} />
      </div>

      <div style={{ display: 'grid', gap: '0.9rem' }}>
        {filteredUsers.map((u) => {
          const assignedRoleIds = new Set(u.userRoles.map((x) => x.role.id));
          const assignableRoles = roles.filter((r) => !assignedRoleIds.has(r.id));
          return (
            <div key={u.id} style={cardStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr auto auto', gap: 10, marginBottom: '0.9rem' }}>
                <input
                  value={u.email}
                  onChange={(e) => {
                    const next = e.currentTarget.value;
                    setUsers((prev) => prev.map((item) => (item.id === u.id ? { ...item, email: next } : item)));
                  }}
                  placeholder="Email"
                  style={inputStyle}
                />
                <input
                  value={u.name ?? ''}
                  onChange={(e) => {
                    const next = e.currentTarget.value;
                    setUsers((prev) => prev.map((item) => (item.id === u.id ? { ...item, name: next } : item)));
                  }}
                  placeholder="Name"
                  style={inputStyle}
                />
                <button onClick={() => void saveUser(u)} style={secondaryButtonStyle}>Save</button>
                <button onClick={() => void deleteUser(u.id)} style={dangerButtonStyle}>Delete</button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '0.9rem' }}>
                {u.userRoles.map((assignment) => (
                  <span key={assignment.id} style={chipStyle}>
                    {assignment.role.name}
                    <button onClick={() => void removeRole(assignment.id)} style={chipRemoveStyle}>x</button>
                  </span>
                ))}
                {u.userRoles.length === 0 && <span style={{ color: 'var(--hf-muted)', fontSize: '0.88rem' }}>No roles assigned</span>}
              </div>

              <div style={{ display: 'flex', gap: 10, maxWidth: 460 }}>
                <select
                  value={roleByUser[u.id] ?? ''}
                  onChange={(e) => setRoleByUser((prev) => ({ ...prev, [u.id]: e.currentTarget.value }))}
                  style={{ ...inputStyle, flex: 1 }}
                >
                  <option value="">Select role to assign</option>
                  {assignableRoles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
                <button onClick={() => void assignRole(u.id)} style={buttonStyle}>Assign Role</button>
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && <p style={{ margin: 0, padding: '1rem', color: 'var(--hf-muted)' }}>No users found.</p>}
      </div>
    </div>
  );
}

const cardStyle = {
  background: 'var(--hf-surface)',
  border: '1px solid var(--hf-border)',
  borderRadius: 22,
  padding: '1rem',
  boxShadow: 'var(--hf-card-shadow)',
};

const chipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  borderRadius: 999,
  background: 'var(--hf-primary-soft)',
  color: 'var(--hf-primary)',
  padding: '5px 12px',
  fontSize: '0.82rem',
  fontWeight: 700,
  border: '1px solid color-mix(in srgb, var(--hf-primary) 16%, white 84%)',
};

const chipRemoveStyle = {
  border: 'none',
  background: 'transparent',
  color: 'inherit',
  fontSize: '1rem',
  lineHeight: 1,
  cursor: 'pointer',
  padding: 0,
};

const inputStyle = {
  border: '1px solid var(--hf-border)',
  borderRadius: 14,
  padding: '11px 13px',
  background: 'rgba(255,255,255,0.88)',
};

const buttonStyle = {
  border: '1px solid transparent',
  borderRadius: 14,
  padding: '11px 14px',
  background: 'var(--hf-primary)',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 700,
  boxShadow: '0 10px 22px color-mix(in srgb, var(--hf-primary) 28%, transparent 72%)',
};

const secondaryButtonStyle = {
  border: '1px solid var(--hf-border)',
  borderRadius: 14,
  padding: '11px 14px',
  background: 'rgba(255,255,255,0.82)',
  color: 'var(--hf-foreground)',
  cursor: 'pointer',
  fontWeight: 700,
};

const dangerButtonStyle = {
  border: '1px solid transparent',
  borderRadius: 14,
  padding: '11px 14px',
  background: '#dc2626',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 700,
  boxShadow: '0 10px 22px rgba(220, 38, 38, 0.18)',
};
`;
}

function portalRolesRoute(): string {
  return `import { useEffect, useMemo, useState } from 'react';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';

type PermissionRecord = {
  id: string;
  module: string;
  action: string;
  description: string | null;
};

type RolePermissionAssignment = {
  id: string;
  permission: PermissionRecord;
};

type RoleRecord = {
  id: string;
  name: string;
  description: string | null;
  permissions: RolePermissionAssignment[];
};

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [permissions, setPermissions] = useState<PermissionRecord[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [permissionByRole, setPermissionByRole] = useState<Record<string, string>>({});

  function authHeaders(withJson = false): Record<string, string> {
    const token = localStorage.getItem('token') ?? '';
    const tenantId = localStorage.getItem('tenantId') ?? '';
    return {
      ...(withJson ? { 'content-type': 'application/json' } : {}),
      authorization: 'Bearer ' + token,
      'x-tenant-id': tenantId,
    };
  }

  async function load() {
    const [rolesRes, permsRes] = await Promise.all([
      fetch(API + '/v1/roles', { headers: authHeaders() }),
      fetch(API + '/v1/permissions', { headers: authHeaders() }),
    ]);
    if (!rolesRes.ok || !permsRes.ok) return;
    const rolesData = (await rolesRes.json()) as RoleRecord[];
    const permsData = (await permsRes.json()) as PermissionRecord[];
    setRoles(rolesData);
    setPermissions(permsData);
  }

  useEffect(() => {
    void load();
  }, []);

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) => {
      const permText = r.permissions.map((p) => p.permission.module + '.' + p.permission.action).join(' ');
      return (r.name + ' ' + (r.description ?? '') + ' ' + permText).toLowerCase().includes(q);
    });
  }, [roles, search]);

  async function createRole() {
    const res = await fetch(API + '/v1/roles', {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify({ name, description }),
    });
    if (res.ok) {
      setName('');
      setDescription('');
      await load();
    }
  }

  async function saveRole(role: RoleRecord) {
    const res = await fetch(API + '/v1/roles/' + role.id, {
      method: 'PUT',
      headers: authHeaders(true),
      body: JSON.stringify({ name: role.name, description: role.description }),
    });
    if (res.ok) {
      await load();
    }
  }

  async function deleteRole(roleId: string) {
    const res = await fetch(API + '/v1/roles/' + roleId, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.ok) {
      await load();
    }
  }

  async function assignPermission(roleId: string) {
    const permissionId = permissionByRole[roleId];
    if (!permissionId) return;
    const res = await fetch(API + '/v1/role-permissions', {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify({ roleId, permissionId }),
    });
    if (res.ok) {
      setPermissionByRole((prev) => ({ ...prev, [roleId]: '' }));
      await load();
    }
  }

  async function removePermission(assignmentId: string) {
    const res = await fetch(API + '/v1/role-permissions/' + assignmentId, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.ok) {
      await load();
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Roles</h2>
      <p style={{ margin: '0 0 0.9rem', color: '#64748b' }}>Manage tenant roles and assign permissions.</p>

      <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: '2fr 3fr auto', marginBottom: '0.75rem', maxWidth: 900 }}>
        <input value={name} onChange={(e) => setName(e.currentTarget.value)} placeholder="Role name" style={inputStyle} />
        <input value={description} onChange={(e) => setDescription(e.currentTarget.value)} placeholder="Description" style={inputStyle} />
        <button onClick={createRole} style={buttonStyle}>Add Role</button>
      </div>

      <input value={search} onChange={(e) => setSearch(e.currentTarget.value)} placeholder="Search roles by name, description, permission..." style={{ ...inputStyle, width: '100%', maxWidth: 900, marginBottom: '1rem' }} />

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {filteredRoles.map((role) => {
          const assignedPermissionIds = new Set(role.permissions.map((p) => p.permission.id));
          const assignablePermissions = permissions.filter((p) => !assignedPermissionIds.has(p.id));

          return (
            <div key={role.id} style={cardStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr auto auto', gap: 8, marginBottom: '0.7rem' }}>
                <input
                  value={role.name}
                  onChange={(e) => {
                    const next = e.currentTarget.value;
                    setRoles((prev) => prev.map((item) => (item.id === role.id ? { ...item, name: next } : item)));
                  }}
                  placeholder="Role name"
                  style={inputStyle}
                />
                <input
                  value={role.description ?? ''}
                  onChange={(e) => {
                    const next = e.currentTarget.value;
                    setRoles((prev) => prev.map((item) => (item.id === role.id ? { ...item, description: next } : item)));
                  }}
                  placeholder="Description"
                  style={inputStyle}
                />
                <button onClick={() => void saveRole(role)} style={secondaryButtonStyle}>Save</button>
                <button onClick={() => void deleteRole(role.id)} style={dangerButtonStyle}>Delete</button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '0.65rem' }}>
                {role.permissions.map((assignment) => (
                  <span key={assignment.id} style={chipStyle}>
                    {assignment.permission.module}.{assignment.permission.action}
                    <button onClick={() => void removePermission(assignment.id)} style={chipRemoveStyle}>x</button>
                  </span>
                ))}
                {role.permissions.length === 0 && <span style={{ color: '#64748b', fontSize: '0.85rem' }}>No permissions assigned</span>}
              </div>

              <div style={{ display: 'flex', gap: 8, maxWidth: 520 }}>
                <select
                  value={permissionByRole[role.id] ?? ''}
                  onChange={(e) => setPermissionByRole((prev) => ({ ...prev, [role.id]: e.currentTarget.value }))}
                  style={{ ...inputStyle, flex: 1 }}
                >
                  <option value="">Select permission to assign</option>
                  {assignablePermissions.map((p) => (
                    <option key={p.id} value={p.id}>{p.module}.{p.action}</option>
                  ))}
                </select>
                <button onClick={() => void assignPermission(role.id)} style={buttonStyle}>Assign Permission</button>
              </div>
            </div>
          );
        })}

        {filteredRoles.length === 0 && <p style={{ margin: 0, padding: '1rem', color: '#64748b' }}>No roles found.</p>}
      </div>
    </div>
  );
}

const cardStyle = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: '0.8rem',
};

const chipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  borderRadius: 999,
  background: '#ecfdf5',
  color: '#065f46',
  padding: '3px 10px',
  fontSize: '0.82rem',
};

const chipRemoveStyle = {
  border: 'none',
  background: 'transparent',
  color: '#065f46',
  fontSize: '1rem',
  lineHeight: 1,
  cursor: 'pointer',
};

const inputStyle = {
  border: '1px solid #d1d5db',
  borderRadius: 8,
  padding: '8px 10px',
};

const buttonStyle = {
  border: 'none',
  borderRadius: 8,
  padding: '8px 12px',
  background: '#2563eb',
  color: '#fff',
  cursor: 'pointer',
};

const secondaryButtonStyle = {
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '8px 12px',
  background: '#fff',
  color: '#1f2937',
  cursor: 'pointer',
};

const dangerButtonStyle = {
  border: 'none',
  borderRadius: 8,
  padding: '8px 12px',
  background: '#dc2626',
  color: '#fff',
  cursor: 'pointer',
};
`;
}

function portalPermissionsRoute(): string {
  return `import { useEffect, useMemo, useState } from 'react';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';

type PermissionRecord = {
  id: string;
  module: string;
  action: string;
  description: string | null;
};

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<PermissionRecord[]>([]);
  const [moduleName, setModuleName] = useState('');
  const [action, setAction] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');

  function authHeaders(withJson = false): Record<string, string> {
    const token = localStorage.getItem('token') ?? '';
    return {
      ...(withJson ? { 'content-type': 'application/json' } : {}),
      authorization: 'Bearer ' + token,
    };
  }

  async function load() {
    const res = await fetch(API + '/v1/permissions', { headers: authHeaders() });
    if (!res.ok) return;
    const data = (await res.json()) as PermissionRecord[];
    setPermissions(data);
  }

  useEffect(() => {
    void load();
  }, []);

  const filteredPermissions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return permissions;
    return permissions.filter((p) => {
      return (p.module + ' ' + p.action + ' ' + (p.description ?? '')).toLowerCase().includes(q);
    });
  }, [search, permissions]);

  async function createPermission() {
    const res = await fetch(API + '/v1/permissions', {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify({ module: moduleName, action, description }),
    });
    if (res.ok) {
      setModuleName('');
      setAction('');
      setDescription('');
      await load();
    }
  }

  async function savePermission(item: PermissionRecord) {
    const res = await fetch(API + '/v1/permissions/' + item.id, {
      method: 'PUT',
      headers: authHeaders(true),
      body: JSON.stringify({ module: item.module, action: item.action, description: item.description }),
    });
    if (res.ok) {
      await load();
    }
  }

  async function deletePermission(id: string) {
    const res = await fetch(API + '/v1/permissions/' + id, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.ok) {
      await load();
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Permissions</h2>
      <p style={{ margin: '0 0 0.9rem', color: '#64748b' }}>Create and maintain module permission keys used by RBAC.</p>

      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1.2fr 1fr 2fr auto', marginBottom: '0.75rem' }}>
        <input value={moduleName} onChange={(e) => setModuleName(e.currentTarget.value)} placeholder="module (e.g. billing)" style={inputStyle} />
        <input value={action} onChange={(e) => setAction(e.currentTarget.value)} placeholder="action (e.g. manage)" style={inputStyle} />
        <input value={description} onChange={(e) => setDescription(e.currentTarget.value)} placeholder="description" style={inputStyle} />
        <button onClick={createPermission} style={buttonStyle}>Add</button>
      </div>

      <input value={search} onChange={(e) => setSearch(e.currentTarget.value)} placeholder="Search permissions..." style={{ ...inputStyle, width: '100%', marginBottom: '1rem' }} />

      <div style={{ display: 'grid', gap: 8 }}>
        {filteredPermissions.map((item) => (
          <div key={item.id} style={cardStyle}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 2fr auto auto', gap: 8 }}>
              <input
                value={item.module}
                onChange={(e) => {
                  const next = e.currentTarget.value;
                  setPermissions((prev) => prev.map((p) => (p.id === item.id ? { ...p, module: next } : p)));
                }}
                style={inputStyle}
              />
              <input
                value={item.action}
                onChange={(e) => {
                  const next = e.currentTarget.value;
                  setPermissions((prev) => prev.map((p) => (p.id === item.id ? { ...p, action: next } : p)));
                }}
                style={inputStyle}
              />
              <input
                value={item.description ?? ''}
                onChange={(e) => {
                  const next = e.currentTarget.value;
                  setPermissions((prev) => prev.map((p) => (p.id === item.id ? { ...p, description: next } : p)));
                }}
                style={inputStyle}
              />
              <button onClick={() => void savePermission(item)} style={secondaryButtonStyle}>Save</button>
              <button onClick={() => void deletePermission(item.id)} style={dangerButtonStyle}>Delete</button>
            </div>
          </div>
        ))}

        {filteredPermissions.length === 0 && <p style={{ margin: 0, padding: '1rem', color: '#64748b' }}>No permissions found.</p>}
      </div>
    </div>
  );
}

const cardStyle = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: '0.75rem',
};

const inputStyle = {
  border: '1px solid #d1d5db',
  borderRadius: 8,
  padding: '8px 10px',
};

const buttonStyle = {
  border: 'none',
  borderRadius: 8,
  padding: '8px 12px',
  background: '#2563eb',
  color: '#fff',
  cursor: 'pointer',
};

const secondaryButtonStyle = {
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '8px 12px',
  background: '#fff',
  color: '#1f2937',
  cursor: 'pointer',
};

const dangerButtonStyle = {
  border: 'none',
  borderRadius: 8,
  padding: '8px 12px',
  background: '#dc2626',
  color: '#fff',
  cursor: 'pointer',
};
`;
}

function portalJobsRoute(): string {
  return `import { useEffect, useState } from 'react';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';

type JobRecord = {
  id: string;
  jobType: string;
  status: string;
  attempts: number;
  createdAt: string;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [jobType, setJobType] = useState('demo.sync');

  async function load() {
    const token = localStorage.getItem('token') ?? '';
    const tenantId = localStorage.getItem('tenantId') ?? '';
    const res = await fetch(API + '/v1/jobs', {
      headers: { authorization: 'Bearer ' + token, 'x-tenant-id': tenantId },
    });
    if (!res.ok) return;
    const data = (await res.json()) as JobRecord[];
    setJobs(data);
  }

  useEffect(() => {
    void load();
  }, []);

  async function triggerJob() {
    const token = localStorage.getItem('token') ?? '';
    const tenantId = localStorage.getItem('tenantId') ?? '';
    const res = await fetch(API + '/v1/jobs/' + encodeURIComponent(jobType) + '/trigger', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token, 'x-tenant-id': tenantId },
      body: JSON.stringify({ payload: { source: 'portal' }, priority: 1 }),
    });
    if (res.ok) {
      await load();
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Background Jobs</h2>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', maxWidth: 560 }}>
        <input value={jobType} onChange={(e) => setJobType(e.currentTarget.value)} placeholder="job type" style={{ ...inputStyle, flex: 1 }} />
        <button onClick={triggerJob} style={buttonStyle}>Trigger Job</button>
      </div>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }}>
        {jobs.map((j) => (
          <div key={j.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px 1.5fr', gap: '0.5rem', padding: '0.7rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontWeight: 600 }}>{j.jobType}</span>
            <span>{j.status}</span>
            <span>{j.attempts}</span>
            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{new Date(j.createdAt).toLocaleString()}</span>
          </div>
        ))}
        {jobs.length === 0 && <p style={{ margin: 0, padding: '1rem', color: '#64748b' }}>No jobs queued yet.</p>}
      </div>
    </div>
  );
}

const inputStyle = {
  border: '1px solid #d1d5db',
  borderRadius: 8,
  padding: '8px 10px',
};

const buttonStyle = {
  border: 'none',
  borderRadius: 8,
  padding: '8px 12px',
  background: '#2563eb',
  color: '#fff',
  cursor: 'pointer',
};
`;
}

function portalAssistantRoute(): string {
  return `import { useEffect, useState } from 'react';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';

type AssistantReply = {
  ok: boolean;
  provider: string;
  model: string;
  mocked: boolean;
  response: {
    message: string;
    confidence: number;
    suggestions: string[];
  };
};

type SchedulerReply = {
  ok: boolean;
  provider: string;
  model: string;
  mocked: boolean;
  recommendation: {
    recommendedTechnician: string;
    recommendedAppointmentSlot: string;
    confidence: number;
    explanation: string;
    alternatives: string[];
    risks: string[];
  };
};

export default function AssistantPage() {
  const [prompt, setPrompt] = useState('Generate an operations checklist for completing today\'s deployment safely.');
  const [reply, setReply] = useState<AssistantReply | null>(null);
  const [scheduleReply, setScheduleReply] = useState<SchedulerReply | null>(null);
  const [loading, setLoading] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobType, setJobType] = useState('hvac.install');
  const [jobPriority, setJobPriority] = useState('high');
  const [preferredDateTime, setPreferredDateTime] = useState(new Date(Date.now() + 2 * 3600 * 1000).toISOString().slice(0, 16));

  useEffect(() => {
    void checkAccess();
  }, []);

  async function checkAccess() {
    const token = localStorage.getItem('token') ?? '';
    const tenantId = localStorage.getItem('tenantId') ?? '';
    const res = await fetch(API + '/v1/ai-assistant/access', {
      headers: { authorization: 'Bearer ' + token, 'x-tenant-id': tenantId },
    });

    if (res.ok) {
      setAccessError(null);
      return;
    }

    if (res.status === 403) {
      setAccessError('You do not have ai-assistant:read permission. Ask an admin to grant access.');
      return;
    }

    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setAccessError(data.error ?? 'Unable to verify assistant access.');
  }

  async function askAssistant() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') ?? '';
      const tenantId = localStorage.getItem('tenantId') ?? '';
      const res = await fetch(API + '/v1/ai-assistant/chat', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: 'Bearer ' + token,
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string; requiredPermission?: string };
        if (res.status === 403) {
          setError((data.error ?? 'Forbidden') + (data.requiredPermission ? ' (' + data.requiredPermission + ')' : ''));
        } else {
          setError(data.error ?? 'Failed to invoke assistant');
        }
        return;
      }

      setReply((await res.json()) as AssistantReply);
    } finally {
      setLoading(false);
    }
  }

  async function runScheduler() {
    setScheduling(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') ?? '';
      const tenantId = localStorage.getItem('tenantId') ?? '';
      const res = await fetch(API + '/v1/ai/schedule', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: 'Bearer ' + token,
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({
          jobType,
          jobPriority,
          customerLocation: 'Downtown, Seattle',
          requiredSkills: ['hvac', 'electrical'],
          preferredDateTime: new Date(preferredDateTime).toISOString(),
          technicianAvailability: [
            { technicianId: 'tech-101', windows: ['2026-05-01T09:00:00.000Z', '2026-05-01T13:00:00.000Z'] },
            { technicianId: 'tech-202', windows: ['2026-05-01T10:00:00.000Z', '2026-05-01T15:00:00.000Z'] },
          ],
          technicianSkillMatch: [
            { technicianId: 'tech-101', score: 0.87 },
            { technicianId: 'tech-202', score: 0.79 },
          ],
          existingSchedule: [
            { technicianId: 'tech-101', slot: '2026-05-01T11:00:00.000Z' },
          ],
          travelDistanceHint: 'urban traffic moderate',
          slaDeadline: '2026-05-01T23:00:00.000Z',
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string; requiredPermission?: string };
        setError((data.error ?? 'Failed to run AI scheduler') + (data.requiredPermission ? ' (' + data.requiredPermission + ')' : ''));
        return;
      }

      setScheduleReply((await res.json()) as SchedulerReply);
    } finally {
      setScheduling(false);
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>AI Assistant</h2>
      <p style={{ marginTop: 0, marginBottom: '1rem', color: '#64748b' }}>
        Ask the tenant assistant or run AI scheduling recommendations. Provider selection is controlled via AI_PROVIDER with automatic mock fallback.
      </p>

      {accessError ? (
        <div style={{ border: '1px solid #fecaca', background: '#fef2f2', color: '#991b1b', borderRadius: 10, padding: '0.85rem', marginBottom: '1rem' }}>
          {accessError}
        </div>
      ) : null}

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', padding: '1rem', marginBottom: '1rem' }}>
        <h3 style={{ marginTop: 0 }}>Assistant Chat</h3>
        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#334155', marginBottom: '0.45rem' }}>Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.currentTarget.value)}
          rows={4}
          style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: 10, padding: '10px 12px', resize: 'vertical' }}
        />
        <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.55rem' }}>
          <button onClick={askAssistant} disabled={loading || Boolean(accessError)} style={primaryButtonStyle}>
            {loading ? 'Thinking...' : 'Ask Assistant'}
          </button>
        </div>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', padding: '1rem', marginBottom: '1rem' }}>
        <h3 style={{ marginTop: 0 }}>AI Scheduler</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
          <input value={jobType} onChange={(e) => setJobType(e.currentTarget.value)} placeholder="job type" style={inputStyle} />
          <select value={jobPriority} onChange={(e) => setJobPriority(e.currentTarget.value)} style={inputStyle}>
            <option value="low">low</option>
            <option value="normal">normal</option>
            <option value="high">high</option>
            <option value="urgent">urgent</option>
          </select>
          <input type="datetime-local" value={preferredDateTime} onChange={(e) => setPreferredDateTime(e.currentTarget.value)} style={inputStyle} />
        </div>
        <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.55rem' }}>
          <button onClick={runScheduler} disabled={scheduling || Boolean(accessError)} style={primaryButtonStyle}>
            {scheduling ? 'Scheduling...' : 'Get Recommendation'}
          </button>
        </div>
      </div>

      {error ? <p style={{ margin: '0.7rem 0 0', color: '#b91c1c' }}>{error}</p> : null}

      {reply ? (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', padding: '1rem', marginBottom: '1rem' }}>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
            Provider: {reply.provider} · Model: {reply.model} · {reply.mocked ? 'mock fallback' : 'live provider'} · Confidence: {(reply.response.confidence * 100).toFixed(0)}%
          </p>
          <p style={{ margin: '0.75rem 0 0', color: '#0f172a', lineHeight: 1.5 }}>{reply.response.message}</p>
        </div>
      ) : null}

      {scheduleReply ? (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', padding: '1rem' }}>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
            Scheduler provider: {scheduleReply.provider} · Model: {scheduleReply.model} · {scheduleReply.mocked ? 'mock fallback' : 'live provider'}
          </p>
          <p style={{ margin: '0.7rem 0 0', color: '#0f172a' }}><strong>Technician:</strong> {scheduleReply.recommendation.recommendedTechnician}</p>
          <p style={{ margin: '0.4rem 0 0', color: '#0f172a' }}><strong>Slot:</strong> {new Date(scheduleReply.recommendation.recommendedAppointmentSlot).toLocaleString()}</p>
          <p style={{ margin: '0.4rem 0 0', color: '#0f172a' }}><strong>Confidence:</strong> {(scheduleReply.recommendation.confidence * 100).toFixed(0)}%</p>
          <p style={{ margin: '0.4rem 0 0', color: '#334155' }}>{scheduleReply.recommendation.explanation}</p>
        </div>
      ) : null}
    </div>
  );
}

const inputStyle = {
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '8px 10px',
};

const primaryButtonStyle = {
  border: 'none',
  borderRadius: 8,
  padding: '8px 12px',
  background: '#2563eb',
  color: '#fff',
  cursor: 'pointer',
};
`;
}

function portalNotificationsRoute(): string {
  return `import { useEffect, useState } from 'react';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';

type TemplateRecord = {
  id: string;
  key: string;
  channel: 'email' | 'push';
  provider: string | null;
  subject: string | null;
  body: string;
  isActive: boolean;
};

type DeliveryRecord = {
  id: string;
  channel: string;
  provider: string | null;
  recipient: string;
  subject: string | null;
  status: string;
  error: string | null;
  createdAt: string;
};

export default function NotificationsPage() {
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [templateKey, setTemplateKey] = useState('ops.alert');
  const [channel, setChannel] = useState<'email' | 'push'>('email');
  const [subject, setSubject] = useState('Action required for {{tenantName}}');
  const [body, setBody] = useState('Hello {{userName}}, please review item {{itemId}}.');
  const [recipient, setRecipient] = useState('admin@local-demo.com');
  const [variablesJson, setVariablesJson] = useState('{"tenantName":"Local Demo","userName":"Admin","itemId":"INC-100"}');
  const [status, setStatus] = useState('');

  async function load() {
    const token = localStorage.getItem('token') ?? '';
    const tenantId = localStorage.getItem('tenantId') ?? '';
    const [templatesRes, deliveriesRes] = await Promise.all([
      fetch(API + '/v1/notifications/templates', { headers: { authorization: 'Bearer ' + token, 'x-tenant-id': tenantId } }),
      fetch(API + '/v1/notifications/deliveries?limit=40', { headers: { authorization: 'Bearer ' + token, 'x-tenant-id': tenantId } }),
    ]);

    if (templatesRes.ok) {
      setTemplates((await templatesRes.json()) as TemplateRecord[]);
    }
    if (deliveriesRes.ok) {
      setDeliveries((await deliveriesRes.json()) as DeliveryRecord[]);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveTemplate() {
    const token = localStorage.getItem('token') ?? '';
    const tenantId = localStorage.getItem('tenantId') ?? '';

    let variablesSchema: Record<string, unknown> = {};
    try {
      const parsed = JSON.parse(variablesJson) as unknown;
      variablesSchema = typeof parsed === 'object' && parsed ? (parsed as Record<string, unknown>) : {};
    } catch {
      setStatus('Variables must be valid JSON');
      return;
    }

    const res = await fetch(API + '/v1/notifications/templates/' + encodeURIComponent(templateKey), {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer ' + token,
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify({
        channel,
        subject,
        body,
        isActive: true,
        variablesSchema,
      }),
    });

    if (!res.ok) {
      setStatus('Failed to save template');
      return;
    }

    setStatus('Template saved');
    await load();
  }

  async function sendNotification() {
    const token = localStorage.getItem('token') ?? '';
    const tenantId = localStorage.getItem('tenantId') ?? '';

    let variables: Record<string, unknown> = {};
    try {
      const parsed = JSON.parse(variablesJson) as unknown;
      variables = typeof parsed === 'object' && parsed ? (parsed as Record<string, unknown>) : {};
    } catch {
      setStatus('Variables must be valid JSON');
      return;
    }

    const res = await fetch(API + '/v1/notifications/send', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer ' + token,
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify({
        recipient,
        templateKey,
        variables,
      }),
    });

    if (!res.ok) {
      const failed = (await res.json().catch(() => ({ error: 'Failed to send notification' }))) as { error?: string };
      setStatus(failed.error ?? 'Failed to send notification');
      await load();
      return;
    }

    setStatus('Notification sent');
    await load();
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Notifications</h2>
      <p style={{ marginTop: 0, marginBottom: '1rem', color: '#64748b' }}>
        Manage tenant templates and inspect recent delivery logs.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Template Editor</h3>
          <div style={formGridStyle}>
            <label style={labelStyle}>Template key</label>
            <input value={templateKey} onChange={(e) => setTemplateKey(e.currentTarget.value)} style={inputStyle} />
            <label style={labelStyle}>Channel</label>
            <select value={channel} onChange={(e) => setChannel(e.currentTarget.value as 'email' | 'push')} style={inputStyle}>
              <option value="email">email</option>
              <option value="push">push</option>
            </select>
            <label style={labelStyle}>Subject / title</label>
            <input value={subject} onChange={(e) => setSubject(e.currentTarget.value)} style={inputStyle} />
            <label style={labelStyle}>Body</label>
            <textarea value={body} onChange={(e) => setBody(e.currentTarget.value)} rows={5} style={textareaStyle} />
            <label style={labelStyle}>Variables (JSON)</label>
            <textarea value={variablesJson} onChange={(e) => setVariablesJson(e.currentTarget.value)} rows={4} style={textareaStyle} />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
            <button onClick={saveTemplate} style={primaryButtonStyle}>Save Template</button>
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Send Test Notification</h3>
          <label style={labelStyle}>Recipient (email or push token)</label>
          <input value={recipient} onChange={(e) => setRecipient(e.currentTarget.value)} style={inputStyle} />
          <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.5rem' }}>
            <button onClick={sendNotification} style={primaryButtonStyle}>Send Using Template</button>
            <button onClick={() => void load()} style={secondaryButtonStyle}>Refresh</button>
          </div>
          {status ? <p style={{ margin: '0.8rem 0 0', color: '#0f172a' }}>{status}</p> : null}

          <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '0.95rem', color: '#334155' }}>Template Keys</h4>
          <div style={{ maxHeight: 220, overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
            {templates.map((item) => (
              <div key={item.id} style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{item.key}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{item.channel} · {item.isActive ? 'active' : 'inactive'}</p>
              </div>
            ))}
            {templates.length === 0 ? <p style={{ margin: 0, padding: '0.8rem', color: '#64748b' }}>No templates yet.</p> : null}
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: '1rem' }}>
        <h3 style={cardTitleStyle}>Delivery Log</h3>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 10 }}>
          {deliveries.map((d) => (
            <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '110px 120px 1.4fr 110px 1.2fr', gap: '0.5rem', padding: '0.65rem 0.8rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontWeight: 600 }}>{d.channel}</span>
              <span style={{ color: '#334155' }}>{d.provider ?? 'n/a'}</span>
              <span style={{ color: '#0f172a' }}>{d.recipient}</span>
              <span style={{ color: d.status === 'failed' ? '#b91c1c' : '#166534', fontWeight: 600 }}>{d.status}</span>
              <span style={{ color: '#64748b', fontSize: '0.82rem' }}>{new Date(d.createdAt).toLocaleString()}</span>
            </div>
          ))}
          {deliveries.length === 0 ? <p style={{ margin: 0, padding: '0.9rem', color: '#64748b' }}>No delivery records yet.</p> : null}
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  background: '#fff',
  padding: '1rem',
};

const cardTitleStyle = {
  marginTop: 0,
  marginBottom: '0.8rem',
  fontSize: '1.05rem',
  color: '#0f172a',
};

const formGridStyle = {
  display: 'grid',
  gap: '0.45rem',
};

const labelStyle = {
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#475569',
};

const inputStyle = {
  border: '1px solid #d1d5db',
  borderRadius: 8,
  padding: '8px 10px',
};

const textareaStyle = {
  border: '1px solid #d1d5db',
  borderRadius: 8,
  padding: '8px 10px',
  resize: 'vertical' as const,
};

const primaryButtonStyle = {
  border: 'none',
  borderRadius: 8,
  padding: '8px 12px',
  background: '#2563eb',
  color: '#fff',
  cursor: 'pointer',
};

const secondaryButtonStyle = {
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '8px 12px',
  background: '#fff',
  color: '#1f2937',
  cursor: 'pointer',
};
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

function portalExampleThemeAdapterCss(): string {
  return `/**
 * Example ThemeForest Adapter for HubForge
 * ==========================================
 * 1. Download your ThemeForest theme and extract the compiled CSS file.
 * 2. Copy it into this folder alongside a new adapter file.
 * 3. @import it below and override HubForge's --hf-* variables.
 * 4. Register the adapter in apps/portal/app/lib/theme-registry.ts.
 *
 * See docs/ThemeForest-Integration.md for full step-by-step instructions.
 */

/* @import './vuexy/app.min.css'; */

:root {
  /* --hf-primary:             #7367f0; */
  /* --hf-primary-hover:       #6259cc; */
  /* --hf-surface:             #fff; */
  /* --hf-surface-alt:         #f8f8f8; */
  /* --hf-foreground:          #6e6b7b; */
  /* --hf-muted:               #a8aaae; */
  /* --hf-border:              #ebe9f1; */
  /* --hf-sidebar:             #fff; */
  /* --hf-sidebar-text:        #625f6e; */
  /* --hf-sidebar-active:      #f0eeff; */
  /* --hf-sidebar-active-text: #7367f0; */
  /* --hf-header:              #fff; */
  /* --hf-font:                'Montserrat', ui-sans-serif, sans-serif; */
}
`;
}

function portalThemeRegistryTs(): string {
  return `export type CustomTheme = {
  key: string;
  name: string;
  cssUrl: string;
  tokens?: Record<string, string>;
};

/**
 * Register your custom / ThemeForest themes here.
 * Local CSS files: place in apps/portal/public/themes/ then reference as '/themes/my-theme.css'.
 * See docs/ThemeForest-Integration.md for full instructions.
 */
export const CUSTOM_THEMES: CustomTheme[] = [
  // {
  //   key: 'vuexy',
  //   name: 'Vuexy Admin',
  //   cssUrl: '/themes/vuexy-adapter.css',
  //   tokens: {
  //     '--hf-primary': '#7367f0',
  //     '--hf-primary-hover': '#6259cc',
  //   },
  // },
];
`;
}

function portalThemeLibTs(): string {
  return `import { CUSTOM_THEMES, type CustomTheme } from './theme-registry.js';

export type { CustomTheme };

export type ThemePreset = 'ynex-light' | 'slate' | 'forest';

const PRESETS: Record<ThemePreset, Record<string, string>> = {
  'ynex-light': {
    '--hf-primary': '#2563eb',
    '--hf-primary-hover': '#1d4ed8',
    '--hf-primary-soft': 'rgba(37, 99, 235, 0.12)',
    '--hf-surface': 'rgba(255, 255, 255, 0.92)',
    '--hf-surface-alt': '#f4f7fb',
    '--hf-surface-muted': '#eef3f8',
    '--hf-foreground': '#172033',
    '--hf-muted': '#617089',
    '--hf-border': 'rgba(148, 163, 184, 0.22)',
    '--hf-border-strong': 'rgba(100, 116, 139, 0.32)',
    '--hf-sidebar': 'linear-gradient(180deg, #0f172a 0%, #111c34 100%)',
    '--hf-sidebar-text': '#afbdd4',
    '--hf-sidebar-active': 'rgba(255, 255, 255, 0.08)',
    '--hf-sidebar-active-text': '#f8fbff',
    '--hf-header': 'rgba(255, 255, 255, 0.82)',
    '--hf-card-shadow': '0 18px 40px rgba(15, 23, 42, 0.08)',
    '--hf-card-shadow-soft': '0 8px 24px rgba(15, 23, 42, 0.05)',
  },
  slate: {
    '--hf-primary': '#60a5fa',
    '--hf-primary-hover': '#3b82f6',
    '--hf-primary-soft': 'rgba(96, 165, 250, 0.12)',
    '--hf-surface': 'rgba(15, 23, 42, 0.88)',
    '--hf-surface-alt': '#020617',
    '--hf-surface-muted': '#0f172a',
    '--hf-foreground': '#e2e8f0',
    '--hf-muted': '#94a3b8',
    '--hf-border': 'rgba(71, 85, 105, 0.44)',
    '--hf-border-strong': 'rgba(100, 116, 139, 0.55)',
    '--hf-sidebar': 'linear-gradient(180deg, #020617 0%, #0f172a 100%)',
    '--hf-sidebar-text': '#93a2b8',
    '--hf-sidebar-active': 'rgba(148, 163, 184, 0.12)',
    '--hf-sidebar-active-text': '#eff6ff',
    '--hf-header': 'rgba(2, 6, 23, 0.72)',
    '--hf-card-shadow': '0 18px 40px rgba(2, 6, 23, 0.36)',
    '--hf-card-shadow-soft': '0 8px 24px rgba(2, 6, 23, 0.24)',
  },
  forest: {
    '--hf-primary': '#0f9f6e',
    '--hf-primary-hover': '#0b7d57',
    '--hf-primary-soft': 'rgba(15, 159, 110, 0.12)',
    '--hf-surface': 'rgba(255, 255, 255, 0.92)',
    '--hf-surface-alt': '#edf8f2',
    '--hf-surface-muted': '#e0f2e8',
    '--hf-foreground': '#183126',
    '--hf-muted': '#537463',
    '--hf-border': 'rgba(110, 145, 124, 0.24)',
    '--hf-border-strong': 'rgba(80, 113, 94, 0.35)',
    '--hf-sidebar': 'linear-gradient(180deg, #0d1f17 0%, #153328 100%)',
    '--hf-sidebar-text': '#b3d1bf',
    '--hf-sidebar-active': 'rgba(255, 255, 255, 0.08)',
    '--hf-sidebar-active-text': '#f5fff8',
    '--hf-header': 'rgba(255, 255, 255, 0.78)',
    '--hf-card-shadow': '0 18px 40px rgba(13, 31, 23, 0.10)',
    '--hf-card-shadow-soft': '0 8px 24px rgba(13, 31, 23, 0.06)',
  },
};

export function getCustomThemes(): CustomTheme[] {
  return CUSTOM_THEMES;
}

export function applyCustomTheme(themeKey: string): void {
  if (typeof document === 'undefined') return;
  const theme = CUSTOM_THEMES.find((t) => t.key === themeKey);
  if (!theme) return;
  applyPortalTheme('ynex-light', theme.cssUrl);
  if (theme.tokens) {
    const root = document.documentElement;
    Object.entries(theme.tokens).forEach(([key, value]) => root.style.setProperty(key, value));
  }
  localStorage.setItem('hf_custom_theme_key', themeKey);
  localStorage.removeItem('hf_theme_preset');
}

export function applyStoredPortalTheme(): void {
  if (typeof document === 'undefined') return;
  const customKey = localStorage.getItem('hf_custom_theme_key');
  if (customKey) {
    applyCustomTheme(customKey);
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
import { applyPortalTheme, applyCustomTheme, getCustomThemes, type ThemePreset, type CustomTheme } from '../lib/theme';

const builtinPresets: ThemePreset[] = ['ynex-light', 'slate', 'forest'];

const presetLabels: Record<ThemePreset, string> = {
  'ynex-light': '☀️ Ynex Light',
  slate: '🌙 Slate Dark',
  forest: '🌲 Forest',
};

export default function ThemeSettingsPage() {
  const [activeKey, setActiveKey] = useState<string>('ynex-light');
  const [cssUrl, setCssUrl] = useState('');
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);

  useEffect(() => {
    setCustomThemes(getCustomThemes());
    const customKey = localStorage.getItem('hf_custom_theme_key');
    if (customKey) {
      setActiveKey('custom:' + customKey);
      return;
    }
    const storedPreset = (localStorage.getItem('hf_theme_preset') as ThemePreset | null) ?? 'ynex-light';
    const storedCssUrl = localStorage.getItem('hf_theme_css_url') ?? '';
    setActiveKey(storedPreset);
    setCssUrl(storedCssUrl);
  }, []);

  function selectBuiltin(preset: ThemePreset) {
    setActiveKey(preset);
    localStorage.removeItem('hf_custom_theme_key');
    applyPortalTheme(preset, '');
    setCssUrl('');
  }

  function selectCustom(theme: CustomTheme) {
    setActiveKey('custom:' + theme.key);
    applyCustomTheme(theme.key);
  }

  function applyUrl(e: FormEvent) {
    e.preventDefault();
    const preset = builtinPresets.includes(activeKey as ThemePreset) ? (activeKey as ThemePreset) : 'ynex-light';
    localStorage.removeItem('hf_custom_theme_key');
    applyPortalTheme(preset, cssUrl);
  }

  const cardBase: React.CSSProperties = {
    border: '2px solid var(--hf-border)',
    borderRadius: 10,
    padding: '0.65rem 1rem',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '0.88rem',
    background: 'var(--hf-surface)',
    color: 'var(--hf-foreground)',
    textAlign: 'left',
    transition: 'border-color 0.15s',
  };

  const activeCard: React.CSSProperties = {
    ...cardBase,
    borderColor: 'var(--hf-primary)',
    color: 'var(--hf-primary)',
  };

  return (
    <div style={{ maxWidth: 760, display: 'grid', gap: '1.25rem' }}>
      <div style={{ background: 'var(--hf-surface)', border: '1px solid var(--hf-border)', borderRadius: 12, padding: '1.25rem' }}>
        <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 700 }}>Portal Theme</h2>
        <p style={{ margin: '0 0 1rem', color: 'var(--hf-muted)', fontSize: '0.9rem' }}>
          Choose a built-in preset, a registered custom theme, or load any external CSS stylesheet.
        </p>

        <p style={{ margin: '0 0 0.5rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--hf-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Built-in Presets
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {builtinPresets.map((preset) => (
            <button key={preset} type="button" onClick={() => selectBuiltin(preset)}
              style={activeKey === preset ? activeCard : cardBase}>
              {presetLabels[preset]}
            </button>
          ))}
        </div>

        {customThemes.length > 0 && (
          <>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--hf-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Installed Themes
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {customThemes.map((theme) => (
                <button key={theme.key} type="button" onClick={() => selectCustom(theme)}
                  style={activeKey === 'custom:' + theme.key ? activeCard : cardBase}>
                  🎨 {theme.name}
                </button>
              ))}
            </div>
          </>
        )}

        {customThemes.length === 0 && (
          <div style={{ background: 'var(--hf-surface-alt)', border: '1px dashed var(--hf-border)', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--hf-muted)' }}>
            <strong>No custom themes installed yet.</strong> Place a CSS adapter in <code>public/themes/</code> and register it in <code>app/lib/theme-registry.ts</code>.
          </div>
        )}

        <form onSubmit={applyUrl}>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--hf-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            External CSS URL (Advanced)
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={cssUrl} onChange={(e) => setCssUrl(e.currentTarget.value)}
              placeholder="https://example.com/admin-theme.css"
              style={{ flex: 1, border: '1px solid var(--hf-border)', borderRadius: 8, padding: '8px 10px', fontSize: '0.88rem' }} />
            <button type="submit" style={{ border: 'none', borderRadius: 8, background: 'var(--hf-primary)', color: '#fff', padding: '8px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Apply URL
            </button>
            <button type="button"
              onClick={() => { setCssUrl(''); applyPortalTheme('ynex-light', ''); localStorage.removeItem('hf_custom_theme_key'); }}
              style={{ border: '1px solid var(--hf-border)', borderRadius: 8, background: 'transparent', color: 'var(--hf-foreground)', padding: '8px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
`;
}

function portalEmailAccountSettingsRoute(): string {
  return `import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';

type EmailSettings = {
  enabled: boolean;
  fromEmail: string;
  fromName: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
};

const defaults: EmailSettings = {
  enabled: false,
  fromEmail: '',
  fromName: 'HubForge Notifications',
  smtpHost: 'localhost',
  smtpPort: 1025,
  smtpSecure: false,
  smtpUser: '',
  smtpPass: '',
};

export default function EmailAccountSettingsPage() {
  const [settings, setSettings] = useState<EmailSettings>(defaults);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tenantId = localStorage.getItem('tenantId') ?? '';
    const token = localStorage.getItem('token') ?? '';
    fetch(API + '/v1/settings/email-account', {
      headers: { 'x-tenant-id': tenantId, authorization: 'Bearer ' + token },
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as Partial<EmailSettings>;
        setSettings({ ...defaults, ...data });
      })
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof EmailSettings>(key: K, value: EmailSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    const tenantId = localStorage.getItem('tenantId') ?? '';
    const token = localStorage.getItem('token') ?? '';
    const res = await fetch(API + '/v1/settings/email-account', {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'x-tenant-id': tenantId,
        authorization: 'Bearer ' + token,
      },
      body: JSON.stringify(settings),
    });
    setMessage(res.ok ? 'Saved email account settings.' : 'Failed to save settings.');
  }

  if (loading) return <p style={{ color: 'var(--hf-muted)' }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 760 }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.75rem', color: 'var(--hf-foreground)' }}>Email Account Settings</h2>
      <p style={{ color: 'var(--hf-muted)', marginTop: 0 }}>
        Configure SMTP credentials used for outbound email notifications.
      </p>

      <div style={{ background: 'var(--hf-surface)', border: '1px solid var(--hf-border)', borderRadius: 12, padding: '1rem', display: 'grid', gap: '0.75rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={settings.enabled} onChange={(e) => update('enabled', e.currentTarget.checked)} />
          Enable email delivery
        </label>

        <input value={settings.fromName} onChange={(e) => update('fromName', e.currentTarget.value)} placeholder="From name" style={inputStyle} />
        <input value={settings.fromEmail} onChange={(e) => update('fromEmail', e.currentTarget.value)} placeholder="From email" style={inputStyle} />
        <input value={settings.smtpHost} onChange={(e) => update('smtpHost', e.currentTarget.value)} placeholder="SMTP host" style={inputStyle} />
        <input value={String(settings.smtpPort)} onChange={(e) => update('smtpPort', Number(e.currentTarget.value) || 0)} placeholder="SMTP port" style={inputStyle} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={settings.smtpSecure} onChange={(e) => update('smtpSecure', e.currentTarget.checked)} />
          Use secure SMTP (TLS)
        </label>
        <input value={settings.smtpUser} onChange={(e) => update('smtpUser', e.currentTarget.value)} placeholder="SMTP username" style={inputStyle} />
        <input value={settings.smtpPass} onChange={(e) => update('smtpPass', e.currentTarget.value)} placeholder="SMTP password" type="password" style={inputStyle} />

        <button onClick={save} style={primaryButton}>Save Settings</button>
        {message && <p style={{ margin: 0, color: 'var(--hf-muted)' }}>{message}</p>}
      </div>
    </div>
  );
}

const inputStyle: CSSProperties = {
  border: '1px solid var(--hf-border)',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: '0.9rem',
  background: 'var(--hf-surface)',
  color: 'var(--hf-foreground)',
};

const primaryButton: CSSProperties = {
  border: 'none',
  borderRadius: 8,
  padding: '8px 14px',
  background: 'var(--hf-primary)',
  color: '#fff',
  cursor: 'pointer',
};
`;
}

function portalAuditLogRoute(): string {
  return `import { useLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';

const API = (import.meta as { env?: Record<string, string> }).env?.['VITE_API_URL'] ?? 'http://localhost:4000';

type AuditItem = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  traceId: string | null;
  createdAt: string;
};

export async function clientLoader({ request }: LoaderFunctionArgs) {
  const page = new URL(request.url).searchParams.get('page') ?? '1';
  const tenantId = typeof window !== 'undefined' ? (localStorage.getItem('tenantId') ?? '') : '';
  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') ?? '') : '';

  try {
    const res = await fetch(API + '/v1/audit-log?page=' + page + '&limit=30', {
      headers: { 'x-tenant-id': tenantId, authorization: 'Bearer ' + token },
    });
    if (!res.ok) {
      return { items: [], total: 0, page: 1, limit: 30, error: 'API ' + res.status };
    }
    const data = (await res.json()) as { items: AuditItem[]; total: number; page: number; limit: number };
    return { ...data, error: null };
  } catch {
    return { items: [], total: 0, page: 1, limit: 30, error: 'API unavailable' };
  }
}

export default function AuditLogPage() {
  const { items, error } = useLoaderData<typeof clientLoader>();

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--hf-foreground)' }}>Audit Log</h2>
      {error && <p style={{ color: '#dc2626', marginTop: 0 }}>⚠️ {error}</p>}
      <div style={{ background: 'var(--hf-surface)', border: '1px solid var(--hf-border)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--hf-surface-alt)' }}>
            <tr>
              {['Time', 'Action', 'Entity', 'Trace'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: '0.75rem', color: 'var(--hf-muted)', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={4} style={{ padding: '1.25rem', color: 'var(--hf-muted)' }}>No audit events found.</td></tr>
            )}
            {items.map((row) => (
              <tr key={row.id} style={{ borderTop: '1px solid var(--hf-border)' }}>
                <td style={{ padding: '10px 14px', fontSize: '0.82rem' }}>{new Date(row.createdAt).toLocaleString()}</td>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>{row.action}</td>
                <td style={{ padding: '10px 14px' }}>{row.entityType}{row.entityId ? ':' + row.entityId : ''}</td>
                <td style={{ padding: '10px 14px', color: 'var(--hf-muted)', fontFamily: 'monospace' }}>{row.traceId ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`;
}

function portalNotFoundRoute(): string {
  return `import { Link, isRouteErrorResponse, useRouteError } from 'react-router';

export default function NotFoundRoute() {
  const err = useRouteError();
  const status = isRouteErrorResponse(err) ? err.status : 404;

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--hf-surface-alt)', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 640, borderRadius: 18, border: '1px solid var(--hf-border)', background: 'var(--hf-surface)', padding: '2rem' }}>
        <p style={{ margin: 0, color: 'var(--hf-primary)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.8rem' }}>HubForge</p>
        <h1 style={{ margin: '0.5rem 0 0.25rem', fontSize: '2rem', color: 'var(--hf-foreground)' }}>{status === 404 ? 'Page not found' : 'Something went wrong'}</h1>
        <p style={{ margin: '0 0 1.25rem', color: 'var(--hf-muted)' }}>
          The page you requested does not exist or may have been moved.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/dashboard" style={{ textDecoration: 'none', borderRadius: 10, padding: '8px 14px', background: 'var(--hf-primary)', color: '#fff' }}>Go to dashboard</Link>
          <Link to="/settings" style={{ textDecoration: 'none', borderRadius: 10, padding: '8px 14px', border: '1px solid var(--hf-border)', color: 'var(--hf-foreground)' }}>Open settings</Link>
          <Link to="/docs" style={{ textDecoration: 'none', borderRadius: 10, padding: '8px 14px', border: '1px solid var(--hf-border)', color: 'var(--hf-foreground)' }}>API docs</Link>
        </div>
      </div>
    </div>
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

