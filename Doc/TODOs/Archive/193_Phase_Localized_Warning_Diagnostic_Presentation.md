# Phase 193 - Localized Warning Diagnostic Presentation

Date: 2026-04-25

Document class:

- archived phase

## Goal

Add localized warning diagnostic labels and a diagnostic summary layer without removing raw diagnostic strings.

## Scope

- generate presentation from known typed `warningDiagnostic` codes and params
- show localized diagnostic presentation in Settings source cards and Provider Detail
- preserve raw warning, source-selection, and fallback text
- update roadmap, i18n boundary, phase-index, and closeout docs

## What Changed

- `src/shared/localized-copy.ts` now includes `getProviderDiagnosticPresentation`.
- `src/sidepanel/settings-view-models.ts` accepts an optional typed warning diagnostic presentation model.
- `src/sidepanel/routes/SettingsPage.tsx` passes localized warning diagnostic presentation into source-card diagnostics.
- `src/sidepanel/routes/ProviderDetailPage.tsx` renders the diagnostic summary before the raw warning reason note.
- `src/shared/i18n.test.ts` and `src/sidepanel/settings-view-models.test.ts` cover localized output and unknown-code fallback.
- `scripts/phase193-localized-warning-diagnostic-presentation-review.mjs` records the phase-specific review artifact.

## Preserved Boundaries

- raw diagnostic strings remain source truth
- unknown typed diagnostics still leave the product on raw fallback behavior
- source-selection and fallback diagnostic bodies remain raw until a dedicated follow-up
- no provider coverage, source selection, sync, archive, or store-screenshot behavior changed

## Verification

- `npm run phase193:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `git diff --check`

## Follow-Up

Continue `Direction 09.3` with source-selection and fallback diagnostic presentation expansion. That slice should generate localized presentation for typed source-selection and fallback diagnostics while preserving raw evidence bodies.
