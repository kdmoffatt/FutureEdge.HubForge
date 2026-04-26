# HubForge Agent Prompt – FieldOps WorkHub Sample Application

## Purpose

Use this prompt with an AI coding agent to continue development of **HubForge**, an AI-first TypeScript SaaS scaffolding framework that uses Vite, React Router, Hono, Prisma, pnpm, Turborepo, FastAPI, and custom `hubforge` CLI commands.

The goal is to improve the framework by forcing it to generate a complete real-world production-style application that exercises all major framework features.

---

# Full Agent Prompt

You are working on the **HubForge** framework.

HubForge is an AI-first, opinionated, full-stack SaaS scaffolding framework and CLI for TypeScript monorepos. It is intended to merge the best developer experience ideas from frameworks like **Laravel** and **ABP**, while using a modern TypeScript stack.

The framework should scaffold production-ready standalone applications. Generated applications must not depend on HubForge at runtime. Once generated, the app belongs fully to the developer.

## Current HubForge Stack

HubForge currently uses or targets the following stack:

- TypeScript
- Node.js
- pnpm workspaces
- Turborepo
- Vite
- React Router v7 SSR
- Tailwind CSS
- Hono API
- Prisma ORM
- PostgreSQL / SQLite / MySQL / SQL Server support
- Local authentication
- External OIDC authentication
- Zitadel / Auth0 / Keycloak provider support
- FastAPI AI service
- BullMQ / Redis background jobs
- NATS event/messaging baseline
- Firebase notification baseline
- Stripe billing baseline
- Docker Compose infrastructure baseline
- Vitest
- Playwright
- GitHub Actions CI/CD

---

# Core Objective

Extend HubForge so it can generate and validate a real-world sample application called:

## FieldOps WorkHub

**FieldOps WorkHub** is a multi-tenant field service management SaaS platform for companies that manage:

- Customers
- Customer contacts
- Technicians
- Technician skills
- Jobs / work orders
- Appointments
- Dispatch board
- Service contracts
- Inventory
- Invoices
- Payments
- Notifications
- AI scheduling recommendations
- Operational dashboards
- Audit logs
- Tenant settings
- User and role management

This application should be used as the official HubForge smoke-test and framework validation sample because it naturally exercises:

- Public site generation
- Authenticated portal generation
- API resource generation
- Tenant module generation
- Local auth
- External OIDC auth
- Multi-tenancy
- RBAC
- CRUD
- Billing
- Notifications
- Background jobs
- Workflows
- Domain events
- AI service integration
- Audit logging
- Reporting dashboards
- E2E testing
- Dev infrastructure

---

# Important Directory Requirement

The sample application must be generated **one directory level above the HubForge framework project directory**, not inside the framework repository.

Assume the developer is currently inside the HubForge framework repository root.

Example current directory:

```bash
C:\Users\kmoffatt\source\repos\FutureEdgePro\FutureEdge.HubForge
```

The generated sample app should be created here:

```bash
C:\Users\kmoffatt\source\repos\FutureEdgePro\fieldops-workhub
```

Use relative paths like:

```bash
../fieldops-workhub
../fieldops-workhub-local
../fieldops-workhub-cloud
```

Do not generate sample apps inside:

```bash
./fieldops-workhub
./_samples/fieldops-workhub
```

unless explicitly instructed later.

---

# Docker Constraint

The developer is **not currently running Docker**.

Do not assume Docker is available for local development.

The generated app must be able to run in dev mode using locally installed services.

Where external services are required, document what must be installed locally and how to configure it.

## Local Development Service Requirements

For the local SQLite profile:

```bash
pnpm hubforge init ../fieldops-workhub-local --template full-local --db sqlite --tenant shared --auth local --ai fastapi
```

This should require minimal infrastructure.

Expected local requirements:

- Node.js 20+
- pnpm 10+
- Python 3.11+
- SQLite support through Prisma
- Optional Redis only if background jobs are enabled in local mode

For the PostgreSQL cloud-style profile:

```bash
pnpm hubforge init ../fieldops-workhub-cloud --template full-cloud --db postgres --tenant isolated --auth external --auth-provider zitadel --ai fastapi
```

Document local requirements:

- Node.js 20+
- pnpm 10+
- Python 3.11+
- PostgreSQL 16+
- Redis 7+
- Optional NATS
- Optional MinIO or local filesystem storage
- Optional SMTP test server such as Mailpit
- Optional Zitadel, Auth0, Keycloak, or custom OIDC provider

If Docker is not available, provide local install guidance for:

- PostgreSQL
- Redis
- Python virtual environment
- optional NATS
- optional MinIO alternative

Do not block the local SQLite development path on Docker.

---

# Required CLI Enhancements

## 1. Add `hubforge sample`

The command should scaffold a complete sample app and apply all needed feature generators.

