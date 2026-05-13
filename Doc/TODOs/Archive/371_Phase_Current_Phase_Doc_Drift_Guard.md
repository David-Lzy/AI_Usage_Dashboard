# Phase 371 - Current Phase Doc Drift Guard

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-13

## Goal

Make `npm run docs:check` catch stale "current phase" references in the maintained docs that are updated after every completed phase.

## Scope

- Extend the doc taxonomy checker with a formatted latest phase label derived from the newest archived phase filename.
- Verify the top-level TODO current execution header references the latest phase.
- Verify the strategic directions index current truth references the latest phase.
- When the phase index has no queued phase files, verify README and top-level TODO no-queued-phase text references the latest phase.
- Keep the existing taxonomy label checks and phase-index/archive alignment checks unchanged.

## Preserved Boundaries

- No runtime UI behavior changes.
- No release package, manifest version, or Chrome Web Store boundary changes.
- No provider, permission, or localization behavior changes.
- No rewrite of historical phase archives beyond adding this completed phase note.

## Acceptance

- `npm run docs:check` passes with Phase 371 as the latest archived slice.
- Future stale README/TODO/strategic-index current-phase references fail `docs:check`.
- Existing doc taxonomy checks still report the latest archived phase filename.

## Planned Verification

- `npm run docs:check`
- `git diff --check`

## Completion Summary

- Added `formatPhaseTupleLabel` and current-reference checks to `scripts/lib/doc-taxonomy-check.mjs`.
- `docs:check` now validates current phase references in README, top-level TODOs, and the strategic directions index when no queued phase is active.
- Updated maintained docs to mark Phase 371 as the latest completed slice.

## Verification

- `npm run docs:check`
- `git diff --check`

## Follow-Up

- If a future phase intentionally leaves queued phase files active, the no-queued-phase README/TODO checks can be skipped by changing the phase index away from `queued phase files: none`.
