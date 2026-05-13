# Phase 273 - Standard App Session Page Actions Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 273 standard app session-page actions split and regression checks

## Scope

Phase 273 moved standard app session-page open and attach actions from `src/sidepanel/standard-app-actions.ts` into:

- `src/sidepanel/standard-app-session-page-actions.ts`

`createStandardAppActions` still returns the same action names for `App.tsx`, Settings, provider detail, and dashboard consumers.

## Review Coverage

- `npm run test -- src/sidepanel/standard-app-actions.test.ts src/sidepanel/standard-app-session-page-actions.test.ts src/sidepanel/app-browser-controls.test.ts --run`
  - verifies the existing standard action aggregator contract
  - verifies session-page controls remain unavailable outside extension mode
  - verifies helper unavailability surfaces a toast without dispatching messages
  - verifies full-page surfaces keep active-page attach disabled
  - keeps browser-control capability tests adjacent to the moved Chrome tab actions
- `npm run phase273:review`
  - verifies `phase273:review` package script wiring
  - verifies session-page action handlers moved out of `standard-app-actions.ts`
  - verifies closeout documentation markers

## Commands

- `npm run test -- src/sidepanel/standard-app-actions.test.ts src/sidepanel/standard-app-session-page-actions.test.ts src/sidepanel/app-browser-controls.test.ts --run`
- `npm run phase273:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
