# Phase 185 - Type-Only Additive Diagnostic Model

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Implement the first additive typed diagnostic model without changing rendered UI behavior or raw diagnostic strings.

This phase is the type-only additive diagnostic model slice.

## Why This Phase Exists

`Phase 184` defined the adapter diagnostic reason-code plan. This phase implements only the first safe runtime slice: types, known code taxonomy, helper functions, and focused tests.

## What Changed

- `ProviderSnapshot` now accepts optional `warningDiagnostic`, `sourceSelectionDiagnostic`, and `sourceFallbackDiagnostic` fields beside existing raw diagnostic strings.
- `src/providers/diagnostics.ts` now defines known diagnostic code categories plus helper functions for creating typed diagnostics and falling back to raw messages.
- `src/providers/diagnostics.test.ts` verifies raw-message preservation, additive snapshot shape, absent diagnostic fallback, and unknown future code fallback.
- `phase185-type-only-diagnostic-model-review.mjs` verifies code markers, docs, tests, and closeout references.

## Runtime Behavior

Rendered UI behavior is unchanged in this slice.

Existing raw diagnostic strings remain the source of displayed diagnostic bodies:

- `ProviderSnapshot.warningReason`
- `ProviderSnapshot.sourceSelectionReason`
- `ProviderSnapshot.sourceFallbackReason`

## Verification

- `npm run phase185:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `git diff --check`

## Follow-Up

The next safe implementation slice is Source Selection And Fallback Builders. It should populate typed source-selection and fallback diagnostics while preserving the existing raw strings exactly.
