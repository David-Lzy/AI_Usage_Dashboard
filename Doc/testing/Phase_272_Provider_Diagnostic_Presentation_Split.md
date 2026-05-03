# Phase 272 - Provider Diagnostic Presentation Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records the Phase 272 provider diagnostic presentation split and regression checks

## Scope

Phase 272 moved provider diagnostic presentation from `src/shared/localized-copy.ts` into:

- `src/shared/provider-diagnostic-presentation.ts`

The legacy `src/shared/localized-copy.ts` import path still re-exports `ProviderDiagnosticPresentation` and `getProviderDiagnosticPresentation`, so existing view-model, Settings, and provider-source consumers do not need to change in this slice.

## Review Coverage

- `npm run test -- src/shared/provider-diagnostic-presentation.test.ts src/shared/i18n.test.ts src/sidepanel/settings-view-models.test.ts src/sidepanel/view-models.test.ts --run`
  - verifies source-selection diagnostic presentation in English and Simplified Chinese
  - verifies usage-threshold diagnostic presentation
  - verifies adapter-error diagnostic presentation
  - verifies the existing `localized-copy` re-export path still works
  - keeps existing runtime i18n and sidepanel view-model coverage adjacent to the moved diagnostic presentation
- `npm run phase272:review`
  - verifies `phase272:review` package script wiring
  - verifies diagnostic presentation moved out of `localized-copy.ts`
  - verifies closeout documentation markers

## Commands

- `npm run test -- src/shared/provider-diagnostic-presentation.test.ts src/shared/i18n.test.ts src/sidepanel/settings-view-models.test.ts src/sidepanel/view-models.test.ts --run`
- `npm run phase272:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`
