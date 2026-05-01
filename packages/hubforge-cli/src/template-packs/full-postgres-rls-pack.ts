import path from 'node:path';
import { writeTextFile } from '../lib/fs.js';
import { scaffoldFullTemplatePack } from './full-pack.js';
import type { InitScaffoldOptions } from './types.js';

export async function scaffoldFullPostgresRlsTemplatePack(
  targetDir: string,
  options: InitScaffoldOptions,
): Promise<void> {
  await scaffoldFullTemplatePack(targetDir, options);

  await writeTextFile(
    path.join(targetDir, 'packages', 'db', 'drizzle', 'rls.sql'),
    postgresRlsMigrationSql(),
  );

  await writeTextFile(
    path.join(targetDir, 'packages', 'db', 'src', 'fieldops.ts'),
    fieldopsSchemaTs(),
  );

  await writeTextFile(
    path.join(targetDir, 'packages', 'db', 'drizzle', 'rls-fieldops.sql'),
    fieldopsRlsSql(),
  );

  await writeTextFile(path.join(targetDir, 'packages', 'events', 'package.json'), eventsPackageJson());
  await writeTextFile(path.join(targetDir, 'packages', 'events', 'tsconfig.json'), packageTsConfig());
  await writeTextFile(path.join(targetDir, 'packages', 'events', 'src', 'index.ts'), eventsIndexTs());

  await writeTextFile(path.join(targetDir, 'packages', 'workflows', 'package.json'), workflowsPackageJson());
  await writeTextFile(path.join(targetDir, 'packages', 'workflows', 'tsconfig.json'), packageTsConfig());
  await writeTextFile(path.join(targetDir, 'packages', 'workflows', 'src', 'index.ts'), workflowsIndexTs());
  await writeTextFile(path.join(targetDir, 'packages', 'workflows', 'src', 'modules.ts'), workflowsModulesRegistryTs());

  await writeTextFile(path.join(targetDir, 'README.md'), readmeWithRlsNotice(options.projectName));
}

function packageTsConfig(): string {
  return `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "..",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src", "../modules/*/src"]
}
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

export const tenantProvisionedEvent = z.object({
  kind: z.literal('tenant.v1.provisioned'),
  tenantId: z.string(),
  environment: z.string(),
  ts: z.number(),
});

export type TenantProvisionedEvent = z.infer<typeof tenantProvisionedEvent>;
`;
}

function workflowsPackageJson(): string {
  const pkg = {
    name: '@hubforge/workflows',
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
      '@hubforge/events': 'workspace:*',
    },
    devDependencies: {
      typescript: '^5.4.0',
    },
  };

  return `${JSON.stringify(pkg, null, 2)}\n`;
}

function workflowsIndexTs(): string {
  return `export * from './modules.js';

export function createTenantProvisioningWorkflow(): string[] {
  return [
    'validate-tenant-input',
    'create-tenant-record',
    'apply-tenant-rls-policies',
    'publish-tenant-provisioned-event',
  ];
}
`;
}

function workflowsModulesRegistryTs(): string {
  return `export type TenantModule = {
  id: string;
  name: string;
  route: string;
  tenantScoped?: boolean;
};

export const tenantModules: TenantModule[] = [];
`;
}

function postgresRlsMigrationSql(): string {
  return `-- HubForge Postgres RLS — applied after Drizzle migrations
-- This file is applied by packages/db/scripts/migrate.ts via client.unsafe()

-- Helper function reads app.current_tenant_id session variable (set per-request by API middleware)
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS text LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.current_tenant_id', true), '')::text
$$;

-- Framework tables
ALTER TABLE tenant ENABLE ROW LEVEL SECURITY;
ALTER TABLE environment ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE setting ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_delivery ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_job ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON tenant USING (id = current_tenant_id());
CREATE POLICY tenant_isolation ON environment USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation ON membership USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation ON audit_log USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation ON setting
  USING (tenant_id = current_tenant_id() OR tenant_id IS NULL);
CREATE POLICY tenant_isolation ON notification_template USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation ON notification_delivery USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation ON log_entry USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation ON job_schedule USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation ON background_job USING (tenant_id = current_tenant_id());
`;
}

