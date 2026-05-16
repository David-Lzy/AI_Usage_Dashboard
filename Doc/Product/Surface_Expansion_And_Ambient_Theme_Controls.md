# Surface Expansion And Ambient Theme Controls

Date: 2026-05-14

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file records the agreed implementation contract for popup, sidebar, and future full-page shell expansion plus near-surface theme controls
- refresh it whenever the expansion target, route behavior, theme-toggle semantics, or RDP review expectations change
- `Phase 155` has now started the runtime line by shipping a shared sidepanel entry plus explicit `?surface=full-page` query contract for route-preserving full-page state
- `Phase 156` has now added the first popup-side runtime action on top of that baseline by shipping one compact popup-header expand control that opens the dashboard full-page tab
- `Phase 157` has now added one route-preserving sidepanel expand control for dashboard, settings, and provider-detail routes
- `Phase 158` has now added one popup plus sidebar quick light-dark toggle that also carries into the standard full-page shell
- `Phase 159` has now added one restrained source-aware full-page entry motion layer for popup-expand and sidepanel-expand flows while keeping reduced-motion mode animation-free
- `Phase 160` has now refreshed real RDP runtime captures for popup, sidepanel, and full-page surfaces while teaching the capture workflow to close the extension windows it opens
- `Phase 209` has now improved compact popup density by showing structured usage-window progress as circular remaining indicators instead of another long vertical text block
- `Phase 210` has now made quota progress style selectable per popup, sidebar, and full-page tab surface while moving popup quota cards above nonessential summary/explanation cards
- `Phase 211` has now added Settings-controlled popup size, corner, and shadow presets while preserving the default balanced quota-first popup appearance
- `Phase 212` has now added a Settings-side popup appearance preview bound to those size, corner, and shadow presets
- `Phase 422` through `Phase 427` have now made provider order and quota progress item visibility/order configurable per popup, sidebar, and full-page surface without changing provider source truth
- `Phase 428` and `Phase 429` have now added soft and gauge circular progress styles plus localized Settings preview/options while keeping the classic ring valid for existing users
- `Phase 430` through `Phase 432` have now moved Settings provider-shaped sections onto a reusable carousel and closed the queue with representative UI QA notes

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

## Purpose

Define one stable contract for the next productization slices and keep it aligned as those runtime slices start landing.

## Surface Responsibilities

### Popup

- compact
- task-focused
- optimized for one-click status and next-step actions
- should not turn into a second full workspace
- may expose controlled appearance preferences from Settings, but those preferences must stay popup-only and must not change sidebar or full-page density

### Sidebar

- richer and operational
- the main extension workspace for:
  - settings
  - source diagnostics
  - provider detail
  - broader dashboard context

### Full-Page Shell

- a separate extension surface
- not a preview-only fallback
- not an external web page
- should feel like an expanded view of extension state, not a separate product
- current implementation baseline:
  - route-preserving full-page state is now carried through the shared sidepanel entry with the explicit `?surface=full-page` query contract
  - later slices can add dedicated expand buttons without inventing a second route model

## Expansion Entry Contract

### Popup Expansion

- popup expand opens the dashboard full-page tab
- it does not try to preserve popup-local state as if popup were a deep navigation surface
- it should feel like moving from quick glance into full workspace context
- current implementation note:
  - the popup-header expand control now owns this full-page dashboard jump
  - existing popup quick actions still keep their sidepanel handoff semantics in this slice

### Sidebar Expansion

- sidebar expand opens one route-preserving full-page shell
- it should preserve the current route when that route is supported in full-page mode
- unsupported routes should fall back explicitly and truthfully instead of silently dropping state
- current implementation note:
  - dashboard, settings, and provider detail now ship one compact top-bar `Tab` action
  - that action stays hidden once the runtime is already inside `?surface=full-page`

## Route Preservation Rules

- full-page shell should reuse the existing route-state model
- dashboard should remain the fallback route
- settings should preserve its route
- provider detail should preserve its route
- debug or review routes should only be supported intentionally, not accidentally

## Theme Toggle Contract

- a small light-dark toggle should appear in popup and sidebar
- the full-page shell should inherit the sidebar top-bar control
- the quick toggle only switches between light and dark
- Settings remains the only full theme-configuration surface for:
  - `system`
  - preset accents
  - custom accent colors through the validated seed path
  - UI font-family preference
- quick toggle must not wipe or mutate preset/custom-seed/font configuration
- current implementation note:
  - popup header now ships one quick light-dark toggle
  - standard sidepanel and full-page top bars now ship the same quick toggle
  - the toggle only rewrites `themeMode`, never `themePreset`, `themeCustomSeedHex`, or `uiFontFamily`

### `system` Mode Semantics

