# Phase 450 - UI Micro Polish Select Ring And Color Bands

Status: completed on 2026-05-14

## Goal

Fix the next small UI polish pass reported after `Phase 449`:

- prevent the open Popup progress-style select blue edge from looking clipped
- make `circle-soft` green progress render the actual percentage reliably
- make remaining-color-band number and color controls more compact and visually softer

## Scope

- Change the Material select open/focus ring from an outer shadow to an inset ring so the left edge is not clipped by surrounding layout.
- Make soft/gauge SVG rings render actual circle-length `stroke-dasharray` values as SVG attributes instead of relying on `pathLength=100` plus CSS custom-property dash math.
- Tighten remaining-color-band grid columns so numeric and color inputs no longer consume the full row width.
- Restyle native color inputs as rounded rectangular swatches and keep narrow layouts stacked.
- Update focused ring-rendering tests and maintained current docs.

## Preserved Boundaries

- Do not change storage shape, progress color-band validation, warning thresholds, provider warnings, quota math, adapter output, raw evidence, localized copy, package version, or manifest version.
- Do not package a new release zip; `0.1.0-rc.19` remains the current packaged follow-up candidate and current source is ahead by this UI micro-polish phase.
- Do not mutate the submitted RC13 Chrome Web Store review milestone.

## Acceptance

- Open progress-style selects draw the blue state ring inside the control and avoid clipped left edges.
- `circle-soft` green values such as `51%` and `75%` render as partial arcs, not full rings.
- Remaining-color-band number fields and hex color controls use compact widths on wide layouts.
- Native color controls present as rounded rectangular swatches and continue stacking safely on narrow layouts.
- Focused progress, popup, preview, and Settings tests pass.

## Planned Verification

- `npm run test -- src/sidepanel/components/UsageProgressRing.test.tsx src/sidepanel/components/UsageProgress.test.tsx src/sidepanel/components/PopupAppearancePreview.test.tsx src/popup/PopupProviderProgress.test.tsx src/sidepanel/components/ProgressAppearancePreferenceControls.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- If these UI fixes should ship to users, open a separate packaging phase after deciding whether to replace or supersede the current `rc.19` follow-up candidate.

## Completion Notes

- Material select open/focus state now uses an inset primary ring.
- SVG soft/gauge rings now use actual `r=48` circumference dash values on the SVG circles, with the fill arc calculated from the rendered percentage.
- Remaining-color-band controls now use compact numeric and color-control tracks instead of stretching to fill the whole row.
- Native color inputs are wider rounded swatches, with browser swatch pseudo-elements rounded where supported.
- Built preview Playwright smoke confirmed the soft-ring sample renders `fillDash="153.81 301.59"` against `trackDash="301.59 301.59"` for a `51%` value.

## Verification

- `npm run test -- src/sidepanel/components/UsageProgressRing.test.tsx src/sidepanel/components/UsageProgress.test.tsx src/sidepanel/components/PopupAppearancePreview.test.tsx src/popup/PopupProviderProgress.test.tsx src/sidepanel/components/ProgressAppearancePreferenceControls.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`
- built preview Playwright SVG dash smoke
