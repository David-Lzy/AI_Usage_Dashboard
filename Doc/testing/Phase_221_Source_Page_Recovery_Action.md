# Phase 221 - Source Page Recovery Action

Date: 2026-04-29

Document class:

- closed evidence

## Goal

Expose a direct source-page recovery action from provider surfaces that already show session-page source failures.

## Why This Phase Exists

After the capture-unavailable and empty-progress closeout, the dashboard can clearly say that a Codex or Cursor usage page is open but unreadable. The next useful operator step should not require detouring through Settings just to reopen or focus the shipped source page.

## What Changed

- Added `openableSessionPageUrl` to sidepanel provider view models for shipped session-page tracks with a concrete route.
- Hardened `getOpenableRouteHint` so wildcard-only route hints are still matchable but not treated as automatically openable URLs.
- Added a `Source page` action to dashboard provider cards for shipped Codex/Cursor-style session-page providers.
- Added a localized source-page recovery action block to provider detail.
- Reused the existing `handleOpenSessionPage` Chrome tabs flow, preserving tab attach, page binding, and no-cookie-storage boundaries.

## Verification

- `npm run test -- --run src/shared/provider-sources.test.ts src/sidepanel/view-models.test.ts src/sidepanel/components/ProviderCard.test.tsx src/sidepanel/routes/ProviderDetailPage.test.tsx`
- `npm run typecheck`
- `npm run phase221:review`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Use the next RDP Chrome pass to click the dashboard `Source page` action for Codex or Cursor, confirm Chrome focuses or opens the provider route, and then refresh the provider after the page settles.
