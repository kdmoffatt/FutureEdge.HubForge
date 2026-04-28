# Feature: Email and Auth Server Settings

## Purpose and Scope

This feature manages outbound email configuration and tenant-level external auth server metadata.

## Installation via CLI

- Email account settings are in full baseline.
- Auth server settings are available when generated with auth server support or enabled via:
  - `hubforge authserver enable --target <path> [--force]`

## API Endpoints

Email:

- `GET /v1/settings/email-account`
- `PUT /v1/settings/email-account`

Auth server:

- `GET /v1/settings/auth-server`
- `PUT /v1/settings/auth-server`

## Portal UI

Settings pages include Email Account and Auth Server forms.

## Configuration

Email:

- SMTP host/port/secure/user/pass
- fromEmail, fromName, enabled

Auth server:

- enabled, provider, issuerUrl, jwksUrl, clientId, clientSecret, audience

## Extension Points

- Add encrypted secret storage for client secrets
- Add provider-specific validation and discovery helpers

## Known Limitations

- Email account settings baseline uses file-backed storage in generated API; production deployments should move this to database-backed secure storage.
