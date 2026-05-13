# Phase 108 - Custom Seed Provider State Review

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

## Goal

Extend the shipped custom-seed QA into provider-state-specific surfaces:

- prove warning and error provider-state surfaces stay state-colored when the active custom seed changes
- prove neutral provider-state surfaces only follow the active custom seed where the product intentionally binds them to accent roles
- prove dashboard, popup, and provider detail all keep one coherent provider-state-specific theme contract under the saved custom seed path

## What Shipped

- new repeatable review script:
  - `scripts/phase108-custom-seed-provider-state-review.mjs`
- new npm entry:
  - `npm run phase108:review`
- machine-readable artifacts:
  - `tmp/phase108-custom-seed-provider-state-review/phase108-results.json`

## Assertions Covered

The provider-state review currently covers two explicit theme modes:

- `light`
- `dark`

For both modes, the review compares two accent variants:

- `default`
- `custom`

The custom-seed variant currently uses:

- `#4F46E5`

The review then proves the following provider-state behavior:

- dashboard:
  - Claude error status chip, error meta chip, warning meta chip, error progress track, and error progress fill stay stable
  - Gemini warning status chip, warning meta chip, warning progress track, and warning progress fill stay stable
  - Codex neutral progress track stays stable
  - Codex neutral status chip changes with the active accent palette
  - Codex neutral progress fill changes with the active accent palette
- popup:
  - the snapshot status chip stays stable when it is in an error state
  - the first warning provider card stays stable
  - the first warning provider-card status chip stays stable
- Claude provider detail:
  - `Source state` error note stays stable
  - `Warning reason` warning note stays stable
  - error progress track and fill stay stable
- Gemini provider detail:
  - `Source state` warning note stays stable
  - `Warning reason` warning note stays stable
  - warning progress track and fill stay stable
- Codex provider detail:
  - `Source fidelity` warning note stays stable
  - `Warning reason` warning note stays stable
  - neutral progress track stays stable
  - neutral progress fill changes with the active accent palette

## Verification

The following commands passed after `Phase 108` landed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
npx -y node@22 ./scripts/phase107-custom-seed-compact-width-review.mjs
npx -y node@22 ./scripts/phase108-custom-seed-provider-state-review.mjs
curl -I http://127.0.0.1:4173/src/sidepanel/index.html
curl -I http://127.0.0.1:4173/src/popup/index.html
```

Verification summary:

- typecheck passed
- `vitest` passed with `140/140`
- production build passed
- compact-width custom-seed review passed
- provider-state-specific custom-seed review passed
- preview `sidepanel` and `popup` both returned `200 OK`

Observed provider-state results for `#4F46E5`:

- `light`
  - dashboard `Codex` healthy status-chip background changed from `rgb(215, 227, 248)` to `rgb(233, 229, 241)`
  - dashboard `Codex` neutral progress fill changed from `rgb(0, 90, 193)` to `rgb(79, 70, 229)`
  - provider-detail `Codex` neutral progress fill changed from `rgb(0, 90, 193)` to `rgb(79, 70, 229)`
  - dashboard `Claude` error status chip remained `color(srgb 1 0.910039 0.900314)`
  - dashboard `Gemini` warning status chip remained `color(srgb 1 0.922667 0.840784)`
- `dark`
  - dashboard `Codex` healthy status-chip background changed from `rgb(60, 71, 88)` to `rgb(72, 62, 89)`
  - dashboard `Codex` neutral progress fill changed from `rgb(173, 199, 255)` to `rgb(153, 148, 240)`
  - provider-detail `Codex` neutral progress fill changed from `rgb(173, 199, 255)` to `rgb(153, 148, 240)`
  - dashboard `Claude` error status chip remained `color(srgb 0.333647 0.0778824 0.0660392)`
  - dashboard `Gemini` warning status chip remained `color(srgb 0.255059 0.143686 0.0138039)`

## Follow-up

Recommended next theming slices:

1. decide whether any provider-state transition or recovered-state theme surfaces still need a dedicated review slice
2. decide whether one future advanced slice should support separate light and dark seeds or keep one shared seed as the only shipped contract
3. continue rejecting arbitrary per-token editing until the remaining state-transition theme QA story is stronger