function fieldopsSchemaTs(): string {
  return `import { pgTable, text, boolean, timestamp, doublePrecision, integer, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { tenants } from './schema.js';

const now = () => new Date();
const genId = () => crypto.randomUUID();

// ── Customers ──────────────────────────────────────────────────────────────────
export const foCustomers = pgTable('fo_customer', {
  id: text('id').primaryKey().$defaultFn(genId),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  isActive: boolean('is_active').notNull().default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'date' }).$defaultFn(now).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).$defaultFn(now).notNull(),
}, (t) => [
  index('fo_customer_tenant_idx').on(t.tenantId),
]);

// ── Service Types ──────────────────────────────────────────────────────────────
export const foServiceTypes = pgTable('fo_service_type', {
  id: text('id').primaryKey().$defaultFn(genId),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  defaultDurationMinutes: integer('default_duration_minutes'),
  basePrice: doublePrecision('base_price'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date' }).$defaultFn(now).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).$defaultFn(now).notNull(),
}, (t) => [
  index('fo_service_type_tenant_idx').on(t.tenantId),
  uniqueIndex('fo_service_type_tenant_name_idx').on(t.tenantId, t.name),
]);

// ── Field Technicians ──────────────────────────────────────────────────────────
export const foFieldTechnicians = pgTable('fo_field_technician', {
  id: text('id').primaryKey().$defaultFn(genId),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date' }).$defaultFn(now).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).$defaultFn(now).notNull(),
}, (t) => [
  index('fo_tech_tenant_idx').on(t.tenantId),
]);

// ── Work Orders ────────────────────────────────────────────────────────────────
export const foWorkOrders = pgTable('fo_work_order', {
  id: text('id').primaryKey().$defaultFn(genId),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  orderNumber: text('order_number').notNull(),
  customerId: text('customer_id').references(() => foCustomers.id, { onDelete: 'set null' }),
  serviceTypeId: text('service_type_id').references(() => foServiceTypes.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('draft'),
  priority: text('priority').notNull().default('medium'),
  scheduledStart: timestamp('scheduled_start', { mode: 'date' }),
  scheduledEnd: timestamp('scheduled_end', { mode: 'date' }),
  actualStart: timestamp('actual_start', { mode: 'date' }),
  completedAt: timestamp('completed_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).$defaultFn(now).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).$defaultFn(now).notNull(),
}, (t) => [
  uniqueIndex('fo_wo_tenant_number_idx').on(t.tenantId, t.orderNumber),
  index('fo_wo_tenant_status_idx').on(t.tenantId, t.status),
  index('fo_wo_tenant_customer_idx').on(t.tenantId, t.customerId),
]);

export const foWorkOrderLines = pgTable('fo_work_order_line', {
  id: text('id').primaryKey().$defaultFn(genId),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  workOrderId: text('work_order_id').notNull().references(() => foWorkOrders.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  quantity: doublePrecision('quantity').notNull().default(1),
  unitPrice: doublePrecision('unit_price').notNull().default(0),
  total: doublePrecision('total').notNull().default(0),
  createdAt: timestamp('created_at', { mode: 'date' }).$defaultFn(now).notNull(),
}, (t) => [index('fo_wo_line_wo_idx').on(t.workOrderId)]);

export const foWorkOrderNotes = pgTable('fo_work_order_note', {
  id: text('id').primaryKey().$defaultFn(genId),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  workOrderId: text('work_order_id').notNull().references(() => foWorkOrders.id, { onDelete: 'cascade' }),
  body: text('body').notNull(),
  noteType: text('note_type').notNull().default('internal'),
  createdAt: timestamp('created_at', { mode: 'date' }).$defaultFn(now).notNull(),
}, (t) => [index('fo_wo_note_wo_idx').on(t.workOrderId)]);

// ── Dispatch ───────────────────────────────────────────────────────────────────
export const foDispatchAssignments = pgTable('fo_dispatch_assignment', {
  id: text('id').primaryKey().$defaultFn(genId),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  workOrderId: text('work_order_id').notNull().references(() => foWorkOrders.id, { onDelete: 'cascade' }),
  techId: text('tech_id').notNull().references(() => foFieldTechnicians.id, { onDelete: 'restrict' }),
  status: text('status').notNull().default('assigned'),
  scheduledStart: timestamp('scheduled_start', { mode: 'date' }),
  scheduledEnd: timestamp('scheduled_end', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).$defaultFn(now).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).$defaultFn(now).notNull(),
}, (t) => [
  uniqueIndex('fo_dispatch_wo_tech_idx').on(t.workOrderId, t.techId),
  index('fo_dispatch_tenant_tech_idx').on(t.tenantId, t.techId),
]);

// ── Invoices ───────────────────────────────────────────────────────────────────
export const foInvoices = pgTable('fo_invoice', {
  id: text('id').primaryKey().$defaultFn(genId),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  workOrderId: text('work_order_id').references(() => foWorkOrders.id, { onDelete: 'set null' }),
  customerId: text('customer_id').references(() => foCustomers.id, { onDelete: 'set null' }),
  invoiceNumber: text('invoice_number').notNull(),
  status: text('status').notNull().default('draft'),
  subtotal: doublePrecision('subtotal').notNull().default(0),
  taxAmount: doublePrecision('tax_amount').notNull().default(0),
  total: doublePrecision('total').notNull().default(0),
  dueDate: timestamp('due_date', { mode: 'date' }),
  paidAt: timestamp('paid_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).$defaultFn(now).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).$defaultFn(now).notNull(),
}, (t) => [
  index('fo_invoice_tenant_idx').on(t.tenantId),
  uniqueIndex('fo_invoice_tenant_number_idx').on(t.tenantId, t.invoiceNumber),
]);
`;
}

