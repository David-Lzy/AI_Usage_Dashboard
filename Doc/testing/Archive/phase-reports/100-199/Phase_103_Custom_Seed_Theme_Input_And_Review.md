# Phase 103 - Custom Seed Theme Input And Review

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

## Goal

Ship the first advanced theme-personalization slice without opening unsafe token-by-token editing:

- one validated `#RRGGBB` custom-seed input
- one reset-to-default path
- one preview that shows the generated accent roles before and after apply
- one repeatable review baseline that proves the saved custom seed propagates coherently across the main shipped surfaces

## What Shipped

- `src/providers/types.ts` and app settings storage now persist:
  - `themePreset: "custom"`
  - `themeCustomSeedHex`
- `src/shared/theme.ts` now normalizes custom seed hex values, generates Material-like accent role palettes from one seed, and applies those role overrides at runtime through shared theme helpers
- `src/shared/storage.ts` now upgrades older stored app-state shapes by backfilling missing custom-seed settings to `null`
- `src/sidepanel/routes/SettingsPage.tsx` now exposes:
  - `Custom Seed` in the accent-preset selector
  - one validated `#RRGGBB` custom-seed input
  - preview swatches for the generated `primary`, `secondary-container`, and `tertiary` roles
  - `Apply custom seed`
  - `Reset to default`
- `src/sidepanel/App.tsx` now treats custom-seed changes as first-class theme-setting updates, so side-panel routes and special routes both reapply theme state when only the seed changes
- `src/background/message-bus.ts` now treats custom-seed updates as shared theme-preference updates
- new repeatable review script:
  - `scripts/phase103-custom-seed-theme-review.mjs`
- new npm entry:
  - `npm run phase103:review`
- machine-readable artifacts:
  - `tmp/phase103-custom-seed-theme-review/phase103-results.json`

## Assertions Covered

The custom-seed review currently covers two scenarios for the same saved seed:

- `custom-seed-light`
- `custom-seed-dark`

For both scenarios, the review proves:

- Settings, dashboard, popup, and audit hub all resolve the same:
  - `themeMode`
  - `themePreset`
  - `themeResolved`
  - `themeCustomSeedHex`
- the generated accent roles are identical across those four surfaces:
  - `primary`
  - `secondary-container`
  - `tertiary`
- the Settings preview swatches match the active generated roles instead of showing a disconnected local preview
- the audit hub still maps its own hero label and chip to the active generated tertiary plus secondary-container roles
- explicit `Light` and `Dark` custom-seed modes produce different generated palettes for the same seed instead of reusing one static light palette

## Verification

The following commands passed after `Phase 103` landed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
npx -y node@22 ./scripts/phase99-theme-mode-review.mjs
npx -y node@22 ./scripts/phase100-dark-theme-surface-review.mjs
npx -y node@22 ./scripts/phase101-theme-preset-review.mjs
npx -y node@22 ./scripts/phase102-interaction-audit-theme-alignment-review.mjs
npx -y node@22 ./scripts/phase103-custom-seed-theme-review.mjs
```

Verification summary:

- typecheck passed
- `vitest` passed with `140/140`
- production build passed
- theme-mode review passed
- dark-surface review passed
- preset-theme review passed
- audit-hub theme-alignment review passed
- custom-seed theme review passed

Observed custom-seed palette values for `#4F46E5`:

- `custom-seed-light`
  - primary: `#4F46E5`
  - secondary container: `#E9E5F1`
  - tertiary: `#C47AC5`
- `custom-seed-dark`
  - primary: `#9994F0`
  - secondary container: `#483E59`
  - tertiary: `#DFB6DF`

## Follow-up

Recommended next theming slices:

1. extend theme-surface QA so more popup-only and audit-hub-local accents are explicitly reviewed under custom-seed mode
2. decide whether one future advanced slice should support separate light and dark seeds or keep one shared seed as the only shipped contract
3. continue rejecting arbitrary per-token editing until the broader theme-surface QA story is stronger
