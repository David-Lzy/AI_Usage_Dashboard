# Phase 104 - Custom Seed Local Surface Review

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

## Goal

Extend the shipped custom-seed theme path beyond the main cross-surface palette checks from `Phase 103`:

- prove popup-local accent surfaces still follow the active seed
- prove audit-hub-local accent surfaces still follow the active seed
- fix any local control that still falls back to the default blue treatment instead of the current themed primary role

## What Shipped

- `src/popup/PopupApp.tsx` now exposes stable local-surface selectors for:
  - popup header label
  - popup quick-actions label
  - popup featured-section label
  - popup `Open dashboard`
  - popup first `Open detail`
- `src/sidepanel/routes/InteractionAuditPage.tsx` now exposes stable local-surface selectors for:
  - audit hero label
  - audit hero chip
  - audit `Open settings`
- `src/sidepanel/theme/material-theme.css` now normalizes `.text-button` rendering with explicit appearance reset plus authored link-state color rules, so themed links and buttons no longer fall back to the default blue browser treatment
- new repeatable review script:
  - `scripts/phase104-custom-seed-local-surface-review.mjs`
- new npm entry:
  - `npm run phase104:review`
- machine-readable artifacts:
  - `tmp/phase104-custom-seed-local-surface-review/phase104-results.json`

## Assertions Covered

The local-surface review currently covers two scenarios for the same saved seed:

- `custom-seed-local-light`
- `custom-seed-local-dark`

For both scenarios, the review proves:

- popup and audit hub both resolve the same:
  - `themeMode`
  - `themePreset`
  - `themeResolved`
  - `themeCustomSeedHex`
- popup-local labels keep following the active `tertiary` role:
  - popup header label
  - popup quick-actions label
  - popup featured-section label
- popup-local and audit-local text-button surfaces keep following the active `primary` role:
  - popup `Open dashboard`
  - popup first `Open detail`
  - audit `Open settings`
- the audit hero chip keeps following the active `secondary-container` role
- explicit `Light` and `Dark` custom-seed modes still produce distinct local-surface accent values for the same saved seed

## Verification

The following commands passed after `Phase 104` landed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
npx -y node@22 ./scripts/phase99-theme-mode-review.mjs
npx -y node@22 ./scripts/phase100-dark-theme-surface-review.mjs
npx -y node@22 ./scripts/phase101-theme-preset-review.mjs
npx -y node@22 ./scripts/phase102-interaction-audit-theme-alignment-review.mjs
npx -y node@22 ./scripts/phase103-custom-seed-theme-review.mjs
npx -y node@22 ./scripts/phase104-custom-seed-local-surface-review.mjs
```

Verification summary:

- typecheck passed
- `vitest` passed with `140/140`
- production build passed
- theme-mode review passed
- dark-surface review passed
- preset-theme review passed
- audit-hub theme-alignment review passed
- cross-surface custom-seed review passed
- local-surface custom-seed review passed

Observed local-surface accent values for `#4F46E5`:

- `custom-seed-local-light`
  - popup and audit primary role: `#4F46E5`
  - popup and audit tertiary role: `#C47AC5`
  - audit hero chip background: `#E9E5F1`
- `custom-seed-local-dark`
  - popup and audit primary role: `#9994F0`
  - popup and audit tertiary role: `#DFB6DF`
  - audit hero chip background: `#483E59`

## Follow-up

Recommended next theming slices:

1. extend custom-seed review into wider neutral, supporting-surface, and stateful combinations beyond the now-covered popup plus audit local accent surfaces
2. decide whether one future advanced slice should support separate light and dark seeds or keep one shared seed as the only shipped contract
3. continue rejecting arbitrary per-token editing until the wider non-accent theme-surface QA story is stronger