function fieldopsRlsSql(): string {
  return `-- FieldOps domain table RLS policies (append to main rls.sql)
ALTER TABLE fo_customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE fo_service_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE fo_field_technician ENABLE ROW LEVEL SECURITY;
ALTER TABLE fo_work_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE fo_work_order_line ENABLE ROW LEVEL SECURITY;
ALTER TABLE fo_work_order_note ENABLE ROW LEVEL SECURITY;
ALTER TABLE fo_dispatch_assignment ENABLE ROW LEVEL SECURITY;
ALTER TABLE fo_invoice ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON fo_customer USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation ON fo_service_type USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation ON fo_field_technician USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation ON fo_work_order USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation ON fo_work_order_line USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation ON fo_work_order_note USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation ON fo_dispatch_assignment USING (tenant_id = current_tenant_id());
CREATE POLICY tenant_isolation ON fo_invoice USING (tenant_id = current_tenant_id());
`;
}

function readmeWithRlsNotice(projectName: string): string {
  return `# ${projectName}

Generated by HubForge CLI using the **full-postgres-rls** template pack.

## Stack

- **API**: Hono v4, TypeScript, tenant-aware middleware
- **Portal**: React Router v7 (SSR), authenticated app shell
- **Public UI**: React Router v7
- **DB**: Drizzle ORM + PostgreSQL 16 with Row-Level Security
- **Infra**: Docker Compose (Postgres, Redis, NATS, MinIO)
- **Events**: Zod event schemas (\`@hubforge/events\`)
- **Workflows**: Tenant provisioning workflows (\`@hubforge/workflows\`)

## Database

This project uses **Drizzle ORM** (not Prisma).

- Schema: \`packages/db/src/schema.ts\` (framework tables)
- Domain schema: \`packages/db/src/fieldops.ts\` (domain tables with \`fo_\` prefix)
- Config: \`packages/db/drizzle.config.ts\`
- Migrations: \`packages/db/drizzle/\` (generated by \`pnpm db:generate\`)
- RLS: \`packages/db/drizzle/rls.sql\` (applied after migrations by migrate script)

## Row-Level Security

Every tenant-scoped table has an RLS policy using \`current_tenant_id()\`:

\`\`\`sql
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS text ...
  SELECT NULLIF(current_setting('app.current_tenant_id', true), '')::text
\`\`\`

The API middleware sets this per-request:
\`\`\`typescript
await db.execute(sql\`SELECT set_config('app.current_tenant_id', \${tenantId}, true)\`);
\`\`\`

## Getting started

\`\`\`bash
# Start infrastructure
docker compose -f infra/compose/docker-compose.yml up -d

# Install dependencies
pnpm install

# Generate and run migrations
pnpm db:generate
pnpm db:migrate

# Start development
pnpm dev
\`\`\`

## Adding domain modules

\`\`\`bash
# Scaffold a new Drizzle-backed domain resource
hubforge feature add my-resource --type domain-resource
\`\`\`

This generates: DB table in \`fieldops.ts\`, Hono API routes using Drizzle, portal list/detail/new pages.
`;
}