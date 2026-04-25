# Phase 181 - Screenshot Caption Support Localization

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Localize screenshot-adjacent submission-support captions for the store screenshot seed helper route without changing the final popup, side-panel, or full-page screenshot surfaces.

## Why This Phase Exists

After `Phase 180`, store screenshot helper routes already used the runtime `en + zh_CN` pilot for visible helper copy. The remaining safe caption slice was the operator-facing preset-to-caption guidance that appears in submission-support UI, not the generated store-listing source docs and not the final product screenshots themselves.

## What Changed

- [localized-copy.ts](../../src/shared/localized-copy.ts) now maps screenshot seed preset ids to localized submission-support captions
- [StoreScreenshotSeedPage.tsx](../../src/sidepanel/routes/StoreScreenshotSeedPage.tsx) now shows the matching helper-only caption for non-`unlock` presets
- [i18n.test.ts](../../src/shared/i18n.test.ts) now verifies the `zh_CN` caption mapping
- [I18n_Store_Runtime_Helper_Copy.md](../I18n_Store_Runtime_Helper_Copy.md) now records the `Phase 181` caption boundary
- [phase181-screenshot-caption-support-localization-review.mjs](../../scripts/phase181-screenshot-caption-support-localization-review.mjs) verifies the runtime and documentation contract

## Truth Boundary

This phase does not inject captions into final store screenshots.

Preserved boundaries:

- final popup, side-panel, and full-page screenshots remain product surfaces without added caption overlays
- generated store-listing source docs remain maintained references rather than runtime catalogs
- automation `document.title` signals remain English and stable
- screenshot preset ids and debug route hashes remain unchanged
- raw provider source-truth strings remain outside this localized slice

## Verification

- `npm run phase181:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Follow-Up

The next `Direction 09` slice should review raw provider source-truth strings and separate evidence-preserving raw values from presentation-only wrapper copy that can safely enter the localized runtime pilot.
