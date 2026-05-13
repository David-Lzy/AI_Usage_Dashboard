# Phase 210 - Surface Progress Style Preferences

Date: 2026-04-26

Document class:

- closed evidence

## Goal

Make quota progress display configurable per surface while tightening the popup into a quota-first layout.

## Why This Phase Exists

The toolbar popup is the smallest product surface. After `Phase 209`, it could render circular progress, but too much explanatory and setup content still appeared above the actual provider quota. The user requested that Codex and other provider quotas move to the top, that unnecessary popup content be hidden, and that popup, sidebar, and tab surfaces each be able to choose circle or line progress.

## What Changed

- Added persisted progress display preferences for:
  - popup
  - sidebar
  - full-page tab
- Defaulted popup progress to `circle`.
- Defaulted sidebar and full-page tab progress to `line`.
- Added Settings controls for the three surface-specific quota styles.
- Extended shared usage progress rendering so every quota path can render as either line or circle.
- Passed the sidebar or full-page preference into dashboard provider cards and provider detail.
- Converted popup to a quota-first mode when provider cards exist.
- Hid popup summary, setup, snapshot, quick-action, and surface-role cards when quota cards are already available.

## Preserved Boundaries

- No provider parser, sync, source-selection, permission, or release-package behavior changed.
- Style preferences only affect how already-normalized quota/progress data is rendered.
- Popup still falls back to the onboarding/status layout when no provider quota cards exist.
- Provider coverage gaps remain unchanged.

## Artifacts

- `scripts/phase210-surface-progress-style-preferences-review.mjs`
- `tmp/phase210-surface-progress-style-preferences-review/surface-progress-style-preferences-review.json`

## Verification

- `npm run test -- --run src/sidepanel/components/UsageProgress.test.tsx src/sidepanel/components/UsageWindowProgressList.test.tsx src/shared/storage.test.ts`
- `npm run phase210:review`
- `npm run docs:check`
- `git diff --check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Run a real Chrome toolbar-popup visual pass after reload. If four circular quota rings still feel too dense, cap popup rings per provider and push overflow to the full-page tab.
