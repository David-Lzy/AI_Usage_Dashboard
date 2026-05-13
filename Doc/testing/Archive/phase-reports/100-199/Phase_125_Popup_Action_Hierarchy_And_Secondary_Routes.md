# Phase 125 - Popup Action Hierarchy And Secondary Routes

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

## Goal

Continue `Direction 06` by clarifying popup action hierarchy after the earlier guidance and setup-stage work:

- let the guidance card own the primary next step
- keep the lower actions card available, but clearly secondary

## What Shipped

- one runtime action-hierarchy rule:
  - if guidance is present, the lower actions card becomes secondary
  - the lower actions card no longer repeats the same primary action label unchanged
- one dynamic secondary-action contract for:
  - no visible providers
  - mixed setup states
  - policy-only states
  - blocked-provider review states
  - healthy no-guidance states
- one repeatable popup action-hierarchy review for:
  - no visible providers
  - mixed setup state
  - policy-only visible coverage
  - healthy visible providers
- one new popup review artifact bundle under `tmp/phase125-popup-action-hierarchy-review/`

## Files

- `src/popup/view-models.ts`
- `src/popup/view-models.test.ts`
- `src/popup/PopupApp.tsx`
- `scripts/phase125-popup-action-hierarchy-review.mjs`
- `package.json`

## Verification

Executed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
npm run phase125:review
```

Key truthful results:

- guided popup states now have one unambiguous primary CTA
- the lower actions card remains available for broader navigation, but no longer duplicates the current primary next step
- this phase did not change badge semantics, provider contracts, or side-panel routing

## Not Claimed

- that popup onboarding is finished
- that the lower actions card should disappear completely
- that this action-hierarchy review replaces real toolbar operator feedback
