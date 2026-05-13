# Phase 190 - Usage Threshold And Policy-Only Diagnostics

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Populate typed warning diagnostics for usage-threshold and policy-only states without changing rendered UI behavior or raw diagnostic strings.

This phase covers Cursor, Codex, Gemini, and the shared usage-signal helper.

## Why This Phase Exists

`Phase 185` added the additive typed diagnostic model. `Phase 186` through `Phase 189` populated source-selection, fallback, credential, host-access, and page-session diagnostic metadata. This phase moves usage and policy blocker families into typed metadata while preserving raw warning text.

## What Changed

- `src/providers/diagnostics.ts` now includes reusable usage-threshold and policy-only diagnostic builders.
- `src/providers/normalize.ts` now returns typed usage-threshold diagnostics from shared usage-signal normalization when a provider id is supplied.
- `src/providers/cursor/adapter.ts` now populates `warningDiagnostic` for Cursor official overage and personal on-demand-off states.
- `src/providers/codex/adapter.ts` now populates `warningDiagnostic` for Codex personal usage-window threshold states.
- `src/providers/gemini/adapter.ts` now populates `warningDiagnostic` for the shipped Gemini documented-policy-only state.
- `src/providers/diagnostics.test.ts`, `src/providers/normalize.test.ts`, `src/providers/cursor/adapter.test.ts`, `src/providers/codex/adapter.test.ts`, and `src/providers/gemini/adapter.test.ts` verify the typed diagnostics preserve raw warning messages.
- `phase190-usage-policy-diagnostics-review.mjs` verifies code markers, docs, tests, and closeout references.

## Runtime Behavior

Rendered UI behavior is unchanged in this slice.

Existing raw diagnostic strings remain the displayed source truth:

- `ProviderSnapshot.warningReason`
- `ProviderSnapshot.sourceSelectionReason`
- `ProviderSnapshot.sourceFallbackReason`

The new typed diagnostics are additive metadata for future localization and classification work.

## Verification

- `npm run phase190:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `git diff --check`

## Follow-Up

The next safe implementation slice is sync-stale diagnostics. It should populate typed diagnostics for stale cached-state and overdue automatic-sync states while keeping raw provider warning and source-truth strings unchanged.
