# Phase 198 - Sample Store Seed Diagnostic Metadata Alignment

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Align maintained sample and store screenshot seed diagnostic metadata where stable typed diagnostic codes already match existing raw evidence strings.

## Why This Phase Exists

`Phase 197` locked the archive/export compatibility boundary. The next safe i18n-adjacent diagnostic step was to make maintained sample and seed states participate in the same typed diagnostic model without changing runtime provider behavior, screenshot assets, or archive schemas.

## What Changed

- `SAMPLE_APP_STATE` now includes additive typed diagnostics for stable Cursor, JetBrains, Gemini, and Codex sample diagnostic strings.
- Store screenshot seed states now clear stale typed metadata for raw-only storyboard copy.
- Store screenshot seed states now add typed metadata for stable host-access, workspace-credential, and source-selection seed diagnostics.
- Added `scripts/phase198-sample-store-seed-diagnostic-metadata-review.mjs`.
- Added `npm run phase198:review`.
- Updated Direction 09.3 and maintained i18n docs so the next slice is diagnostic fixture and historical evidence alignment review.

## Preserved Boundaries

- raw diagnostic strings stayed unchanged.
- Provider coverage claims stayed unchanged.
- Source-selection behavior and fallback order stayed unchanged.
- Archive schemas, request schemas, and screenshot assets stayed unchanged.
- Raw-only seed story copy remains raw-only where a typed code would be misleading.

## Verification

- `npm run phase198:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `git diff --check`

## Follow-Up

Continue `Direction 09.3` with diagnostic fixture and historical evidence alignment review. Mutable maintained fixtures can gain typed metadata only where stable codes already match raw strings; frozen archives should not be rewritten.
