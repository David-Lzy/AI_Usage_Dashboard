# Phase 358 - Settings Quick Setup View Model Split

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-13

## Goal

Move Settings Quick Setup card model logic out of `settings-view-models.ts` into one focused module.

## Scope

- Add a dedicated Settings Quick Setup view-model module under `src/sidepanel/`.
- Keep the existing `src/sidepanel/settings-view-models.ts` public export path working through compatibility re-exports.
- Preserve existing Quick Setup action ids, card model shape, setup-state resolution, helper text selection, and source-display mapping.

## Preserved Boundaries

- No Settings UI, provider, storage, routing, i18n copy, release package, or Chrome automation changes.
- No provider-state or source-truth semantics changes.
- No test rewrite beyond keeping existing imports valid.

## Acceptance

- `settings-view-models.ts` no longer owns Quick Setup card construction.
- Existing consumers can still import `buildSettingsQuickSetupCardModel` and related Quick Setup types from `settings-view-models.ts`.
- Existing Settings view-model tests continue to pass without changing expected values.

## Planned Verification

- `npm run typecheck`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Completion Summary

- Added `settings-quick-setup-view-models.ts` for Settings Quick Setup action ids, card model shapes, setup-state resolution, helper text selection, and card construction.
- Kept the existing `settings-view-models.ts` public import path working through compatibility re-exports.
- Preserved existing Quick Setup action ids, card model shape, setup-state resolution, helper text selection, and source-display mapping.

## Verification

- `npm run typecheck`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Follow-Up

- None. Future Quick Setup semantic changes should use a behavior phase if they alter action ids, state mapping, helper text selection, or provider setup behavior.
