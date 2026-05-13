# Phase 186 - Source Selection And Fallback Diagnostic Builders

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Populate the first real source-selection and source-fallback typed diagnostics without changing source-selection behavior, fallback order, rendered UI behavior, or raw diagnostic strings.

This phase is the Cursor source-selection and fallback diagnostic builders slice.

## Why This Phase Exists

`Phase 185` shipped the type-only additive diagnostic model. This phase proves that model against one narrow provider path by attaching stable diagnostic codes beside the raw Cursor source-selection and fallback messages already emitted by the adapter.

## What Changed

- `src/providers/diagnostics.ts` now includes reusable source-selection, source-fallback, and no-live-source diagnostic builders.
- `src/providers/cursor/adapter.ts` now populates `sourceSelectionDiagnostic` and `sourceFallbackDiagnostic` where the existing raw Cursor `sourceSelectionReason` and `sourceFallbackReason` are already generated.
- `src/providers/diagnostics.test.ts` verifies the new builders preserve raw messages.
- `src/providers/cursor/adapter.test.ts` verifies Cursor typed diagnostics for auto selection, preference fallback, missing-credential fallback, unavailable session page fallback, and no-live-path output.
- `phase186-source-selection-fallback-diagnostic-builders-review.mjs` verifies code markers, docs, tests, and closeout references.

## Runtime Behavior

Rendered UI behavior is unchanged in this slice.

Existing raw diagnostic strings remain the displayed source truth:

- `ProviderSnapshot.sourceSelectionReason`
- `ProviderSnapshot.sourceFallbackReason`

The new typed diagnostics are additive metadata for future localization and classification work.

## Verification

- `npm run phase186:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `git diff --check`

## Follow-Up

The next safe implementation slice is Codex Source Selection And Fallback Diagnostic Builders. It should reuse the shared builders, populate the equivalent Codex typed diagnostics, and preserve existing raw diagnostic strings exactly.
