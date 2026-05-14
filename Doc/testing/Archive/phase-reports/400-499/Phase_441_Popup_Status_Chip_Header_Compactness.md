# Phase 441 - Popup Status Chip Header Compactness QA

Date: 2026-05-14

## Summary

Phase 441 moved popup featured-provider status chips into the provider title row. The change is visual/layout-only and keeps provider status labels, tones, actions, quota values, provider order, and source-truth behavior unchanged.

## Checks

- Focused render tests verified that the status chip is rendered inside `.popup-provider-card__title-row`.
- Focused render tests verified that non-progress cards still render the plan under the title row.
- Playwright preview checks verified compact, balanced, and wide popup widths with no horizontal overflow.
- Representative locale checks covered `en`, `zh-CN`, `de`, and `ar`.

## Evidence

- Preview screenshots and JSON results are local generated evidence under `tmp/phase441-popup-status-chip/`.
- The preview check asserted:
  - `horizontalOverflow === 0`
  - every popup provider card has `.popup-provider-card__title-row .popup-provider-card__status`
  - provider title text does not overlap the status chip

## Verification

- `npm run test -- src/popup/PopupFeaturedProviderList.test.tsx src/popup/PopupProviderProgress.test.tsx --run`
- `npm run typecheck`
- `npm run build`
- Playwright popup structural/overflow check for `en`, `zh-CN`, `de`, and `ar`

## Notes

The historical `phase129:review` helper still waits for the old English `Quick glance` text and times out when the current preview state resolves to a localized popup. Phase 441 used structural selectors for the current component instead of treating that stale string gate as product evidence.
