# Phase 397 - Diagnostic Presentation 14-Locale Inventory

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-13
- inventory and split-planning phase only

## Goal

Inventory `src/shared/provider-diagnostic-presentation.ts` so warning, source-selection/fallback, and adapter-error presentation can move from `en + zh-CN` to 14-locale copy without touching raw diagnostic evidence.

## Scope

- Enumerate current diagnostic categories, codes, labels, and generated summaries.
- Split implementation into warning diagnostics, source diagnostics, and adapter-error diagnostics.
- Identify which summary fragments are safe repo-owned presentation copy and which values must remain raw params or evidence.
- Update i18n backlog docs with the exact implementation slices.

## Preserved Boundaries

- Do not change runtime diagnostic behavior.
- Do not translate raw `warningReason`, `sourceSelectionReason`, `sourceFallbackReason`, adapter raw body text, provider ids, host labels, URLs, route hints, or archive/export schemas.
- Do not change typed diagnostic builders, source-state classification, provider adapters, parsers, or view-model behavior.

## Acceptance

- A maintained inventory or phase closeout table maps diagnostic labels and summaries to implementation phases.
- `Phase 398`, `Phase 399`, and `Phase 400` have clear boundaries and test paths.
- Raw evidence preservation is explicitly documented.

## Planned Verification

- `rg 'getProviderDiagnosticPresentation|warningDiagnostic|sourceDiagnostic|adapter_error' src Doc`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Start `Phase 398` warning diagnostic presentation copy after the inventory is archived.

## Closeout

Completed on 2026-05-13.

Summary:

- Added [I18n_Diagnostic_Presentation_14_Locale_Inventory.md](../../../../I18n/I18n_Diagnostic_Presentation_14_Locale_Inventory.md) as the maintained diagnostic presentation inventory.
- Mapped typed diagnostic presentation into three implementation slices:
  - `Phase 398` warning diagnostic presentation
  - `Phase 399` source-selection and fallback diagnostic presentation
  - `Phase 400` adapter-error diagnostic presentation
- Confirmed raw `warningReason`, `sourceSelectionReason`, `sourceFallbackReason`, adapter raw body text, provider ids, host labels, URLs, route hints, archive/export schemas, and unknown diagnostic fallback behavior stay outside localization.

Verification:

- `rg 'getProviderDiagnosticPresentation|warningDiagnostic|sourceDiagnostic|adapter_error' src Doc` completed.
- `npm run docs:check` passed.
- `git diff --check` passed.
