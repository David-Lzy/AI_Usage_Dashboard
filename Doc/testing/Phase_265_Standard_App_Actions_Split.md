# Phase 265 - Standard App Actions Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 265 standard-app actions split and regression checks

## Scope

Phase 265 moved standard app action handler assembly from `App.tsx` into:

- `src/sidepanel/standard-app-actions.ts`

The standard `App.tsx` runtime still owns route selection, route guards, runtime i18n creation, view-model assembly, dashboard rendering, Settings rendering, provider detail rendering, and top-level special-route handoff.

## Review Coverage

- `npm run test -- src/sidepanel/standard-app-actions.test.ts src/sidepanel/app-browser-controls.test.ts --run`
  - verifies session-page controls report unavailable outside extension mode
  - verifies empty app state does not dispatch provider actions
  - verifies provider refresh, settings update, and provider visibility dispatches keep their message contracts
  - verifies save-preferences feedback uses the current localized runtime copy
  - keeps the adjacent browser-control split covered while action handlers move
- `npm run phase265:review`
  - verifies `phase265:review` package script wiring
  - verifies provider action helper code moved out of `App.tsx`
  - verifies closeout documentation markers
  - starts Vite, opens `#dashboard`, captures the page, and verifies summary pills, provider cards, provider headers, and horizontal overflow

## Commands

- `npm run test -- src/sidepanel/standard-app-actions.test.ts src/sidepanel/app-browser-controls.test.ts --run`
- `npm run phase265:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
