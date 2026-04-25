# Phase 191 - Sync-Stale Diagnostics

Date: 2026-04-25

Document class:

- archived phase

## Goal

Populate typed warning diagnostics for sync engine stale states without changing rendered UI behavior or raw diagnostic strings.

## Scope

- add one sync-stale diagnostic builder
- attach typed metadata to sync-engine generated stale cached-state warnings
- attach typed metadata to sync-engine generated automatic-sync-overdue warnings
- preserve existing provider-owned warning diagnostics when sync health reconciliation only updates freshness state
- update roadmap, i18n boundary, phase-index, and closeout docs

## What Changed

- `src/providers/diagnostics.ts` now includes `createSyncStaleDiagnostic`.
- `src/background/sync-engine.ts` now emits `sync.cached_state_stale` and `sync.automatic_sync_overdue` typed warning diagnostics for raw stale warning messages it creates.
- `src/providers/diagnostics.test.ts` and `src/background/sync-engine.test.ts` verify raw warning preservation and provider-diagnostic preservation.
- `scripts/phase191-sync-stale-diagnostics-review.mjs` records the phase-specific review artifact.

## Preserved Boundaries

- raw diagnostic strings remain source truth
- no rendered UI behavior changed
- no sync cadence, cache invalidation, provider source selection, or provider coverage claim changed
- existing provider warning diagnostics are not overwritten by stale freshness reconciliation

## Verification

- `npm run phase191:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `git diff --check`

## Follow-Up

Continue `Direction 09.3` with source-state classification typed-diagnostic fallback. That slice should prefer typed diagnostic categories when available while preserving raw English fallback checks for compatibility.
