# Phase 194 - Source Diagnostic Presentation

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Render localized source-selection and fallback diagnostic presentation from typed diagnostic codes while preserving raw source-selection and fallback evidence strings.

## Why This Phase Exists

`Phase 193` proved the first localized warning diagnostic presentation layer. The remaining typed source diagnostics still showed only raw English source-selection and fallback bodies. This phase expands the same code-first presentation pattern to `sourceSelectionDiagnostic` and `sourceFallbackDiagnostic` without changing source selection itself.

## What Changed

- `src/shared/localized-copy.ts` now handles known `source.*` diagnostic codes in `getProviderDiagnosticPresentation`.
- Source-selection presentation covers auto-selected, preference-selected, and auto-fallback source choices.
- Source-fallback presentation covers missing official API credentials, official API failures, unavailable session pages, and no-live-path failures.
- Settings source-card diagnostics now show localized selection/fallback diagnostic labels and summaries beside the raw reason fields.
- Provider Detail now shows localized selection/fallback diagnostic labels and summaries beside the raw source-selection and fallback reason fields.
- Focused tests cover source diagnostic presentation and raw reason preservation.
- `scripts/phase194-source-diagnostic-presentation-review.mjs` verifies code, docs, tests, and closeout markers for this slice.

## Preserved Boundaries

- Raw source-selection strings remain visible and unchanged.
- Raw fallback strings remain visible and unchanged; this preserves the raw fallback evidence body for reviews.
- Raw warning strings remain visible and unchanged.
- No provider source selection, fallback order, sync cadence, archive schema, or provider coverage claim changed.
- This is still presentation generated from typed metadata, not direct translation of adapter evidence bodies.

## Verification

- `npm run phase194:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `git diff --check`

## Follow-Up

Continue `Direction 09.3` with adapter-error diagnostic builders and presentation boundary. That next slice should decide where `adapter.unexpected_error`, `adapter.unsupported_response`, and `adapter.parse_failed` are populated before localized presentation is shown for them.
