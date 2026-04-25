# I18n Raw Provider Source-Truth Policy

Date: 2026-04-25

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file records the provider source-truth localization boundary after `Phase 183`
- `Phase 184` added [I18n_Adapter_Diagnostic_Reason_Code_Plan.md](./I18n_Adapter_Diagnostic_Reason_Code_Plan.md) as the maintained plan for typed adapter diagnostics
- `Phase 185` added optional typed diagnostic fields while keeping raw provider source-truth fields unchanged
- `Phase 186` populated Cursor source-selection and fallback typed diagnostics while preserving raw `sourceSelectionReason` and `sourceFallbackReason` strings
- `Phase 187` populated Codex source-selection and fallback typed diagnostics while preserving raw `sourceSelectionReason` and `sourceFallbackReason` strings
- `Phase 188` populated Cursor and Codex credential and host-access typed diagnostics while preserving raw `warningReason`, `sourceSelectionReason`, and `sourceFallbackReason` strings
- `Phase 189` populated Cursor and Codex page-session typed diagnostics while preserving raw `warningReason`, `sourceSelectionReason`, and `sourceFallbackReason` strings
- `Phase 190` populated usage-threshold and policy-only typed diagnostics while preserving raw `warningReason`, `sourceSelectionReason`, and `sourceFallbackReason` strings
- `Phase 191` populated sync-stale typed diagnostics while preserving raw sync-engine `warningReason`, `sourceSelectionReason`, and `sourceFallbackReason` strings
- `Phase 192` made source-state classification prefer typed diagnostics while preserving raw English warning-pattern fallback for older snapshots and unknown diagnostic codes
- `Phase 193` added localized warning diagnostic presentation while preserving raw `warningReason`, `sourceSelectionReason`, and `sourceFallbackReason` strings
- `Phase 194` added localized source diagnostic presentation while preserving raw `sourceSelectionReason` and `sourceFallbackReason` strings
- `Phase 195` added typed adapter-error diagnostics and localized adapter-error presentation while preserving raw adapter `warningReason` strings
- `Phase 196` added compact-width diagnostic presentation QA while preserving raw diagnostic evidence visibility
- `Phase 197` added diagnostic archive/export compatibility review while preserving raw diagnostic evidence schema fields
- `Phase 198` aligned maintained sample and store seed typed diagnostic metadata while preserving raw diagnostic evidence strings
- refresh it when provider source display helpers, adapter reason fields, provider-source blueprints, or runtime i18n scope changes materially

## Goal

Separate provider source-truth evidence from presentation-only wrapper copy so the `en + zh_CN` runtime pilot can continue without translating strings that still carry source selection, provider contract, archive, or adapter diagnostic meaning.

## Why This Boundary Exists

Provider copy is different from ordinary UI copy.

Some strings are normal product labels and can be localized safely. Other strings describe what the provider adapter saw, why a source was selected, why a fallback happened, or what the current shipped contract promises. Translating those raw strings too early would create two risks:

- status classification could break because current code still inspects English `warningReason` patterns
- evidence review could become ambiguous because archives, tests, and provider contracts would no longer match the raw runtime state

## Current Raw Fields

These fields remain raw source-truth values while typed diagnostics are populated and reviewed:

| Field | Source | Current policy |
| --- | --- | --- |
| `ProviderSnapshot.warningReason` | provider adapters, seeded runtime states, sample state | raw evidence; do not translate directly |
| `ProviderSnapshot.sourceSelectionReason` | provider adapters and seed states | raw source-selection explanation; do not translate directly |
| `ProviderSnapshot.sourceFallbackReason` | provider adapters and seed states | raw fallback explanation; do not translate directly |
| non-parseable `resetAt` values | provider snapshots | raw vendor or policy window labels |
| non-pattern `resetLabel` and `lastSyncLabel` values | provider snapshots | raw unless handled by explicit locale-aware formatting helpers |
| `ProviderSourcePlan.contractDetail` | `PROVIDER_SOURCE_BLUEPRINTS` | source-contract evidence; keep raw until plan strings become stable message ids |
| `ProviderSourcePlan.note` | `PROVIDER_SOURCE_BLUEPRINTS` | source-contract evidence; keep raw until plan strings become stable message ids |
| `ProviderSourcePlan.graduationGateLabel` | `PROVIDER_SOURCE_BLUEPRINTS` | source-contract evidence; keep raw until a graduation-gate id model exists |
| `ProviderSourcePlan.graduationGateDetail` | `PROVIDER_SOURCE_BLUEPRINTS` | source-contract evidence; keep raw until a graduation-gate id model exists |
| `ProviderSetting.description` | sample and persisted settings | provider contract helper text; keep raw until settings source-card wrappers are split from evidence |
| `ProviderSetting.hostsLabel` and `hostOrigins` | sample and persisted settings | technical target identifiers; do not translate |
| provider labels, provider ids, route hints, URLs, and API names | provider config and blueprints | stable identifiers; do not translate |

