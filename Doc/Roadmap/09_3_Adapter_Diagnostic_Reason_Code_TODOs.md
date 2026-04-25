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
- page-session diagnostics for Cursor and Codex completed in `Phase 189`
- usage-threshold and policy-only diagnostics completed in `Phase 190`
- sync-stale diagnostics completed in `Phase 191`
- source-state classification typed-diagnostic fallback completed in `Phase 192`
- localized warning diagnostic presentation completed in `Phase 193`
- source diagnostic presentation completed in `Phase 194`
- adapter-error diagnostics and presentation boundary completed in `Phase 195`
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

As of `Phase 195`:

- provider-source display wrappers are localized through `ProviderSourceDisplayCopy`
- raw provider source-truth fields still pass through unchanged
- `ProviderSnapshot` has optional typed diagnostic fields beside the raw strings
- `src/providers/diagnostics.ts` provides known diagnostic code categories and raw-message fallback helpers
- `src/providers/diagnostics.ts` now also provides reusable source-selection, source-fallback, credential, host-access, page-session, usage-threshold, policy-only, and sync-stale diagnostic builders
- `src/providers/normalize.ts` now returns usage-threshold diagnostics from shared usage-signal normalization when a provider id is supplied
- the sync engine now populates typed sync-stale `warningDiagnostic` metadata only when it is the component generating the stale raw warning body
- source-state classification now prefers typed warning diagnostic categories where available and keeps raw English warning-pattern matching as compatibility fallback
- Settings and Provider Detail now render localized labels and a short diagnostic summary from known typed `warningDiagnostic` codes and params
- Settings and Provider Detail now render localized labels and short summaries from known typed `sourceSelectionDiagnostic` and `sourceFallbackDiagnostic` codes and params
- Settings and Provider Detail now render localized labels and short summaries for known `adapter.*` diagnostics while keeping raw adapter warning bodies visible
- `src/providers/diagnostics.ts` now provides a reusable adapter-error diagnostic builder for unexpected adapter failures, unsupported responses, and parser failures
- the Cursor adapter populates typed `sourceSelectionDiagnostic` and `sourceFallbackDiagnostic` metadata beside existing raw source-selection and fallback strings
- the Codex adapter populates typed `sourceSelectionDiagnostic` and `sourceFallbackDiagnostic` metadata beside existing raw source-selection and fallback strings
- Cursor and Codex now populate typed `warningDiagnostic` metadata for missing credential and missing host-access blockers
- Cursor and Codex now populate typed `warningDiagnostic` metadata for open-page-required, logged-out, and capture-unavailable page-session blockers
- Cursor now populates typed `warningDiagnostic` metadata for official-path overage and personal-page on-demand-off usage states
- Codex now populates typed `warningDiagnostic` metadata for personal-page usage threshold states
- Gemini now populates typed `warningDiagnostic` metadata for its shipped documented-policy-only state
- stale cached-state and overdue automatic-sync states now have typed `warningDiagnostic` metadata when the sync engine emits the raw stale warning
- Cursor and Codex now populate typed `adapter.parse_failed` metadata for personal-page parser route drift
- Cursor and Codex now populate typed `adapter.unexpected_error` metadata for official and personal adapter catch paths
- Claude Code now populates typed `adapter.unexpected_error` metadata for analytics API catch paths
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

- completed in `Phase 189` for Cursor and Codex
- map open-page-required, logged-out, and capture-unavailable states into typed diagnostics
- keep vendor-owned page wording raw
- avoid changing page-binding behavior

### E. Usage Threshold And Policy-Only Diagnostics

- completed in `Phase 190`
- map shared normalization warnings into typed usage-threshold diagnostics
- map policy-only provider diagnostics into typed policy-only diagnostics
- keep quota and policy wording raw until localized templates are explicitly implemented

### F. Sync-Stale Diagnostics

- completed in `Phase 191`
- map sync-engine stale cache warnings into typed diagnostics
- keep current stale copy visible until UI presentation is migrated
- add tests for cached-state fallback behavior

### G. Source-State Classification Typed Diagnostic Fallback

- completed in `Phase 192`
- update source-state classification to prefer typed diagnostic categories where present
- keep current English raw-string checks as compatibility fallback
- add regression tests proving absent or unknown typed diagnostics still render the current source-state fallback
- avoid changing visible provider-source labels except where typed metadata already matches the current raw-string classification

### H. Localized Presentation Follow-Up

- first warning-diagnostic presentation slice completed in `Phase 193`
- render localized diagnostic summaries from codes and params
- keep raw diagnostic bodies accessible in details, exports, or evidence views
- add unknown-code fallback tests

### I. Source Selection And Fallback Diagnostic Presentation Expansion

- completed in `Phase 194`
- render localized presentation for typed `sourceSelectionDiagnostic` and `sourceFallbackDiagnostic` values
- keep raw source-selection and fallback bodies visible for evidence-oriented surfaces
- add unknown-code fallback tests for both source diagnostic fields
- avoid changing source-selection order or fallback behavior

### J. Adapter-Error Diagnostic Builders And Presentation Boundary

- completed in `Phase 195`
- reusable adapter-error builders now cover `adapter.unexpected_error`, `adapter.unsupported_response`, and `adapter.parse_failed`
- Cursor, Codex, and Claude Code now populate adapter-error diagnostics only where the repo already owns stable error semantics
- keep raw adapter error messages visible for evidence-oriented surfaces
- localized adapter-error summaries are generated from typed metadata and do not translate raw adapter bodies directly
- focused tests cover the builder, localized presentation, parser route drift, and Claude analytics catch behavior

### K. Diagnostic Presentation Compact-Width And Evidence QA

- next recommended slice
- review Settings and Provider Detail diagnostic presentation density after warning, source, and adapter-error summaries are all visible
- verify compact-width behavior for diagnostic stacks with raw warning, source-selection, source-fallback, and adapter-error bodies
- verify evidence-oriented surfaces still expose raw `warningReason`, `sourceSelectionReason`, and `sourceFallbackReason`
- keep this as presentation QA; do not add new provider coverage claims

## First Implementation Candidate

The next runtime phase should implement the first narrow slice of `K. Diagnostic Presentation Compact-Width And Evidence QA`.

Recommended scope:

- build a compact-width fixture or focused review for known diagnostic-summary stacks
- verify Settings source cards and Provider Detail remain scannable when localized summaries and raw evidence bodies both exist
- keep unknown typed diagnostics on raw fallback behavior
- preserve exact raw `warningReason`, `sourceSelectionReason`, and `sourceFallbackReason` strings
- avoid adding new provider coverage or changing source-selection behavior

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
