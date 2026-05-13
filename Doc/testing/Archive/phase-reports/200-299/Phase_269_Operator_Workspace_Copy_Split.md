# Phase 269 - Operator Workspace Copy Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 269 operator workspace copy split and regression checks

## Scope

Phase 269 moved interaction-audit and theme-recovery operator workspace localized copy from `src/shared/localized-copy.ts` into:

- `src/shared/operator-workspace-localized-copy.ts`

The legacy `src/shared/localized-copy.ts` import path still re-exports `buildOperatorWorkspaceLocalizedCopy`, so existing interaction-audit and theme-recovery route consumers do not need to change in this slice.

## Review Coverage

- `npm run test -- src/shared/operator-workspace-localized-copy.test.ts src/sidepanel/special-route-app.test.tsx --run`
  - verifies English interaction-audit and theme-recovery copy
  - verifies Simplified Chinese operator workspace copy
  - verifies the existing `localized-copy` re-export path still works
  - keeps the special-route app test adjacent to the moved operator copy
- `npm run phase269:review`
  - verifies `phase269:review` package script wiring
  - verifies operator workspace copy moved out of `localized-copy.ts`
  - verifies closeout documentation markers

## Commands

- `npm run test -- src/shared/operator-workspace-localized-copy.test.ts src/sidepanel/special-route-app.test.tsx --run`
- `npm run phase269:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
