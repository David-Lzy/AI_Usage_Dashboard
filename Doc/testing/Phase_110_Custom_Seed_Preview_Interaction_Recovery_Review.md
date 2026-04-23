# Phase 110 - Custom Seed Preview Interaction Recovery Review

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

## Goal

Extend the shipped custom-seed QA into one more honest recovered-state baseline:

- prove the shipped Settings host-access controls can drive the same `host_access_missing -> ready` recovery path in browser preview mode without direct localStorage seeding
- prove the saved custom-seed palette stays stable while those preview interactions move warning surfaces back to neutral healthy treatments
- prove Settings, dashboard, popup, and provider detail all agree on the recovered state after the same interaction-driven path

## What Shipped

- new repeatable review script:
  - `scripts/phase110-custom-seed-preview-interaction-recovery-review.mjs`
- new npm entry:
  - `npm run phase110:review`
- stable QA selectors for Settings interaction controls:
  - `src/sidepanel/components/PermissionPrompt.tsx`
  - `src/sidepanel/routes/SettingsPage.tsx`
- machine-readable artifacts:
  - `tmp/phase110-custom-seed-preview-interaction-recovery-review/phase110-results.json`

## Assertions Covered

The preview-interaction recovered-state review currently covers two explicit theme modes:

- `light`
- `dark`

For both modes, the review keeps the same saved custom seed:

- `#4F46E5`

The review resets preview local state, then uses shipped Settings controls to:

- apply `Theme mode`
- apply `Accent preset = Custom Seed`
- set `Cursor` and `Codex` to `Session page`
- keep only `Cursor` and `Codex` visible in the dashboard feed
- simulate `missing` host access through the shipped preview-only permission toggle
- then simulate `granted` host access through that same control

The review proves:

- the degraded and recovered scenarios keep the same:
  - `themeMode`
  - `themePreset`
  - `themeResolved`
  - `themeCustomSeedHex`
  - `primary`
  - `tertiary`
- degraded Settings permission prompts render the warning path:
  - `permission-prompt--warning`
  - chip text `Host access missing`
  - action text `Request access`
- recovered Settings permission prompts return to the granted path:
  - warning treatment removed
  - chip text `Host access granted`
  - action text `Remove access`
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
- recovered Settings permission prompts and recovered healthy provider surfaces still converge on one shared accent-bound custom-seed treatment instead of drifting by route

## Verification

The following commands passed after `Phase 110` landed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
npx -y node@22 ./scripts/phase109-custom-seed-recovered-state-review.mjs
npx -y node@22 ./scripts/phase110-custom-seed-preview-interaction-recovery-review.mjs
curl -I http://127.0.0.1:4173/src/sidepanel/index.html
curl -I http://127.0.0.1:4173/src/popup/index.html
```

Verification summary:

- typecheck passed
- `vitest` passed with `140/140`
- production build passed
- seeded recovered-state custom-seed review passed
- preview-interaction recovered-state custom-seed review passed
- preview `sidepanel` and `popup` both returned `200 OK`

Observed preview-interaction recovered-state results for `#4F46E5`:

- `light`
  - Settings permission prompts moved from `Host access missing` to `Host access granted`
  - popup `Snapshot Status` moved from warning `Mixed state` to neutral `Aligned`
  - popup first featured provider stayed `Codex` and moved from `Needs access` to `Healthy`
  - `primary` stayed `#4F46E5` across Settings, dashboard, popup, and provider detail
- `dark`
  - Settings permission prompts moved from `Host access missing` to `Host access granted`
  - popup `Snapshot Status` moved from warning `Mixed state` to neutral `Aligned`
  - popup first featured provider stayed `Codex` and moved from `Needs access` to `Healthy`
  - `primary` stayed `#9994F0` across Settings, dashboard, popup, and provider detail
- both modes also proved:
  - degraded Settings permission prompts used `permission-prompt--warning`
  - recovered Settings permission prompts removed that warning treatment
  - degraded detail `Access status` and `Source state` notes existed for both providers
  - recovered detail `Access status` and `Source state` notes were absent for both providers
  - the same saved custom-seed palette persisted through the whole preview interaction path instead of being regenerated differently after recovery

## Follow-up

Recommended next theming slices:

1. decide whether one future review slice should cover real extension-mode host-access recovery beyond the now-shipped seeded and preview-interaction baselines
2. decide whether any other live provider-state transition surfaces still need dedicated review before richer seed-color work starts
3. continue rejecting arbitrary per-token editing until the remaining live transition story is stronger
