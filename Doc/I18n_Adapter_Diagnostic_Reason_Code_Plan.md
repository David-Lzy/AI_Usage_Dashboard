# I18n Adapter Diagnostic Reason-Code Plan

Date: 2026-04-25

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file records the `Phase 184` adapter diagnostic reason-code plan
- `Phase 185` implemented the type-only additive diagnostic model in `src/providers/types.ts` and `src/providers/diagnostics.ts`
- `Phase 186` populated Cursor source-selection and source-fallback typed diagnostics through reusable builders while preserving raw strings
- `Phase 187` populated Codex source-selection and source-fallback typed diagnostics through the same reusable builders while preserving raw strings
- `Phase 188` populated Cursor and Codex credential and host-access warning diagnostics while preserving raw strings
- `Phase 189` populated Cursor and Codex page-session warning diagnostics while preserving raw strings
- `Phase 190` populated usage-threshold and policy-only warning diagnostics while preserving raw strings
- `Phase 191` populated sync-stale warning diagnostics while preserving raw sync-engine stale strings
- `Phase 192` made source-state classification prefer typed warning diagnostics while preserving raw English fallback behavior
- `Phase 193` added localized warning diagnostic presentation while preserving raw diagnostic strings
- `Phase 194` added localized source diagnostic presentation while preserving raw source-selection and fallback strings
- `Phase 195` added adapter-error diagnostics and localized adapter-error presentation while preserving raw adapter warning bodies
- `Phase 196` added compact-width evidence QA for combined diagnostic presentation stacks
- `Phase 197` added diagnostic archive and export compatibility review
- refresh it when provider adapters, source-selection behavior, provider snapshot fields, archive evidence schemas, or runtime i18n boundaries change materially

## Goal

Define the typed diagnostic model that should exist before adapter-generated diagnostic bodies are localized.

This is a planning contract. It does not change runtime behavior by itself.

## Why This Plan Exists

`Phase 183` localized provider-source display wrappers safely because those strings are generated from typed enums and helper state. The remaining adapter diagnostic bodies are different:

- they are emitted by provider adapters, sync fallback paths, seeded runtime states, or sample evidence
- they are currently used as raw evidence in UI, tests, operator workspaces, and archives
- some status classification still inspects English `warningReason` text as a fallback

Localizing those bodies directly would make evidence harder to compare and could break existing classification rules. The safe path is to introduce typed reason codes first, keep raw strings during migration, and only localize presentation generated from those codes after compatibility is proven.

## Current Raw Diagnostic Fields

These fields stay source-truthful while the typed model is populated:

| Field | Current role | Migration rule |
| --- | --- | --- |
| `ProviderSnapshot.warningReason` | human-readable warning or error detail | keep raw; add optional typed diagnostic beside it |
| `ProviderSnapshot.sourceSelectionReason` | source-selection explanation | keep raw; add optional typed source-selection diagnostic beside it |
| `ProviderSnapshot.sourceFallbackReason` | fallback explanation | keep raw; add optional typed fallback diagnostic beside it |
| sync-engine stale warning strings | generated cache freshness evidence | keep raw; typed sync-stale diagnostics are additive metadata |
| seeded store screenshot warnings | screenshot storyboard evidence | keep raw unless the seed explicitly opts into typed diagnostics |
| sample-state warning strings | test and preview evidence | keep raw until all affected assertions are migrated |

## Proposed Additive Runtime Contract

The first runtime implementation is additive. It does not remove or rename the existing raw string fields.

Recommended additions:

```ts
type ProviderDiagnosticSeverity = "info" | "warning" | "error";

type ProviderDiagnosticCategory =
  | "source_selection"
  | "source_fallback"
  | "credential"
  | "host_access"
  | "page_session"
  | "usage_threshold"
  | "policy_only"
  | "sync_stale"
  | "adapter_error";

type ProviderDiagnostic = {
  code: ProviderDiagnosticCode;
  category: ProviderDiagnosticCategory;
  severity: ProviderDiagnosticSeverity;
  rawMessage: string;
  params?: Record<string, string | number | boolean | null>;
};

type ProviderSnapshot = {
  warningReason: string | null;
  sourceSelectionReason: string;
  sourceFallbackReason: string | null;
  warningDiagnostic?: ProviderDiagnostic | null;
  sourceSelectionDiagnostic?: ProviderDiagnostic | null;
  sourceFallbackDiagnostic?: ProviderDiagnostic | null;
};
```

The exact TypeScript names can change during implementation, but the additive shape should stay: typed code plus category plus severity plus raw message plus optional parameters.

## Initial Code Taxonomy

The first code set should stay narrow and map only to diagnostics already emitted today.

