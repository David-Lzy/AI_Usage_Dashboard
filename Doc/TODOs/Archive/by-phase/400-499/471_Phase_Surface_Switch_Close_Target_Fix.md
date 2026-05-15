# Phase 471 - Surface Switch Close Target Fix

Date: 2026-05-15

Status: completed

## Goal

Make sidebar-to-tab navigation close the existing side panel consistently, matching the already working tab-to-sidebar behavior.

## Scope

- Update shared side-panel close helpers so a navigation can try multiple close targets.
- Use window-level close first when expanding a side-panel route into a full-page tab, then use the active-tab target as a fallback.
- Keep popup Settings-to-tab behavior and full-page tab-to-sidebar behavior unchanged.
- Add focused coverage for the window-level side-panel close path.

## Preserved Boundaries

- No provider behavior, source truth, permissions, credentials, storage schema, package version, or release artifact changes.
- No UI layout or localization changes beyond the existing Phase 470 surface-switch labels.
- `chrome.sidePanel.close` remains best-effort for Chrome versions or contexts that do not support it.

## Acceptance

- Sidebar top-bar "tab" action opens the matching full-page tab and attempts to close the current side panel by `windowId`.
- If a tab-level side panel was used, the active-tab close fallback is still attempted.
- Full-page tab "sidebar" action still opens the side panel and closes the current extension tab after success.
- Focused tests cover popup/sidepanel navigation helpers.

## Planned Verification

- `npm run test -- src/sidepanel/app-browser-controls.test.ts src/popup/popup-route-actions.test.ts --run`
- `npm run typecheck`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Completed Verification

- `npm run test -- src/sidepanel/app-browser-controls.test.ts src/popup/popup-route-actions.test.ts --run`
- `npm run typecheck`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Follow-Up

- Before the next packaged release, run a real Chrome sidebar/tab switch smoke pass because side-panel close behavior depends on the installed Chrome API surface and whether the panel is tab-level or window-level.
