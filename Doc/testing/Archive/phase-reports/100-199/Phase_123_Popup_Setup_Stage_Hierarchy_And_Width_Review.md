# Phase 123 - Popup Setup Stage Hierarchy And Width Review

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

## Goal

Continue `Direction 06` by making the popup setup story clearer without adding more cards:

- turn the shipped `Setup coverage` card into one explicit setup-stage layer
- keep that new stage hierarchy compact enough for realistic popup widths

## What Shipped

- one explicit popup setup-stage label inside the existing `Setup coverage` card:
  - `Start setup`
  - `Needs setup`
  - `Needs review`
  - `Contract-only`
  - `Ready`
- one dedicated setup-stage width review script for:
  - no visible providers
  - mixed setup state
  - policy-only visible coverage
  - healthy visible providers
- one additional unit-test contract for the `Needs review` stage, which is not stable enough to treat as a preview-width review fixture
- one new popup review artifact bundle under `tmp/phase123-popup-setup-stage-hierarchy-review/`

## Files

- `src/popup/view-models.ts`
- `src/popup/view-models.test.ts`
- `src/popup/PopupApp.tsx`
- `scripts/phase123-popup-setup-stage-hierarchy-review.mjs`
- `package.json`

## Verification

Executed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
npm run phase123:review
```

Key truthful results:

- the popup setup-coverage layer now communicates a setup stage before the user has to interpret four separate counts
- the repo now checks that setup-stage headers stay compact at `360px` and `420px`, not only that the count grid fits
- `Needs review` is covered in runtime tests, but this phase does not claim one preview-width fixture for that stage because credential-backed preview seeding still gets normalized during reload

## Not Claimed

- that popup onboarding is finished
- that preview-width review replaces real toolbar operator feedback
- that `Needs review` is now fully covered by real browser operator evidence
