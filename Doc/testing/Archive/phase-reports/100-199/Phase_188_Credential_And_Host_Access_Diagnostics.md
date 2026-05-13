# Phase 188 - Credential And Host-Access Diagnostics

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Populate typed warning diagnostics for missing credential and missing host-access states without changing rendered UI behavior or raw diagnostic strings.

This phase covers Cursor and Codex because both already have typed source-selection and fallback diagnostics.

## Why This Phase Exists

`Phase 185` added the additive typed diagnostic model. `Phase 186` and `Phase 187` populated source-selection and fallback diagnostics for Cursor and Codex. This phase moves the next diagnostic family into typed metadata by covering missing credential and host-access blockers while preserving raw warning text.

## What Changed

- `src/providers/diagnostics.ts` now includes reusable credential and host-access diagnostic builders.
- `src/providers/cursor/adapter.ts` now populates `warningDiagnostic` for missing Cursor Admin API key and missing Cursor host access.
- `src/providers/codex/adapter.ts` now populates `warningDiagnostic` for missing Codex analytics workspace config and missing Codex host access.
- Cursor and Codex success or non-covered warning paths explicitly clear `warningDiagnostic` to avoid stale typed warning metadata.
- `src/providers/diagnostics.test.ts`, `src/providers/cursor/adapter.test.ts`, and `src/providers/codex/adapter.test.ts` verify the typed diagnostics preserve raw warning messages.
- `phase188-credential-host-access-diagnostics-review.mjs` verifies code markers, docs, tests, and closeout references.

## Runtime Behavior

Rendered UI behavior is unchanged in this slice.

Existing raw diagnostic strings remain the displayed source truth:

- `ProviderSnapshot.warningReason`
- `ProviderSnapshot.sourceSelectionReason`
- `ProviderSnapshot.sourceFallbackReason`

The new typed diagnostics are additive metadata for future localization and classification work.

## Verification

- `npm run phase188:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `git diff --check`

## Follow-Up

The next safe implementation slice is Page-Session Diagnostics. It should populate typed diagnostics for open-page-required, logged-out, and capture-unavailable states while keeping raw provider warning and source-truth strings unchanged.
