# Phase 444 - Soft And Gauge Ring Visual Differentiation

Status: active

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
