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
| sync-engine stale warning strings | generated cache freshness evidence | keep raw until stale diagnostics have typed codes |
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
2. Populate source-selection and source-fallback diagnostics for Cursor and Codex because those adapters already have source attempt order helpers. Cursor completed in `Phase 186`; Codex remains next.
3. Populate credential, host-access, and page-session diagnostics for provider adapters.
4. Populate usage-threshold and policy-only diagnostics for shared normalization and Gemini policy output.
5. Populate sync-stale diagnostics in the sync engine.
6. Update source-state classification to prefer typed diagnostics, with raw English pattern matching kept only as a compatibility fallback.
7. Localize presentation generated from diagnostic codes after typed coverage and compatibility tests pass.

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

## Next Executable Slice

The next safe implementation slice should populate the same source-selection and source-fallback diagnostics for Codex while preserving exact raw strings and rendered UI behavior.
