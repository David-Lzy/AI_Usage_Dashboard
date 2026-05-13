# Phase 400 - Adapter Error Diagnostic Presentation 14-Locale Copy

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-13
- third diagnostic presentation implementation slice

## Goal

Add explicit 14-locale presentation copy for typed adapter-error diagnostics while preserving raw adapter bodies.

## Scope

- Localize adapter-error labels and short summaries generated from typed params.
- Cover parse-failed, unsupported-response, and unexpected-error presentation.
- Use [I18n_Diagnostic_Presentation_14_Locale_Inventory.md](../../../../I18n/I18n_Diagnostic_Presentation_14_Locale_Inventory.md) as the code list:
  - `adapter.parse_failed`
  - `adapter.unsupported_response`
  - `adapter.unexpected_error`
- Add tests proving every non-English locale gets representative non-English adapter-error presentation.
- Update i18n inventory/backlog docs when diagnostic presentation coverage is complete.

## Preserved Boundaries

- Do not translate raw adapter diagnostic bodies.
- Do not translate `ProviderDiagnostic.rawMessage`, provider ids, host labels, URLs, route hints, archive/export schemas, or vendor page text.
- Do not change parser behavior, adapter behavior, typed diagnostic builders, source-state classification, archive/export schemas, or raw evidence rendering.
- Do not start operator-workspace or store-helper localization in this phase.

## Acceptance

- Adapter-error diagnostic presentation has explicit 14-locale coverage.
- Raw adapter bodies remain visible and unchanged in existing tests.
- Unknown adapter diagnostic fallback behavior remains presentation-only and safe.
- I18n docs record that typed diagnostic presentation is no longer a non-`zh-CN` fallback bucket after this phase.

## Planned Verification

- `npm run i18n:check`
- focused diagnostic presentation tests for adapter-error diagnostics
- `npm run test -- src/shared/i18n.test.ts`
- `npm run test -- src/sidepanel/settings-view-models.test.ts`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Choose between operator-workspace/store-helper localization and another maintenance hotspot after diagnostic presentation is complete.

## Closeout

Completed on 2026-05-13.

Summary:

- Added `src/shared/provider-diagnostic-adapter-error-copy.ts` with explicit 14-locale adapter-error labels and summaries for parse-failed, unsupported-response, and unexpected-error diagnostics.
- Kept `src/shared/provider-diagnostic-presentation.ts` as the public presentation entry while delegating `adapter.*` diagnostic codes to the new helper.
- Preserved raw adapter diagnostic bodies, `ProviderDiagnostic.rawMessage`, provider ids, host labels, URLs, route hints, archive/export schemas, and vendor page text.
- Added focused coverage proving every shipped locale gets explicit adapter-error presentation and that every adapter-error code still leaves raw adapter bodies untouched.

Verification:

- `npm run i18n:check` passed.
- `npm run test -- src/shared/provider-diagnostic-presentation.test.ts` passed with `10` tests.
- `npm run test -- src/shared/i18n.test.ts` passed with `37` tests.
- `npm run test -- src/sidepanel/settings-view-models.test.ts` passed with `13` tests.
- `npm run typecheck` passed.
- `npm run build` passed.
- `npm run docs:check` passed.
- `git diff --check` passed.
