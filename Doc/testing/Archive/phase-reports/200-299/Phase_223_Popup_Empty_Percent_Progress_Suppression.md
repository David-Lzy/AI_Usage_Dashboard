# Phase 223 - Popup Empty Percent Progress Suppression

Date: 2026-04-29

Document class:

- closed evidence

## Goal

Stop the popup from rendering an `Unknown` percent progress circle when a provider has no measured percent value.

## Why This Phase Exists

The Phase 222 RDP popup check confirmed the new source-page recovery action, but it also showed Codex still rendering a circular `Unknown` progress indicator during a capture-unavailable state. Phase 220 already fixed the same truth issue for dashboard and provider detail.

## What Changed

- Added a popup-specific progress visibility helper.
- Reused the existing single-progress display gate so empty percent provider snapshots no longer render top-level popup progress.
- Kept structured usage-window progress visible in the popup.
- Preserved documented non-percent totals as indeterminate context.
- Wired the popup featured-provider renderer through the helper.

## Verification

- `npm run test -- --run src/popup/progress-visibility.test.ts src/popup/view-models.test.ts src/sidepanel/usage-progress-visibility.test.ts`
- `npm run typecheck`
- `npm run phase223:review`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Use the next RDP Chrome popup capture to confirm the Codex capture-unavailable card shows recovery copy and the source-page action without an `Unknown` percent ring.
