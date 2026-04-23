# Phase 105 - Custom Seed Surface Stability Review

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

## Goal

Prove the shipped custom-seed theme path is still honest beyond accent roles:

- accent roles should change when the saved seed changes
- popup and audit-hub non-accent surfaces should stay visually stable within the same explicit theme mode
- warning, neutral, and supporting surfaces should not silently drift just because the user changed the accent seed

## What Shipped

- `src/popup/PopupApp.tsx` now exposes stable local-surface selectors for:
  - popup `Snapshot Status` card
  - popup `Quick Actions` card
  - popup `Popup Contract` card
  - popup first featured provider card
- new repeatable review script:
  - `scripts/phase105-custom-seed-surface-stability-review.mjs`
- new npm entry:
  - `npm run phase105:review`
- machine-readable artifacts:
  - `tmp/phase105-custom-seed-surface-stability-review/phase105-results.json`

## Assertions Covered

The surface-stability review currently covers two explicit theme modes:

- `light`
- `dark`

For each mode, the review compares:

- `default` preset
- one saved `custom` seed: `#4F46E5`

For both modes, the review proves:

- popup and audit hub resolve the expected:
  - `themeMode`
  - `themePreset`
  - `themeResolved`
  - `themeCustomSeedHex`
- the custom seed changes the intended accent roles:
  - `primary`
  - `tertiary`
- popup non-accent surfaces stay stable between `default` and `custom`:
  - `Snapshot Status`
  - `Quick Actions`
  - `Popup Contract`
  - first warning featured-provider card
- audit-hub non-accent surfaces stay stable between `default` and `custom`:
  - `Request Scope`
  - `Review Queue`
  - `Workspace state`
  - warning `Outstanding review work` note
  - first queue item
  - signoff-preview surface

## Verification

The following commands passed after `Phase 105` landed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
npx -y node@22 ./scripts/phase104-custom-seed-local-surface-review.mjs
npx -y node@22 ./scripts/phase105-custom-seed-surface-stability-review.mjs
```

Verification summary:

- typecheck passed
- `vitest` passed with `140/140`
- production build passed
- local-surface custom-seed review passed
- non-accent surface-stability review passed

Observed stability results for `#4F46E5`:

- in `light` mode:
  - popup and audit `primary` changed from `#005ac1` to `#4F46E5`
  - popup and audit `tertiary` changed from `#6b5778` to `#C47AC5`
  - popup `Snapshot Status`, popup first warning provider card, audit `Request Scope`, audit `Review Queue`, audit first queue item, and audit warning handoff note all kept the same background and border values between `default` and `custom`
- in `dark` mode:
  - popup and audit `primary` changed from `#adc7ff` to `#9994F0`
  - popup and audit `tertiary` changed from `#d6bee4` to `#DFB6DF`
  - popup `Snapshot Status`, popup first warning provider card, audit `Request Scope`, audit `Review Queue`, audit first queue item, and audit warning handoff note all kept the same background and border values between `default` and `custom`

## Follow-up

Recommended next theming slices:

1. extend custom-seed review into dashboard, settings, and provider-detail non-accent surfaces so the stability proof is no longer limited to popup and audit hub
2. decide whether one future advanced slice should support separate light and dark seeds or keep one shared seed as the only shipped contract
3. continue rejecting arbitrary per-token editing until the wider app-wide non-accent theme-surface QA story is stronger
