# Phase 222 - Popup Source Page Recovery Action

Date: 2026-04-29

Document class:

- closed evidence

## Goal

Let the toolbar popup recover shipped session-page source states without forcing a detour through provider detail or Settings.

## Why This Phase Exists

Phase 221 added direct source-page recovery to dashboard and provider detail. The toolbar popup still treated unreadable, logged-out, or missing session-page states as generic review states, even when the best next action was to reopen or focus the provider source page.

## What Changed

- Added a `source-page` popup action kind for shipped session-page recovery states.
- Changed popup featured-provider cards to use `Open source page` when a provider has a concrete shipped session-page route and its source state is `open_page_required`, `logged_out`, or `capture_unavailable`.
- Added localized popup action copy for `en` and `zh-CN`.
- Wired popup runtime handling so the action focuses an existing matching provider tab or opens the concrete route, then saves the provider page binding through the existing background message.
- Kept fallback behavior conservative: deferred or non-openable session-page tracks still route to provider detail.

## Verification

- `npm run test -- --run src/popup/view-models.test.ts`
- `npm run typecheck`
- `npm run phase222:review`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Use the next RDP Chrome popup pass to open the native toolbar popup in a Codex/Cursor source-page failure state and confirm the featured card presents the source-page recovery action directly.
