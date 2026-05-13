# Phase 107 - Custom Seed Compact Width Review

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

## Goal

Extend the shipped custom-seed QA into narrow viewports:

- prove dashboard, Settings, provider detail, and popup stay overflow-free at compact widths under one saved custom seed
- prove those same routes preserve one coherent custom-seed theme state instead of drifting to older preset values
- prove the Settings sticky top bar still behaves correctly after scroll at compact widths under the custom-seed path

## What Shipped

- new repeatable review script:
  - `scripts/phase107-custom-seed-compact-width-review.mjs`
- new npm entry:
  - `npm run phase107:review`
- machine-readable artifacts:
  - `tmp/phase107-custom-seed-compact-width-review/phase107-results.json`

## Assertions Covered

The compact-width review currently covers two explicit theme modes:

- `light`
- `dark`

For both modes, the review applies one saved custom seed:

- `#4F46E5`

The review then checks two compact widths:

- `360`
- `420`

For every route and width, the review proves:

- dashboard, Settings, provider detail, and popup resolve the expected:
  - `themeMode`
  - `themePreset`
  - `themeResolved`
  - `themeCustomSeedHex`
- compact-width routes stay overflow-free:
  - dashboard
  - Settings
  - provider detail
  - popup
- the Settings sticky top bar remains anchored after scroll at compact widths
- the active custom-seed palette stays coherent across widths:
  - `primary`
  - `tertiary`
- the saved custom seed still resolves to distinct light and dark role values even at compact widths

## Verification

The following commands passed after `Phase 107` landed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
npx -y node@22 ./scripts/phase106-custom-seed-main-surface-stability-review.mjs
npx -y node@22 ./scripts/phase107-custom-seed-compact-width-review.mjs
```

Verification summary:

- typecheck passed
- `vitest` passed with `140/140`
- production build passed
- main-surface custom-seed stability review passed
- compact-width custom-seed review passed

Observed compact-width results for `#4F46E5`:

- `360px`
  - dashboard overflow: `0`
  - Settings overflow: `0`
  - provider-detail overflow: `0`
  - popup overflow: `0`
  - Settings sticky top bar after scroll: `12px`
- `420px`
  - dashboard overflow: `0`
  - Settings overflow: `0`
  - provider-detail overflow: `0`
  - popup overflow: `0`
  - Settings sticky top bar after scroll: `12px`
- compact-width theme roles remained coherent per mode:
  - `light` primary: `#4F46E5`
  - `light` tertiary: `#C47AC5`
  - `dark` primary: `#9994F0`
  - `dark` tertiary: `#DFB6DF`

## Follow-up

Recommended next theming slices:

1. decide whether any provider-state-specific custom-seed edge cases still need review now that the main narrow-width path is covered
2. decide whether one future advanced slice should support separate light and dark seeds or keep one shared seed as the only shipped contract
3. continue rejecting arbitrary per-token editing until the remaining provider-state-specific theme QA story is stronger
