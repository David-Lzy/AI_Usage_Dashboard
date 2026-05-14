# Phase 432 - UI QA And Doc Closeout

Status: completed

## Goal

Close out the provider ordering, quota visibility, progress style, and Settings carousel work with documentation alignment and representative visual QA.

## Scope

- Update README, top-level TODOs, Roadmap, Product/I18n docs as needed.
- Run representative visual checks for popup, sidebar dashboard, full-page dashboard, and Settings carousel.
- Include `en`, `zh-CN`, `de`, and `ar` spot checks where practical.
- Fix visible overflow or overlap discovered during this QA phase.

## Preserved Boundaries

- Do not expand provider support claims.
- Do not mutate RC13 store-submission history.
- Do not package a new release unless explicitly promoted after QA.

## Acceptance

- Current docs describe the completed UI preference and carousel behavior.
- Phase index has no queued work from this slice.
- Visual notes record any checks that could not run and why.
- Build and documentation checks pass.

## Planned Verification

- `npm run docs:check`
- `npm run i18n:check`
- focused tests changed by Phases 422-431
- `npm run typecheck`
- `npm run build`
- `git diff --check`

## Follow-Up

- If this work is promoted to a new release candidate, create a separate release/package phase instead of mutating this UI closeout.

## Completion Summary

- Closed the provider display-preference queue after `Phase 422` through `Phase 431`.
- Updated the maintained docs so the current source boundary reflects per-surface provider ordering, per-surface quota item visibility/order, soft/gauge progress rings, localized progress-style preview/options, and Settings provider-section carousel migration.
- Added a Phase 432 visual QA evidence note under `Doc/testing/Archive/phase-reports/400-499/`.
- Fixed one RTL carousel status presentation issue found during Arabic Settings preview by switching the status text to a neutral `1 / 4 · Provider` format and isolating its bidirectional rendering.

## Visual QA Notes

- RDP Chrome extension-window capture was attempted for popup, sidepanel-sized dashboard, full-page dashboard, and Arabic Settings carousel routes, but the captured image files were blank or near-blank in the current RDP/X11 capture path. Those captures were treated as invalid evidence and not promoted as visual signoff.
- Playwright/Vite preview checks covered:
  - `en` popup at `640x520`
  - `zh-CN` sidepanel-sized dashboard at `420x900`
  - `de` full-page dashboard at `1280x800`
  - `ar` full-page Settings carousel at `1280x900`
- The Playwright checks reported `overflowX = 0` for all four representative routes. Arabic Settings resolved `dir=rtl` and rendered one carousel without obvious overlap after the status-text fix.

## Verification

- `npm run test -- src/shared/display-preferences.test.ts src/shared/storage.test.ts src/shared/provider-progress-items.test.ts src/shared/provider-progress-item-selection.test.ts src/shared/progress-display.test.ts src/sidepanel/components/ProviderOrderPreferenceControls.test.tsx src/sidepanel/components/ProviderProgressItemPreferenceControls.test.tsx src/sidepanel/components/ProviderCard.test.tsx src/popup/PopupProviderProgress.test.tsx src/sidepanel/settings-preference-options.test.ts src/sidepanel/components/PopupAppearancePreview.test.tsx src/sidepanel/components/ProviderCarousel.test.tsx src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/components/SettingsSections.test.tsx src/sidepanel/components/SettingsCredentialsSection.test.tsx src/sidepanel/components/SettingsSourceSection.test.tsx`
- Playwright/Vite representative visual checks for `en`, `zh-CN`, `de`, and `ar`
- `npm run i18n:check`
- `npm run docs:check`
- `npm run typecheck`
- `npm run build`
- `git diff --check`
