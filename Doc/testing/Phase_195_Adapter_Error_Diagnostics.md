# Phase 195 - Adapter Error Diagnostics

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Populate typed adapter-error diagnostics and localized adapter-error presentation without translating or hiding raw adapter warning bodies.

## Why This Phase Exists

`Phase 194` completed localized source diagnostic presentation. The remaining known diagnostic family was `adapter.*`, but those codes needed a clear population boundary before localized presentation could be user-visible. This phase adds that boundary for repo-owned stable failure paths.

## What Changed

- `src/providers/diagnostics.ts` now exposes `createAdapterErrorDiagnostic`.
- The builder covers `adapter.unexpected_error`, `adapter.unsupported_response`, and `adapter.parse_failed`.
- Cursor and Codex parser route drift now maps to typed `adapter.parse_failed` diagnostics.
- Cursor and Codex official/personal catch paths now map stable repo-owned failures to typed `adapter.unexpected_error` diagnostics.
- Claude Code analytics catch paths now map stable repo-owned failures to typed `adapter.unexpected_error` diagnostics.
- `src/shared/localized-copy.ts` now returns localized labels and short summaries for known `adapter.*` diagnostics.
- Focused tests cover the adapter-error builder, localized presentation, Cursor route drift, Codex route drift, and Claude analytics catch behavior.
- `scripts/phase195-adapter-error-diagnostics-review.mjs` verifies code, docs, tests, and closeout markers for this slice.

## Preserved Boundaries

- Raw adapter `warningReason` strings remain visible and unchanged.
- Raw `sourceSelectionReason` and `sourceFallbackReason` strings remain visible and unchanged.
- Adapter-error summaries are generated from typed metadata; they are not translations of raw adapter bodies.
- No provider coverage, source-selection order, fallback order, sync cadence, archive schema, or store-screenshot behavior changed.
- `adapter.unsupported_response` is supported by the builder and presentation boundary but is not populated where the repo does not yet own a stable unsupported-response path.

## Verification

- `npm run phase195:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `git diff --check`

## Follow-Up

Continue `Direction 09.3` with diagnostic presentation compact-width and evidence QA. That next slice should verify Settings and Provider Detail density after warning, source, and adapter-error summaries all exist beside raw evidence bodies.
