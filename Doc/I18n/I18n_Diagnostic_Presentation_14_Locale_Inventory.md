# I18n Diagnostic Presentation 14-Locale Inventory

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- created in `Phase 397`
- update this file when typed diagnostic presentation codes, labels, summary params, or localization boundaries change

## Purpose

Map the current typed diagnostic presentation copy before expanding it from `en + zh-CN` to the 14 shipped runtime locales.

The implementation source is [provider-diagnostic-presentation.ts](../../src/shared/provider-diagnostic-presentation.ts). It returns presentation-only labels and summaries for Settings and Provider Detail while raw diagnostic evidence remains visible separately.

## Current Surface

Consumed by:

- [SettingsSourceCard.tsx](../../src/sidepanel/components/SettingsSourceCard.tsx)
- [ProviderDetailPage.tsx](../../src/sidepanel/routes/ProviderDetailPage.tsx)
- [settings-view-models.test.ts](../../src/sidepanel/settings-view-models.test.ts)

Current behavior:

- known typed warning diagnostics get localized labels plus short summaries for all 14 runtime locales after `Phase 398`
- known typed source-selection and source-fallback diagnostics get localized labels plus short summaries for all 14 runtime locales after `Phase 399`
- known typed adapter-error diagnostics still get localized labels plus short summaries for `en` and `zh-CN`
- non-`en` / non-`zh-CN` runtime locales still fall back to English for adapter-error diagnostics until `Phase 400`
- unknown diagnostic codes return `null`, leaving raw evidence display paths unchanged

## Safe Presentation Copy

These strings are repo-owned UI copy and can be localized:

- typed diagnostic labels for known codes
- fixed summary sentence templates
- stable enum labels for `ProviderSourceKind`: `official_api`, `session_page`, `policy_only`
- stable enum labels for `ProviderSourcePreference`: `auto`, `official_api`, `session_page`
- fixed support text that tells the user raw diagnostic bodies are preserved for review

These dynamic values are formatting inputs, not translatable evidence:

- `failureCount`
- `usagePercent`
- `thresholdPercent`
- `overageCount`
- `ageMinutes`
- `staleAfterMinutes`

These values must stay raw and must not be translated or rewritten:

- `ProviderDiagnostic.rawMessage`
- `warningReason`
- `sourceSelectionReason`
- `sourceFallbackReason`
- adapter raw diagnostic body text
- provider ids
- host labels and origins
- URLs and route hints
- vendor page text
- archive/export/request/fixture schemas and identifiers

`unitLabel` is currently inserted as a raw typed param. Do not translate it inside the diagnostic presentation pass unless a later phase first converts it to a stable enum contract.

## Phase 398 - Warning Diagnostics

Status:

- completed in `Phase 398`
- implementation copy lives in [provider-diagnostic-warning-copy.ts](../../src/shared/provider-diagnostic-warning-copy.ts)
- raw warning bodies, `ProviderDiagnostic.rawMessage`, and raw `unitLabel` params remain untranslated evidence

Implementation scope:

| Category | Codes | Summary helper |
| --- | --- | --- |
| `credential` | `credential.admin_api_key_missing`, `credential.workspace_config_missing` | fixed sentence templates |
| `host_access` | `host_access.missing`, `host_access.required_for_live_sync` | fixed sentence template |
| `page_session` | `page_session.open_page_required`, `page_session.logged_out`, `page_session.capture_unavailable` | fixed sentence templates |
| `usage_threshold` | `usage.threshold_warning` | `formatThresholdSummary` |
| `usage_threshold` | `usage.overage_detected` | `formatOverageSummary` |
| `usage_threshold` | `usage.on_demand_off` | fixed sentence template |
| `policy_only` | `policy.live_source_unavailable`, `policy.documented_limit_only` | fixed sentence templates |
| `sync_stale` | `sync.automatic_sync_overdue`, `sync.cached_state_stale` | `formatSyncStaleSummary` |

Guard tests:

- add or extend focused `getProviderDiagnosticPresentation` assertions
- keep `src/sidepanel/settings-view-models.test.ts` proving localized presentation is added without hiding raw diagnostics
- include one non-English non-`zh-CN` locale assertion and one RTL-safe locale assertion if the helper adds locale maps

## Phase 399 - Source Diagnostics

Status:

- completed in `Phase 399`
- implementation copy lives in [provider-diagnostic-source-copy.ts](../../src/shared/provider-diagnostic-source-copy.ts)
- raw `sourceSelectionReason`, raw `sourceFallbackReason`, `ProviderDiagnostic.rawMessage`, and vendor/source identifiers remain untranslated evidence

Implementation scope:

| Category | Codes | Summary helper |
| --- | --- | --- |
| `source_selection` | `source.auto_selected_official_api`, `source.auto_selected_session_page`, `source.preference_selected_official_api`, `source.preference_selected_session_page` | `formatSourceSelectionSummary` |
| `source_fallback` | `source.official_api_missing_credential`, `source.official_api_failed`, `source.session_page_unavailable`, `source.no_live_path` | fixed sentence templates or `formatNoLivePathSummary` |

Shared labels:

- `formatDiagnosticSourceKindLabel`
- `formatDiagnosticSourcePreferenceLabel`

Guard tests:

- keep raw `sourceSelectionReason` and `sourceFallbackReason` visible
- verify the `hadFallback` branch for `source.auto_selected_session_page`
- verify `failureCount` formatting for `source.no_live_path`

## Phase 400 - Adapter-Error Diagnostics

Status: active after `Phase 399`.

Implementation scope:

| Category | Codes | Summary helper |
| --- | --- | --- |
| `adapter_error` | `adapter.unexpected_error`, `adapter.unsupported_response`, `adapter.parse_failed` | `formatAdapterErrorSummary` |

Shared labels:

- `formatDiagnosticSourceKindLabel` for the optional `sourceKind` param

Guard tests:

- keep raw adapter diagnostic bodies visible
- verify all three `adapter.*` labels and summaries
- verify unknown adapter diagnostic fallback still returns `null` presentation and raw evidence remains visible

## Verification Pattern

Each implementation phase should run:

- `npm run i18n:check`
- focused diagnostic presentation tests
- `npm run test -- src/sidepanel/settings-view-models.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

`Phase 400` should also run `npm run build` and update the deeper runtime copy backlog to remove typed diagnostic presentation from the remaining fallback buckets.
