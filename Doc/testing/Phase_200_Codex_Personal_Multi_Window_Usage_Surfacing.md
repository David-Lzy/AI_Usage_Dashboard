# Phase 200 - Codex Personal Multi-Window Usage Surfacing

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Make Codex personal usage-page support more functional for real quota triage by preserving all visible percentage windows and surfacing the most constrained window in the main dashboard values.

## Why This Phase Exists

The current Codex personal route can expose multiple independent windows at once, including a base 5-hour window, a weekly window, and model-specific windows. A single primary-window display can hide the practical constraint when the 5-hour window is full but the weekly window is lower.

## What Changed

- Added optional `usageWindows` and `usageSummary` fields to provider snapshots.
- Updated the Codex personal adapter so the main `used`, `remaining`, `resetAt`, and `planName` values use the most constrained visible percentage window.
- Kept warning state threshold-driven; lower but non-threshold windows are shown as usage context instead of fake warnings.
- Added dashboard provider-card chips for visible Codex windows.
- Added Provider Detail visible-window notes for multi-window Codex snapshots.
- Let popup featured-provider secondary copy use the multi-window summary for healthy Codex personal states.
- Expanded Codex personal page capture snippets from `12` to `24` so later cards are not silently truncated.
- Added parser and adapter tests for a Chinese Codex page shape where the 5-hour window is `100%` remaining but the weekly window is `32%` remaining.

## Preserved Boundaries

- No provider coverage claims changed.
- No source-selection order changed.
- No archive schemas changed.
- No store screenshot request or operator evidence package changed.
- Raw provider evidence strings remain preserved; this phase only adds derived functional display metadata.

## Verification

- `npm run test -- src/providers/codex/personal-page-parser.test.ts src/providers/codex/adapter.test.ts`
- `npm run typecheck`
- full closeout validation should still run before commit:
  - `npm run docs:check`
  - `npm run test -- --run`
  - `npm run build`
  - `git diff --check`

## Follow-Up

Keep functional development first while Codex budget is constrained. The next high-value functional work is either a real Chrome Codex personal multi-window verification pass or another provider live-source slice such as Cursor personal dashboard hardening or JetBrains console reverification.