- if the saved mode is currently `system`, the quick toggle should move into one explicit light or dark mode
- after that, the quick toggle can continue switching between explicit light and dark
- advanced theme configuration remains a Settings concern

## Popup Appearance Contract

- Settings may expose popup-only appearance presets for:
  - size
  - corner style
  - shadow style
- defaults must preserve the current balanced quota-first popup.
- Settings should preview the selected popup appearance because the Chrome action popup has to be reopened to see native runtime changes.
- popup appearance changes must be implemented through popup root attributes and CSS variables, not separate copied layouts.
- compact size must remain truthful about space limits; if two-column circular quota rings become too dense, use a compact-specific layout instead of silently widening the compact preset.
- sidebar and full-page surfaces must not inherit popup appearance presets.

## Provider Display Preference Contract

- Current provider setup versus display semantics are defined in [Provider Setup And Display Product Contract](./Provider_Setup_Display_Product_Contract.md). The rules below remain the narrower display-preference subset.
- Provider order is independent for `popup`, `sidebar`, and `fullPage` surfaces.
- Surfaces with no saved custom provider order keep the default health/status order.
- Per-provider quota progress item visibility and order is also independent for `popup`, `sidebar`, and `fullPage`.
- Unknown provider ids or progress item ids are dropped during normalization; newly discovered providers or progress items append after existing saved preferences.
- Usage facts, raw diagnostic bodies, provider evidence, and archive/export payloads remain source-truth data, not configurable progress bars.
- Settings owns order and visibility editing; popup and dashboard surfaces only consume those display preferences.

## Settings Provider Carousel Contract

- Provider-shaped Settings sections may use the reusable provider carousel for navigation density.
- Carousel controls must stay keyboard accessible through previous/next buttons, slide dots, and ArrowLeft/ArrowRight handling.
- Pointer drag and swipe are local interaction helpers; no external carousel or drag dependency is required.
- RTL pages must preserve logical navigation and stable mixed-direction status text.
- Reduced-motion mode disables slide transform animation while preserving the same controls and content.

## Animation Boundary

- add motion that suggests continuity between compact and expanded surfaces
- do not fake a brittle true cross-window shared-element transition
- prefer one restrained shared-axis or scale-up language for:
  - popup expand
  - sidebar expand
  - full-page shell entry
- reduced-motion support remains mandatory
- current implementation note:
  - popup expand now writes one short-lived full-page entry hint that drives a restrained top-centered entry treatment on dashboard-tab open
  - sidepanel expand now writes one short-lived full-page entry hint that drives a restrained left-origin entry treatment on standard full-page entry
  - the hint is consumed once on full-page boot, so later reloads do not pretend the route always came from a fresh expand action
  - reduced-motion mode disables those entry animations entirely

## QA Notes From Current RDP Review

- popup is currently functional, quota-first when provider cards exist, and has compact circular usage progress by default, but it still needs real native-toolbar visual review after the next authenticated provider capture
- popup now supports size, corner, and shadow presets; the real native-toolbar review should cover compact, balanced, and wide presets rather than only the default
- sidebar already reads as a mature workspace and should not be collapsed into popup-like behavior
- new controls should strengthen the top action density instead of adding more long vertical cards
- current full-page dashboard and full-page settings captures read as stable, intentional workspace surfaces after the shipped expand, quick-theme, and motion slices
- current popup smoke capture remains useful as runtime QA evidence but is visually wider than the true toolbar bubble because the helper opens the popup route in its own extension app window
- RDP runtime capture should close old popup windows and tabs between attempts to reduce session buildup and OOM risk
- Phase 432 RDP extension-window captures opened windows but produced blank or near-blank image files in the current capture path; Playwright/Vite preview covered representative `en`, `zh-CN`, `de`, and `ar` routes with `overflowX=0`, and the RDP blank-capture boundary is recorded under `Doc/testing/Archive/phase-reports/400-499/Phase_432_UI_QA_And_Doc_Closeout.md`
- Phase 466 reran the post-polish QA closeout with Playwright built-preview checks for `en`, `zh-CN`, `de`, `ar`, and `hi`, plus sequential RDP Chrome extension-window captures for popup, full-page Settings, Chinese Quick Setup, and Arabic full-page Settings; the evidence record is [Phase 466 UI Polish Visual QA Docs Closeout](../testing/Archive/phase-reports/400-499/Phase_466_UI_Polish_Visual_QA_Docs_Closeout.md).

## Acceptance Boundary

- popup remains compact after new controls land
- sidebar remains the richer operational surface
- full-page shell feels like expansion, not duplication
- quick theme controls do not replace Settings
- screenshots and store assets should be refreshed only after these runtime behaviors are stable
