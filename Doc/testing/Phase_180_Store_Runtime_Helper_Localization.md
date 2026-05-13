# Phase 180 - Store Runtime Helper Localization

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Localize store-screenshot helper runtime copy for the `en + zh_CN` pilot while preserving automation signals and final screenshot truth boundaries.

## Why This Phase Exists

After `Phase 179`, the remaining repo-owned i18n work moved to store-facing runtime helper copy and screenshot-adjacent captions. The first safe slice is the internal helper routes used by the screenshot workflow, because those routes contain operator-facing explanatory copy but should not change final screenshot evidence semantics.

## What Changed

- [I18n_Store_Runtime_Helper_Copy.md](../I18n/I18n_Store_Runtime_Helper_Copy.md) now records the helper-route localization boundary
- [localized-copy.ts](../../src/shared/localized-copy.ts) now includes `buildStoreWorkflowLocalizedCopy`
- [StoreScreenshotSeedPage.tsx](../../src/sidepanel/routes/StoreScreenshotSeedPage.tsx) now localizes its visible helper shell while preserving `document.title` automation signals
- [StoreScreenshotNativePopupProbePage.tsx](../../src/sidepanel/routes/StoreScreenshotNativePopupProbePage.tsx) now localizes its visible helper shell while preserving the probe title signal
- [App.tsx](../../src/sidepanel/App.tsx) now passes runtime i18n into both store helper routes
- [phase180-store-runtime-helper-localization-review.mjs](../../scripts/phase180-store-runtime-helper-localization-review.mjs) verifies the localized helper contract

## Truth Boundary

This phase does not make helper pages final store screenshot surfaces.

Preserved signals and ids:

- `AI Usage Dashboard Screenshot Seed Running`
- `AI Usage Dashboard Screenshot Seed Applied`
- `AI Usage Dashboard Screenshot Seed Cleared`
- `AI Usage Dashboard Screenshot Seed Failed`
- `AI Usage Dashboard Native Popup Probe`
- screenshot preset ids
- debug route hashes

The manual native-toolbar popup capture dependency still remains under `Direction 10.3`.

## Verification

- `npm run phase180:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Follow-Up

The next `Direction 09` slice should localize screenshot-adjacent runtime captions that can appear inside actual screenshot surfaces or submission-support UI. Raw provider source-truth strings and generated store-listing source docs remain outside runtime localization unless they are shown by the extension.