| Code family | Example codes | Scope |
| --- | --- | --- |
| source selection | `source.auto_selected_official_api`, `source.auto_selected_session_page`, `source.preference_selected_official_api` | explains which source path won |
| source fallback | `source.official_api_missing_credential`, `source.official_api_failed`, `source.session_page_unavailable`, `source.no_live_path` | explains why the primary path failed |
| credential | `credential.admin_api_key_missing`, `credential.workspace_config_missing` | explains stored-credential blockers |
| host access | `host_access.missing`, `host_access.required_for_live_sync` | explains optional permission blockers |
| page session | `page_session.open_page_required`, `page_session.logged_out`, `page_session.capture_unavailable` | explains logged-in page blockers |
| usage threshold | `usage.threshold_warning`, `usage.overage_detected`, `usage.on_demand_off` | explains warning threshold and quota state |
| policy only | `policy.live_source_unavailable`, `policy.documented_limit_only` | explains documented-policy-only providers |
| sync stale | `sync.automatic_sync_overdue`, `sync.cached_state_stale` | explains stale cached state |
| adapter error | `adapter.unexpected_error`, `adapter.unsupported_response`, `adapter.parse_failed` | explains adapter-level failures |

## Parameter Rules

Use parameters for values that should be formatted or localized independently from the body text:

- provider id
- source kind
- source preference
- host label or origin count
- credential type
- usage percentage
- overage count
- unit label
- report day or timestamp

Do not put secrets, raw cookies, auth headers, full API keys, or raw response bodies into diagnostic parameters.

## Localization Rule

After typed diagnostics exist:

1. UI may show localized diagnostic labels or summaries from `code`.
2. UI must preserve access to `rawMessage` while archives and operator evidence still depend on it.
3. Runtime copy should prefer parameterized templates over translated raw strings.
4. Unknown codes must fall back to `rawMessage`.
5. Historical archives must not be rewritten.

## Migration Ladder

1. Add types and helpers without changing UI behavior - completed in `Phase 185`.
2. Populate source-selection and source-fallback diagnostics for Cursor and Codex because those adapters already have source attempt order helpers. Cursor completed in `Phase 186`; Codex completed in `Phase 187`.
3. Populate credential, host-access, and page-session diagnostics for provider adapters. Credential and host-access coverage for Cursor and Codex completed in `Phase 188`; page-session diagnostics for Cursor and Codex completed in `Phase 189`.
4. Populate usage-threshold and policy-only diagnostics for shared normalization and Gemini policy output - completed in `Phase 190`.
5. Populate sync-stale diagnostics in the sync engine - completed in `Phase 191`.
6. Update source-state classification to prefer typed diagnostics, with raw English pattern matching kept as a compatibility fallback - completed in `Phase 192`.
7. Localize warning presentation generated from typed warning diagnostic codes after typed coverage and compatibility tests pass - completed in `Phase 193`.
8. Localize source-selection and fallback presentation generated from typed source diagnostic codes after warning presentation proves the raw-evidence boundary - completed in `Phase 194`.
9. Populate adapter-error diagnostics only after the raw adapter-error boundary is explicit - completed in `Phase 195`.
10. Review diagnostic presentation density after warning, source, and adapter-error summaries are all visible - completed in `Phase 196`.
11. Review archive and export compatibility before localizing deeper diagnostic bodies or evidence payloads - completed in `Phase 197`.
12. Align sample and store seed typed diagnostic metadata after archive/export compatibility is explicit.

## Compatibility Rules

- raw diagnostic fields remain in `ProviderSnapshot` through the transition
- existing tests that assert raw strings should continue to pass until deliberately migrated
- archive, request, and export payloads should preserve raw diagnostic strings
- screenshot seed states should not be rewritten unless the screenshot story explicitly depends on typed diagnostics
- provider coverage claims must not change as part of diagnostic typing

## Review Checklist

Before any runtime implementation lands:

- list every adapter file that emits `warningReason`, `sourceSelectionReason`, or `sourceFallbackReason`
- list every non-adapter file that synthesizes warning strings
- decide the first minimal code family to implement
- add tests proving raw fields still pass through unchanged
- add tests proving unknown codes fall back to raw text
- update [I18n_Raw_Provider_Source_Truth_Policy.md](./I18n_Raw_Provider_Source_Truth_Policy.md) when typed coverage changes the boundary

## Current Implementation

`Phase 185` shipped the type-only additive model:

- `ProviderDiagnosticSeverity`
- `ProviderDiagnosticCategory`
- `KnownProviderDiagnosticCode`
- `ProviderDiagnostic`
- optional `ProviderSnapshot` typed diagnostic fields
- known-code category mapping
- raw-message fallback helper

`Phase 186` populated the first adapter path:

- reusable source-selection and source-fallback diagnostic builders in `src/providers/diagnostics.ts`
- Cursor `sourceSelectionDiagnostic` metadata beside existing `sourceSelectionReason`
- Cursor `sourceFallbackDiagnostic` metadata beside existing `sourceFallbackReason`
- no rendered UI behavior changes
- no raw diagnostic string rewrites

`Phase 187` populated the second explicit source-order adapter path:

- Codex `sourceSelectionDiagnostic` metadata beside existing `sourceSelectionReason`
- Codex `sourceFallbackDiagnostic` metadata beside existing `sourceFallbackReason`
- the same shared builders used for Cursor
- no rendered UI behavior changes
- no raw diagnostic string rewrites

