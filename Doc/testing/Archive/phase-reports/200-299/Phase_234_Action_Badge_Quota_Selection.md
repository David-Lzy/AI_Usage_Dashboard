# Phase 234 - Action Badge Quota Selection

Date: 2026-05-03

Document class:

- closed evidence

## Goal

Let the toolbar badge show either the existing attention count or one selected remaining-quota source, without adding provider options that the current stored data cannot support.

## Why This Phase Exists

Phase 49 intentionally gave the action badge one simple meaning: visible providers needing attention. After Codex personal multi-window usage landed, the badge also became a useful place for a selected remaining percentage such as the Codex weekly or 5-hour window. The product needs this to remain explicit and configurable rather than overloading the badge by default.

## What Changed

- Added persisted `actionBadgeSelection` settings with legacy-state normalization back to `attention`.
- Added dynamic quota candidates from enabled providers with real remaining values, including individual usage windows and supplemental balances.
- Added one Settings MaterialSelect for the toolbar badge selection.
- Updated action badge rendering so selected quota sources show compact text such as `32%`, while hover title exposes provider, window, remaining value, reset/sync context, and the usage summary.
- Kept the attention-count badge as the default and the fallback when a saved dynamic quota candidate disappears.

## Verification

- `npm run phase234:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Run one RDP Chrome pass after extension reload to confirm the native toolbar tooltip renders the multiline quota detail clearly enough on the target desktop environment.