If the full `sample` command is too large for the first pass, create a documented script in the framework repository:

```bash
scripts/create-fieldops-sample.ps1
scripts/create-fieldops-sample.sh
```

The script must generate the sample app one level above the framework directory.

Example:

```bash
pnpm hubforge init ../fieldops-workhub-local --template full-local --db sqlite --tenant shared --auth local --ai fastapi

pnpm hubforge feature add marketing-site --type public-page --target ../fieldops-workhub-local
pnpm hubforge feature add auth --type auth-flow --target ../fieldops-workhub-local
pnpm hubforge feature add billing --type billing-module --target ../fieldops-workhub-local
pnpm hubforge feature add notifications --type notifications-module --target ../fieldops-workhub-local
pnpm hubforge feature add customers --type api-resource --target ../fieldops-workhub-local
pnpm hubforge feature add customer-contacts --type api-resource --target ../fieldops-workhub-local
pnpm hubforge feature add technicians --type api-resource --target ../fieldops-workhub-local
pnpm hubforge feature add technician-skills --type api-resource --target ../fieldops-workhub-local
pnpm hubforge feature add jobs --type api-resource --target ../fieldops-workhub-local
pnpm hubforge feature add appointments --type api-resource --target ../fieldops-workhub-local
pnpm hubforge feature add service-contracts --type api-resource --target ../fieldops-workhub-local
pnpm hubforge feature add invoices --type api-resource --target ../fieldops-workhub-local
pnpm hubforge feature add payments --type api-resource --target ../fieldops-workhub-local
pnpm hubforge feature add inventory --type tenant-module --target ../fieldops-workhub-local
pnpm hubforge feature add dispatch-board --type tenant-module --target ../fieldops-workhub-local
pnpm hubforge feature add customer-portal --type tenant-module --target ../fieldops-workhub-local
pnpm hubforge feature add audit-log --type tenant-module --target ../fieldops-workhub-local
pnpm hubforge feature add reporting-dashboard --type tenant-module --target ../fieldops-workhub-local
pnpm hubforge feature add ai-scheduler --type ai-agent --target ../fieldops-workhub-local
pnpm hubforge feature add notification-worker --type worker --target ../fieldops-workhub-local
```

---

# Required New or Improved Generators

## 1. Admin Resource Generator

Add a new feature type:

```bash
hubforge feature add customers --type admin-resource --target ../fieldops-workhub-local
```

The admin resource generator should create a complete vertical slice:

### Backend

- Prisma model or migration stub
- Zod schemas
- Hono API routes
- CRUD handlers
- tenant scoping
- auth middleware
- permission checks
- validation
- pagination
- sorting
- filtering
- soft-delete support if applicable
- audit log hooks
- tests

### Frontend Portal

- List page
- Create page
- Edit page
- Detail page
- Delete confirmation
- Search box
- Filter controls
- Sort controls
- Pagination controls
- Loading state
- Error state
- Empty state
- API client integration
- Form validation

### Shared Packages

- API client functions
- DTO types
- module registration metadata
- permissions metadata

Generated files must be strict TypeScript friendly.

---

## 2. RBAC / Permissions Generator

Add a permissions module if not already present.

Required roles:

- Owner
- Admin
- Dispatcher
- Technician
- Billing Manager
- Read-only Auditor

Required permission format:

```text
module.action
```

Examples:

```text
customers.read
customers.write
customers.delete
jobs.read
jobs.write
jobs.assign
jobs.complete
technicians.read
technicians.write
appointments.read
appointments.write
billing.read
billing.manage
settings.manage
audit.read
reports.read
ai.scheduler.use
```

RBAC must support:

- Tenant-level roles
- User-to-tenant membership
- Permission checking middleware
- Portal-side visibility rules
- Seeded default role-permission mappings
- Tests for permission checks

---

## 3. Audit Log Module

Add or improve an audit log scaffold.

Audit log should capture:

- Tenant ID
- Actor user ID
- Action
- Entity type
- Entity ID
- Before values, where practical
- After values, where practical
- Request ID / trace ID
- IP address, where available
- User agent, where available
- Timestamp

Audit events should be generated for:

- create/update/delete operations
- login/logout
- billing changes
- job assignment
- job completion
- notification sent/failed
- AI recommendation accepted
- AI recommendation rejected
- permission/role changes

---

## 4. File Attachment Module

Add support for tenant-aware file attachment scaffolding.

The file module should support:

- File metadata table
- Linked entity type
- Linked entity ID
- Tenant ID
- Uploaded by user ID
- Storage provider abstraction
- Local filesystem provider for dev
- MinIO/S3-compatible provider for production
- File size
- MIME type
- Original filename
- Stored filename/key
- Virus scan status placeholder
- Permission checks

Local development must work without Docker using local filesystem storage.

