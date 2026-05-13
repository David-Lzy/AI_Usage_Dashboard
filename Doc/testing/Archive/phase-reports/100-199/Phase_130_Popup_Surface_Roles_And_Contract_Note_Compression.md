# Phase 130 - Popup Surface Roles And Contract Note Compression

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

## Goal

Continue `Direction 06` by removing the last static side-panel-style footer note from the popup:

- replace the old static `Popup Contract` explainer with one lighter stateful `Surface roles` note
- keep popup footer copy aligned with the already-shipped setup and review story
- verify the new footer note stays compact at `360px` and `420px`

## What Shipped

- one dynamic popup footer card labeled `Surface roles`
- one stateful footer-note contract for:
  - no visible providers
  - mixed setup states
  - needs-review states
  - policy-only states
  - healthy states
- one repeatable popup width review for those same footer-note states
- one new popup review artifact bundle under `tmp/phase130-popup-surface-roles-review/`

## Files

- `src/popup/view-models.ts`
- `src/popup/view-models.test.ts`
- `src/popup/PopupApp.tsx`
- `scripts/phase130-popup-surface-roles-review.mjs`
- `package.json`

## Verification

Executed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
npm run phase130:review
git diff --check
```

Key truthful results:

- the old static `Popup Contract` footer no longer survives as one fixed explainer across every popup state
- the new footer now changes ownership honestly:
  - `Settings owns setup`
  - `Dashboard owns contract review`
  - `Provider detail owns review`
  - `Popup stays quick glance`
- the footer note no longer replays the longer `Current shipped contract ...` prose and stays overflow-free at `360px` and `420px`

## Not Claimed

- that popup contract language is finished
- that the footer note replaces dashboard, settings, or provider detail surfaces
- that this footer-note review replaces real toolbar operator feedback
