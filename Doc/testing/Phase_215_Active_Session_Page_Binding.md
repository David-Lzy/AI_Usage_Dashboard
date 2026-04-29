# Phase 215 - Active Session Page Binding

Date: 2026-04-29

Document class:

- closed evidence

## Goal

Add a Settings-side action that binds the current active Chrome tab as the provider's logged-in session page when the tab matches a shipped session-page route.

## Why This Phase Exists

Codex and Cursor personal paths already support logged-in page sessions, and Settings already had a `Find or open page` helper. The missing operator workflow was the direct case: the user is already on the correct Codex or Cursor page and wants the extension to attach that page instead of opening or searching tabs again.

## What Changed

- Added route-hint URL matching for concrete and wildcard session-page route hints.
- Added a `Use current page` Settings action for shipped session-page tracks.
- The action rejects extension pages and unrelated provider URLs before saving a binding.
- A matching active tab is saved as a bound page and immediately refreshed through the shared sync flow.
- Added localized English and Simplified Chinese button copy.

## Verification

- `npm run test -- --run src/shared/provider-sources.test.ts`
- `npm run typecheck`
- `npm run phase215:review`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Use this action during the next real Codex or Cursor operator pass: open the real usage page in the active tab, go to Settings, choose `Use current page`, then confirm the provider refreshes from the saved binding.
