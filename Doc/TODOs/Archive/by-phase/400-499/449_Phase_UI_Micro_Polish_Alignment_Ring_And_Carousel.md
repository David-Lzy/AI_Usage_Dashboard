# Phase 449 - UI Micro Polish Alignment Ring And Carousel

Status: completed on 2026-05-14

## Goal

Fix the four small UI regressions reported after the post-`rc.19` package boundary:

- align controls inside remaining-color-band rows
- align the Settings display-level selector with its wide-layout helper text
- make `circle-soft` render the actual remaining percentage instead of appearing full when green
- make Settings provider carousel slide changes visibly animated

## Scope

- Adjust Settings appearance CSS for remaining-color-band row alignment.
- Adjust Settings overview CSS so the wide display-level helper aligns with the select control instead of the label stack.
- Change SVG soft/gauge ring rendering to set the foreground dash length directly from the percentage.
- Slow the Settings provider-carousel slide transition through a carousel-local motion token.
- Update focused tests that assert ring rendering tokens.
- Align maintained current docs with the new source boundary.

## Preserved Boundaries

- Do not change storage shape, provider snapshots, adapter output, quota math, warning thresholds, or progress color-band semantics.
- Do not change localized copy or the 14-locale runtime set.
- Do not package a new release zip; `0.1.0-rc.19` remains the current packaged follow-up candidate and is now behind the latest source by this micro-polish phase.
- Do not mutate the submitted RC13 Chrome Web Store review milestone.

## Acceptance

- Remaining-color-band controls line up horizontally on wide Settings layouts and continue to stack safely on narrow layouts.
- Wide Settings overview places the display-level helper alongside the select control without interfering with the narrow stacked layout.
- `circle-soft` and the popup preview render 75%, 51%, and other green values as partial arcs instead of full rings.
- Settings provider carousel transitions are visible during provider changes and still disable under reduced-motion mode.
- Focused tests pass for UsageProgress, UsageProgressRing, popup preview, popup provider progress, Settings page, progress appearance controls, and ProviderCarousel.

## Planned Verification

- `npm run test -- src/sidepanel/components/UsageProgressRing.test.tsx src/sidepanel/components/UsageProgress.test.tsx src/sidepanel/components/PopupAppearancePreview.test.tsx src/popup/PopupProviderProgress.test.tsx src/sidepanel/components/ProgressAppearancePreferenceControls.test.tsx src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/components/ProviderCarousel.test.tsx --run`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- If a human wants these UI fixes in a distributable artifact, open a separate packaging phase after deciding whether to replace the current `rc.19` follow-up candidate.

## Completion Notes

- Remaining-color-band rows now align swatch, input controls, range chip, and row actions against the control row on wide layouts.
- Settings overview display-level help now aligns beside the select control in wide layouts and resets to the previous stacked rhythm below the responsive breakpoint.
- SVG soft/gauge rings now expose `--usage-progress-ring-fill-arc` as the actual rendered foreground arc length, fixing full-looking green soft rings in popup cards and preview.
- Provider carousel slide transitions now use a local `420ms` duration while preserving reduced-motion behavior.

## Verification

- `npm run test -- src/sidepanel/components/UsageProgressRing.test.tsx src/sidepanel/components/UsageProgress.test.tsx src/sidepanel/components/PopupAppearancePreview.test.tsx src/popup/PopupProviderProgress.test.tsx src/sidepanel/components/ProgressAppearancePreferenceControls.test.tsx src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/components/ProviderCarousel.test.tsx --run`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`
