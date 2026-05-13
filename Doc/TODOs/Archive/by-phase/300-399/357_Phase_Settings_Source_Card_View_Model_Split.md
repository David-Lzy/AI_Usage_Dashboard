# Phase 357 - Settings Source Card View Model Split

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-13

## Goal

Move Settings source-card compact fields, session-track, and diagnostics view-model logic out of `settings-view-models.ts` into one focused module.

## Scope

- Add a dedicated Settings source-card view-model module under `src/sidepanel/`.
- Keep the existing `src/sidepanel/settings-view-models.ts` public export path working through compatibility re-exports.
- Preserve existing source-card model shapes, labels, diagnostic grouping, field filtering, and compact-field behavior.

## Preserved Boundaries

- No Settings UI, provider, storage, routing, i18n copy, release package, or Chrome automation changes.
- No source-truth, diagnostic, or provider-state semantics changes.
- No test rewrite beyond keeping existing imports valid.

## Acceptance

- `settings-view-models.ts` no longer owns source-card diagnostic model construction.
- Existing consumers can still import `buildSettingsSourceCardModel`, `buildSettingsSourceCompactFields`, `getCompactSourceSetupValue`, and related types from `settings-view-models.ts`.
- Existing Settings source-card tests continue to pass without changing expected values.

## Planned Verification

- `npm run typecheck`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Completion Summary

- Added `settings-source-card-view-models.ts` for Settings source-card compact fields, session-track, and diagnostics model construction.
- Kept the existing `settings-view-models.ts` public import path working through compatibility re-exports.
- Preserved existing source-card model shapes, labels, diagnostic grouping, field filtering, and compact-field behavior.

## Verification

- `npm run typecheck`
- `npm test`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Follow-Up

- None. Future Settings source-card semantic changes should use a behavior phase if they alter diagnostics, compact fields, source-truth labels, or provider-state semantics.
