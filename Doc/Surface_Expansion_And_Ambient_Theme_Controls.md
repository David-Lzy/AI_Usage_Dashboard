# Surface Expansion And Ambient Theme Controls

Date: 2026-04-24

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

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

## Purpose

Define one stable contract for the next productization slices and keep it aligned as those runtime slices start landing.

## Surface Responsibilities

### Popup

- compact
- task-focused
- optimized for one-click status and next-step actions
- should not turn into a second full workspace

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
  - custom seed
- quick toggle must not wipe or mutate preset/custom-seed configuration
- current implementation note:
  - popup header now ships one quick light-dark toggle
  - standard sidepanel and full-page top bars now ship the same quick toggle
  - the toggle only rewrites `themeMode`, never `themePreset` or `themeCustomSeedHex`

### `system` Mode Semantics

- if the saved mode is currently `system`, the quick toggle should move into one explicit light or dark mode
- after that, the quick toggle can continue switching between explicit light and dark
- advanced theme configuration remains a Settings concern

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

- popup is currently functional but visually sparse
- sidebar already reads as a mature workspace and should not be collapsed into popup-like behavior
- new controls should strengthen the top action density instead of adding more long vertical cards
- current full-page dashboard and full-page settings captures read as stable, intentional workspace surfaces after the shipped expand, quick-theme, and motion slices
- current popup smoke capture remains useful as runtime QA evidence but is visually wider than the true toolbar bubble because the helper opens the popup route in its own extension app window
- RDP runtime capture should close old popup windows and tabs between attempts to reduce session buildup and OOM risk

## Acceptance Boundary

- popup remains compact after new controls land
- sidebar remains the richer operational surface
- full-page shell feels like expansion, not duplication
- quick theme controls do not replace Settings
- screenshots and store assets should be refreshed only after these runtime behaviors are stable
