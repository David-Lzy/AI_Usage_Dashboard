# Phase 444 - Soft And Gauge Ring Visual Differentiation

Status: completed

## Goal

Make `circle-soft` and `circle-gauge` visually distinct so users can clearly tell the two circular progress styles apart.

## Scope

- Keep `circle-soft` as a full 360-degree rounded SVG ring with a soft track.
- Keep `circle-gauge` as a partial gauge arc with a visible gap, stronger endpoint emphasis, and different track opacity/scale from `circle-soft`.
- Preserve the shared SVG-ring component and use variant-specific CSS variables rather than duplicating renderer logic.
- Verify popup-sized rings and dashboard/provider-detail rings separately.

## Preserved Boundaries

- Do not add a new progress style option.
- Do not change stored `ProgressDisplayStyle` values or migration behavior.
- Do not change progress values, aria values, or color-band selection from `Phase 443`.
- Do not use third-party image assets or external UI dependencies.

## Acceptance

- Soft ring presents as a complete circular ring.
- Gauge ring presents as a partial instrument-style arc with a clear gap.
- The two styles differ in at least arc length, rotation/gap placement, and track/fill emphasis.
- Reduced-motion users see the same static distinction without extra animation.
- Popup screenshots show the distinction at small ring size.

## Planned Verification

- `UsageProgressRing` focused tests for variant CSS variables and arc-length behavior.
- `UsageProgress` render tests for both variants.
- Popup preview or Playwright captures for `circle-soft` and `circle-gauge`.
- Sidebar/full-page visual smoke checks.
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- If the distinction is still not obvious in popup size, open a follow-up visual-only phase for iconography or labels instead of changing the model again.

## Completion Summary

Phase 444 completed the visual split between the two SVG ring variants without changing stored progress-style values or quota semantics.

- `circle-soft` now remains a full 360-degree ring with the existing start rotation and full track emphasis.
- `circle-gauge` now uses a shorter instrument-style arc, shifted gap rotation, lower track opacity, slightly larger sizing, and a subtle fill emphasis.
- The shared `UsageProgressRing` renderer still owns both variants through CSS variables instead of duplicate component paths.

## Verification

- `npm run test -- src/sidepanel/components/UsageProgress.test.tsx src/sidepanel/components/UsageProgressRing.test.tsx src/sidepanel/components/PopupAppearancePreview.test.tsx src/popup/PopupProviderProgress.test.tsx --run`
- `npm run typecheck`
- `npm run build`
- Playwright preview smoke against `dist/` captured Settings popup-preview cards for soft and gauge rings under `tmp/phase444-ring-visual-smoke/` and verified:
  - soft arc `100`, rotation `-90deg`, track opacity `1`
  - gauge arc `68`, rotation `146deg`, track opacity `0.46`

## Closeout Notes

- No provider data, warnings, diagnostics, action-badge logic, raw evidence, export schema, release package, or i18n catalog changed.
- The production build still emits the known sidepanel chunk-size warning.
