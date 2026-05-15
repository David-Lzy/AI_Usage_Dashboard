# Phase 485 - Bundle Split Pass

Date: 2026-05-15

Status: completed

## Goal

Reduce the oversized sidepanel bundle before the next store candidate while preserving stable extension entry filenames and ordinary dashboard, Settings, provider-detail, popup, and service-worker behavior.

## Scope

- Lazy-load special/debug sidepanel routes:
  - fixture capture routes
  - interaction audit
  - store screenshot seed
  - native popup probe
  - theme recovery review
- Keep ordinary dashboard, Settings, and provider-detail routes eagerly loaded.
- Replace popup and sidepanel runtime imports from `src/shared/localized-copy.ts` with direct imports from focused copy modules.
- Keep `src/shared/localized-copy.ts` as a compatibility re-export for tests and older import paths.
- Keep stable output filenames for `assets/sidepanel.js`, `assets/popup.js`, and `assets/service-worker.js`.

## Preserved Boundaries

- No provider source truth, source-selection, permission, diagnostic, storage schema, archive/export schema, manifest permission, or Web Store listing promise change.
- No ordinary dashboard, Settings, provider-detail, popup, or service-worker behavior change.
- No manual chunk configuration was needed because route-level dynamic imports removed the warning.

## Build Result

Before this phase:

- `dist/assets/sidepanel.js` - 861,799 bytes.
- Vite emitted a `Some chunks are larger than 500 kB` warning.

After this phase:

- `dist/assets/sidepanel.js` - 429,190 bytes.
- `dist/assets/message-bus.js` - 325,682 bytes.
- `dist/assets/usage-progress.js` - 297,609 bytes.
- `dist/assets/write-clipboard-text.js` - 284,330 bytes.
- `dist/assets/popup.js` - 164,997 bytes.
- Special route chunks are split out, including `InteractionAuditPage.js`, `ThemeRecoveryReviewPage.js`, `store-workflow-localized-copy.js`, fixture capture pages, and native popup probe.
- Vite build completed without the >500 KB chunk warning.

## Acceptance

- `npm run build` completes without the previous large chunk warning.
- Stable extension entry output paths remain present in `dist/assets/`.
- Runtime imports from `src/shared/localized-copy.ts` are removed from popup and sidepanel non-test code.
- Focused route/view-model tests and typecheck pass.

## Planned Verification

- `rg -n "from ['\"](../|../../)shared/localized-copy" src/popup src/sidepanel --glob '!**/*.test.*'`
- `npm run test -- src/sidepanel/standard-route-app.test.tsx src/sidepanel/view-models.test.ts src/popup/view-models.test.ts --run`
- `npm run typecheck`
- `npm run docs:check`
- `npm run i18n:check`
- `npm run build`
- `git diff --check`

## Completed Verification

- `rg -n "from ['\"](../|../../)shared/localized-copy" src/popup src/sidepanel --glob '!**/*.test.*'`
- `npm run test -- src/sidepanel/standard-route-app.test.tsx src/sidepanel/view-models.test.ts src/popup/view-models.test.ts --run`
- `npm run typecheck`
- `npm run docs:check`
- `npm run i18n:check`
- `npm run build`
- `git diff --check`

## Follow-Up

- Continue with Phase 486 CSS consolidation before cutting `0.1.0-rc.22`.
