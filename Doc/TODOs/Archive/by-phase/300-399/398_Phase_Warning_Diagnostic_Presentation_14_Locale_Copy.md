# Phase 398 - Warning Diagnostic Presentation 14-Locale Copy

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-13
- first diagnostic presentation implementation slice

## Goal

Add explicit 14-locale presentation copy for typed warning diagnostics while keeping raw warning bodies unchanged.

## Scope

- Localize warning diagnostic labels and short summaries generated from typed params.
- Cover credential, host-access, page-session, usage-threshold, policy-only, and sync-stale warning presentation that currently branches only for `zh-CN`.
- Use [I18n_Diagnostic_Presentation_14_Locale_Inventory.md](../../../../I18n/I18n_Diagnostic_Presentation_14_Locale_Inventory.md) as the code list:
  - `credential.admin_api_key_missing`
  - `credential.workspace_config_missing`
  - `host_access.missing`
  - `host_access.required_for_live_sync`
  - `page_session.open_page_required`
  - `page_session.logged_out`
  - `page_session.capture_unavailable`
  - `usage.threshold_warning`
  - `usage.overage_detected`
  - `usage.on_demand_off`
  - `policy.live_source_unavailable`
  - `policy.documented_limit_only`
  - `sync.automatic_sync_overdue`
  - `sync.cached_state_stale`
- Add tests proving every non-English locale gets representative non-English warning diagnostic presentation.

## Preserved Boundaries

- Do not translate or rewrite raw `warningReason`.
- Do not translate `ProviderDiagnostic.rawMessage`, raw adapter bodies, provider ids, host labels, URLs, route hints, archive/export schemas, or the raw `unitLabel` param.
- Do not change diagnostic builders, provider adapters, source-state classification, archive/export schemas, or view-model raw evidence rendering.
- Do not start source-selection/fallback or adapter-error presentation in this phase.

## Acceptance

- Warning diagnostic presentation has explicit 14-locale coverage.
- Raw warning bodies remain visible and unchanged in existing tests.
- Unknown warning diagnostic fallback behavior remains presentation-only and safe.

## Planned Verification

- `npm run i18n:check`
- focused diagnostic presentation tests for warning diagnostics
- `npm run test -- src/shared/i18n.test.ts`
- `npm run test -- src/sidepanel/settings-view-models.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Continue to `Phase 399` source-selection and fallback diagnostic presentation copy.

## Closeout

Completed on 2026-05-13.

Summary:

- Added `src/shared/provider-diagnostic-warning-copy.ts` with explicit 14-locale warning diagnostic labels and summaries for credential, host-access, page-session, usage-threshold, policy-only, and sync-stale typed warning diagnostics.
- Kept `src/shared/provider-diagnostic-presentation.ts` as the public presentation entry while delegating warning diagnostic codes to the new helper.
- Preserved raw `warningReason`, `ProviderDiagnostic.rawMessage`, adapter raw bodies, provider ids, host labels, URLs, route hints, archive/export schemas, and raw `unitLabel` params.
- Added focused coverage proving every shipped locale gets explicit usage-threshold warning presentation and that every warning diagnostic code still leaves raw warning bodies untouched.

Verification:

- `npm run i18n:check` passed.
- `npm run test -- src/shared/provider-diagnostic-presentation.test.ts` passed with `6` tests.
- `npm run test -- src/shared/i18n.test.ts` passed with `37` tests.
- `npm run test -- src/sidepanel/settings-view-models.test.ts` passed with `13` tests.
- `npm run typecheck` passed.
- `npm run docs:check` passed.
- `git diff --check` passed.
