# Phase 208 - Usage Window Progress Bars

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Render every visible structured usage window as a remaining progress bar on the richer dashboard and provider detail surfaces.

## Why This Phase Exists

Codex can expose multiple visible quota windows at once, including weekly windows and model-specific windows such as `GPT-5.3-Codex-Spark 5 小时使用限额`. Previously those secondary windows were displayed as chips or text rows. The user expectation is closer to the vendor UI: each visible window should have an explicit remaining bar.

## What Changed

- Extended `UsageProgress` with a remaining-value mode.
- Added `UsageWindowProgressList` to render all visible usage windows as remaining progress bars.
- Added dashboard provider-card rendering for structured usage-window progress bars.
- Added provider-detail rendering for structured usage-window progress bars.
- Kept usage balances as supplemental chips/text rather than primary progress bars.
- Kept popup compact; it still shows the compressed usage-window summary from `Phase 205`.
- Added focused component tests and `npm run phase208:review`.

## Preserved Boundaries

- No provider parser, source-selection, provider coverage, or sync behavior changed.
- Codex personal still represents visible usage-window context, not one full plan-wide absolute remaining balance.
- Flex credit balance remains supplemental context, not a window progress bar.
- Popup remains a quick triage surface rather than a full vendor-style usage grid.

## Artifacts

- `scripts/phase208-usage-window-progress-bars-review.mjs`
- `tmp/phase208-usage-window-progress-bars-review/usage-window-progress-bars-review.json`

## Verification

- `npm run test -- --run src/sidepanel/components/UsageProgress.test.tsx src/sidepanel/components/UsageWindowProgressList.test.tsx`
- `npm run phase208:review`
- `npm run docs:check`
- `git diff --check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

If the next authenticated Codex capture shows additional window categories, keep them in the same structured progress-list path instead of creating provider-specific one-off UI.
