# Phase 192 - Source-State Typed Diagnostic Fallback

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Make provider source-state classification prefer typed warning diagnostics while preserving raw diagnostic strings, existing source-state labels, and raw English fallback behavior.

## Why This Phase Exists

`Phase 185` added the additive typed diagnostic model. `Phase 186` through `Phase 191` populated typed diagnostic metadata across source, credential, host-access, page-session, usage, policy-only, and sync-stale paths. This phase lets source-state classification consume that metadata before it falls back to raw English `warningReason` pattern matching.

## What Changed

- `src/shared/provider-sources.ts` now checks `ProviderSnapshot.warningDiagnostic` before raw warning text patterns.
- Typed host-access diagnostics map to the existing `host_access_missing` source state.
- Typed credential diagnostics map to the existing `credential_missing` source state.
- Typed page-session diagnostics map to the existing `logged_out`, `open_page_required`, or `sync_error` source states.
- Typed usage-threshold and cached-state stale diagnostics keep the source state `ready`, matching current source-readiness behavior.
- Typed automatic-sync-overdue diagnostics map to the existing `sync_error` source state.
- Unknown or absent typed diagnostics still fall back to raw English warning-pattern checks.
- `src/shared/provider-sources.test.ts` verifies typed category preference plus unknown-code fallback.
- `phase192-source-state-typed-diagnostic-fallback-review.mjs` verifies code markers, docs, tests, and closeout references.

## Runtime Behavior

Rendered source-state labels and tones are unchanged in this slice.

Existing raw diagnostic strings remain the displayed source truth:

- `ProviderSnapshot.warningReason`
- `ProviderSnapshot.sourceSelectionReason`
- `ProviderSnapshot.sourceFallbackReason`

The source-state classifier can now use typed diagnostics when available, but raw strings remain the compatibility fallback for older stored snapshots, screenshot seeds, archives, and future unknown diagnostic codes.

## Verification

- `npm run phase192:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `git diff --check`

## Follow-Up

The next safe implementation slice is localized diagnostic presentation follow-up. It should generate localized labels or short summaries from typed diagnostic codes and params while keeping raw diagnostic bodies available in provider detail, exports, and evidence-oriented surfaces.
