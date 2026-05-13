# Phase 124 - Popup Top Stack Density And Snapshot Copy Review

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

## Goal

Continue `Direction 06` by tightening the popup top stack after `Phase 123`:

- remove one redundant empty-state card from the no-provider flow
- keep `Snapshot Status` focused on freshness once setup stage and next step are already visible above it

## What Shipped

- one runtime rule that hides the empty `Snapshot Status` card when no provider is visible
- one shorter snapshot-detail contract for visible-provider states:
  - freshness only
  - no repeated `healthy / needs review / sync issue` prose inside the supporting copy
- one repeatable popup top-stack density review for:
  - no visible providers
  - mixed setup state
  - policy-only visible coverage
  - healthy visible providers
- one new popup review artifact bundle under `tmp/phase124-popup-top-stack-density-review/`

## Files

- `src/popup/view-models.ts`
- `src/popup/view-models.test.ts`
- `src/popup/PopupApp.tsx`
- `scripts/phase124-popup-top-stack-density-review.mjs`
- `package.json`

## Verification

Executed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
npm run phase124:review
```

Key truthful results:

- the popup no-provider state now uses two top-stack cards instead of keeping one redundant empty snapshot shell
- visible-provider snapshot copy now stays on freshness instead of restating setup or action guidance already shown above it
- this phase did not change badge semantics, provider contracts, or side-panel routing

## Not Claimed

- that popup onboarding is finished
- that top-stack density work replaces real toolbar operator feedback
- that popup should stop showing snapshot status for visible-provider states
