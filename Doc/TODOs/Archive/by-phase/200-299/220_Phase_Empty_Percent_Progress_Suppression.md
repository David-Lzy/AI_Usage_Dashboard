# Phase 220 - Empty Percent Progress Suppression

Date: 2026-04-29

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-29

## Goal

Suppress empty percent progress visualizations when no measured percent value exists.

## Completed Work

- Added a shared sidepanel progress-visibility helper.
- Reused the helper in dashboard provider cards and provider detail.
- Hid the generic `rolling percent` progress bar for Codex-style parse failures where `used` and `remaining` are both unavailable.
- Preserved indeterminate progress for documented non-percent totals such as Gemini's daily request quota.
- Added focused component and helper tests.

## Preserved Boundaries

- No provider parser, adapter source-selection order, page binding, credential storage, or host-permission behavior changed.
- Structured usage windows continue to render through `UsageWindowProgressList`.
- Non-percent documented totals can still render indeterminate progress when that is useful context.

## Verification

- `npm run test -- --run src/sidepanel/usage-progress-visibility.test.ts src/sidepanel/components/ProviderCard.test.tsx src/sidepanel/components/UsageProgress.test.tsx src/sidepanel/components/UsageWindowProgressList.test.tsx`
- `npm run typecheck`
- `npm run phase220:review`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Use the next RDP Chrome provider refresh pass to confirm a healthy Codex usage page still renders structured usage-window bars, while an unavailable percent measurement stays a source-state problem rather than an empty percent progress bar.
