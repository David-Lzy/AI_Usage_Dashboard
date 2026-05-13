# Phase 268 - Store Workflow Copy Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 268 store workflow copy split and regression checks

## Scope

Phase 268 moved store screenshot workflow localized copy from `src/shared/localized-copy.ts` into:

- `src/shared/store-workflow-localized-copy.ts`

The legacy `src/shared/localized-copy.ts` import path still re-exports `buildStoreWorkflowLocalizedCopy`, so existing screenshot seed and native popup probe consumers do not need to change in this slice.

## Review Coverage

- `npm run test -- src/shared/store-workflow-localized-copy.test.ts src/sidepanel/special-route-app.test.tsx --run`
  - verifies English store screenshot seed copy and native popup probe copy
  - verifies Simplified Chinese store workflow copy and fallback handling
  - verifies the existing `localized-copy` re-export path still works
  - keeps the special-route app test adjacent to the moved store workflow copy
- `npm run phase268:review`
  - verifies `phase268:review` package script wiring
  - verifies store workflow copy moved out of `localized-copy.ts`
  - verifies closeout documentation markers

## Commands

- `npm run test -- src/shared/store-workflow-localized-copy.test.ts src/sidepanel/special-route-app.test.tsx --run`
- `npm run phase268:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
