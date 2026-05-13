# Phase 194 - Source Diagnostic Presentation

Date: 2026-04-25

Document class:

- archived phase

## Goal

Add localized source diagnostic presentation without removing raw source-selection or raw fallback evidence strings.

## Scope

- generate presentation from known typed `sourceSelectionDiagnostic` and `sourceFallbackDiagnostic` codes and params
- show localized source diagnostic presentation in Settings source cards and Provider Detail
- preserve raw warning, source-selection, and fallback text
- update roadmap, i18n boundary, phase-index, and closeout docs

## What Changed

- `src/shared/localized-copy.ts` now maps known `source.*` codes to localized labels and summaries.
- `src/sidepanel/settings-view-models.ts` accepts optional source-selection and source-fallback diagnostic presentation models.
- `src/sidepanel/routes/SettingsPage.tsx` passes typed source diagnostics into source-card diagnostics.
- `src/sidepanel/routes/ProviderDetailPage.tsx` renders localized source diagnostic fields next to the raw source-selection and fallback reason fields.
- `src/shared/i18n.test.ts` and `src/sidepanel/settings-view-models.test.ts` cover localized source presentation and raw reason preservation.
- `scripts/phase194-source-diagnostic-presentation-review.mjs` records the phase-specific review artifact.

## Preserved Boundaries

- raw source-selection strings remain source truth
- raw fallback strings remain source truth
- unknown typed diagnostics still leave the product on raw fallback behavior
- no provider coverage, source selection, sync, archive, or store-screenshot behavior changed

## Verification

- `npm run phase194:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `git diff --check`

## Follow-Up

Continue `Direction 09.3` with adapter-error diagnostic builders and presentation boundary. That slice should add a safe population plan before any adapter-error presentation can become user-visible.
