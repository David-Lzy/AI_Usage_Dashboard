# Phase 121 - Popup Setup Coverage Summary

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

## Goal

Continue `Direction 06` by making popup onboarding breadth scannable:

- the popup should summarize how the current visible-provider set breaks down across live-ready, host-access, stored-credential, and policy-only states
- users should not need to infer setup coverage only from the featured-provider list plus one next-step card

## What Shipped

- one new popup `Setup coverage` card with a compact summary-pill grid
- one new popup view-model section that counts visible providers across:
  - `Live ready`
  - `Host access`
  - `Credentials`
  - `Policy-only`
- one explanatory coverage sentence that still calls out any remaining in-product review blockers outside those four setup buckets
- two additional popup view-model tests:
  - no visible providers
  - one mixed visible set with explicit live-ready, host-access, credential, and policy-only coverage

## Files

- `src/popup/view-models.ts`
- `src/popup/PopupApp.tsx`
- `src/popup/view-models.test.ts`
- `src/sidepanel/theme/material-theme.css`

## Verification

Executed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
```

Key truthful results:

- popup onboarding now distinguishes one provider's next step from the broader visible-provider setup spread
- the new setup-coverage layer stays compact and does not change badge semantics or side-panel routing
- this phase does not claim store-asset updates or real toolbar operator studies

## Not Claimed

- that popup onboarding is finished
- that the popup replaces Settings or provider detail
- that the popup now exposes provider-specific setup controls inline
