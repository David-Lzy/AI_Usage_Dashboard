# Phase 197 - Diagnostic Archive Export Compatibility Review

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Add a repeatable static review for diagnostic archive and export compatibility before deeper diagnostic-body or evidence-payload localization.

## Why This Phase Exists

`Phase 196` proved the localized diagnostic stack can remain compact while raw evidence stays visible. The next risk is schema drift: archives, requests, screenshot seeds, and operator exports must keep raw diagnostic fields stable instead of silently replacing them with localized presentation text.

## What Changed

- Added `Doc/I18n/I18n_Diagnostic_Archive_Export_Compatibility.md`.
- Added `scripts/phase197-diagnostic-archive-export-compatibility-review.mjs`.
- Added `npm run phase197:review`.
- The review inventories runtime schema, app-state storage, store screenshot seeds, store screenshot archives, theme-recovery exports, and interaction-audit exports.
- The review writes a machine-readable compatibility report under `tmp/phase197-diagnostic-archive-export-compatibility-review/`.

## Preserved Boundaries

- Raw diagnostic bodies remain source truth.
- Typed diagnostic fields remain optional additive metadata.
- Localized diagnostic presentation is not an archive schema.
- This phase does not rewrite historical archives, request manifests, screenshot assets, provider coverage, source-selection behavior, or fallback order.

## Verification

- `npm run phase197:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `git diff --check`

## Follow-Up

Continue `Direction 09.3` with sample and store seed diagnostic metadata alignment so maintained sample/seed states can gain typed diagnostic metadata without changing raw evidence strings.