---

## 5. Workflow Module

Add workflow templates for FieldOps WorkHub.

Workflows:

- Job created
- Technician assigned
- Appointment scheduled
- Appointment reminder sent
- Job completed
- Invoice generated
- Payment received
- Notification failed and retried
- AI scheduling recommendation accepted
- AI scheduling recommendation rejected

Each workflow should be event-driven where possible.

---

## 6. Reporting / Dashboard Generator

Add a reporting dashboard module.

Required widgets:

- Open jobs
- Overdue jobs
- Jobs completed today
- Monthly revenue
- Technician utilization
- Failed notifications
- Upcoming appointments
- New customers this month
- Outstanding invoices
- Service contract renewals

The generated dashboard should include:

- API endpoints for summary data
- Portal dashboard cards
- Chart-ready response DTOs
- Date range filtering
- Tenant scoping

---

## 7. Seed Data Generator

Add sample seed support for common tables example users, permissions, roles, etc.

Suggested command:

```bash
hubforge db seed fieldops-workhub --target ../fieldops-workhub-local
```

Seed data should include:

- 2 tenants
- 3 branches per tenant
- 10 users
- 25 customers
- 40 customer contacts
- 15 technicians
- technician skills
- 50 jobs
- 30 appointments
- sample inventory items
- sample service contracts
- sample invoices
- sample payments
- sample notifications
- sample audit logs

The seed should work for SQLite local mode and PostgreSQL mode.

---

# FieldOps WorkHub Domain Model

Create or scaffold the following domain model.

## Tenant / Organization

- Organization
- Environment
- Branch
- Membership
- Role
- Permission
- User

## Customer Management

- Customer
- CustomerContact
- CustomerAddress
- CustomerNote

## Technician Management

- Technician
- TechnicianSkill
- TechnicianAvailability
- TechnicianAssignment

## Job Management

- Job
- JobStatus
- JobPriority
- JobType
- JobNote
- JobAttachment
- JobAssignment

Suggested job statuses:

- Draft
- New
- Scheduled
- Assigned
- InProgress
- WaitingOnCustomer
- Completed
- Cancelled
- Invoiced
- Paid

Suggested job priorities:

- Low
- Normal
- High
- Urgent

## Scheduling

- Appointment
- AppointmentReminder
- DispatchBoardView
- ScheduleSlot

## Billing

- ServiceContract
- Subscription
- Invoice
- InvoiceLine
- Payment
- PaymentMethod

## Inventory

- InventoryItem
- InventoryLocation
- StockMovement
- JobInventoryUsage

## Notifications

- NotificationTemplate
- NotificationPreference
- NotificationDelivery
- DeviceToken

## AI

- AiSchedulingRequest
- AiSchedulingRecommendation
- AiDecisionLog

## Audit

- AuditLog

---

# Public Site Requirements

Generate public pages for:

- Landing page
- Features page
- Pricing page
- Contact sales page
- Login/register call-to-action

Landing page should clearly describe FieldOps WorkHub as a field service SaaS platform.

---

# Portal Requirements

Generate authenticated portal pages for:

- Dashboard
- Customers
- Customer detail
- Customer create/edit
- Jobs
- Job detail
- Job create/edit
- Technicians
- Technician detail
- Technician create/edit
- Appointment calendar/list
- Dispatch board
- Inventory
- Service contracts
- Invoices
- Payments
- Billing/subscription management
- Notification preferences
- AI scheduling assistant
- Reports
- Audit log
- Tenant settings
- User/role management

Portal UI should be clean, production-style, and usable for testing.

---

# AI Scheduler Requirements

Create an AI scheduling assistant module.

The AI module should accept:

- Job type
- Job priority
- Customer location
- Required skills
- Preferred date/time
- Technician availability
- Technician skill match
- Existing schedule
- Travel distance placeholder
- SLA deadline

The AI module should return:

- Recommended technician
- Recommended appointment slot
- Confidence score
- Explanation
- Alternative recommendations
- Risks or conflicts

The dispatcher must be able to:

- Accept recommendation
- Reject recommendation
- Override recommendation
- Assign manually

Accepted or rejected recommendations must:

- Create audit log entry
- Publish domain event
- Trigger notification workflow where applicable

For local development, the AI scheduler should support mock mode without requiring a paid AI API.

---

# Authentication Requirements

Generated sample apps must support both:

## Local Auth

```bash
pnpm hubforge init ../fieldops-workhub-local --template full-local --db sqlite --tenant shared --auth local --ai fastapi
```

This should generate a local username/password or dev-token flow that can be tested without an external identity provider.

## External Auth

```bash
pnpm hubforge init ../fieldops-workhub-cloud --template full-cloud --db postgres --tenant isolated --auth external --auth-provider zitadel --ai fastapi
```

