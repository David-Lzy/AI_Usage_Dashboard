# Phase 208 - Usage Window Progress Bars

Date: 2026-04-25

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-25

## Goal

Make all visible usage windows display as remaining progress bars on dashboard and provider-detail surfaces.

## Completed Work

- Added remaining-mode progress semantics to the shared progress component.
- Added a reusable usage-window progress list for all visible usage windows.
- Rendered Codex-style base, weekly, and model-specific usage windows as bars in dashboard provider cards.
- Rendered the same structured usage-window bars in provider detail.
- Kept usage balances as supplemental context.
- Kept popup compact instead of turning it into a full usage grid.
- Added focused component tests and `phase208:review`.

## Preserved Boundaries

- No parser, source-selection, sync, provider coverage, release-package, or archive behavior changed.
- Codex personal still exposes visible usage-window percentages and optional flex balance context rather than one absolute remaining balance.
- Popup remains compact and uses the existing compressed usage-context detail.
- popup remains compact is an explicit product boundary for this phase.

## Verification

- `npm run test -- --run src/sidepanel/components/UsageProgress.test.tsx src/sidepanel/components/UsageWindowProgressList.test.tsx`
- `npm run phase208:review`
- `npm run docs:check`
- `git diff --check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Run a visual RDP pass after the next real Codex capture if the number of usage windows grows beyond the current base plus model-window shape.
