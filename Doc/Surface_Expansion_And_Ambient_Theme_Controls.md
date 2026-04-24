# Surface Expansion And Ambient Theme Controls

Date: 2026-04-24

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file records the agreed implementation contract for popup, sidebar, and future full-page shell expansion plus near-surface theme controls
- refresh it whenever the expansion target, route behavior, theme-toggle semantics, or RDP review expectations change

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

## Purpose

Define one stable contract for the next productization slices before runtime implementation begins.

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

## Expansion Entry Contract

### Popup Expansion

- popup expand opens the dashboard full-page tab
- it does not try to preserve popup-local state as if popup were a deep navigation surface
- it should feel like moving from quick glance into full workspace context

### Sidebar Expansion

- sidebar expand opens one route-preserving full-page shell
- it should preserve the current route when that route is supported in full-page mode
- unsupported routes should fall back explicitly and truthfully instead of silently dropping state

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

## QA Notes From Current RDP Review

- popup is currently functional but visually sparse
- sidebar already reads as a mature workspace and should not be collapsed into popup-like behavior
- new controls should strengthen the top action density instead of adding more long vertical cards
- RDP runtime capture should close old popup windows and tabs between attempts to reduce session buildup and OOM risk

## Acceptance Boundary

- popup remains compact after new controls land
- sidebar remains the richer operational surface
- full-page shell feels like expansion, not duplication
- quick theme controls do not replace Settings
- screenshots and store assets should be refreshed only after these runtime behaviors are stable
