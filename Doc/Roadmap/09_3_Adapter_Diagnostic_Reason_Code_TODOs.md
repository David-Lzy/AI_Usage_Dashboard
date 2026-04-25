# Direction 09.3 - Adapter Diagnostic Reason-Code TODOs

Date: 2026-04-25

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- living strategy

Status note:

- created in `Phase 184`
- type-only additive model completed in `Phase 185`
- Cursor source-selection and fallback diagnostic builders completed in `Phase 186`
- Codex source-selection and fallback diagnostic builders completed in `Phase 187`
- credential and host-access diagnostics for Cursor and Codex completed in `Phase 188`
- this child TODO turns the adapter diagnostic reason-code plan into executable follow-up slices
- refresh it when typed diagnostic coverage, provider adapter behavior, or archive compatibility rules change

Parent direction:

- [Direction 09 - Internationalization Bootstrap And Pilot Locales](./09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md)

Maintained reference:

- [I18n_Adapter_Diagnostic_Reason_Code_Plan.md](../I18n_Adapter_Diagnostic_Reason_Code_Plan.md)

## Goal

Introduce typed adapter diagnostics before localizing adapter-generated diagnostic bodies.

The goal is not to translate raw provider evidence immediately. The goal is to make future localization safe by giving diagnostics stable codes, categories, severities, and optional parameters while preserving raw strings.

## Current Truth

As of `Phase 188`:

- provider-source display wrappers are localized through `ProviderSourceDisplayCopy`
- raw provider source-truth fields still pass through unchanged
- `ProviderSnapshot` has optional typed diagnostic fields beside the raw strings
- `src/providers/diagnostics.ts` provides known diagnostic code categories and raw-message fallback helpers
- `src/providers/diagnostics.ts` now also provides reusable source-selection, source-fallback, and no-live-source diagnostic builders
- the Cursor adapter populates typed `sourceSelectionDiagnostic` and `sourceFallbackDiagnostic` metadata beside existing raw source-selection and fallback strings
- the Codex adapter populates typed `sourceSelectionDiagnostic` and `sourceFallbackDiagnostic` metadata beside existing raw source-selection and fallback strings
- Cursor and Codex now populate typed `warningDiagnostic` metadata for missing credential and missing host-access blockers
- `ProviderSnapshot.warningReason` remains the primary raw warning body
- `ProviderSnapshot.sourceSelectionReason` remains the primary raw source-selection explanation
- `ProviderSnapshot.sourceFallbackReason` remains the primary raw fallback explanation
- provider state classification still uses some English raw-string pattern checks as compatibility fallback
- archives, requests, screenshot seed states, and tests still depend on raw diagnostic text

## Non-Negotiable Boundaries

- do not remove raw diagnostic fields during the first implementation slice
- do not localize raw adapter diagnostic bodies before typed codes exist
- do not rewrite historical archives
- do not change provider coverage claims
- do not change source-selection behavior or fallback order
- do not put secrets, raw cookies, auth headers, full API keys, or raw response bodies into diagnostic params

## Planned Slices

### A. Type-Only Additive Model

- completed in `Phase 185`
- add diagnostic type definitions
- define code, category, severity, raw message, and optional params
- add optional fields beside existing raw string fields
- add tests proving raw fields still exist and can be preserved
- avoid UI behavior changes

### B. Source Selection And Fallback Builders

- completed for Cursor and Codex in `Phase 186` and `Phase 187`
- add helper builders for source-selection and fallback diagnostics
- start with Cursor and Codex because those adapters already have explicit source attempt order logic
- Cursor now uses the shared builders without changing raw string output
- Codex now uses the same shared builders without changing raw string output
- preserve existing source-selection and fallback strings exactly
- add tests that compare raw string output before and after typing

### C. Credential And Host-Access Diagnostics

- completed in `Phase 188` for Cursor and Codex
- map missing admin API key, missing workspace config, and host-access blockers into typed diagnostics
- keep provider settings and host labels raw
- make source-state classification prefer typed categories where available
- keep raw English pattern matching as fallback

### D. Page-Session Diagnostics

- next recommended slice
- map open-page-required, logged-out, stale binding, and capture-unavailable states into typed diagnostics
- keep vendor-owned page wording raw
- avoid changing page-binding behavior

### E. Usage Threshold And Policy-Only Diagnostics

- map shared normalization warnings into typed usage-threshold diagnostics
- map policy-only provider diagnostics into typed policy-only diagnostics
- keep quota and policy wording raw until localized templates are explicitly implemented

### F. Sync-Stale Diagnostics

- map sync-engine stale cache warnings into typed diagnostics
- keep current stale copy visible until UI presentation is migrated
- add tests for cached-state fallback behavior

### G. Localized Presentation Follow-Up

- only start after typed coverage is stable
- render localized diagnostic summaries from codes and params
- keep raw diagnostic bodies accessible in details, exports, or evidence views
- add unknown-code fallback tests

## First Implementation Candidate

The next runtime phase should implement the first narrow slice of `D. Page-Session Diagnostics`.

Recommended scope:

- start with Cursor and Codex because both have typed source diagnostics and explicit page-session blocker states
- populate `warningDiagnostic` for open-page-required, logged-out, and parser/capture unavailable states without changing raw `warningReason`
- keep source-state classification raw-string fallback intact until typed coverage is broader
- no UI rendering changes
- no source-selection or fallback-order behavior changes
- preserve exact raw `warningReason`, `sourceSelectionReason`, and `sourceFallbackReason` strings

## Acceptance Criteria

- raw diagnostic string fields remain present and unchanged
- typed diagnostic fields are optional and backward-compatible
- unknown or absent typed diagnostics fall back to raw strings
- docs and tests state that diagnostic typing does not imply translated diagnostic bodies yet
- provider coverage truth remains unchanged:
  - JetBrains stays deferred for the active promise
  - Claude personal support is not yet graduated
  - Gemini remains policy-only
  - Codex and Cursor personal support remain partial rather than absolute remaining-balance claims

## Out Of Scope

- translating diagnostic body copy
- changing provider source selection
- changing provider setup requirements
- changing screenshot archive semantics
- changing operator evidence schemas
- adding new provider coverage
