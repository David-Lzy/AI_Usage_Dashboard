# Phase 189 - Page-Session Diagnostics

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Populate typed warning diagnostics for page-session blocker states without changing rendered UI behavior or raw diagnostic strings.

This phase covers Cursor and Codex because both already have typed source-selection, fallback, credential, and host-access diagnostics.

## Why This Phase Exists

`Phase 185` added the additive typed diagnostic model. `Phase 186` through `Phase 188` populated source-selection, fallback, credential, and host-access diagnostic metadata for Cursor and Codex. This phase moves the next blocker family into typed metadata by covering page-session states while preserving raw warning text.

## What Changed

- `src/providers/diagnostics.ts` now includes a reusable page-session diagnostic builder.
- `src/providers/cursor/adapter.ts` now populates `warningDiagnostic` for Cursor page-session open-page-required, logged-out, route-drift, and capture-unavailable blocker paths.
- `src/providers/codex/adapter.ts` now populates `warningDiagnostic` for Codex page-session open-page-required, logged-out, route-drift, and capture-unavailable blocker paths.
- `src/providers/diagnostics.test.ts`, `src/providers/cursor/adapter.test.ts`, and `src/providers/codex/adapter.test.ts` verify the typed diagnostics preserve raw warning messages.
- `phase189-page-session-diagnostics-review.mjs` verifies code markers, docs, tests, and closeout references.

## Runtime Behavior

Rendered UI behavior is unchanged in this slice.

Existing raw diagnostic strings remain the displayed source truth:

- `ProviderSnapshot.warningReason`
- `ProviderSnapshot.sourceSelectionReason`
- `ProviderSnapshot.sourceFallbackReason`

The new typed diagnostics are additive metadata for future localization and classification work.

## Verification

- `npm run phase189:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `git diff --check`

## Follow-Up

The next safe implementation slice is usage-threshold and policy-only diagnostics. It should populate typed diagnostics for shared usage warnings and policy-only provider states while keeping raw provider warning and source-truth strings unchanged.
