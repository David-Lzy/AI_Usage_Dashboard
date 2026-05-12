# Phase 321 - Popup Route Action Helper

## Goal

Move popup route-opening actions out of `PopupApp.tsx` and guard the key side-panel/full-page handoff contracts.

## Scope

- Extract side-panel, full-page, Settings, dashboard, and provider-detail open actions into a popup helper module.
- Preserve Chrome extension runtime behavior and preview fallback behavior.
- Add focused tests for preview route URLs and full-page pending-entry storage.

## Preserved Boundaries

- Do not change popup layout, copy, card selection, or source-page recovery.
- Do not change Settings route hash syntax.
- Do not change full-page pending-entry storage format.
- Do not change Chrome `sidePanel`, `tabs.create`, or fallback `window.open` semantics.

## Acceptance

- `PopupApp.tsx` imports route actions instead of defining them inline.
- Preview fallback opens the expected sidepanel/full-page URLs.
- Full-page actions store the pending entry before opening the full-page route.
- Chrome tab full-page opening still calls `chrome.tabs.create` and closes the popup.

## Planned Verification

- `npm run test -- --run src/popup/popup-route-actions.test.ts src/shared/extension-surface-entry.test.ts src/shared/extension-surface-paths.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion

Status: completed on 2026-05-13.

Summary:

- Added `src/popup/popup-route-actions.ts` for popup side-panel, full-page, Settings, dashboard, and provider-detail route actions.
- Added focused tests for Settings preview fallback, full-page preview pending-entry storage, and Chrome tab full-page opening.
- Removed route-opening implementation details from `PopupApp.tsx` while preserving source-page recovery and hide-provider behavior.

Verification:

- `npm run test -- --run src/popup/popup-route-actions.test.ts src/shared/extension-surface-entry.test.ts src/shared/extension-surface-paths.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
