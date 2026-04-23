# Phase 128 - Popup Featured Card Action Hierarchy

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

## Goal

Continue `Direction 06` by aligning featured-provider CTA routing with the popup-first setup story:

- stop implying every featured-provider state should route to provider detail
- make setup blockers route back to settings
- make contract-only cards route to dashboard
- keep provider detail for review and healthy provider-specific drill-down

## What Shipped

- one stateful featured-provider CTA rule:
  - `Needs access` and `Needs setup` -> `Open settings`
  - `Contract-only` -> `Open dashboard`
  - `Needs review` -> `Review detail`
  - `Healthy` -> `Open detail`
- one repeatable featured-card action review for:
  - mixed setup state
  - needs-review state
  - policy-only visible coverage
  - healthy visible providers
- one new popup review artifact bundle under `tmp/phase128-popup-featured-card-action-review/`

## Files

- `src/popup/view-models.ts`
- `src/popup/view-models.test.ts`
- `src/popup/PopupApp.tsx`
- `scripts/phase128-popup-featured-card-action-review.mjs`
- `package.json`

## Verification

Executed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
npm run phase128:review
```

Key truthful results:

- featured-provider cards no longer claim one generic `Open detail` route for every popup state
- popup CTA routing now matches the same setup-story contract already established by guidance, setup coverage, and featured-card copy
- this phase did not change provider contracts, toolbar badge semantics, or side-panel routing primitives

## Not Claimed

- that popup CTA work is complete
- that provider detail is no longer useful for setup or contract states
- that this action-hierarchy review replaces real toolbar operator feedback
