# Phase 100 - Dark Theme Surface Review

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

## Goal

Add the first dark-theme-specific QA baseline for the surfaces most likely to regress after `Phase 98` and `Phase 99`:

- warning and error toned cards
- warning and error detail notes
- neutral supporting surfaces versus stronger supporting surfaces
- warning and error progress tracks versus neutral progress tracks

## What Shipped

- new repeatable review script:
  - `scripts/phase100-dark-theme-surface-review.mjs`
- new npm entry:
  - `npm run phase100:review`
- machine-readable artifacts:
  - `tmp/phase100-dark-theme-surface-review/phase100-results.json`
- screenshots for:
  - dashboard dark toned surfaces
  - settings dark toned plus supporting surfaces
  - cursor detail dark neutral surfaces
  - jetbrains detail dark warning surfaces

## Assertions Covered

The review script now verifies in explicit dark mode:

- warning and error dashboard cards do not collapse into the neutral card treatment
- warning and error progress tracks plus fills remain distinct from neutral progress
- warning permission prompts and warning or error detail notes remain readable
- supporting diagnostic groups remain visually distinct from their outer source cards
- provider-detail neutral notes remain distinct from provider-detail warning notes
- provider-detail warning progress remains distinct from neutral progress

## Verification

The following commands passed after `Phase 100` landed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
npx -y node@22 ./scripts/phase99-theme-mode-review.mjs
npx -y node@22 ./scripts/phase100-dark-theme-surface-review.mjs
```

Verification summary:

- typecheck passed
- `vitest` passed with `132/132`
- production build passed
- theme-mode review passed
- dark-surface review passed

Observed contrast values from the dark-surface pass:

- dashboard warning supporting contrast: `9.51`
- dashboard error supporting contrast: `9.42`
- settings warning-note supporting contrast: `9.51`
- settings error-note supporting contrast: `9.42`
- detail warning-note supporting contrast: `9.51`

## Follow-up

Recommended next theming slices:

1. add repeatable popup warning and error review states if product fixtures make them available
2. add preset accent themes
3. add validated seed-color input