## Presentation-Only Candidates

These were localized in `Phase 183` because they are derived from typed enums or helper state, not raw adapter evidence:

- source kind labels:
  - `Official API`
  - `Session page`
  - `Policy only`
- source preference labels:
  - `Auto`
  - `Official API`
  - `Session page`
- rollout-stage labels:
  - `Shipped`
  - `Planned`
  - `Deferred`
- field availability labels:
  - `Exact`
  - `Window only`
  - `Analytics`
  - `Policy`
  - `Unavailable`
- source fidelity labels and helper descriptions generated from `ProviderSourceFidelityKind`
- source contract labels generated from `ProviderSourceContractKind`
- connection-mode labels and helper descriptions generated from `SourceConnectionMode`
- credential, cookie, manual-cookie-import, and host-access helper labels generated by provider-source display helpers
- page-binding labels and helper descriptions generated from `ProviderPageBinding`
- `classifySourceState` labels and fallback details when they are generated from state, not copied from `warningReason`
- availability summaries generated from typed field availability values

## Localized Display Wrappers

`Phase 183` moved the presentation-only bucket into the runtime pilot through `ProviderSourceDisplayCopy` and `buildProviderSourceDisplayLocalizedCopy`.

The localized wrappers now include:

- source kind and source preference labels
- rollout, availability, fidelity, connection, and contract labels
- generated fidelity, access-model, credential, cookie, manual-cookie-import, host-access, page-binding, and fallback source-state helper descriptions
- generated availability summaries

The raw fields in [Current Raw Fields](#current-raw-fields) still pass through unchanged. For example, a localized Settings source card may show a localized `Fallback reason` field label while preserving the English raw fallback body emitted by the provider adapter.

## Implementation Rule

Future localization should prefer this order:

1. Localize presentation-only enum labels and helper descriptions.
2. Preserve raw adapter fields exactly and show them under localized labels such as `Warning reason`, `Selection reason`, or `Fallback reason`.
3. Add tests that prove raw `warningReason`, `sourceSelectionReason`, and `sourceFallbackReason` values are still passed through unchanged.
4. Only after that, introduce typed reason codes for adapter-generated diagnostics if the product needs localized diagnostic bodies.
5. Only after typed reason codes exist, consider localizing adapter diagnostics from code plus data instead of translating raw strings directly.
6. After `Phase 193`, warning diagnostics may expose localized presentation generated from typed metadata, but the raw warning body remains visible for evidence.
7. After `Phase 194`, source-selection and fallback diagnostics may expose localized presentation generated from typed metadata, but the raw source bodies remain visible for evidence.
8. After `Phase 195`, adapter-error diagnostics may expose localized presentation generated from typed metadata, but raw adapter error bodies remain visible for evidence.
9. After `Phase 196`, compact-width QA must keep localized diagnostic summaries and raw evidence bodies visible together.
10. After `Phase 197`, archive and export compatibility reviews must treat localized diagnostic presentation as UI output, not as a replacement for raw diagnostic evidence fields.
11. After `Phase 198`, maintained sample and store seed typed metadata may be aligned where stable codes already match raw strings, but frozen historical evidence must not be rewritten.

## Out Of Scope

- translating vendor-owned page text
- translating provider names, ids, URLs, route hints, or API names
- translating generated archive evidence, fixture text, or request manifests
- changing provider coverage claims
- changing source-selection behavior or fallback order
- replacing raw adapter diagnostics with localized prose before typed reason codes exist

## Next Executable Slice

The next safe engineering slice should review diagnostic fixtures and historical evidence references before any deeper diagnostic-body localization.

It should not translate raw provider source-truth fields listed above directly; localized output should be generated from typed diagnostics and must keep raw bodies available for evidence surfaces. Maintained fixtures can be aligned only where raw strings already have stable codes; archived evidence should remain unchanged.
