# Phase 264 - Standard App Runtime Hook

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 264 standard-app runtime hook extraction and regression checks

## Scope

Phase 264 moved standard app runtime ownership from `App.tsx` into:

- `src/sidepanel/use-standard-app-runtime.ts`

The standard `App.tsx` runtime still owns route guards, provider action handlers, dashboard rendering, Settings rendering, provider detail rendering, and top-level route selection.

## Review Coverage

- `npm run test -- src/sidepanel/use-standard-app-runtime.test.tsx src/sidepanel/app-browser-controls.test.ts --run`
  - verifies the hook exposes initial loading state, empty app state, empty toast state, and callback functions
  - verifies normal bootstrap still uses `app:init`
  - verifies locked store screenshot seeds still use `app:read-state`
  - keeps the adjacent browser-control split covered while this App region changes
- `npm run phase264:review`
  - verifies `phase264:review` package script wiring
  - verifies runtime initialization and theme-sync helper code moved out of `App.tsx`
  - verifies closeout documentation markers
  - starts Vite, opens `#dashboard`, captures the page, and verifies summary pills, provider cards, provider headers, and horizontal overflow

## Commands

- `npm run test -- src/sidepanel/use-standard-app-runtime.test.tsx src/sidepanel/app-browser-controls.test.ts --run`
- `npm run phase264:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
