# Phase 220 - Empty Percent Progress Suppression

Date: 2026-04-29

Document class:

- closed evidence

## Goal

Stop dashboard and provider-detail surfaces from rendering an indeterminate percent progress bar when a provider has no measured percent value.

## Why This Phase Exists

After the current Codex page-session error state, the dashboard could show `Usage window percent unavailable` while still rendering a `rolling percent` progress bar with `Unknown`. That made a parse or source-state failure look like a quota visualization instead of a blocked measurement.

## What Changed

- Added a shared `shouldShowSingleUsageProgress` display gate for sidepanel quota surfaces.
- Hid generic single-value progress when a percent provider has no used or remaining percentage.
- Kept documented non-percent totals visible as indeterminate context, such as Gemini's documented daily request quota.
- Reused the same gate in dashboard provider cards and provider detail.
- Added component coverage for the Codex parse-failure dashboard card and unit coverage for the display gate.

## Verification

- `npm run test -- --run src/sidepanel/usage-progress-visibility.test.ts src/sidepanel/components/ProviderCard.test.tsx src/sidepanel/components/UsageProgress.test.tsx src/sidepanel/components/UsageWindowProgressList.test.tsx`
- `npm run typecheck`
- `npm run phase220:review`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

The next real Chrome pass should refresh the Codex provider after reopening a valid Codex usage page and confirm healthy windows still render as structured progress bars while parse failures no longer show empty percent progress.
