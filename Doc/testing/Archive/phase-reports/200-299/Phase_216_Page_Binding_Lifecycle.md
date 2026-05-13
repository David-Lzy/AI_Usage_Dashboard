# Phase 216 - Page Binding Lifecycle

Date: 2026-04-29

Document class:

- closed evidence

## Goal

Mark saved session-page bindings stale as soon as the bound provider tab closes or navigates away from the provider's supported route hints.

## Why This Phase Exists

Phase 215 made it easier to bind the currently active Codex or Cursor usage page. The next functional gap was lifecycle honesty: after a bound tab closes or leaves the usage page, Settings should not keep presenting that page as a healthy active binding until a later manual refresh discovers the failure.

## What Changed

- Added a background page-binding lifecycle helper.
- Added `tabs.onRemoved` handling for bound tab closure.
- Added `tabs.onUpdated` URL handling for bound tab navigation away from supported provider routes.
- Kept route-preserving hash/query updates healthy when they still match provider session-page hints.
- Refreshed the action badge after a binding is marked stale.
- Preserved the no-cookie/no-auth-header boundary.

## Verification

- `npm run test -- --run src/background/page-binding-lifecycle.test.ts src/shared/provider-sources.test.ts`
- `npm run typecheck`
- `npm run phase216:review`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

The next provider pass can now rely on Settings showing stale page bindings promptly after the real Codex or Cursor usage tab is closed or navigated away.
