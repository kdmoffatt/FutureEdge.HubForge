# Feature: Billing

## Purpose and Scope

Billing integrates Stripe lifecycle events with local mock fallback for development.

## Installation via CLI

Baseline billing route exists in full pack. Additional scaffold option:

- `hubforge feature add billing --type billing-module`

## Database Schema

Models:

- `BillingCustomer`
- `BillingSubscription`
- `BillingEvent`

## API Endpoints

- `GET /v1/billing/config`
- `GET /v1/billing/subscriptions`
- `POST /v1/billing/subscriptions/mock`
- `POST /v1/billing/webhooks/stripe`

## Portal UI

Billing pages surface subscription and lifecycle visibility.

## Settings and Configuration

- `BILLING_PROVIDER`
- `BILLING_CURRENCY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Seeding

Mock subscriptions can be seeded or created via mock endpoint.

## Extension Points

- Add provider abstraction layers for non-Stripe gateways
- Add portal workflows for upgrade/downgrade and invoice views

## Known Limitations

- Stripe checkout session orchestration is outside baseline scaffold
