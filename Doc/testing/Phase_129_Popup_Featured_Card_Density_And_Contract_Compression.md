# Phase 129 - Popup Featured Card Density And Contract Compression

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

## Goal

Continue `Direction 06` by reducing popup featured-provider density without dropping provider-contract honesty:

- reduce featured-provider chips from three to two
- keep contract truth visible, but move healthy and contract-only cards away from the longer side-panel contract prose
- keep the popup card density appropriate for `360px` and `420px` widths

## What Shipped

- one lower-density featured-card chip rule:
  - `current contract`
  - `freshness`
- one shorter secondary-copy rule for:
  - healthy featured cards
  - contract-only featured cards
- one repeatable featured-card density review for:
  - mixed setup state
  - needs-review state
  - policy-only visible coverage
  - healthy visible providers
- one new popup review artifact bundle under `tmp/phase129-popup-featured-card-density-review/`

## Files

- `src/popup/view-models.ts`
- `src/popup/view-models.test.ts`
- `src/popup/PopupApp.tsx`
- `scripts/phase129-popup-featured-card-density-review.mjs`
- `package.json`

## Verification

Executed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
npm run phase129:review
```

Key truthful results:

- featured-provider cards now keep one lighter popup density instead of carrying three chips and longer side-panel contract prose
- provider-contract honesty is still preserved through the contract chip plus the shorter availability-summary second line
- this phase did not change provider contracts, toolbar badge semantics, or CTA routing

## Not Claimed

- that popup featured-card density work is finished
- that availability summaries replace provider detail or dashboard contract surfaces
- that this density review replaces real toolbar operator feedback
