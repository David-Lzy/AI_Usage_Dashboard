# Phase 126 - Popup Header And Top Summary Story

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

## Goal

Continue `Direction 06` by making the popup's very top layer feel like a toolbar-first setup story instead of a cut-down dashboard:

- make the header supporting copy stateful
- replace the generic top summary labels with popup-specific setup labels

## What Shipped

- one stateful popup header supporting line for:
  - no visible providers
  - setup blockers
  - policy-only contract coverage
  - setup-clear review states
  - healthy visible providers
- one popup-specific top summary strip:
  - `Visible`
  - `Live ready`
  - `Setup blockers`
  - `Policy-only`
- one repeatable popup header-plus-summary review for:
  - no visible providers
  - mixed setup state
  - policy-only visible coverage
  - healthy visible providers
- one new popup review artifact bundle under `tmp/phase126-popup-header-and-summary-review/`

## Files

- `src/popup/view-models.ts`
- `src/popup/view-models.test.ts`
- `src/popup/PopupApp.tsx`
- `scripts/phase126-popup-header-and-summary-review.mjs`
- `package.json`

## Verification

Executed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
npm run phase126:review
```

Key truthful results:

- the popup top line now explains toolbar state in popup-native terms instead of reusing the broader dashboard summary vocabulary
- the popup top summary now explains setup story directly before the user reads lower cards
- this phase did not change badge semantics, provider contracts, or side-panel routing

## Not Claimed

- that popup onboarding is finished
- that header-plus-summary review replaces real toolbar operator feedback
- that the popup should become a second full dashboard shell
