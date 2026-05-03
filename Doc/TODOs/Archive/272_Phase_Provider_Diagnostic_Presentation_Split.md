# Phase 272 - Provider Diagnostic Presentation Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is a localization maintainability slice; it extracts provider diagnostic presentation without changing diagnostic semantics or import compatibility

## Goal

Finish the current `src/shared/localized-copy.ts` split queue by moving provider diagnostic presentation into a focused shared module.

## Scope

- add `src/shared/provider-diagnostic-presentation.ts`
- move `ProviderDiagnosticPresentation` and `getProviderDiagnosticPresentation` plus private diagnostic formatting helpers out of `src/shared/localized-copy.ts`
- keep the legacy `src/shared/localized-copy.ts` export path through re-exports
- add focused coverage for source-selection, usage-threshold, adapter-error, and the legacy re-export path

## Preserved Boundaries

- do not change diagnostic codes, diagnostic params, diagnostic raw evidence, source truth labels, provider data models, Settings copy, popup copy, provider-detail copy, source-display copy, store workflow copy, operator workspace copy, or runtime locale behavior
- do not change consumer import paths in this slice
- do not begin `standard-app-actions.ts` or Settings page extraction in this slice

## Completed Work

- Extracted provider diagnostic presentation into `src/shared/provider-diagnostic-presentation.ts`.
- Reduced `src/shared/localized-copy.ts` to a compatibility export aggregator for the focused localized-copy modules.
- Added `src/shared/provider-diagnostic-presentation.test.ts`.
- Added `npm run phase272:review` to verify runtime markers, closeout docs, and export-boundary preservation.

## Verification

- `npm run test -- src/shared/provider-diagnostic-presentation.test.ts src/shared/i18n.test.ts src/sidepanel/settings-view-models.test.ts src/sidepanel/view-models.test.ts --run`
- `npm run phase272:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the oversized-file maintenance queue with additional narrow phases:

- reassess `src/sidepanel/standard-app-actions.ts`
- reassess `src/sidepanel/routes/SettingsPage.tsx`
- keep `src/shared/localized-copy.ts` as a compatibility export aggregator unless a later phase deliberately updates all call sites
