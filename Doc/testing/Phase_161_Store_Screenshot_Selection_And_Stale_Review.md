# Phase 161 - Store Screenshot Selection And Stale Review

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- frozen snapshot

Status note:

- this file records the `Phase 161` closeout for the first `Direction 10.3` store-asset slice

## Goal

Turn the first screenshot archive and the `Phase 160` refreshed runtime evidence into one explicit store-asset selection/stale-review decision, so the next screenshot request is based on a documented asset contract instead of ad-hoc judgment.

## Implemented

- added one maintained screenshot-selection pack that records per-slot keep-vs-refresh decisions for the current store screenshot set:
  - [Store_Screenshot_Selection_Pack.md](../Store/Store_Screenshot_Selection_Pack.md)
- updated the maintained storyboard so the next store-ready pack now prefers:
  - native toolbar-bubble popup capture for the first three screenshot slots
  - full-page shell depth capture for the deeper workspace slots
  - [Store_Screenshot_Storyboard.md](../Store/Store_Screenshot_Storyboard.md)
- updated the maintained listing-copy pack and localization source pack so they now read as pre-refresh baselines anchored to the first archive rather than as the final submission pack:
  - [Store_Listing_Copy_Pack.md](../Store/Store_Listing_Copy_Pack.md)
  - [Store_Listing_Localization_Source_Pack.md](../Store/Store_Listing_Localization_Source_Pack.md)
- updated the `Direction 10.3` TODO line so the stale-review slice is completed and the next slice is the refreshed screenshot-capture request:
  - [10_3_Store_Asset_Pack_And_Submission_TODOs.md](../Roadmap/10_3_Store_Asset_Pack_And_Submission_TODOs.md)
- added one repeatable review that checks the selection pack, storyboard, copy-pack baseline state, localization-source baseline state, and `Phase 160` runtime evidence keys:
  - [phase161-store-screenshot-selection-review.mjs](../../scripts/phase161-store-screenshot-selection-review.mjs)
  - [package.json](../../package.json)

## Verification

- `npm run docs:check`
- `npm run phase161:review`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Result

The first screenshot archive remains truthful historical evidence, but after the popup/full-page surface-expansion line it is no longer the final recommended submission asset set. The next `Direction 10.3` slice is now a refreshed screenshot-capture request for native popup-bubble and full-page-shell store surfaces.
