# Phase 196 - Diagnostic Presentation Compact Evidence QA

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Add a repeatable compact-width QA pass for the full diagnostic presentation stack after warning, source, and adapter-error summaries became visible.

## Why This Phase Exists

`Phase 195` completed adapter-error diagnostic presentation. Settings and Provider Detail can now show localized diagnostic summaries beside raw warning, source-selection, and fallback evidence. This phase verifies that the combined stack remains scannable at compact widths and that raw evidence stays visible.

## What Changed

- Added `scripts/phase196-diagnostic-presentation-compact-evidence-review.mjs`.
- Added `npm run phase196:review`.
- The review seeds a zh-CN diagnostic stress state in local preview storage with:
  - localized adapter-error presentation
  - localized source-selection presentation
  - localized fallback presentation
  - raw `warningReason`
  - raw `sourceSelectionReason`
  - raw `sourceFallbackReason`
- The review checks Settings source diagnostics at `420px`.
- The review checks Provider Detail diagnostics at `360px`.
- The review writes screenshots and a machine-readable report under `tmp/phase196-diagnostic-presentation-compact-evidence-review/`.

## Preserved Boundaries

- Raw diagnostic bodies remain visible and unchanged.
- This phase does not change provider coverage, source-selection behavior, fallback order, sync cadence, archive schemas, or store-screenshot assets.
- The seeded state is review-only; it does not change default runtime data.
- Localized diagnostic summaries remain presentation generated from typed metadata, not translations of raw adapter evidence.

## Verification

- `npm run phase196:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `git diff --check`

## Follow-Up

Continue `Direction 09.3` with diagnostic archive and export compatibility review before any deeper diagnostic-body localization or evidence payload localization.
