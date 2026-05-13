# Phase 109 - Custom Seed Recovered State Review

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

## Goal

Extend the shipped custom-seed QA into one honest recovered-state baseline:

- prove the shipped session-page providers can move from a seeded `host_access_missing` warning state back to a neutral healthy state without losing the saved custom-seed palette
- prove popup snapshot status and featured-provider surfaces recover coherently instead of keeping stale warning treatments after the same seeded state is fixed
- prove recovered neutral healthy surfaces converge on one shared accent-bound treatment rather than drifting across dashboard, popup, and provider detail

## What Shipped

- new repeatable review script:
  - `scripts/phase109-custom-seed-recovered-state-review.mjs`
- new npm entry:
  - `npm run phase109:review`
- machine-readable artifacts:
  - `tmp/phase109-custom-seed-recovered-state-review/phase109-results.json`

## Assertions Covered

The recovered-state review currently covers two explicit theme modes:

- `light`
- `dark`

For both modes, the review keeps the same saved custom seed:

- `#4F46E5`

The review then seeds two deterministic session-page scenarios for the shipped `Cursor` and `Codex` paths:

- `degraded`
  - both providers are forced into `host_access_missing`
  - dashboard cards, popup snapshot, popup featured provider, and provider-detail surfaces all render warning treatments
- `recovered`
  - both providers are forced back into `ready`
  - dashboard cards, popup snapshot, popup featured provider, and provider-detail surfaces all render neutral healthy treatments

The review proves:

- the recovered scenario keeps the same:
  - `themeMode`
  - `themePreset`
  - `themeResolved`
  - `themeCustomSeedHex`
  - `primary`
  - `tertiary`
- degraded dashboard `Cursor` and `Codex` surfaces use warning treatments:
  - provider card
  - status chip
  - host-access chip
  - progress track
  - progress fill
- recovered dashboard `Cursor` and `Codex` surfaces move to neutral healthy treatments:
  - provider card
  - status chip
  - progress track
  - progress fill
  - host-access chip disappears
- degraded popup surfaces use warning treatments:
  - snapshot status card
  - snapshot status chip
  - first featured provider card
  - first featured provider status chip
- recovered popup surfaces move to neutral healthy treatments:
  - snapshot status card
  - snapshot status chip
  - first featured provider card
  - first featured provider status chip
- degraded provider-detail surfaces render warning recovery blockers:
  - `Access status`
  - `Source state`
  - warning sync-status chip
  - warning usage progress
- recovered provider-detail surfaces remove those blocker notes and return to neutral healthy sync-status chips plus neutral usage progress
- recovered healthy `Cursor` and `Codex` status chips plus progress fills converge to the same accent-bound values instead of drifting per route

## Verification

The following commands passed after `Phase 109` landed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
npx -y node@22 ./scripts/phase108-custom-seed-provider-state-review.mjs
npx -y node@22 ./scripts/phase109-custom-seed-recovered-state-review.mjs
curl -I http://127.0.0.1:4173/src/sidepanel/index.html
curl -I http://127.0.0.1:4173/src/popup/index.html
```

Verification summary:

- typecheck passed
- `vitest` passed with `140/140`
- production build passed
- provider-state-specific custom-seed review passed
- recovered-state custom-seed review passed
- preview `sidepanel` and `popup` both returned `200 OK`

Observed seeded recovered-state results for `#4F46E5`:

- `light`
  - degraded popup snapshot card used `status-card status-card--warning`
  - recovered popup snapshot card returned to plain `status-card`
  - degraded dashboard `Cursor` and `Codex` status chips used `status-chip--warning`
  - recovered dashboard `Cursor` and `Codex` status chips used `status-chip--neutral`
  - recovered dashboard `Cursor` and `Codex` status-chip background converged at `rgb(233, 229, 241)`
  - recovered dashboard `Cursor` and `Codex` progress-fill background converged at `rgb(79, 70, 229)`
- `dark`
  - degraded popup snapshot card used `status-card status-card--warning`
  - recovered popup snapshot card returned to plain `status-card`
  - degraded dashboard `Cursor` and `Codex` status chips used `status-chip--warning`
  - recovered dashboard `Cursor` and `Codex` status chips used `status-chip--neutral`
  - recovered dashboard `Cursor` and `Codex` status-chip background converged at `rgb(72, 62, 89)`
  - recovered dashboard `Cursor` and `Codex` progress-fill background converged at `rgb(153, 148, 240)`
- both modes also proved:
  - degraded detail `Access status` and `Source state` notes existed for both providers
  - recovered detail `Access status` and `Source state` notes were absent for both providers
  - the popup first featured provider stayed `Codex`, making the warning-to-healthy transition review stable across both scenarios

## Follow-up

Recommended next theming slices:

1. decide whether any live, non-seeded recovered-state or other provider-state transition surfaces still need dedicated review beyond this seeded baseline
2. decide whether one future advanced slice should support separate light and dark seeds or keep one shared seed as the only shipped contract
3. continue rejecting arbitrary per-token editing until the remaining live state-transition story is stronger
