# Phase 282 - Standard Route App Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 282 standard route app extraction plus regression checks

## Scope

Phase 282 moved standard dashboard, settings, and provider-detail route rendering from `src/sidepanel/App.tsx` into:

- `src/sidepanel/standard-route-app.tsx`

`App.tsx` still owns hash observation and special route dispatch.

## Review Coverage

- `npm run test -- src/sidepanel/route-state.test.ts src/sidepanel/special-route-app.test.tsx src/sidepanel/use-standard-app-runtime.test.tsx --run`
  - verifies route hash parsing and special route ownership still work
  - verifies standard app runtime bootstrap still initializes through the same helper path
- `npm run phase282:review`
  - verifies `phase282:review` package script wiring
  - verifies `App.tsx` only owns hash observation and route handoff markers
  - verifies standard route rendering markers moved to `standard-route-app.tsx`
  - verifies closeout documentation markers

## Commands

- `npm run test -- src/sidepanel/route-state.test.ts src/sidepanel/special-route-app.test.tsx src/sidepanel/use-standard-app-runtime.test.tsx --run`
- `npm run phase282:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
