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
- `Phase 458` made remaining-color-band color dropdowns show one visible value, with localized recommended-color names or custom hex labels as appropriate, and compacted the band controls into inline field groups.
- `Phase 459` promoted application language and theme mode into Settings overview and removed their duplicate Appearance & Sync controls.
- `Phase 460` moved all providers into the Quick Setup carousel and removed the separate "More Provider" disclosure while keeping hidden providers editable through card-level visibility controls.
- `Phase 461` stabilized Settings provider-carousel motion by capping depth offsets and slightly slowing the carousel-local transition while preserving reduced-motion handling and carousel interaction semantics.
- `Phase 462` moved popup refresh into the title row, added a popup header Settings action, and kept theme, tab, and Settings controls in a compact action row.
- `Phase 463` added a popup circular progress row-count preference, Settings control, and popup-only circular layout consumption while leaving line progress unchanged.
- `Phase 464` made shared Settings form-control values more legible with explicit body-large typography and tightened progress appearance numeric/color controls while preserving storage and provider behavior.
- Post-`Phase 464` polish moved Settings section/helper explanations into hover/focus tooltips, including the popup circular row-count helper, so dense Settings controls no longer carry full-width always-visible notes.
- Post-`Phase 464` polish also made remaining-color-band rows wrap the color selector below the numeric range at sidepanel widths, avoiding card overflow while preserving wide-layout alignment.
- Post-`Phase 464` polish renamed the UI disclosure copy to “More UI settings / Collapse UI settings” with synchronized 14-locale labels.
- Post-`Phase 464` polish tightened remaining-color-band responsive grids so number and color controls use stretch-to-fit columns instead of content-width columns at sidepanel widths.
- `Phase 465` added a safe local UI font-family preference, Settings control, storage normalization, root Material typography-variable sync, and 14-locale labels/helper copy without loading remote fonts.
- `Phase 466` closed the UI polish queue with Playwright built-preview checks, sequential RDP Chrome extension-window captures, documentation alignment, and an RC20 packaging decision.
- `Phase 467` packaged the completed UI polish source as `0.1.0-rc.20`; RC13 remains the submitted Chrome Web Store review boundary.
- `Phase 468` polished Settings help tooltips and form controls by making help triggers subtle, tooltip content opaque and viewport-positioned, progress-thickness input wider, and shared field labels more readable.
- `Phase 469` packaged the Phase 468 source boundary as `0.1.0-rc.21`; RC13 remains the submitted Chrome Web Store review boundary.
- `Phase 470` made popup Settings actions open the full-page Settings tab, added best-effort side-panel close during tab opens, and added full-page tab to sidebar top-bar switching.
- `Phase 471` fixed sidebar-to-tab close targeting by trying the current window side-panel target before the active-tab fallback, while preserving popup Settings-to-tab and full-page tab-to-sidebar behavior.
- `Phase 472` made remaining-color-band summary chips and reorder/remove actions share one responsive row at medium Settings widths while preserving narrow-width wrapping and color-band semantics.
- `Phase 473` added Settings toolbar-icon preferences for default, match-badge provider, explicit provider favicon, and custom image modes while preserving store/extension-management icons, provider data, badge behavior, and release packaging.
- `Phase 474` added Settings configuration backup, JSON export/import, and Chrome Sync save/restore actions while preserving local-only credentials, page bindings, permissions, runtime evidence, provider source truth, and release packaging.
- `Phase 475` shortened `100%` quota action-badge text to `100` while preserving full tooltip/title semantics, non-100 percent badge text, provider state, and release packaging.
- `Phase 476` added multi-select toolbar badge sources, configurable badge rotation, a dedicated rotation alarm, default match-badge toolbar icons for fresh settings, and match-badge icon rotation while preserving provider sync and release packaging.
- `Phase 477` promoted Provider display settings into a standalone top-level Settings section with its own navigation chip while preserving provider order, quota item preferences, provider state, and release packaging.
- `Phase 478` changed action badge multi-select UI from an always-visible checkbox stack to a compact Material-style dropdown summary while preserving badge rotation, toolbar icon matching, provider sync, and release packaging.
- `Phase 479` split action badge selection and badge rotation interval into separate Settings grid controls with tooltip helper copy while preserving badge rotation, toolbar icon matching, provider sync, and release packaging.
- `Phase 480` made Provider display quota item details default-collapsed per provider while keeping provider summaries visible and preserving per-surface quota item controls, storage, provider state, and release packaging.
- `Phase 481` added balanced Settings/quick-setup field grids and moved field-level help tooltips into label rows while preserving storage, provider truth, toolbar behavior, localization strings, and release packaging.
- `Phase 482` documented the pre-store maintenance audit, including largest source files, current `dist/` chunks, stale Settings/Form/CSS cleanup candidates, bundle-split targets, and release-safe boundaries before runtime cleanup begins.
- `Phase 483` removed stale `.settings-preferences__field-with-helper` CSS wrapper rules after confirming no runtime JSX uses them, while preserving Settings render semantics, provider truth, storage, archives, generated ledgers, and release packaging.
- `Phase 484` consolidated repeated Material select, editable number combobox, and action badge selector label/accessory JSX into `FormFieldLabel` while preserving label ids, `htmlFor`, `aria-labelledby`, visual output, storage, provider truth, and release packaging.
- `Phase 485` lazy-loaded special/debug sidepanel routes and replaced popup/sidepanel runtime copy imports with focused copy-module imports, reducing `dist/assets/sidepanel.js` from about 861.8 KB to 429.2 KB and eliminating the Vite >500 KB chunk warning while preserving stable extension entry filenames.
- Current implementation source is ahead of the `0.1.0-rc.21` package through `Phase 485`.
- The next deliberate track is low-risk CSS consolidation and `0.1.0-rc.22` packaging.
