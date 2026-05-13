# Phase 106 - Custom Seed Main Surface Stability Review

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

## Goal

Extend the shipped custom-seed stability proof beyond popup and audit shell surfaces:

- prove dashboard non-accent warning and error surfaces stay stable within the same explicit theme mode
- prove Settings non-accent neutral, warning, and supporting surfaces stay stable within the same explicit theme mode
- prove provider-detail non-accent neutral, warning, and supporting surfaces stay stable within the same explicit theme mode

## What Shipped

- `src/sidepanel/components/SummaryStrip.tsx` now exposes stable tone selectors for summary pills
- `src/sidepanel/components/ProviderCard.tsx` now exposes stable provider selectors for dashboard cards
- `src/sidepanel/routes/SettingsPage.tsx` now exposes stable selectors for:
  - the theme-customization card
  - each provider source card
  - the Cursor operational note
  - the Cursor session note
- `src/sidepanel/routes/ProviderDetailPage.tsx` now exposes stable selectors for:
  - the sync-status card
  - the usage card
  - the fidelity note
  - the product-contract note
  - the trust-boundary note
- new repeatable review script:
  - `scripts/phase106-custom-seed-main-surface-stability-review.mjs`
- new npm entry:
  - `npm run phase106:review`
- machine-readable artifacts:
  - `tmp/phase106-custom-seed-main-surface-stability-review/phase106-results.json`

## Assertions Covered

The main-surface stability review currently covers two explicit theme modes:

- `light`
- `dark`

For each mode, the review compares:

- `default` preset
- one saved `custom` seed: `#4F46E5`

For both modes, the review proves:

- dashboard, Settings, and provider detail resolve the expected:
  - `themeMode`
  - `themePreset`
  - `themeResolved`
  - `themeCustomSeedHex`
- the custom seed changes the intended accent roles:
  - `primary`
  - `tertiary`
- dashboard non-accent surfaces stay stable between `default` and `custom`:
  - error summary pill
  - Claude warning or error provider card
  - Gemini warning provider card
- Settings non-accent surfaces stay stable between `default` and `custom`:
  - theme-customization card
  - Cursor source card
  - Cursor operational note
  - Cursor session note
- provider-detail non-accent surfaces stay stable between `default` and `custom`:
  - sync-status card
  - usage card
  - fidelity note
  - product-contract note
  - trust-boundary note

## Verification

The following commands passed after `Phase 106` landed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
npx -y node@22 ./scripts/phase105-custom-seed-surface-stability-review.mjs
npx -y node@22 ./scripts/phase106-custom-seed-main-surface-stability-review.mjs
```

Verification summary:

- typecheck passed
- `vitest` passed with `140/140`
- production build passed
- popup plus audit surface-stability review passed
- dashboard plus Settings plus provider-detail surface-stability review passed

Observed stability results for `#4F46E5`:

- in `light` mode:
  - dashboard, Settings, and provider detail `primary` changed from `#005ac1` to `#4F46E5`
  - dashboard, Settings, and provider detail `tertiary` changed from `#6b5778` to `#C47AC5`
  - dashboard error summary pill, Claude error card, Gemini warning card, Settings Cursor note surfaces, and provider-detail fidelity plus trust notes all kept the same background and border values between `default` and `custom`
- in `dark` mode:
  - dashboard, Settings, and provider detail `primary` changed from `#adc7ff` to `#9994F0`
  - dashboard, Settings, and provider detail `tertiary` changed from `#d6bee4` to `#DFB6DF`
  - dashboard error summary pill, Claude error card, Gemini warning card, Settings Cursor note surfaces, and provider-detail fidelity plus trust notes all kept the same background and border values between `default` and `custom`

## Follow-up

Recommended next theming slices:

1. decide whether any compact-width or provider-state-specific edge cases still need custom-seed review beyond the now-covered popup, audit hub, dashboard, Settings, and provider-detail surfaces
2. decide whether one future advanced slice should support separate light and dark seeds or keep one shared seed as the only shipped contract
3. continue rejecting arbitrary per-token editing until the remaining edge-case theme-surface QA story is stronger
