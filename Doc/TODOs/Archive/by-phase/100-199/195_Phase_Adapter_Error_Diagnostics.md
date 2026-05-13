# Phase 195 - Adapter Error Diagnostics

Date: 2026-04-25

Document class:

- archived phase

## Goal

Add typed adapter-error diagnostics and localized adapter-error presentation while preserving raw adapter warning bodies.

## Scope

- add a reusable adapter-error diagnostic builder
- populate stable adapter-error diagnostics for repo-owned Cursor, Codex, and Claude Code failure paths
- add localized labels and summaries for known `adapter.*` diagnostic codes
- preserve raw warning, source-selection, and fallback text
- update roadmap, i18n boundary, phase-index, and closeout docs

## What Changed

- `src/providers/diagnostics.ts` now supports `adapter.unexpected_error`, `adapter.unsupported_response`, and `adapter.parse_failed` through `createAdapterErrorDiagnostic`.
- Cursor and Codex parser route drift now uses `adapter.parse_failed`.
- Cursor, Codex, and Claude Code stable catch paths now use `adapter.unexpected_error`.
- `src/shared/localized-copy.ts` now maps known adapter-error diagnostics to localized presentation.
- `src/providers/diagnostics.test.ts`, `src/shared/i18n.test.ts`, and focused adapter tests cover the new path.
- `scripts/phase195-adapter-error-diagnostics-review.mjs` records the phase-specific review artifact.

## Preserved Boundaries

- raw adapter `warningReason` strings remain source truth
- raw source-selection and fallback strings remain source truth
- unknown typed diagnostics still leave the product on raw fallback behavior
- no provider coverage, source selection, sync, archive, or store-screenshot behavior changed

## Verification

- `npm run phase195:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `git diff --check`

## Follow-Up

Continue `Direction 09.3` with diagnostic presentation compact-width and evidence QA. The next slice should verify localized diagnostic stack density without hiding raw adapter or source evidence.
