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
