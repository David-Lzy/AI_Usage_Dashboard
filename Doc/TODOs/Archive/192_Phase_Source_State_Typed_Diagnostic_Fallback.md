# Phase 192 - Source-State Typed Diagnostic Fallback

Date: 2026-04-25

Document class:

- archived phase

## Goal

Make source-state classification prefer typed warning diagnostics while preserving raw diagnostic strings and rendered UI behavior.

## Scope

- add a typed diagnostic classification path before raw English warning-pattern checks
- keep host-access, credential, page-session, sync-error, policy-only, and ready source-state vocabulary unchanged
- preserve raw English fallback for absent or unknown typed diagnostics
- update roadmap, i18n boundary, phase-index, and closeout docs

## What Changed

- `src/shared/provider-sources.ts` now classifies source state from `warningDiagnostic` categories and codes before raw warning text.
- `src/shared/provider-sources.test.ts` covers typed host-access, credential, page-session, usage-threshold, sync-stale, automatic-sync-overdue, and unknown-diagnostic fallback behavior.
- `scripts/phase192-source-state-typed-diagnostic-fallback-review.mjs` records the phase-specific review artifact.

## Preserved Boundaries

- raw diagnostic strings remain source truth
- no rendered source-state label vocabulary changed
- no provider source selection, sync cadence, cache invalidation, or provider coverage claim changed
- unknown typed diagnostics and older snapshots still use raw English pattern fallback

## Verification

- `npm run phase192:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `git diff --check`

## Follow-Up

Continue `Direction 09.3` with localized diagnostic presentation follow-up. That slice should generate localized presentation from typed diagnostic codes and params while keeping raw diagnostic bodies available for evidence surfaces.
