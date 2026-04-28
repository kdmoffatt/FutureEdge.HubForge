# Feature: AI Assistant and Scheduler

## Purpose and Scope

AI assistant provides tenant-aware chat and scheduling recommendations with OpenAI/Azure support and deterministic mock fallback.

## Installation via CLI

Baseline AI assistant and scheduler endpoints are included in full pack.

## Database and Authorization

RBAC permissions:

- `ai-assistant:read`
- `ai-assistant:invoke`

## API Endpoints

- `GET /v1/ai-assistant/access`
- `POST /v1/ai-assistant/chat`
- `POST /v1/ai/schedule`

## Portal UI

Portal assistant page supports chat prompts and scheduling recommendation requests.

## Settings and Configuration

Environment keys:

- `AI_PROVIDER` (`mock`, `openai`, `azure`)
- `AI_KEY`
- `AI_MODEL`
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_DEPLOYMENT`
- `AZURE_OPENAI_API_VERSION`

## Seeding

Seed includes AI permission defaults for initial admin role assignment.

## Extension Points

- Add domain-specific system prompts
- Add tool-calling workflows
- Add job-planning persistence model for recommendation history

## Known Limitations

- Local mock mode is heuristic and non-deterministic across custom prompt variants
