# Feature: Notifications

## Purpose and Scope

Notifications provides template-driven email and push delivery with provider abstraction and delivery logging.

## Installation via CLI

Baseline route exists in full pack. Additional notification module scaffolding:

- `hubforge feature add notifications --type notifications-module`

## Database Schema

Models:

- `NotificationTemplate`
- `NotificationDelivery`

## API Endpoints

Templates:

- `GET /v1/notifications/templates`
- `PUT /v1/notifications/templates/:key`
- `DELETE /v1/notifications/templates/:id`

Deliveries:

- `GET /v1/notifications/deliveries`

Dispatch:

- `POST /v1/notifications/send`
- `POST /v1/notifications/push`
- `POST /v1/notifications/email`

## Portal UI

Portal notifications page supports template editing, test send, and delivery log inspection.

## Settings and Configuration

Important env keys:

- `NOTIFICATION_PROVIDER`
- `NOTIFICATION_EMAIL_PROVIDER`
- `FIREBASE_PROJECT_ID`
- SMTP variables

Typical Setting keys:

- `notifications.emailEnabled`

## Seeding

Seed includes default notification enablement patterns per tenant.

## Extension Points

- Add provider adapters in `apps/api/src/lib/notifications.ts`
- Add new channels by extending dispatch input contracts

## Known Limitations

- Baseline unread/read UX for user inbox is not fully implemented
