# Phase 204 - Diagnostic Raw Fallback Regression

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Close the deferred adapter diagnostic raw fallback regression slice without changing runtime product behavior.

## Why This Phase Exists

Typed diagnostic codes are now used for localized labels and summaries, but raw provider evidence remains the compatibility boundary for older snapshots, unknown future codes, and intentionally raw-only diagnostics. This phase locks that behavior with tests before any deeper diagnostic-body localization work.

## What Changed

- Added regression coverage for unknown `source_selection`, `source_fallback`, and `adapter_error` diagnostic codes returning no localized presentation.
- Added regression coverage for absent typed warning diagnostics still falling back to raw warning patterns in provider source-state classification.
- Added Settings source-card regression coverage proving raw selection, fallback, and readiness details stay visible when typed diagnostic presentation is absent.
- Added Provider Detail view-model regression coverage proving raw warning and fallback evidence still reaches the detail surface when typed diagnostics are unknown.
- Added `npm run phase204:review` as a static marker review for the raw fallback regression boundary.

## Preserved Boundaries

- No runtime product behavior changed in this slice.
- Raw diagnostic bodies were not translated or rewritten.
- Provider coverage claims were not changed.
- Source-selection behavior and fallback order were not changed.
- Archive, request, screenshot seed, and operator evidence schemas were not changed.

## Artifacts

- `scripts/phase204-diagnostic-raw-fallback-regression-review.mjs`
- `tmp/phase204-diagnostic-raw-fallback-regression-review/diagnostic-raw-fallback-regression-review.json`

## Verification

- `npm run test -- --run src/shared/i18n.test.ts src/shared/provider-sources.test.ts src/sidepanel/settings-view-models.test.ts src/sidepanel/view-models.test.ts`
- `npm run phase204:review`
- `npm run docs:check`
- `git diff --check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Return to functionality-first provider work if a real authenticated Codex or Cursor operator pass is available. Otherwise, keep the next repo-owned default on narrow regression or release-readiness slices instead of expanding documentation-only planning.
