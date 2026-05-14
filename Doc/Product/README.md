# Product Documentation

Date: 2026-05-15

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this directory holds current product and surface-contract references
- dated baselines and old audits belong under `Doc/Archive/`

## Current References

- [Surface Expansion And Ambient Theme Controls](./Surface_Expansion_And_Ambient_Theme_Controls.md)

## Current Source Boundary

- `Phase 422` through `Phase 432` completed the provider display-preference queue for per-surface provider order, per-surface quota item visibility/order, soft/gauge progress ring styling, localized progress-style Settings preview/options, Settings provider-section carousel migration, and representative UI QA closeout.
- `Phase 438` localized the Settings quota/progress item controls for all 14 runtime locales without changing provider order, progress item preference, or raw evidence behavior.
- `Phase 439` verified the post-RC17 UI polish queue across representative popup, dashboard, Settings carousel, quota localization, and RDP Chrome error-state checks.
- `Phase 440` packaged those source changes as `0.1.0-rc.18`; RC13 remains the submitted Chrome Web Store review boundary.
- `Phase 441` compacted popup provider status chips into the title row.
- `Phase 442` added progress appearance settings for global thickness and remaining-color bands without changing provider warnings.
- `Phase 443` applied those appearance settings to progress renderers while preserving quota math, warning diagnostics, action-badge behavior, and raw evidence boundaries.
- `Phase 444` made soft and gauge SVG rings visually distinct without changing progress values, accessibility text, or provider evidence boundaries.
- `Phase 445` moved Provider order and Quota items below the visual appearance controls and localized Provider order copy across the 14 runtime locales.
- `Phase 446` made the Settings overview display-level helper responsive across wide and narrow localized layouts.
- `Phase 447` made Appearance & Sync preference grids responsive and kept long custom select/combobox menus visible through scrollable capped overlays.
- `Phase 448` packaged the post-`rc.18` UI polish source boundary as `0.1.0-rc.19`; RC13 remains the submitted Chrome Web Store review boundary.
- `Phase 449` fixed remaining-color-band row alignment, Settings display-level helper alignment, soft-ring percentage rendering, and provider-carousel motion.
- `Phase 450` fixed select open-ring clipping, hardened soft/gauge SVG ring dash rendering with actual circumference values, and compacted remaining-color-band controls.
- `Phase 451` changed the soft ring to CSS conic-gradient rendering with `closest-side` inner cutout geometry so non-100 green values show slim visible neutral gaps while gauge remains SVG-based.
- `Phase 452` restored Settings provider-carousel card controls by preventing carousel drag pointer capture from starting on interactive descendants.
- `Phase 453` added halo and slim foreground layers to the soft ring so it is visually distinct from the classic circle.
- `Phase 454` through `Phase 457` split the Settings bottom disclosures into UI controls and Provider display controls, replaced the visible custom seed card with an accent color dropdown, reused that dropdown for remaining-color bands, and added 14-locale color picker/disclosure copy.
- Current implementation source is ahead of the `0.1.0-rc.19` package by the `Phase 449` through `Phase 457` UI micro-polish phases.
- `Phase 458` through `Phase 466` are queued as the next scoped UI polish sequence covering color-band row layout, Settings overview placement, all-provider Quick Setup carousel behavior, carousel pacing, popup header actions, popup circular progress density, form-control typography, UI font preference, and visual QA/docs closeout.