`Phase 188` populated the first typed warning diagnostic family:

- reusable credential and host-access diagnostic builders in `src/providers/diagnostics.ts`
- Cursor missing Admin API key and missing host-access `warningDiagnostic` metadata
- Codex missing analytics workspace config and missing host-access `warningDiagnostic` metadata
- explicit clearing of non-covered `warningDiagnostic` paths to avoid stale typed warning metadata
- no rendered UI behavior changes
- no raw diagnostic string rewrites

`Phase 189` populated the page-session warning diagnostic family:

- reusable page-session diagnostic builder in `src/providers/diagnostics.ts`
- Cursor open-page-required, logged-out, and capture-unavailable `warningDiagnostic` metadata for the session-page path
- Codex open-page-required, logged-out, and capture-unavailable `warningDiagnostic` metadata for the session-page path
- no rendered UI behavior changes
- no raw diagnostic string rewrites

`Phase 190` populated the usage-threshold and policy-only warning diagnostic families:

- reusable usage-threshold and policy-only diagnostic builders in `src/providers/diagnostics.ts`
- shared `buildUsageSignal` usage-threshold diagnostics in `src/providers/normalize.ts`
- Cursor official overage and personal on-demand-off `warningDiagnostic` metadata
- Codex personal usage-threshold `warningDiagnostic` metadata
- Gemini documented-policy-only `warningDiagnostic` metadata
- no rendered UI behavior changes
- no raw diagnostic string rewrites

`Phase 191` populated the sync-stale warning diagnostic family:

- reusable sync-stale diagnostic builder in `src/providers/diagnostics.ts`
- sync-engine generated stale cached-state `warningDiagnostic` metadata
- sync-engine generated automatic-sync-overdue `warningDiagnostic` metadata
- existing provider warning diagnostics are not overwritten when the sync engine only updates freshness labels
- no rendered UI behavior changes
- no raw diagnostic string rewrites

`Phase 192` updated source-state classification:

- `src/shared/provider-sources.ts` now prefers typed `warningDiagnostic` categories and codes before raw English warning-pattern checks
- host-access, credential, page-session, usage-threshold, sync-stale, policy-only, and adapter-error categories map to the same existing source-state labels and tones where applicable
- raw English pattern checks still run for absent or unknown typed diagnostics
- no rendered UI label or source-state vocabulary changes
- no raw diagnostic string rewrites

`Phase 193` added the first localized presentation layer:

- `src/shared/localized-copy.ts` now generates localized labels and short summaries from known typed `warningDiagnostic` codes and params
- Settings source-card diagnostics can show localized warning diagnostic presentation beside existing raw readiness and source-truth fields
- Provider Detail can show the localized diagnostic summary before the raw warning reason note
- unknown typed warning codes return no presentation so raw fallback behavior remains available
- no raw diagnostic string rewrites

`Phase 194` expanded localized presentation to source diagnostics:

- known `sourceSelectionDiagnostic` codes now produce localized labels and short summaries
- known `sourceFallbackDiagnostic` codes now produce localized labels and short summaries
- Settings source-card diagnostics and Provider Detail show the localized source diagnostic presentation beside raw source-selection and fallback reason fields
- no source-selection or fallback behavior changed
- no raw diagnostic string rewrites

`Phase 195` populated adapter-error diagnostics and presentation:

- reusable adapter-error builders now cover `adapter.unexpected_error`, `adapter.unsupported_response`, and `adapter.parse_failed`
- Cursor and Codex parser route drift now maps to typed `adapter.parse_failed` diagnostics
- Cursor, Codex, and Claude Code catch paths now map stable repo-owned failures to typed `adapter.unexpected_error` diagnostics
- Settings and Provider Detail can show localized adapter-error labels and short summaries generated from typed metadata
- raw adapter warning bodies still remain visible and unchanged
- no provider coverage, source-selection, or fallback behavior changed

`Phase 196` added compact-width evidence QA for the combined diagnostic stack:

- `npm run phase196:review` seeds one zh-CN diagnostic stress state in local preview storage
- Settings source diagnostics are verified at `420px`
- Provider Detail diagnostics are verified at `360px`
- localized warning/source/adapter summaries are checked beside raw `warningReason`, `sourceSelectionReason`, and `sourceFallbackReason`
- no runtime source-selection or provider coverage behavior changed

`Phase 197` added diagnostic archive and export compatibility review:

- `Doc/I18n_Diagnostic_Archive_Export_Compatibility.md` records the maintained archive/export boundary
- `npm run phase197:review` verifies stable raw diagnostic fields, optional typed diagnostic fields, and `ProviderDiagnostic.rawMessage`
- the review inventories app-state storage, store screenshot seed/archives, theme-recovery exports, and interaction-audit exports
- localized diagnostic presentation remains separate from archive and export schemas
- no historical archives, provider coverage, source-selection behavior, or fallback order changed

## Next Executable Slice

The next safe implementation slice should align sample and store seed diagnostic metadata where stable typed codes already match raw sample evidence. Raw diagnostic bodies should remain visible for details, exports, and archive compatibility.
