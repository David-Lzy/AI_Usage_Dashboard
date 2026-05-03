# Phase 281 - Standard App Settings Actions Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 281 standard app Settings action extraction plus regression checks

## Scope

Phase 281 moved Settings-owned action handlers from `src/sidepanel/standard-app-actions.ts` into:

- `src/sidepanel/standard-app-settings-actions.ts`

`createStandardAppActions` still aggregates the extracted Settings actions with refresh, provider visibility, permission, full-page, and session-page actions.

## Review Coverage

- `npm run test -- src/sidepanel/standard-app-settings-actions.test.ts src/sidepanel/standard-app-actions.test.ts --run`
  - verifies Settings update dispatch and source preference dispatch stay unchanged
  - verifies provider API key and Codex workspace config payloads stay unchanged
  - verifies the preferences-saved toast stays localized
  - verifies the top-level standard action aggregator still exposes the same Settings action names
- `npm run phase281:review`
  - verifies `phase281:review` package script wiring
  - verifies Settings action payload markers moved to `standard-app-settings-actions.ts`
  - verifies `standard-app-actions.ts` no longer owns Settings update, credential, Codex workspace, or preferences-saved toast payloads
  - verifies closeout documentation markers

## Commands

- `npm run test -- src/sidepanel/standard-app-settings-actions.test.ts src/sidepanel/standard-app-actions.test.ts --run`
- `npm run phase281:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
