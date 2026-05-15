# Phase 482 - Pre-Store Maintenance Audit

Date: 2026-05-15

Status: completed

## Goal

Audit the post-`rc.21` source before the next store candidate so cleanup, refactor, bundle split, CSS consolidation, and `rc.22` packaging stay scoped and low risk.

## Scope

- Record the largest source files and current `dist/` chunks.
- Identify duplicate Settings/Form/CSS patterns introduced during recent UI polish.
- Identify stale-code cleanup candidates that are safe to prove with `rg` plus focused tests.
- Define release-safe boundaries for the follow-up maintenance phases.

## Preserved Boundaries

- No runtime behavior, UI behavior, storage schema, provider source truth, source-selection semantics, permissions, release package, generated evidence archive, or Chrome Web Store submission boundary changes in this phase.
- No historical archive, release package, store screenshot evidence, provider note, or phase-review script deletion.
- `0.1.0-rc.13` remains the submitted Chrome Web Store review boundary, and `0.1.0-rc.21` remains the latest packaged follow-up candidate until a later packaging phase cuts `rc.22`.

## Audit Findings

Largest current source files by byte size:

- `src/shared/operator-workspace-localized-copy.ts` - 352,783 bytes.
- `src/shared/popup-localized-copy.ts` - 179,235 bytes.
- `src/shared/store-workflow-localized-copy.ts` - 75,093 bytes.
- `src/shared/settings-core-localized-copy.ts` - 74,263 bytes.
- `src/shared/provider-source-display-extended-localized-copy.ts` - 73,099 bytes.
- `src/shared/provider-detail-extended-localized-copy.ts` - 51,631 bytes.
- `src/shared/provider-diagnostic-warning-copy.ts` - 49,653 bytes.
- `src/shared/runtime-message-catalog-data/overrides-latin.ts` - 47,815 bytes.
- `src/shared/runtime-message-catalog-data/overrides-other.ts` - 42,246 bytes.
- `src/shared/settings-source-permissions-localized-copy.ts` - 41,597 bytes.

Largest current `dist/assets` outputs:

- `dist/assets/sidepanel.js` - 861,799 bytes.
- `dist/assets/message-bus.js` - 325,682 bytes.
- `dist/assets/usage-progress.js` - 324,600 bytes.
- `dist/assets/popup.js` - 164,967 bytes.
- `dist/assets/index2.css` - 93,920 bytes.
- `dist/assets/usage-progress.css` - 44,813 bytes.

Maintenance targets:

- Phase 483 can remove the stale `.settings-preferences__field-with-helper` CSS rules; current JSX no longer emits that wrapper after label accessories moved into shared controls.
- Phase 484 can collapse duplicate label/accessory markup in `MaterialSelect`, `EditableNumberCombobox`, and `ActionBadgeSelectionControls` into one small shared label-row component while preserving markup semantics.
- Phase 485 should first lazy-load special/debug sidepanel routes, especially interaction audit, theme recovery, store screenshot seed, fixture capture, and native popup probe pages. Ordinary dashboard, Settings, and provider-detail routes should stay eagerly loaded unless build output proves more work is needed.
- Phase 485 should replace runtime imports from `src/shared/localized-copy.ts` with direct imports from focused copy modules where practical, keeping `localized-copy.ts` as a compatibility re-export for tests and old callers.
- Phase 486 can consolidate repeated label-row/field-helper CSS in `form-controls.css` and keep responsive grid rules behavior-preserving.
- Phase 487 should package `0.1.0-rc.22` only after the maintenance phases pass focused tests, `typecheck`, `docs:check`, `i18n:check`, `build`, and `release:check`.

Do not touch in this maintenance pass:

- provider adapters' source-truth logic or live-support claims
- settings storage schema beyond later release-version bumps
- archive/export payload schemas
- generated operator/store evidence packages
- existing release zips and submitted RC13 milestone text
- Web Store listing promises

## Acceptance

- The pre-store maintenance boundary is documented before runtime cleanup begins.
- The next phases have concrete safe targets and explicit non-targets.
- Current docs acknowledge that source has advanced through `Phase 482` while `rc.21` remains the latest package.

## Planned Verification

- `npm run docs:check`
- `npm run i18n:check`
- `git diff --check`

## Completed Verification

- `npm run docs:check`
- `npm run i18n:check`
- `git diff --check`

## Follow-Up

- Continue with Phase 483 stale-code cleanup, using this audit as the cleanup boundary.
