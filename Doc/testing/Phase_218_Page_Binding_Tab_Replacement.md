# Phase 218 - Page Binding Tab Replacement

Date: 2026-04-29

Document class:

- closed evidence

## Goal

Keep saved session-page bindings honest when Chrome replaces a tab id for the same browser page.

## Why This Phase Exists

Phase 216 covered tab close and route navigation. A remaining Chrome lifecycle edge is `tabs.onReplaced`, where the old tab id is removed and a new tab id takes over. Without explicit handling, a valid bound Codex or Cursor usage page can keep showing an obsolete tab id until the next manual reconciliation.

## What Changed

- Added replacement-tab reconciliation to the page-binding lifecycle helper.
- Migrated a bound provider page to the replacement tab id when the new tab URL still matches that provider's session-page route hints.
- Marked the binding stale when the replacement tab is missing a matching usage-page URL.
- Wired `chrome.tabs.onReplaced` in the service worker.
- Refreshed the action badge after replacement-driven binding changes.

## Verification

- `npm run test -- --run src/background/page-binding-lifecycle.test.ts src/shared/provider-sources.test.ts`
- `npm run typecheck`
- `npm run phase218:review`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

The next real Chrome operator pass should include one reload or restore path that may trigger tab replacement, then confirm Settings still shows the bound Codex or Cursor page as attached to the current tab.
