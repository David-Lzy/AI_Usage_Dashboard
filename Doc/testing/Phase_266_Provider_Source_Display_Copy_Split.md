# Phase 266 - Provider Source Display Copy Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 266 provider-source display copy split and regression checks

## Scope

Phase 266 moved provider-source display localized copy from `src/shared/localized-copy.ts` into:

- `src/shared/provider-source-display-localized-copy.ts`

The legacy `src/shared/localized-copy.ts` import path still re-exports `buildProviderSourceDisplayLocalizedCopy`, so existing dashboard, popup, Settings, and test consumers do not need to change in this slice.

## Review Coverage

- `npm run test -- src/shared/provider-source-display-localized-copy.test.ts src/shared/provider-sources.test.ts --run`
  - verifies English continues to return the default source display copy object
  - verifies Simplified Chinese source-kind, source-preference, state, and availability summary labels
  - verifies the existing `localized-copy` re-export path still works
  - keeps provider-source contract tests adjacent to the moved copy
- `npm run phase266:review`
  - verifies `phase266:review` package script wiring
  - verifies provider-source display copy moved out of `localized-copy.ts`
  - verifies closeout documentation markers

## Commands

- `npm run test -- src/shared/provider-source-display-localized-copy.test.ts src/shared/provider-sources.test.ts --run`
- `npm run phase266:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
