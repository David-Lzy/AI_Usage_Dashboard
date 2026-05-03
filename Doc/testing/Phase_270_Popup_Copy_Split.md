# Phase 270 - Popup Copy Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 270 popup copy split and regression checks

## Scope

Phase 270 moved popup structured localized copy from `src/shared/localized-copy.ts` into:

- `src/shared/popup-localized-copy.ts`

The legacy `src/shared/localized-copy.ts` import path still re-exports `buildPopupLocalizedCopy`, so existing popup runtime and popup view-model consumers do not need to change in this slice.

## Review Coverage

- `npm run test -- src/shared/popup-localized-copy.test.ts src/shared/i18n.test.ts src/popup/view-models.test.ts --run`
  - verifies English popup setup and surface-role copy
  - verifies Simplified Chinese popup setup and featured-card copy
  - verifies the existing `localized-copy` re-export path still works
  - keeps existing runtime i18n and popup view-model coverage adjacent to the moved popup copy
- `npm run phase270:review`
  - verifies `phase270:review` package script wiring
  - verifies popup copy moved out of `localized-copy.ts`
  - verifies closeout documentation markers

## Commands

- `npm run test -- src/shared/popup-localized-copy.test.ts src/shared/i18n.test.ts src/popup/view-models.test.ts --run`
- `npm run phase270:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
