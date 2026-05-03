# Phase 262 - Special Route App Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 262 special-route app split and regression checks

## Scope

Phase 262 moved special debug/operator route ownership from `App.tsx` into:

- `src/sidepanel/special-route-app.tsx`

The standard `App.tsx` runtime still chooses between special and standard routes, and still owns dashboard, Settings, provider detail, sync, source-page recovery, and standard route rendering.

## Review Coverage

- `npm run test -- src/sidepanel/special-route-app.test.tsx src/sidepanel/route-state.test.ts --run`
  - verifies supported debug hashes map to special routes
  - verifies standard hashes are ignored by the special route parser
  - verifies a special route can render independently of the standard app state
- `npm run phase262:review`
  - verifies `phase262:review` package script wiring
  - verifies fixture/operator route imports, stored theme/locale parsing, and special-route rendering moved out of `App.tsx`
  - verifies closeout documentation markers
  - starts Vite, opens `#debug-interaction-audit`, captures the page, and verifies the special route shell, hero card, title, and horizontal overflow

## Commands

- `npm run test -- src/sidepanel/special-route-app.test.tsx src/sidepanel/route-state.test.ts --run`
- `npm run phase262:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
