# Phase 187 - Codex Source Selection And Fallback Diagnostic Builders

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Populate Codex source-selection and source-fallback typed diagnostics without changing source-selection behavior, fallback order, rendered UI behavior, or raw diagnostic strings.

This phase completes the Codex half of the source-selection and fallback diagnostic builders track started in `Phase 186`.

## Why This Phase Exists

`Phase 186` proved the shared source diagnostic builders on Cursor. Codex has the same explicit source attempt order shape, so this phase applies the same additive diagnostic metadata to Codex before moving to credential and host-access diagnostic coverage.

## What Changed

- `src/providers/codex/adapter.ts` now populates `sourceSelectionDiagnostic` and `sourceFallbackDiagnostic` where the existing raw Codex `sourceSelectionReason` and `sourceFallbackReason` are already generated.
- `src/providers/codex/adapter.test.ts` verifies Codex typed diagnostics for auto selection, preference fallback, missing-configuration fallback, unavailable session page fallback, and no-live-path output.
- `phase187-codex-source-diagnostic-builders-review.mjs` verifies code markers, docs, tests, and closeout references.

## Runtime Behavior

Rendered UI behavior is unchanged in this slice.

Existing raw diagnostic strings remain the displayed source truth:

- `ProviderSnapshot.sourceSelectionReason`
- `ProviderSnapshot.sourceFallbackReason`

The new typed diagnostics are additive metadata for future localization and classification work.

## Verification

- `npm run phase187:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `git diff --check`

## Follow-Up

The next safe implementation slice is Credential And Host-Access Diagnostics. It should populate typed diagnostics for missing admin or analytics credentials and missing host-access blockers while keeping raw warning and source-truth strings unchanged.
