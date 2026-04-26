# Agent Handoff Protocol

Use this protocol for every implementation session.

## Required updates after each code change

1. Update `readme/Modification-References.md`:
   - What changed
   - Why it changed
   - Validation commands and outcomes
2. Update `readme/HubForge-Feature-Todos.md`:
   - Mark completed work
   - Add newly discovered backlog items
   - Keep status current (`[ ]`, `[~]`, `[x]`)
3. Update `readme/CLI-Instructions.md` when command signatures or generated outputs change.

## Validation checklist

Run from repository root:

- `pnpm hubforge:build`
- `pnpm typecheck`

For new scaffolding behavior, run at least one smoke test:

- `pnpm hubforge init <temp-project> ...`
- `pnpm hubforge feature add ...`

## Auth and provider policy

- Init default auth mode: `external`
- Init default auth provider: `zitadel`
- Generated projects must remain configurable post-install via env files.

## Notes for continuation

- Prefer adding baseline scaffolds rather than leaving empty placeholders.
- Keep generated files strict-mode friendly (avoid implicit `process` references in shared packages unless Node types are included).
- Keep migration scripts non-interactive when possible.
