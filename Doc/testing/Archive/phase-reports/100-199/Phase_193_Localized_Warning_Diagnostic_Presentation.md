# Phase 193 - Localized Warning Diagnostic Presentation

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Render the first localized warning diagnostic labels and short summaries from typed diagnostic codes while preserving raw diagnostic strings for evidence and compatibility.

## Why This Phase Exists

`Phase 185` through `Phase 191` added and populated typed diagnostics, and `Phase 192` made source-state classification prefer typed warning diagnostics. This phase starts the visible presentation migration without translating raw adapter or sync-engine diagnostic bodies directly.

## What Changed

- `src/shared/localized-copy.ts` now exposes `getProviderDiagnosticPresentation` for known `warningDiagnostic` codes.
- The helper returns localized `en` and `zh-CN` labels plus a short diagnostic summary from typed codes and safe params.
- Unknown diagnostic codes return `null`, so raw fallback behavior remains available.
- Settings source-card diagnostics now show the localized diagnostic label and diagnostic summary when typed warning metadata exists.
- Provider Detail now shows the localized diagnostic summary note before the existing raw warning reason note.
- Focused tests cover localized usage-threshold output, unknown-code fallback, and raw Settings diagnostics staying visible.
- `scripts/phase193-localized-warning-diagnostic-presentation-review.mjs` verifies the code, docs, tests, and closeout markers for this slice.

## Preserved Boundaries

- Raw diagnostic strings remain visible and unchanged.
- `ProviderSnapshot.warningReason` remains the evidence-grade warning body.
- `ProviderSnapshot.sourceSelectionReason` and `ProviderSnapshot.sourceFallbackReason` stay raw and are not localized in this slice.
- No provider source selection, fallback order, sync cadence, archive schema, or provider coverage claim changed.
- This is a presentation layer over existing typed metadata, not a rewrite of adapter diagnostics.

## Verification

- `npm run phase193:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `git diff --check`

## Follow-Up

Continue `Direction 09.3` with source-selection and fallback diagnostic presentation expansion. That next slice should add localized presentation for typed `sourceSelectionDiagnostic` and `sourceFallbackDiagnostic` values while preserving raw source-selection and fallback bodies for details, exports, and archive compatibility.