This should generate OIDC-ready configuration using environment variables.

Generated projects must remain configurable post-install via env files.

---

# Local Development Without Docker

Because Docker is not currently running, make sure the generated app can run locally using installed services.

## SQLite Local Mode

This mode should work with only:

- Node.js 20+
- pnpm 10+
- Python 3.11+

Suggested commands:

```bash
pnpm hubforge init ../fieldops-workhub-local --template full-local --db sqlite --tenant shared --auth local --ai fastapi
cd ../fieldops-workhub-local
pnpm install
pnpm typecheck
pnpm dev
```

If Redis is required for workers, support one of these:

1. Disable background workers in local mode by default.
2. Use in-memory queue fallback.
3. Clearly document Redis installation.

## PostgreSQL Local Mode

If testing the cloud profile locally without Docker, document requirements:

### Windows

Install:

- PostgreSQL 16+
- Redis for Windows alternative, Memurai, WSL Redis, or another supported Redis-compatible service
- Python 3.11+
- pnpm 10+

### Linux / WSL

Install:

```bash
sudo apt update
sudo apt install postgresql redis-server python3.11 python3.11-venv
```

### macOS

Install:

```bash
brew install postgresql@16 redis python@3.11
```

Document required environment variables:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fieldops_workhub
SHADOW_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fieldops_workhub_shadow
REDIS_URL=redis://localhost:6379
AUTH_MODE=local
LOCAL_AUTH_SECRET=change-me
AI_SERVICE_URL=http://localhost:5000
```

Do not require Docker to run the local SQLite sample.

---

# Validation Requirements

After implementation, run from the HubForge framework root:

```bash
pnpm hubforge:build
pnpm typecheck
```

Generate local sample one level above the framework directory:

```bash
pnpm hubforge init ../fieldops-workhub-local --template full-local --db sqlite --tenant shared --auth local --ai fastapi
```

Apply feature generators:

```bash
pnpm hubforge feature add marketing-site --type public-page --target ../fieldops-workhub-local
pnpm hubforge feature add auth --type auth-flow --target ../fieldops-workhub-local
pnpm hubforge feature add billing --type billing-module --target ../fieldops-workhub-local
pnpm hubforge feature add notifications --type notifications-module --target ../fieldops-workhub-local
pnpm hubforge feature add customers --type api-resource --target ../fieldops-workhub-local
pnpm hubforge feature add jobs --type api-resource --target ../fieldops-workhub-local
pnpm hubforge feature add technicians --type api-resource --target ../fieldops-workhub-local
pnpm hubforge feature add appointments --type api-resource --target ../fieldops-workhub-local
pnpm hubforge feature add ai-scheduler --type ai-agent --target ../fieldops-workhub-local
```

Then validate generated app:

```bash
cd ../fieldops-workhub-local
pnpm install
pnpm typecheck
pnpm test
pnpm test:e2e
```

Also test cloud-style sample if local PostgreSQL and Redis are installed:

```bash
cd ../FutureEdge.HubForge
pnpm hubforge init ../fieldops-workhub-cloud --template full-cloud --db postgres --tenant isolated --auth external --auth-provider zitadel --ai fastapi
cd ../fieldops-workhub-cloud
pnpm install
pnpm typecheck
```

---

# Documentation Requirements

After every implementation change, update:

```text
readme/Modification-References.md
readme/HubForge-Feature-Todos.md
```

Update this file if CLI commands or generated output changes:

```text
readme/CLI-Instructions.md
```

Each modification reference entry should include:

- What changed
- Why it changed
- Files changed
- Validation commands run
- Validation results
- Known issues

---

# Expected Final Agent Output

At the end of the implementation session, report:

1. Summary of framework changes.
2. New or updated CLI commands.
3. Generated sample application path.
4. Local dev requirements.
5. Whether Docker is required.
6. Files changed.
7. Generated modules.
8. Validation commands run.
9. Validation results.
10. Known limitations.
11. Remaining backlog items.

---

# Implementation Priorities

Work in this order:

1. Confirm current CLI builds.
2. Add missing feature types only if required.
3. Improve existing generators before creating redundant new ones.
4. Add sample app generation flow.
5. Ensure sample app is generated one directory above framework root.
6. Ensure local SQLite app works without Docker.
7. Add local service documentation for PostgreSQL / Redis mode.
8. Add seed data if practical.
9. Run validation.
10. Update documentation.

---

# Important Quality Rules

- Do not create empty placeholder files unless clearly documented as extension points.
- Prefer working baseline scaffolds.
- Keep generated code strict TypeScript compatible.
- Keep generated apps standalone.
- Avoid hidden runtime dependency on HubForge.
- Make local dev easy.
- Do not assume Docker is running.
- Use relative target path `../fieldops-workhub-local` for sample app generation.
- Keep documentation concise but complete.
