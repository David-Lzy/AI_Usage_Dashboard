# Phase 101 - Preset Theme Accents

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

## Goal

Ship the first safe theme-personalization slice on top of the new `System / Light / Dark` runtime:

- a small set of shipped accent presets
- one persisted preset selection shared across the side panel and popup
- one repeatable QA baseline that proves the shipped presets actually propagate through visible accent roles

## What Shipped

- shared theme settings now persist both:
  - `themeMode`
  - `themePreset`
- new shipped preset accents:
  - `Default Blue`
  - `Meadow`
  - `Sunset`
- Settings now exposes an `Accent preset` control next to `Theme mode`
- the side panel and popup now apply the same persisted preset accent choice
- `src/sidepanel/theme/tokens.css` now ships light and dark role overrides for:
  - `meadow`
  - `sunset`
- new repeatable review script:
  - `scripts/phase101-theme-preset-review.mjs`
- new npm entry:
  - `npm run phase101:review`
- machine-readable artifacts:
  - `tmp/phase101-theme-preset-review/phase101-results.json`

## Assertions Covered

The preset-theme review now verifies six scenarios:

- `default-light`
- `meadow-light`
- `sunset-light`
- `default-dark`
- `meadow-dark`
- `sunset-dark`

For each scenario, the review proves:

- settings, dashboard, and popup all resolve the same `themeMode`, `themePreset`, and `themeResolved`
- the expected palette roles are identical across those three surfaces
- visible accent surfaces keep using those roles instead of drifting back to the default palette:
  - settings overview `section-label`
  - dashboard hero `section-label`
  - dashboard hero `token-chip`
  - popup header `section-label`

## Verification

The following commands passed after `Phase 101` landed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
npx -y node@22 ./scripts/phase99-theme-mode-review.mjs
npx -y node@22 ./scripts/phase100-dark-theme-surface-review.mjs
npx -y node@22 ./scripts/phase101-theme-preset-review.mjs
```

Verification summary:

- typecheck passed
- `vitest` passed with `135/135`
- production build passed
- theme-mode review passed
- dark-surface review passed
- preset-theme review passed

Observed palette values from the preset review:

- `default-light`
  - primary: `#005ac1`
  - secondary container: `#d7e3f8`
  - tertiary: `#6b5778`
- `meadow-light`
  - primary: `#2a6a31`
  - secondary container: `#cfe8d0`
  - tertiary: `#39656a`
- `sunset-light`
  - primary: `#9a4d00`
  - secondary container: `#ffdccd`
  - tertiary: `#6d5b91`
- `default-dark`
  - primary: `#adc7ff`
  - secondary container: `#3c4758`
  - tertiary: `#d6bee4`
- `meadow-dark`
  - primary: `#90d58f`
  - secondary container: `#364b38`
  - tertiary: `#9fd0d5`
- `sunset-dark`
  - primary: `#ffb784`
  - secondary container: `#5d4034`
  - tertiary: `#cfbee8`

## Follow-up

Recommended next theming slices:

1. add one validated seed-color input instead of raw freeform token editing
2. decide when the audit hub should adopt the same persisted theme runtime as the side panel and popup
3. keep expanding dark-theme QA only where preset or seed-color work actually increases regression risk
