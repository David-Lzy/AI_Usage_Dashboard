# Phase 443 - Progress Rendering Thickness And Color Bands QA

Date: 2026-05-14

## Summary

Phase 443 consumed the progress appearance model from Phase 442 in the progress renderers. Popup, sidebar dashboard, full-page dashboard, Provider Detail, and Settings preview now pass the shared thickness and color-band preferences into `UsageProgress`.

## Checks

- `UsageProgress` line, classic circle, soft ring, and gauge ring render CSS variables for shared thickness.
- Determinate progress with a remaining percentage resolves fill color from the configured remaining-percent color bands.
- Unknown or indeterminate progress keeps the previous neutral/tone fallback and accessible aria text.
- `ProviderProgressItemList` remains the shared progress rendering path for popup, dashboard cards, and provider detail.
- The legacy `UsageWindowProgressList` accepts the same appearance props for any future retained caller.

## Preserved Boundaries

- No quota math changed.
- No provider warning diagnostics, provider `displayTone`, action-badge attention counts, adapter output, source-truth labels, raw evidence, or export schemas changed.
- No release package was created.

## Verification

- `npm run test -- src/shared/progress-appearance.test.ts src/sidepanel/components/UsageProgress.test.tsx src/popup/PopupProviderProgress.test.tsx src/popup/PopupFeaturedProviderList.test.tsx src/sidepanel/components/ProviderCard.test.tsx src/sidepanel/routes/ProviderDetailPage.test.tsx src/sidepanel/routes/DashboardPage.test.tsx src/sidepanel/components/PopupAppearancePreview.test.tsx --run`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Notes

The production build still emits the known sidepanel chunk-size warning. This phase did not package a new release candidate and does not alter the existing chunk-size audit boundary.
