# Direction 05.1 - Adaptive Theming And Color Modes TODOs

Date: 2026-04-23

Status note:

- direction created on `2026-04-23`
- no executable phase has started yet

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Parent direction:

- [Direction 05 - Adaptive Theming And Color Modes](./05_Direction_Adaptive_Theming_And_Color_Modes.md)

## Detailed TODOs

### A. Theme Architecture

- define persistent theme settings:
  - `system`
  - `light`
  - `dark`
- define where theme state lives in storage and how it is hydrated on startup
- define one shared theme application path for side panel, popup, and audit hub
- decide whether theme state should be exposed in Settings only or also in the popup

### B. Material Fidelity Audit

- audit current token coverage against Material system roles:
  - color
  - typography
  - shape
  - elevation
  - interaction
- identify where current styling is still Material-like but not fully role-based
- decide which remaining one-off colors or blends should be normalized before dark mode ships

### C. Dark Mode

- add a dark token set that preserves current hierarchy:
  - surfaces
  - supporting surfaces
  - chips
  - progress
  - warning and error surfaces
  - provider-detail note tiers
- define whether `system` follows `prefers-color-scheme`
- verify the popup remains readable at narrow widths in dark mode

### D. Preset Themes And User Seed Color

- define a small set of shipped preset accents
- add one validated seed-color input with:
  - `#RRGGBB` validation
  - live preview
  - reset to default
- decide whether the first advanced version supports one shared seed or separate light and dark seeds
- reject arbitrary per-token editing in the first release of personalization

### E. QA And Accessibility

- add contrast verification for text, chips, and status surfaces
- add repeatable screenshot review for light, dark, and at least one custom seed theme
- verify reduced-motion behavior remains intact under every theme mode
- verify theme changes do not break provider-state semantics

## Out Of Scope

- syncing custom themes across browsers or user accounts
- importing full third-party theme packs
- exposing raw editing for every Material token
