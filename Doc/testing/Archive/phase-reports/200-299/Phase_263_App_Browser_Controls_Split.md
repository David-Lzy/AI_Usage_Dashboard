# Phase 263 - App Browser Controls Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 263 browser-controls split and regression checks

## Scope

Phase 263 moved browser-control helper ownership from `App.tsx` into:

- `src/sidepanel/app-browser-controls.ts`

The standard `App.tsx` runtime still owns app state, route selection, provider actions, dashboard rendering, Settings rendering, provider detail rendering, sync, and source-page recovery.

## Review Coverage

- `npm run test -- src/sidepanel/app-browser-controls.test.ts src/sidepanel/route-state.test.ts --run`
  - verifies browser controls report unavailable outside extension mode
  - verifies extension-mode permission and tab controls are detected
  - verifies tab priority sorting prefers active tabs before recency and does not mutate input
  - verifies full-page route opening still creates the expected Chrome tab URL in extension mode
- `npm run phase263:review`
  - verifies `phase263:review` package script wiring
  - verifies browser-control helper code moved out of `App.tsx`
  - verifies closeout documentation markers
  - starts Vite, opens `#dashboard`, captures the page, and verifies summary pills, provider cards, provider headers, and horizontal overflow

## Commands

- `npm run test -- src/sidepanel/app-browser-controls.test.ts src/sidepanel/route-state.test.ts --run`
- `npm run phase263:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
