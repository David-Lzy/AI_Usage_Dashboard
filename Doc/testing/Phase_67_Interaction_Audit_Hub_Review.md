# Phase 67 Interaction Audit Hub Review

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Purpose:

- record the first repeatable review pass for the real-browser interaction-audit hub route that embeds the shipped dashboard, settings, provider-detail, and popup surfaces inside fixed-width audit frames

## Commands

- `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- `npx -y node@22 ./scripts/phase55-multi-width-visual-review.mjs`
- `npx -y node@22 ./scripts/phase60-compact-settings-review.mjs`
- `npx -y node@22 ./scripts/phase61-interaction-state-review.mjs`
- `npx -y node@22 ./scripts/phase62-status-surface-review.mjs`
- `npx -y node@22 ./scripts/phase63-toned-content-review.mjs`
- `npx -y node@22 ./scripts/phase64-pointer-state-review.mjs`
- `npx -y node@22 ./scripts/phase65-chip-progress-review.mjs`
- `npx -y node@22 ./scripts/phase66-detail-supporting-surface-review.mjs`
- `npx -y node@22 ./scripts/phase67-interaction-audit-hub-review.mjs`

## Result

- all automated review passes completed successfully after the audit hub route landed
- `Phase 67` confirmed that one dedicated `#debug-interaction-audit` route now exposes five fixed-width embedded surfaces:
  - dashboard at `360x920`
  - settings at `420x980`
  - Cursor detail at `360x920`
  - Codex detail at `420x980`
  - popup at `360x760`
- the new review pass confirmed `overflow=0` on the audit hub itself and verified that every embedded surface preserved its configured frame width and height instead of being squeezed by the outer review page
- the route also now exposes standalone links for each embedded surface, so real-browser QA can jump from the hub into the matching live route without rebuilding URLs by hand
- the earlier width, compact, keyboard, status-surface, toned-content, pointer-state, chip-progress, and supporting-surface baselines still pass, so the audit hub did not regress the existing Direction 04 review stack

## Artifacts

- machine-readable review:
  - `tmp/phase67-interaction-audit-hub-review/phase67-results.json`
- screenshots:
  - `tmp/phase67-interaction-audit-hub-review/interaction-audit-hub.png`

## Notes

- the first draft of the `Phase 67` review script failed because it measured the inner iframe box instead of the outer fixed-width viewport container; that created a false `-2px` width diff from the viewport border rather than a real layout regression
- the first draft of the audit hub grid also let card padding squeeze the embedded frames below their intended widths, so the final layout now reserves enough track width for the fixed viewport plus card padding
