# Phase 127 - Popup Featured Card Story Alignment

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

## Goal

Continue `Direction 06` by aligning the lower featured-provider cards with the popup-first setup story already established by the header, guidance, and setup-coverage layers:

- make featured-card status badges popup-specific instead of purely sync-status-derived
- make featured-card first supporting lines state-first instead of contract-first
- keep detailed contract honesty available as a lower supporting line

## What Shipped

- one popup-specific featured-card badge vocabulary for the first featured provider states:
  - `Needs access`
  - `Needs setup`
  - `Needs review`
  - `Contract-only`
  - `Healthy`
- one popup-specific featured-card primary-detail vocabulary for:
  - host-access blocked
  - credential missing
  - open-page or logged-out page states
  - post-setup review states
  - policy-only contract states
  - healthy live-ready states
- one repeatable featured-card story review for:
  - mixed setup state
  - needs-review state
  - policy-only visible coverage
  - healthy visible providers
- one new popup review artifact bundle under `tmp/phase127-popup-featured-card-story-review/`

## Files

- `src/popup/view-models.ts`
- `src/popup/view-models.test.ts`
- `src/popup/PopupApp.tsx`
- `scripts/phase127-popup-featured-card-story-review.mjs`
- `package.json`

## Verification

Executed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
npm run phase127:review
```

Key truthful results:

- featured-provider cards now stay in popup setup and review vocabulary instead of immediately dropping back to side-panel contract prose
- contract, fidelity, and freshness honesty are still preserved through chips plus the second supporting line
- this phase did not change provider contracts, badge semantics, or side-panel routing

## Not Claimed

- that the popup no longer needs further onboarding work
- that featured-provider cards should replace provider detail
- that popup-specific copy should hide contract context or source fidelity
