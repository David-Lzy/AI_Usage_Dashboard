# Phase 311 - Popup View Model Maintenance Split

## Goal

Reduce `src/popup/view-models.ts` maintenance risk by extracting focused popup model builders without changing popup behavior.

## Scope

- Split state classification, setup coverage, and featured provider card assembly into focused modules.
- Preserve current public popup view-model output shape.
- Keep copy ownership in the existing localized popup copy module.
- Update imports and tests without altering user-facing text or provider semantics.

## Preserved Boundaries

- Do not redesign popup UI.
- Do not change action routing, provider ordering, badge semantics, or hidden-provider behavior.
- Do not combine this cleanup with Quick Setup or performance work.

## Acceptance

- Existing popup tests pass without snapshot or behavior changes.
- `src/popup/view-models.ts` becomes a smaller aggregator for exported popup model assembly.
- New helper modules have narrow ownership and no circular imports.

## Planned Verification

- `npm run test -- --run src/popup/view-models.test.ts src/popup/settings-route-targets.test.ts src/popup/progress-visibility.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
- `npm run docs:check`
- `git diff --check`

## Completion

Status: completed on 2026-05-13.

Summary:

- Extracted popup view-model types to `src/popup/view-model-types.ts` while keeping `src/popup/view-models.ts` as the public re-export point for existing imports.
- Extracted setup-coverage/state-classification builders to `src/popup/setup-coverage-view-models.ts`.
- Extracted featured provider card, usage context, and localized featured-card builders to `src/popup/featured-provider-card-view-models.ts`.
- Reduced `src/popup/view-models.ts` from `1839` lines to `945` lines without changing popup output shape or action routing.

Verification:

- `npm run test -- --run src/popup/view-models.test.ts src/popup/settings-route-targets.test.ts src/popup/progress-visibility.test.ts`
- `npm run typecheck`
